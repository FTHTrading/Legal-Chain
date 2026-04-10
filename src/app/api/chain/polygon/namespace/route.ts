/**
 * /api/chain/polygon/namespace
 *
 * GET  ?name=kevan&tld=law     ΓÇö check availability
 * GET  ?wallet=0x...           ΓÇö list names owned by wallet (reads totalNames)
 * GET  ?resolve=kevan.law      ΓÇö resolve a full name
 * POST { name, tld, owner?, resolution? } ΓÇö server-side issuer registration (admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { checkNamespaceAvailability, resolveNamespace, issuerRegisterNamespace, getTotalNamespaces, getRegistrationFee } from "@/lib/polygon/ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name");
  const tld = searchParams.get("tld");
  const resolve = searchParams.get("resolve");

  try {
    // Resolve a full name
    if (resolve) {
      const ns = await resolveNamespace(resolve);
      if (!ns) {
        return NextResponse.json({ ok: false, error: "Name not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, data: ns });
    }

    // Check availability
    if (name && tld) {
      const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, "");
      const cleanTld = tld.toLowerCase();

      if (!["law", "legal"].includes(cleanTld)) {
        return NextResponse.json({ ok: false, error: "TLD must be 'law' or 'legal'" }, { status: 400 });
      }
      if (clean.length < 2 || clean.length > 32) {
        return NextResponse.json({ ok: false, error: "Name must be 2ΓÇô32 characters" }, { status: 400 });
      }

      const [availability, fee] = await Promise.all([
        checkNamespaceAvailability(clean, cleanTld),
        getRegistrationFee(),
      ]);
      return NextResponse.json({ ok: true, data: availability, registrationFee: fee });
    }

    // Stats fallback
    const total = await getTotalNamespaces();
    const fee = await getRegistrationFee();
    return NextResponse.json({ ok: true, data: { totalNames: total, registrationFee: fee } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Validate admin token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, tld, owner, resolution } = body as {
      name?: string;
      tld?: string;
      owner?: string;
      resolution?: string;
    };

    if (!name || !tld) {
      return NextResponse.json({ ok: false, error: "name and tld required" }, { status: 400 });
    }
    if (!["law", "legal"].includes(tld.toLowerCase())) {
      return NextResponse.json({ ok: false, error: "TLD must be 'law' or 'legal'" }, { status: 400 });
    }

    const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const result = await issuerRegisterNamespace(
      clean,
      tld.toLowerCase(),
      owner || process.env.POLYGON_ISSUER_ADDRESS || "",
      resolution || "{}"
    );

    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}