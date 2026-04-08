import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

// Rate limit: 5 applications per IP per hour
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (entry && entry.resetAt > now && entry.count >= 5) {
    return NextResponse.json(
      { error: "Too many applications. Please try again later or email law@unykorn.org directly." },
      { status: 429 },
    );
  }
  if (!entry || entry.resetAt <= now) {
    rateLimiter.set(ip, { count: 1, resetAt: now + 3600_000 });
  } else {
    entry.count++;
  }

  try {
    const body = await req.json();
    const { name, email, situation, caseType } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !situation?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and situation description are required." },
        { status: 400 },
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    // Store the hardship application as an intake with hardship flag
    const intake = store.createIntake({
      clientName: name.trim(),
      email: email.trim(),
      phone: "",
      matterType: caseType?.trim() || "hardship_general",
      urgency: "routine",
      description: `[HARDSHIP ACCESS APPLICATION]\n\nSituation: ${situation.trim()}`,
    });

    return NextResponse.json({
      ok: true,
      message: "Hardship access application received. Full platform access will be granted within 24 hours.",
      applicationId: intake.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process application. Please email law@unykorn.org directly." },
      { status: 500 },
    );
  }
}
