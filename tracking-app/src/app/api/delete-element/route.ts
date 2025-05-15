import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function DELETE(req: Request) {
  try {
    const { client, experienceNumber } = await req.json();

    console.log("[DELETE] Received client:", client, "experienceNumber:", experienceNumber);

    if (!client || !experienceNumber) {
      console.log("[DELETE] Missing client or experienceNumber.");
      return NextResponse.json({ message: "Missing client or experienceNumber." }, { status: 400 });
    }

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
      { name: "Sephora", code: "SA" },
    ];

    const clientCode = clients.find((c) => c.name === client || c.code === client)?.code || client;

    const _id = experienceNumber.startsWith(clientCode) ? experienceNumber : `${clientCode}${experienceNumber}`;

    console.log(`[DELETE] Trying to delete document with _id: ${_id}`);

    const db = await connectToDatabase();
    const collection = db.collection("eventdata");

    const result = await collection.deleteOne({ _id });
    console.log(`[DELETE] deleteOne result for _id ${_id}:`, result);

    if (result.deletedCount === 0) {
      console.log("[DELETE] Experience not found for _id:", _id);
      return NextResponse.json({ message: "Experience not found." }, { status: 404 });
    }

    console.log("[DELETE] Experience deleted successfully.");
    return NextResponse.json({ message: "Experience deleted successfully." });
  } catch (error: any) {
    console.error("[DELETE] Failed to delete experience:", error);
    return NextResponse.json({ message: `Failed to delete experience: ${error.message}` }, { status: 500 });
  }
}
