import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { clients } from "../../../lib/clients";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { elementData } = body;

    if (!elementData || !elementData.client || !elementData.eventDescriptions || !elementData.experienceNumber || !elementData.experienceName || typeof elementData.numVariants !== "number") {
      return NextResponse.json({ message: "Missing required fields in request body." }, { status: 400 });
    }

    const clientCode = clients.find((c) => c.name === elementData.client)?.code || elementData.client;
    const fullClient = `${clientCode}${elementData.experienceNumber}`;

    //console.log("Saving document with _id:", fullClient);

    const usedLetters = new Set<string>();
    const descriptionLetters = new Map<string, string>();

    const getRandomLetter = (usedLetters: Set<string>): string => {
      // Single-letter pool only (no double letters) - Q removed for regular events
      const letters = "GHIJKLMNOPRSTUVWXYZ"; // 19 letters (Q removed)
      const nextIndex = usedLetters.size;
      if (nextIndex < letters.length) {
        const letter = letters[nextIndex];
        usedLetters.add(letter);
        return letter;
      }
      console.warn("[save-elements] More than 19 unique event descriptions – reusing last letter (Z). Extend letters if needed.");
      return "Z";
    };

    elementData.eventDescriptions.forEach((description: string, index: number) => {
      if (!descriptionLetters.has(description)) {
        // Check if this is a trigger event (first in the array)
        // Trigger events always get Q
        const isTriggerEvent = index === 0;

        if (isTriggerEvent) {
          // Trigger events always get Q
          descriptionLetters.set(description, "Q");
        } else {
          // Regular events get sequential letters from the pool
          descriptionLetters.set(description, getRandomLetter(usedLetters));
        }
      }
    });

    const generateEventSegment = (description: string, variantPrefix: string) => {
      const sharedLetter = descriptionLetters.get(description);
      if (variantPrefix === "ECO") {
        // For Dummy Control, use 'ECO' prefix
        return `${fullClient}${variantPrefix}${sharedLetter}`;
      }
      // For variations, use 'EV' followed by variant number (e.g., EV1, EV2)
      return `${fullClient}E${variantPrefix}${sharedLetter}`;
    };

    // Helper to determine if this index is the trigger event
    const isTriggerEvent = (idx: number) => elementData.triggerEvent && elementData.triggerEvent.enabled && idx === 0;

    // Generate Dummy Control events
    const controlEvents = [];

    // Add experience event if needed
    if (elementData.includeExperienceEvent && (clientCode === "SA" || clientCode === "LF" || clientCode === "VX")) {
      controlEvents.push({
        event: "conversioExperience",
        experienceEvent: true,
        conversio: {
          // SA & VX use snake_case, LF uses camelCase (we keep camelCase keys too for LF consumer safety)
          ...(clientCode === "SA" || clientCode === "VX"
            ? {
                experience_category: "Conversio Experience",
                experience_action: `${fullClient} | ${elementData.experienceName}`,
                experience_label: `${fullClient} | Control Original`,
              }
            : {
                experienceCategory: "Conversio Experience",
                experienceAction: `${fullClient} | ${elementData.experienceName}`,
                experienceLabel: `${fullClient} | Control Original`,
              }),
          experience_segment: `${fullClient}.XCO`,
        },
        codeCopied: false,
      });
    }

    // Add regular control events
    const regularControlEvents =
      elementData.controlEventsWithCopied && elementData.controlEventsWithCopied.length === elementData.eventDescriptions.length
        ? elementData.controlEventsWithCopied.map((eventObj: unknown, idx: number) => {
            const description = elementData.eventDescriptions[idx];
            const eventSegment = generateEventSegment(description, "ECO");
            let baseEvent;

            if (clientCode === "LT") {
              baseEvent = {
                event: "targetClickEvent",
                eventData: {
                  click: {
                    clickLocation: "Conversio CRO",
                    clickAction: `${fullClient} | Event Tracking`,
                    clickText: `${fullClient} (Control Original) | ${description}`,
                  },
                },
              };
            } else if (clientCode === "SA" || clientCode === "VX") {
              baseEvent = {
                event: "conversioEvent",
                conversio: {
                  event_category: "Conversio CRO",
                  event_action: `${eventSegment} | Event Tracking`,
                  event_label: `${eventSegment} | (Control Original) | ${description}`,
                  event_segment: `${eventSegment}`,
                },
              };
            } else {
              baseEvent = {
                eventCategory: "Conversio CRO",
                eventAction: `${fullClient} | Event Tracking`,
                eventLabel: `${fullClient} | (Control Original) | ${description}`,
                eventSegment: eventSegment,
              };
            }

            // Only add triggerEvent: true if this is the trigger event
            return {
              ...baseEvent,
              codeCopied: !!(eventObj as { codeCopied?: boolean })?.codeCopied,
              ...(isTriggerEvent(idx) ? { triggerEvent: true } : {}),
            };
          })
        : elementData.eventDescriptions.map((description: string, idx: number) => {
            const eventSegment = generateEventSegment(description, "ECO");
            let baseEvent;

            if (clientCode === "LT") {
              baseEvent = {
                event: "targetClickEvent",
                eventData: {
                  click: {
                    clickLocation: "Conversio CRO",
                    clickAction: `${fullClient} | Event Tracking`,
                    clickText: `${fullClient} (Control Original) | ${description}`,
                  },
                },
              };
            } else if (clientCode === "SA" || clientCode === "VX") {
              baseEvent = {
                event: "conversioEvent",
                conversio: {
                  event_category: "Conversio CRO",
                  event_action: `${eventSegment} | Event Tracking`,
                  event_label: `${eventSegment} | (Control Original) | ${description}`,
                  event_segment: `${eventSegment}`,
                },
              };
            } else {
              baseEvent = {
                eventCategory: "Conversio CRO",
                eventAction: `${fullClient} | Event Tracking`,
                eventLabel: `${fullClient} | (Control Original) | ${description}`,
                eventSegment: eventSegment,
              };
            }

            return {
              ...baseEvent,
              codeCopied: false,
              ...(isTriggerEvent(idx) ? { triggerEvent: true } : {}),
            };
          });

    controlEvents.push(...regularControlEvents);

    // Generate Variation events dynamically based on numVariants
    const variationEvents = [];
    for (let variantIndex = 1; variantIndex <= elementData.numVariants; variantIndex++) {
      const eventsForVariant = [];

      // Add experience event if needed
      if (elementData.includeExperienceEvent && (clientCode === "SA" || clientCode === "LF" || clientCode === "VX")) {
        eventsForVariant.push({
          event: "conversioExperience",
          experienceEvent: true,
          conversio: {
            ...(clientCode === "SA" || clientCode === "VX"
              ? {
                  experience_category: "Conversio Experience",
                  experience_action: `${fullClient} | ${elementData.experienceName}`,
                  experience_label: `${fullClient} | Variation ${variantIndex}`,
                }
              : {
                  experienceCategory: "Conversio Experience",
                  experienceAction: `${fullClient} | ${elementData.experienceName}`,
                  experienceLabel: `${fullClient} | Variation ${variantIndex}`,
                }),
            experience_segment: `${fullClient}.XV${variantIndex}`,
          },
          codeCopied: false,
        });
      }

      // Add regular variation events
      const regularVariationEvents =
        elementData.variationEventsWithCopied && elementData.variationEventsWithCopied.length === elementData.numVariants * elementData.eventDescriptions.length
          ? elementData.variationEventsWithCopied.slice((variantIndex - 1) * elementData.eventDescriptions.length, variantIndex * elementData.eventDescriptions.length).map((eventObj: unknown, idx: number) => {
              const description = elementData.eventDescriptions[idx];
              const eventSegment = generateEventSegment(description, `V${variantIndex}`);
              let baseEvent;

              if (clientCode === "LT") {
                baseEvent = {
                  event: "targetClickEvent",
                  eventData: {
                    click: {
                      clickLocation: "Conversio CRO",
                      clickAction: `${fullClient} | Event Tracking`,
                      clickText: `${fullClient} (Variation ${variantIndex}) | ${description}`,
                    },
                  },
                };
              } else if (clientCode === "SA" || clientCode === "VX") {
                baseEvent = {
                  event: "conversioEvent",
                  conversio: {
                    event_category: "Conversio CRO",
                    event_action: `${eventSegment} | Event Tracking`,
                    event_label: `${eventSegment} | (Variation ${variantIndex}) | ${description}`,
                    event_segment: `${eventSegment}`,
                  },
                };
              } else {
                baseEvent = {
                  eventCategory: "Conversio CRO",
                  eventAction: `${fullClient} | Event Tracking`,
                  eventLabel: `${fullClient} | (Variation ${variantIndex}) | ${description}`,
                  eventSegment: eventSegment,
                };
              }

              return {
                ...baseEvent,
                codeCopied: !!(eventObj as { codeCopied?: boolean })?.codeCopied,
                ...(isTriggerEvent(idx) ? { triggerEvent: true } : {}),
              };
            })
          : elementData.eventDescriptions.map((description: string, idx: number) => {
              const eventSegment = generateEventSegment(description, `V${variantIndex}`);
              let baseEvent;

              if (clientCode === "LT") {
                baseEvent = {
                  event: "targetClickEvent",
                  eventData: {
                    click: {
                      clickLocation: "Conversio CRO",
                      clickAction: `${fullClient} | Event Tracking`,
                      clickText: `${fullClient} (Variation ${variantIndex}) | ${description}`,
                    },
                  },
                };
              } else if (clientCode === "SA" || clientCode === "VX") {
                baseEvent = {
                  event: "conversioEvent",
                  conversio: {
                    event_category: "Conversio CRO",
                    event_action: `${eventSegment} | Event Tracking`,
                    event_label: `${eventSegment} | (Variation ${variantIndex}) | ${description}`,
                    event_segment: `${eventSegment}`,
                  },
                };
              } else {
                baseEvent = {
                  eventCategory: "Conversio CRO",
                  eventAction: `${fullClient} | Event Tracking`,
                  eventLabel: `${fullClient} | (Variation ${variantIndex}) | ${description}`,
                  eventSegment: eventSegment,
                };
              }

              return {
                ...baseEvent,
                codeCopied: false,
                ...(isTriggerEvent(idx) ? { triggerEvent: true } : {}),
              };
            });

      eventsForVariant.push(...regularVariationEvents);

      variationEvents.push({ label: `Variation ${variantIndex}`, events: eventsForVariant });
    }

    // Combine control and variation events
    const events = [{ label: "Dummy Control", events: controlEvents }, ...variationEvents];

    // Save to MongoDB
    const db = await connectToDatabase();

    interface Event {
      event?: string;
      eventData?: {
        click?: {
          clickLocation: string;
          clickAction: string;
          clickText: string;
        };
      };
      eventCategory?: string;
      eventAction?: string;
      eventLabel?: string;
      eventSegment?: string;
      codeCopied: boolean;
      triggerEvent?: boolean;
    }

    interface EventGroup {
      label: string;
      events: Event[];
    }

    interface DocumentSchema {
      _id: string;
      client: string;
      experienceName: string;
      events: EventGroup[];
      dateCreated: string;
    }
    const collection = db.collection<DocumentSchema>("eventdata");

    const now = new Date().toISOString();

    //console.log("About to save/update document with _id:", fullClient);

    // Use string _id consistently
    const result = await collection.updateOne(
      { _id: fullClient },
      {
        $set: {
          client: clients.find((c) => c.code === clientCode)?.name || elementData.client,
          experienceName: elementData.experienceName,
          events,
          dateCreated: now,
        },
      },
      { upsert: true }
    );

    //console.log("Save operation result:", result);

    return NextResponse.json({ message: "Element saved successfully!", result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ message: `Failed to save element: ${errorMessage}` }, { status: 500 });
  }
}
