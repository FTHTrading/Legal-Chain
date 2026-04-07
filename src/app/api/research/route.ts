import { NextResponse } from "next/server";

// GET /api/research — research workbench status
export async function GET() {
  return NextResponse.json({
    activeQueries: 0,
    completedQueries: 3,
    authorities: 12,
    message: "Research workbench API — query via POST /api/research",
  });
}
