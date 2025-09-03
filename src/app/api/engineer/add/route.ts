import { addEngineer } from "@/lib/engineer-store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const newEngineer = await addEngineer({ name });
    return NextResponse.json(newEngineer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add engineer" }, { status: 500 });
  }
}

