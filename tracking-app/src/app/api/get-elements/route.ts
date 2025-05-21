import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("eventdata");

    // Fetch all elements, no pagination or search filters
    const elements = await collection.find({}).toArray();

    const formattedElements = elements
      .map((element) => {
        // --- Ensure dateCreated is always present and is an ISO string ---
        let dateCreated: string;
        if (element.dateCreated) {
          // If already a Date object or ISO string
          dateCreated = new Date(element.dateCreated).toISOString();
        } else if (element._id && element._id.getTimestamp) {
          // If _id is a MongoDB ObjectId, extract timestamp
          dateCreated = element._id.getTimestamp().toISOString();
        } else {
          // Fallback to now
          dateCreated = new Date().toISOString();
        }

        const isLaithwaites = element.client === "Laithwaites";
        const anyCopied = element.events.some((group: any) => group.events.some((event: any) => event.codeCopied === true));
        let processedEventGroups;

        if (anyCopied) {
          processedEventGroups = element.events
            .map((group: any) => {
              const copiedEvents = group.events.filter((event: any) => event.codeCopied === true);
              if (copiedEvents.length > 0) {
                const formattedCopiedEvents = copiedEvents.map((event: any) => {
                  if (isLaithwaites && event.event === "targetClickEvent") {
                    return {
                      eventAction: event.eventData.click.clickAction,
                      eventCategory: event.eventData.click.clickLocation,
                      eventLabel: event.eventData.click.clickText,
                      eventSegment: "",
                      codeCopied: event.codeCopied,
                      // Preserve triggerEvent property if it exists
                      ...(event.triggerEvent ? { triggerEvent: event.triggerEvent } : {}),
                    };
                  }
                  return event;
                });
                return { ...group, events: formattedCopiedEvents };
              }
              return null;
            })
            .filter((group: any): group is any => group !== null);
        } else {
          processedEventGroups = element.events.map((group: any) => {
            const formattedAllEvents = group.events.map((event: any) => {
              if (isLaithwaites && event.event === "targetClickEvent") {
                return {
                  eventAction: event.eventData.click.clickAction,
                  eventCategory: event.eventData.click.clickLocation,
                  eventLabel: event.eventData.click.clickText,
                  eventSegment: "",
                  codeCopied: event.codeCopied,
                  // Preserve triggerEvent property if it exists
                  ...(event.triggerEvent ? { triggerEvent: event.triggerEvent } : {}),
                };
              }
              return event;
            });
            return { ...group, events: formattedAllEvents };
          });
        }

        return {
          _id: element._id,
          client: element.client,
          dateCreated, // always ISO string
          experienceName: element.experienceName,
          events: processedEventGroups, // This is the grouped structure
        };
      })
      .filter((element) => element.events.length > 0);

    // Return only the elements, no pagination metadata
    return new Response(JSON.stringify({ elements: formattedElements }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    // Ensure JSON response even on error
    return new Response(JSON.stringify({ message: `Failed to fetch elements: ${error.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
