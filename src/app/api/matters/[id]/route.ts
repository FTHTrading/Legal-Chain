import { NextRequest, NextResponse } from "next/server";
import { SEED_MATTER_CREAMER } from "@/lib/data/seed";

// GET /api/matters/[id] — get single matter detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Demo: return seed matter for the known ID
  if (id === SEED_MATTER_CREAMER.id || id === "creamer-drive-169") {
    return NextResponse.json(SEED_MATTER_CREAMER);
  }

  return NextResponse.json({ error: "Matter not found" }, { status: 404 });
}
