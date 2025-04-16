import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("eventdata");

    // Fetch all documents from the "eventdata" collection
    const elements = await collection.find({}).toArray();

    return NextResponse.json({ elements });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to fetch elements: ${error.message}` },
      { status: 500 }
    );
  }
}