import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/stripe/webhook — Handle Stripe webhook events
 *
 * Processes subscription lifecycle events:
 * - checkout.session.completed → activate subscription
 * - customer.subscription.updated → update status
 * - customer.subscription.deleted → revoke access
 * - invoice.payment_failed → flag account
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig || !WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
    }

    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log(`[Stripe] Checkout completed: ${session.id}, customer: ${session.customer_email}`);
        // TODO: Activate user subscription in database
        // TODO: Increment founder signup count if applicable
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object;
        console.log(`[Stripe] Subscription updated: ${sub.id}, status: ${sub.status}`);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        console.log(`[Stripe] Subscription cancelled: ${sub.id}`);
        // TODO: Revoke platform access
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log(`[Stripe] Payment failed: ${invoice.id}`);
        break;
      }
      default:
        console.log(`[Stripe] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    console.error("[Stripe Webhook Error]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
