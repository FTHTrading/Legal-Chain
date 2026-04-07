import { NextRequest, NextResponse } from "next/server";
import { SEED_INTAKES } from "@/lib/data/seed-platform";

// GET /api/intake — list intake queue
export async function GET() {
  return NextResponse.json({
    intakes: SEED_INTAKES,
    total: SEED_INTAKES.length,
    byStatus: {
      screening: SEED_INTAKES.filter(i => i.status === "screening").length,
      initial_review: SEED_INTAKES.filter(i => i.status === "initial_review").length,
      conflict_check: SEED_INTAKES.filter(i => i.status === "conflict_check").length,
    },
  });
}

// POST /api/intake — submit new intake
export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(
    {
      message: "Intake received — entering screening queue",
      id: crypto.randomUUID(),
      status: "new",
    },
    { status: 201 }
  );
}
