import { NextResponse } from "next/server";
import { SEED_MATTER_CREAMER } from "@/lib/data/seed";

// GET /api/research — research workbench status
export async function GET() {
  const research = SEED_MATTER_CREAMER.claims || [];
  return NextResponse.json({
    activeQueries: 1,
    completedQueries: research.length,
    authorities: 12,
    jurisdictions: ["GA", "FL"],
    topics: ["property_law", "post_closing_disputes", "criminal_sentencing", "blockchain_forensics"],
    message: "Research workbench API — query via POST /api/research",
  });
}
