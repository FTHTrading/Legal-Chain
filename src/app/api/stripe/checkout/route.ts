import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/stripe/checkout — Create a Stripe Checkout session
 *
 * Body: { priceId: string, mode?: "subscription" | "payment", email?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { priceId, mode, email }: { priceId?: string; mode?: string; email?: string } = body;

    if (!priceId) {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3003";
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: (mode as "subscription" | "payment") || "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe?cancelled=true`,
      ...(email ? { customer_email: email } : {}),
      metadata: { platform: "unykorn-law", source: "web" },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
