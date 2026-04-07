import { NextRequest, NextResponse } from "next/server";
import { SEED_MATTER_CREAMER, ACTIVE_CASES } from "@/lib/data/seed";

// GET /api/matters — list all matters
export async function GET() {
  return NextResponse.json({
    matters: ACTIVE_CASES,
    total: ACTIVE_CASES.length,
  });
}

// POST /api/matters — create a new matter (stub)
export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(
    { message: "Matter creation requires attorney approval", received: Object.keys(body) },
    { status: 202 }
  );
}
