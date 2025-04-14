import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    //console.log("Incoming request received"); // Debugging
    const bocldy = await req.json();
    //console.log("Parsed request body:", bocldy);

    const { elementData } = bocldy;
    console.log("Received elementData:", elementData);

    const db = await connectToDatabase();
    console.log("Connected to database:", db.databaseName);

    const collection = db.collection("eventdata");

    const result = await collection.insertOne(elementData);
    console.log("Insert result:", result);

    return NextResponse.json({ message: "Element saved successfully!", result });
  } catch (error: any) {
    //console.error("Error saving data:", error.message, error.stack);
    return NextResponse.json({ message: `Failed to save element: ${error.message}` }, { status: 500 });
  }
}
