import { connectToDatabase } from "@/lib/mongodb";
import { getCorsHeaders, handleOptions } from "@/lib/apiAuth";
import { NextRequest } from "next/server";

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return handleOptions(origin);
}

//Create a new event/experience
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  try {
    const body = await request.json();

    // Validate required fields
    if (!body._id || !body.client || !body.experienceName || !body.events) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields: _id, client, experienceName, events" }), { status: 400, headers: getCorsHeaders(origin) });
    }

    const db = await connectToDatabase();
    const collection = db.collection("eventdata");

    // Check if document with this _id already exists
    const existing = await collection.findOne({ _id: body._id });
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: `Document with _id "${body._id}" already exists` }), { status: 409, headers: getCorsHeaders(origin) });
    }

    // Insert new document
    const newDocument = {
      _id: body._id,
      client: body.client,
      dateCreated: body.dateCreated || new Date().toISOString(),
      experienceName: body.experienceName,
      events: body.events,
    };

    await collection.insertOne(newDocument);

    return new Response(JSON.stringify({ success: true, data: newDocument }), {
      status: 201,
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ success: false, error: `Failed to create element: ${errorMessage}` }), {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
}
