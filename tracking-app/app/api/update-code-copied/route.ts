import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { clients } from "../../../lib/clients";

interface UpdateCodeCopiedRequest {
  client: string;
  experienceNumber: string;
  eventType: string;
  eventIndex: number;
  codeCopied: boolean;
}

export async function POST(req: Request) {
  try {
    const { client, experienceNumber, eventType, eventIndex, codeCopied }: UpdateCodeCopiedRequest = await req.json();

    //console.log("Received update request:", { client, experienceNumber, eventType, eventIndex, codeCopied });

    if (!client || !experienceNumber || !eventType || typeof eventIndex !== "number") {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const clientCode = clients.find((c) => c.name === client || c.code === client)?.code || client;
    const fullClient = `${clientCode}${experienceNumber}`;

    //console.log("Looking for document with _id:", fullClient);

    const db = await connectToDatabase();
    interface EventGroup {
      label: string;
      events: {
        codeCopied?: boolean;
        [key: string]: unknown;
      }[];
    }

    const collection = db.collection<{ _id: string; events?: EventGroup[] }>("eventdata");

    const doc = await collection.findOne({ _id: fullClient });
    if (!doc) {
      console.error("Document not found for _id:", fullClient);
      return NextResponse.json({ message: "Document not found." }, { status: 404 });
    }

    let updated = false;
    if (Array.isArray(doc.events)) {
      for (const group of doc.events) {
        if ((eventType === "control" && group.label === "Dummy Control") || (eventType === "variation" && group.label.startsWith("Variation"))) {
          if (Array.isArray(group.events) && group.events[eventIndex]) {
            //console.log("Before update:", group.events[eventIndex]);
            group.events[eventIndex].codeCopied = !!codeCopied;
            updated = true;
            //console.log("After update:", group.events[eventIndex]);
            break;
          }
        } else if (group.label === "Sephora") {
          for (const event of group.events) {
            if (event.event === "conversioEvent" && event.conversio) {
              event.codeCopied = !!codeCopied;
              updated = true;
              break;
            }
          }
        }
      }
    }

    if (!updated) {
      console.error("Event not found for update in document:", fullClient);
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    await collection.updateOne({ _id: fullClient }, { $set: { events: doc.events } });

    return NextResponse.json({ message: "codeCopied updated successfully." });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("API error:", error);
    return NextResponse.json({ message: `Failed to update codeCopied: ${errorMessage}` }, { status: 500 });
  }
}
