import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const clients = [
      { name: "Finisterre", code: "FN" },
      { name: "Liverpool FC", code: "LF" },
      { name: "Phase Eight", code: "PH" },
      { name: "Hobbs", code: "HO" },
      { name: "Whistles", code: "WC" },
      { name: "Laithwaites", code: "LT" },
      { name: "Accessorize", code: "AS" },
      { name: "Monsoon", code: "MS" },
      { name: "Ocado", code: "OPT" },
      { name: "Team Sport", code: "TS" },
    ];

    const { elementData } = body;

    if (
      !elementData ||
      !elementData.client ||
      !elementData.eventDescriptions ||
      !elementData.experienceNumber
    ) {
      return NextResponse.json(
        { message: "Missing required fields in request body." },
        { status: 400 }
      );
    }

    const clientCode =
      clients.find((c) => c.name === elementData.client)?.code || elementData.client;
    const fullClient = `${clientCode}${elementData.experienceNumber}`;

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

    // Map to final event structure
    const controlEvents = elementData.eventDescriptions.map((desc) => {
      const letter = descriptionLetters.get(desc);
      return {
        eventCategory: "Conversio CRO",
        eventAction: `${fullClient} | Event Tracking`,
        eventLabel: `${fullClient} | (Control Original) | ${desc}`,
        eventSegment: `${fullClient}ECO${letter}`,
      };
    });

    const variationEvents = elementData.eventDescriptions.map((desc) => {
      const letter = descriptionLetters.get(desc);
      return {
        eventCategory: "Conversio CRO",
        eventAction: `${fullClient} | Event Tracking`,
        eventLabel: `${fullClient} | (Variation 1) | ${desc}`,
        eventSegment: `${fullClient}EV1${letter}`,
      };
    });

    const events = [
      { label: "Dummy Control", events: controlEvents },
      { label: "Variation 1", events: variationEvents },
    ];

    // Save to MongoDB
    const db = await connectToDatabase();
    const collection = db.collection("eventdata");

    const result = await collection.updateOne(
      { _id: fullClient },
      {
        $set: {
          client: elementData.client,
          events,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Element saved successfully!", result });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to save element: ${error.message}` },
      { status: 500 }
    );
  }
}
