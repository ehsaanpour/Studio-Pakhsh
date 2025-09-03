import { removeEngineer } from "@/lib/engineer-store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await removeEngineer(id);
    return NextResponse.json({ message: "Engineer removed successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove engineer" }, { status: 500 });
  }
}

