import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

function generateInviteCode(): string {
  return `UNYLAW-${randomBytes(4).toString("hex").toUpperCase()}`;
}

/**
 * POST /api/beta/signup — Register for the beta test
 * Body: { email, name?, role?, referralCode? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, role, referralCode } = body as {
      email?: string;
      name?: string;
      role?: string;
      referralCode?: string;
    };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Check duplicate
    const existing = await db.betaSignup.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      const totalSignups = await db.betaSignup.count();
      // Determine position by counting signups created before this one
      const position = await db.betaSignup.count({
        where: { createdAt: { lte: existing.createdAt } },
      });
      return NextResponse.json({
        ok: true,
        message: "Already registered!",
        inviteCode: existing.inviteCode,
        position,
        totalSignups,
      });
    }

    // Validate referral code if provided
    let referredBy: string | undefined;
    if (referralCode) {
      const referrer = await db.betaSignup.findUnique({
        where: { inviteCode: referralCode },
      });
      if (referrer) referredBy = referrer.email;
    }

    const tester = await db.betaSignup.create({
      data: {
        email: email.toLowerCase(),
        name,
        role,
        inviteCode: generateInviteCode(),
        referredBy,
      },
    });

    const totalSignups = await db.betaSignup.count();

    console.log(`[Beta Signup] #${totalSignups}: ${email} (ref: ${referralCode || "direct"})`);

    return NextResponse.json({
      ok: true,
      message: "Welcome to the UNYKORN // LAW beta!",
      inviteCode: tester.inviteCode,
      position: totalSignups,
      totalSignups,
      shareUrl: `https://law.unykorn.org/beta?ref=${tester.inviteCode}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Signup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * GET /api/beta/signup — Get beta stats
 */
export async function GET() {
  const totalSignups = await db.betaSignup.count();
  const recentSignups = await db.betaSignup.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { name: true, role: true, createdAt: true },
  });
  return NextResponse.json({
    totalSignups,
    spotsRemaining: Math.max(0, 100 - totalSignups),
    recentSignups: recentSignups.map((t) => ({
      name: t.name || "Anonymous",
      role: t.role || "Tester",
      signedUpAt: t.createdAt.toISOString(),
    })),
  });
}
