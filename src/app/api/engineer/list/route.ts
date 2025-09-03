import { listEngineers } from "@/lib/engineer-store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const engineers = await listEngineers();
    return NextResponse.json(engineers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to list engineers" }, { status: 500 });
  }
}

