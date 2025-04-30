import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("eventdata");

    // Fetch all elements from the database
    const elements = await collection.find({}).toArray();

    // Include `experienceName` in the response
    const formattedElements = elements.map((element) => {
      const isLaithwaites = element.client === "Laithwaites";

      const formattedEvents = element.events.map((event: any) => {
        if (isLaithwaites && event.event === "targetClickEvent") {
          return {
            eventAction: event.eventData.click.clickAction,
            eventCategory: event.eventData.click.clickLocation,
            eventLabel: event.eventData.click.clickText,
            eventSegment: "", // Adobe-specific events do not have eventSegment
          };
        }
        return event;
      });

      return {
        _id: element._id,
        client: element.client,
        dateCreated: element.dateCreated,
        experienceName: element.experienceName,
        events: formattedEvents,
      };
    });

    return new Response(JSON.stringify({ elements: formattedElements }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: `Failed to fetch elements: ${error.message}` }), { status: 500 });
  }
}
