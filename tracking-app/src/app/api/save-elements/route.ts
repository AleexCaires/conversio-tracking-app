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
      !elementData.experienceNumber ||
      !elementData.experienceName || 
      typeof elementData.numVariants !== "number"
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

    const generateEventSegment = (description: string, variantPrefix: string) => {
      const sharedLetter = descriptionLetters.get(description);
      if (variantPrefix === "ECO") {
        // For Dummy Control, use 'ECO' prefix
        return `${fullClient}${variantPrefix}${sharedLetter}`;
      }
      // For variations, use 'EV' followed by variant number (e.g., EV1, EV2)
      return `${fullClient}E${variantPrefix}${sharedLetter}`;
    };

    // Generate Dummy Control events
    const controlEvents = elementData.eventDescriptions.map((description) => {
      const eventSegment = generateEventSegment(description, "ECO");
      return {
        eventCategory: "Conversio CRO",
        eventAction: `${fullClient} | Event Tracking`,
        eventLabel: `${fullClient} | (Control Original) | ${description}`,
        eventSegment: eventSegment,
      };
    });

    // Generate Variation events dynamically based on numVariants
    const variationEvents = [];
    for (let variantIndex = 1; variantIndex <= elementData.numVariants; variantIndex++) {
      const eventsForVariant = elementData.eventDescriptions.map((description) => {
        const eventSegment = generateEventSegment(description, `V${variantIndex}`);
        return {
          eventCategory: "Conversio CRO",
          eventAction: `${fullClient} | Event Tracking`,
          eventLabel: `${fullClient} | (Variation ${variantIndex}) | ${description}`,
          eventSegment: eventSegment,
        };
      });
      variationEvents.push({ label: `Variation ${variantIndex}`, events: eventsForVariant });
    }

    // Combine control and variation events
    const events = [
      { label: "Dummy Control", events: controlEvents },
      ...variationEvents,
    ];

    // Save to MongoDB
    const db = await connectToDatabase();
    const collection = db.collection("eventdata");

    const today = new Date().toISOString().split('T')[0];

    const result = await collection.updateOne(
      { _id: fullClient },
      {
        $set: {
          client: clients.find((c) => c.code === clientCode)?.name || elementData.client,
          experienceName: elementData.experienceName, 
          events,
        },
        $setOnInsert: {
          dateCreated: today,
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