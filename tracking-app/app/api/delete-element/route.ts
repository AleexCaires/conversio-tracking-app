import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { clients } from "../../../lib/clients";
import { ObjectId } from "mongodb";
import { authenticateRequest, getCorsHeaders, handleOptions } from "../../../lib/apiAuth";

// Handle preflight OPTIONS requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return handleOptions(origin);
}

export async function DELETE(req: NextRequest) {
  const origin = req.headers.get("origin");
  const url = new URL(req.url);

  const isInternalDashboardRequest = (origin && (origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("conversio-tracking-app.vercel.app"))) || url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "conversio-tracking-app.vercel.app";

  // For internal dashboard requests, allow access without API credentials.
  // For any other callers, require valid API key/secret.
  if (!isInternalDashboardRequest) {
    const authError = await authenticateRequest(req);
    if (authError) return authError;
  }

  try {
    const { client, experienceNumber } = await req.json();

    console.log("[DELETE] Received client:", client, "experienceNumber:", experienceNumber);

    if (!client || !experienceNumber) {
      console.log("[DELETE] Missing client or experienceNumber.");
      return NextResponse.json({ message: "Missing client or experienceNumber." }, { status: 400, headers: getCorsHeaders(origin) });
    }

    const db = await connectToDatabase();
    const collection = db.collection("eventdata");

    // Try multiple approaches to find and delete the document
    let result;
    let foundDoc = null;

    // 1. Try with experienceNumber as direct _id (string)
    console.log("[DELETE] Trying direct experienceNumber as string:", experienceNumber);
    foundDoc = await collection.findOne({ _id: experienceNumber });
    if (foundDoc) {
      console.log("[DELETE] Found document with direct string _id");
      result = await collection.deleteOne({ _id: experienceNumber });
    }

    // 2. Try with experienceNumber as ObjectId
    if (!foundDoc && ObjectId.isValid(experienceNumber)) {
      console.log("[DELETE] Trying experienceNumber as ObjectId:", experienceNumber);
      const objectId = new ObjectId(experienceNumber);
      foundDoc = await collection.findOne({ _id: objectId });
      if (foundDoc) {
        console.log("[DELETE] Found document with ObjectId _id");
        result = await collection.deleteOne({ _id: objectId });
      }
    }

    // 3. Try constructing client+experienceNumber (old format)
    if (!foundDoc) {
      const clientCode = clients.find((c) => c.name === client || c.code === client)?.code || client;
      const constructedId = experienceNumber.startsWith(clientCode) ? experienceNumber : `${clientCode}${experienceNumber}`;
      console.log("[DELETE] Trying constructed _id:", constructedId);
      foundDoc = await collection.findOne({ _id: constructedId });
      if (foundDoc) {
        console.log("[DELETE] Found document with constructed string _id");
        result = await collection.deleteOne({ _id: constructedId });
      }
    }

    if (!result || result.deletedCount === 0) {
      console.log("[DELETE] No document found or deleted");
      return NextResponse.json({ message: "Experience not found." }, { status: 404, headers: getCorsHeaders(origin) });
    }

    console.log("[DELETE] Experience deleted successfully:", result);
    return NextResponse.json({ message: "Experience deleted successfully." }, { headers: getCorsHeaders(origin) });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[DELETE] Failed to delete experience:", error);
    return NextResponse.json({ message: `Failed to delete experience: ${errorMessage}` }, { status: 500, headers: getCorsHeaders(origin) });
  }
}
