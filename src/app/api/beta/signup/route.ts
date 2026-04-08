import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * Beta Tester Store — In-memory for now, persists via Vercel KV or DB later.
 * Each signup gets a unique invite code they can share.
 */

export interface BetaTester {
  id: string;
  email: string;
  name?: string;
  role?: string;
  inviteCode: string;
  referredBy?: string;
  signedUpAt: string;
  activated: boolean;
}

// In-memory store (will be replaced with DB)
const betaTesters: BetaTester[] = [];

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
    if (betaTesters.some((t) => t.email.toLowerCase() === email.toLowerCase())) {
      const existing = betaTesters.find((t) => t.email.toLowerCase() === email.toLowerCase())!;
      return NextResponse.json({
        ok: true,
        message: "Already registered!",
        inviteCode: existing.inviteCode,
        position: betaTesters.indexOf(existing) + 1,
        totalSignups: betaTesters.length,
      });
    }

    // Validate referral code if provided
    let referredBy: string | undefined;
    if (referralCode) {
      const referrer = betaTesters.find((t) => t.inviteCode === referralCode);
      if (referrer) referredBy = referrer.email;
    }

    const tester: BetaTester = {
      id: `beta-${Date.now()}-${randomBytes(4).toString("hex")}`,
      email: email.toLowerCase(),
      name,
      role,
      inviteCode: generateInviteCode(),
      referredBy,
      signedUpAt: new Date().toISOString(),
      activated: false,
    };

    betaTesters.push(tester);

    console.log(`[Beta Signup] #${betaTesters.length}: ${email} (ref: ${referralCode || "direct"})`);

    return NextResponse.json({
      ok: true,
      message: "Welcome to the UNYKORN // LAW beta!",
      inviteCode: tester.inviteCode,
      position: betaTesters.length,
      totalSignups: betaTesters.length,
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
  return NextResponse.json({
    totalSignups: betaTesters.length,
    spotsRemaining: Math.max(0, 100 - betaTesters.length),
    recentSignups: betaTesters.slice(-5).map((t) => ({
      name: t.name || "Anonymous",
      role: t.role || "Tester",
      signedUpAt: t.signedUpAt,
    })),
  });
}
