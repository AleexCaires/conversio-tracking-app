import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("eventdata");

    // Fetch all elements from the database
    const elements = await collection.find({}).toArray();

    // Include `experienceName` in the response
    const formattedElements = elements.map((element) => ({
      _id: element._id,
      client: element.client,
      dateCreated: element.dateCreated,
      experienceName: element.experienceName,
      events: element.events,
    }));

    return new Response(JSON.stringify({ elements: formattedElements }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: `Failed to fetch elements: ${error.message}` }),
      { status: 500 }
    );
  }
}