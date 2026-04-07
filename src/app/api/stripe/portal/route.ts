import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/stripe/portal — Create a Stripe Billing Portal session
 *
 * Body: { customerId: string }
 * Redirects users to manage their subscription.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId }: { customerId?: string } = body;

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3003";
    const stripe = getStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/subscribe`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portal session creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
