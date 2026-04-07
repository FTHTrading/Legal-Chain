import { NextRequest, NextResponse } from "next/server";

// GET /api/audit — audit log summary
export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  return NextResponse.json({
    message: "Audit log — client-side store manages entries. Use the Operations dashboard for full audit trail.",
    accessLevel: "system_admin",
    filter: category || "all",
    endpoints: {
      dashboard: "/ops/audit",
      description: "Full audit log with SHA-256 hash chain available in Operations > Audit",
    },
  });
}
