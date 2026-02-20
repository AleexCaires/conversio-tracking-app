import { connectToDatabase } from "@/lib/mongodb";
import { Event, EventGroup, ExperienceData } from "@/types";
import { getCorsHeaders, handleOptions, authenticateRequest } from "@/lib/apiAuth";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

interface DatabaseElement {
  _id: string;
  client: string;
  dateCreated?: string | Date;
  experienceName: string;
  events: EventGroup[];
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return handleOptions(origin);
}

export async function GET(request: NextRequest) {
  // Check authentication
  const authError = await authenticateRequest(request);
  if (authError) return authError;

  const origin = request.headers.get("origin");

  try {
    const db = await connectToDatabase();
    const collection = db.collection("eventdata");

    // Support optional ?experienceNumber=... query param.
    const url = new URL(request.url);
    const experienceNumber = url.searchParams.get("experienceNumber");

    // Helper to safely escape regex chars
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let elements: unknown[] = [];

    if (experienceNumber) {
      // 1) Try exact _id match (string)
      const exact = await collection.findOne({ _id: experienceNumber });
      if (exact) {
        elements = [exact];
      } else {
        // 2) Try ObjectId match if valid
        if (ObjectId.isValid(experienceNumber)) {
          try {
            const objId = new ObjectId(experienceNumber);
            const byObjectId = await collection.findOne({ _id: objId });
            if (byObjectId) {
              elements = [byObjectId];
            }
          } catch (e) {
            // ignore and fallback to regex search
          }
        }

        // 3) Fallback: match documents whose _id ends with the provided experienceNumber
        if (elements.length === 0) {
          const escaped = escapeRegExp(experienceNumber);
          elements = await collection.find({ _id: { $regex: `${escaped}$` } }).toArray();
        }
      }
    } else {
      elements = await collection.find({}).toArray();
    }

    const formattedElements = elements
      .map(
        (doc: Record<string, unknown>): DatabaseElement => ({
          _id: typeof doc._id === "string" ? doc._id : String(doc._id),
          client: doc.client as string,
          dateCreated: doc.dateCreated as string | Date | undefined,
          experienceName: doc.experienceName as string,
          events: doc.events as EventGroup[],
        }),
      )
      .map((element: DatabaseElement): ExperienceData | null => {
        let dateCreated: string;
        if (element.dateCreated) {
          dateCreated = new Date(element.dateCreated).toISOString();
        } else {
          dateCreated = new Date().toISOString();
        }

        const isLaithwaites = element.client === "Laithwaites";
        const isSephora = element.client === "Sephora" || element.client === "SA";
        const anyCopied = element.events.some((group: EventGroup) => group.events.some((event: Event) => event.codeCopied === true));

        let processedEventGroups: EventGroup[];

        if (anyCopied) {
          processedEventGroups = element.events
            .map((group: EventGroup): EventGroup | null => {
              const copiedEvents = group.events.filter((event: Event) => event.codeCopied === true);
              if (copiedEvents.length > 0) {
                const formattedCopiedEvents = copiedEvents.map((event: Event): Event => {
                  if (isLaithwaites && event.event === "targetClickEvent") {
                    return {
                      eventAction: event.eventData?.click?.clickAction,
                      eventCategory: event.eventData?.click?.clickLocation,
                      eventLabel: event.eventData?.click?.clickText,
                      eventSegment: "",
                      ...(event.triggerEvent ? { triggerEvent: event.triggerEvent } : {}),
                    };
                  }
                  if (isSephora && event.event === "conversioEvent" && event.conversio) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { codeCopied, ...rest } = event;
                    return rest;
                  }
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { codeCopied, ...rest } = event;
                  return rest;
                });
                return { ...group, events: formattedCopiedEvents };
              }
              return null;
            })
            .filter((group: EventGroup | null): group is EventGroup => group !== null);
        } else {
          processedEventGroups = element.events.map((group: EventGroup): EventGroup => {
            const formattedAllEvents = group.events.map((event: Event): Event => {
              if (isLaithwaites && event.event === "targetClickEvent") {
                return {
                  eventAction: event.eventData?.click?.clickAction,
                  eventCategory: event.eventData?.click?.clickLocation,
                  eventLabel: event.eventData?.click?.clickText,
                  eventSegment: "",
                  ...(event.triggerEvent ? { triggerEvent: event.triggerEvent } : {}),
                };
              }
              if (isSephora && event.event === "conversioEvent" && event.conversio) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { codeCopied, ...rest } = event;
                return rest;
              }
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { codeCopied, ...rest } = event;
              return rest;
            });
            return { ...group, events: formattedAllEvents };
          });
        }

        if (processedEventGroups.length === 0) {
          return null;
        }

        return {
          _id: element._id,
          client: element.client,
          dateCreated,
          experienceName: element.experienceName,
          events: processedEventGroups,
        };
      })
      .filter((element: ExperienceData | null): element is ExperienceData => element !== null);

    return new Response(JSON.stringify({ success: true, elements: formattedElements }), {
      status: 200,
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ success: false, error: `Failed to fetch elements: ${errorMessage}` }), {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
}
