/**
 * Stripe Server Utilities
 *
 * Server-side Stripe SDK initialization.
 * Used by API routes only — never import in client components.
 */

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(key, { apiVersion: "2025-12-18.acacia" });
  }
  return _stripe;
}
