import { NextRequest, NextResponse } from "next/server";
import { SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON } from "@/lib/data/seed";

const ALL_MATTERS = [SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON];

// GET /api/matters/[id] — get single matter detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const matter = ALL_MATTERS.find(m => m.id === id);
  if (matter) {
    return NextResponse.json(matter);
  }

  return NextResponse.json({ error: "Matter not found" }, { status: 404 });
}
