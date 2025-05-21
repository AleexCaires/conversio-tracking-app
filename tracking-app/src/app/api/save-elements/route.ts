import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { clients } from "@/lib/clients";


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

    const getRandomLetter = (): string => {
      const letters = "QRSTUVWXYZ";
      let letter;
      do {
        letter = letters[Math.floor(Math.random() * letters.length)];
      } while (usedLetters.has(letter));
      usedLetters.add(letter);
      return letter;
    };

    elementData.eventDescriptions.forEach((desc) => {
      if (!descriptionLetters.has(desc)) {
        descriptionLetters.set(desc, getRandomLetter());
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
        ? elementData.controlEventsWithCopied.map((eventObj, idx) => {
            const description = elementData.eventDescriptions[idx];
            const eventSegment = generateEventSegment(description, "ECO");
            const baseEvent =
              clientCode === "LT"
                ? {
                    event: "targetClickEvent",
                    eventData: {
                      click: {
                        clickLocation: "Conversio CRO",
                        clickAction: `${fullClient} | Event Tracking`,
                        clickText: `${fullClient} (Control Original) | ${description}`,
                      },
                    },
                  }
                : {
                    eventCategory: "Conversio CRO",
                    eventAction: `${fullClient} | Event Tracking`,
                    eventLabel: `${fullClient} | (Control Original) | ${description}`,
                    eventSegment: eventSegment,
                  };
            // Only add triggerEvent: true if this is the trigger event
            return {
              ...baseEvent,
              codeCopied: !!eventObj.codeCopied,
              ...(isTriggerEvent(idx) ? { triggerEvent: true } : {}),
            };
          })
        : elementData.eventDescriptions.map((description, idx) => {
            const eventSegment = generateEventSegment(description, "ECO");
            const baseEvent =
              clientCode === "LT"
                ? {
                    event: "targetClickEvent",
                    eventData: {
                      click: {
                        clickLocation: "Conversio CRO",
                        clickAction: `${fullClient} | Event Tracking`,
                        clickText: `${fullClient} (Control Original) | ${description}`,
                      },
                    },
                  }
                : {
                    eventCategory: "Conversio CRO",
                    eventAction: `${fullClient} | Event Tracking`,
                    eventLabel: `${fullClient} | (Control Original) | ${description}`,
                    eventSegment: eventSegment,
                  };
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
          ? elementData.variationEventsWithCopied.slice((variantIndex - 1) * elementData.eventDescriptions.length, variantIndex * elementData.eventDescriptions.length).map((eventObj, idx) => {
              const description = elementData.eventDescriptions[idx];
              const eventSegment = generateEventSegment(description, `V${variantIndex}`);
              const baseEvent =
                clientCode === "LT"
                  ? {
                      event: "targetClickEvent",
                      eventData: {
                        click: {
                          clickLocation: "Conversio CRO",
                          clickAction: `${fullClient} | Event Tracking`,
                          clickText: `${fullClient} (Variation ${variantIndex}) | ${description}`,
                        },
                      },
                    }
                  : {
                      eventCategory: "Conversio CRO",
                      eventAction: `${fullClient} | Event Tracking`,
                      eventLabel: `${fullClient} | (Variation ${variantIndex}) | ${description}`,
                      eventSegment: eventSegment,
                    };
              return {
                ...baseEvent,
                codeCopied: !!eventObj.codeCopied,
                ...(isTriggerEvent(idx) ? { triggerEvent: true } : {}),
              };
            })
          : elementData.eventDescriptions.map((description, idx) => {
              const eventSegment = generateEventSegment(description, `V${variantIndex}`);
              const baseEvent =
                clientCode === "LT"
                  ? {
                      event: "targetClickEvent",
                      eventData: {
                        click: {
                          clickLocation: "Conversio CRO",
                          clickAction: `${fullClient} | Event Tracking`,
                          clickText: `${fullClient} (Variation ${variantIndex}) | ${description}`,
                        },
                      },
                    }
                  : {
                      eventCategory: "Conversio CRO",
                      eventAction: `${fullClient} | Event Tracking`,
                      eventLabel: `${fullClient} | (Variation ${variantIndex}) | ${description}`,
                      eventSegment: eventSegment,
                    };
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
    const collection = db.collection("eventdata");

    const now = new Date().toISOString();

    // Always update dateCreated to now (full timestamp), even when a trigger event is enabled
    const result = await collection.updateOne(
      { _id: fullClient },
      {
        $set: {
          client: clients.find((c) => c.code === clientCode)?.name || elementData.client,
          experienceName: elementData.experienceName,
          events,
          dateCreated: now, // always update with full timestamp
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Element saved successfully!", result });
  } catch (error: any) {
    return NextResponse.json({ message: `Failed to save element: ${error.message}` }, { status: 500 });
  }
}
