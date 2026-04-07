import { NextResponse } from "next/server";

// GET /api/documents — document index
export async function GET() {
  return NextResponse.json({
    message: "Document vault — per-matter access required",
    endpoint: "/api/matters/[id]/documents",
    totalDocuments: 0,
  });
}
