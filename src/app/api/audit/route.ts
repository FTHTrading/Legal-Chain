import { NextResponse } from "next/server";

// GET /api/audit — audit log (requires system_admin or auditor role)
export async function GET() {
  return NextResponse.json({
    message: "Audit log access requires system_admin or auditor role",
    totalEntries: 0,
    lastEntry: null,
  });
}
