import { NextResponse } from "next/server";

// GET /api/evidence — list evidence items across matters
export async function GET() {
  return NextResponse.json({
    message: "Evidence vault — per-matter access required",
    endpoint: "/api/matters/[id]/evidence",
  });
}
