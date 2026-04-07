import { NextRequest, NextResponse } from "next/server";
import { SEED_FORENSIC_TRON } from "@/lib/data/seed-platform";

const INTERNAL_TOKEN = process.env.FORENSICS_API_TOKEN;

function checkAuth(request: NextRequest): boolean {
  if (!INTERNAL_TOKEN) return false; // deny if no token configured
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === INTERNAL_TOKEN;
}

// GET /api/forensics — list forensic cases or filter by matterId/chain/status
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = request.nextUrl;
  const matterId = searchParams.get("matterId");
  const chain = searchParams.get("chain");
  const status = searchParams.get("status");

  // Seed cases — single forensic case for now
  const cases = [SEED_FORENSIC_TRON];

  const filtered = cases.filter((c) => {
    if (matterId && c.matterId !== matterId) return false;
    if (chain && !c.chains.includes(chain as typeof c.chains[number])) return false;
    if (status && c.status !== status) return false;
    return true;
  });

  return NextResponse.json({
    cases: filtered,
    total: filtered.length,
    filters: { matterId, chain, status },
    timestamp: new Date().toISOString(),
  });
}

// POST /api/forensics — create a new forensic case
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  // Validate required fields
  const required = ["matterId", "title", "description", "caseType", "chains"] as const;
  const missing = required.filter((f) => !body[f]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const newCase = {
    id: `fc-${Date.now()}`,
    ...body,
    wallets: body.wallets || [],
    transactions: body.transactions || [],
    suspects: body.suspects || [],
    status: body.status || "open",
    agentIds: body.agentIds || [],
    evidenceItemIds: body.evidenceItemIds || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(
    { case: newCase, message: "Forensic case created" },
    { status: 201 }
  );
}
