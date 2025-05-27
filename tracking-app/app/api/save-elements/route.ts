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

    console.log("Saving document with _id:", fullClient);

    const usedLetters = new Set<string>();
    const descriptionLetters = new Map<string, string>();

    const getRandomLetter = (seed: string, usedLetters: Set<string>): string => {
      const letters = "QRSTUVWXYZ";
      // Create a simple hash from the seed to make it deterministic
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }

      const availableLetters = letters.split("").filter((letter) => !usedLetters.has(letter));
      if (availableLetters.length === 0) return "Q"; // fallback

      const index = Math.abs(hash) % availableLetters.length;
      const letter = availableLetters[index];
      usedLetters.add(letter);
      return letter;
    };

    elementData.eventDescriptions.forEach((desc: string, index: number) => {
      if (!descriptionLetters.has(desc)) {
        // Use description + index as seed for deterministic results
        const seed = `${desc}-${index}-${fullClient}`;
        descriptionLetters.set(desc, getRandomLetter(seed, usedLetters));
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
    const controlEvents =
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
            } else if (clientCode === "SA") {
              baseEvent = {
                event: "conversioEvent",
                conversio: {
                  conversio_experiences: `${fullClient} | (Control Original) | ${description}`,
                  conversio_events: `${fullClient} | Event Tracking`,
                  conversio_segment: eventSegment,
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
            } else if (clientCode === "SA") {
              baseEvent = {
                event: "conversioEvent",
                conversio: {
                  conversio_experiences: `${fullClient} | (Control Original) | ${description}`,
                  conversio_events: `${fullClient} | Event Tracking`,
                  conversio_segment: eventSegment,
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

    // Generate Variation events dynamically based on numVariants
    const variationEvents = [];
    for (let variantIndex = 1; variantIndex <= elementData.numVariants; variantIndex++) {
      const eventsForVariant =
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
              } else if (clientCode === "SA") {
                baseEvent = {
                  event: "conversioEvent",
                  conversio: {
                    conversio_experiences: `${fullClient} | (Variation ${variantIndex}) | ${description}`,
                    conversio_events: `${fullClient} | Event Tracking`,
                    conversio_segment: eventSegment,
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
              } else if (clientCode === "SA") {
                baseEvent = {
                  event: "conversioEvent",
                  conversio: {
                    conversio_experiences: `${fullClient} | (Variation ${variantIndex}) | ${description}`,
                    conversio_events: `${fullClient} | Event Tracking`,
                    conversio_segment: eventSegment,
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

    console.log("About to save/update document with _id:", fullClient);

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

    console.log("Save operation result:", result);

    return NextResponse.json({ message: "Element saved successfully!", result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ message: `Failed to save element: ${errorMessage}` }, { status: 500 });
  }
}
