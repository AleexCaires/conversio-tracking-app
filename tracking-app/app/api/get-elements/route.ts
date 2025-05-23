import { connectToDatabase } from "../../../lib/mongodb";
import { Event, EventGroup, ExperienceData } from "@/types";

interface DatabaseElement {
  _id: string;
  client: string;
  dateCreated?: string | Date;
  experienceName: string;
  events: EventGroup[];
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("eventdata");

    const elements = await collection.find({}).toArray();
    console.log(
      "Raw elements from database:",
      elements.map((e) => ({ _id: e._id, type: typeof e._id }))
    );

    const formattedElements = elements
      .map(
        (doc: Record<string, unknown>): DatabaseElement => ({
          _id: typeof doc._id === "string" ? doc._id : String(doc._id),
          client: doc.client as string,
          dateCreated: doc.dateCreated as string | Date | undefined,
          experienceName: doc.experienceName as string,
          events: doc.events as EventGroup[],
        })
      )
      .map((element: DatabaseElement): ExperienceData | null => {
        // Ensure dateCreated is always present and is an ISO string
        let dateCreated: string;
        if (element.dateCreated) {
          dateCreated = new Date(element.dateCreated).toISOString();
        } else {
          // If no dateCreated, use current date as fallback
          dateCreated = new Date().toISOString();
        }

        const isLaithwaites = element.client === "Laithwaites";
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
                      codeCopied: event.codeCopied,
                      ...(event.triggerEvent ? { triggerEvent: event.triggerEvent } : {}),
                    };
                  }
                  return event;
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
                  codeCopied: event.codeCopied,
                  ...(event.triggerEvent ? { triggerEvent: event.triggerEvent } : {}),
                };
              }
              return event;
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

    console.log(
      "Formatted elements:",
      formattedElements.map((e) => ({ _id: e._id, type: typeof e._id }))
    );

    return new Response(JSON.stringify({ elements: formattedElements }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ message: `Failed to fetch elements: ${errorMessage}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
