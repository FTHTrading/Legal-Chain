import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/**
 * POST /api/stripe/setup — Create Stripe products & prices for the platform.
 * Idempotent: checks if products already exist before creating.
 * Protected by STRIPE_SETUP_KEY env var.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { setupKey } = body as { setupKey?: string };

    const validKey = process.env.STRIPE_SETUP_KEY;
    if (!validKey || setupKey !== validKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();

    // Check if products already exist
    const existing = await stripe.products.list({ limit: 20 });
    const existingNames = new Set(existing.data.map((p) => p.name));

    const results: Record<string, string> = {};

    // ── Subscription Products ──
    const subscriptionProducts = [
      {
        name: "UNYKORN Law — Founder Access",
        envKey: "NEXT_PUBLIC_STRIPE_INTRO_PRICE_ID",
        amount: 2500, // $25.00
        interval: "month" as const,
        description: "Founder rate: full AI legal platform access with 26 agents",
      },
      {
        name: "UNYKORN Law — Standard",
        envKey: "NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID",
        amount: 9900, // $99.00
        interval: "month" as const,
        description: "Standard rate: full AI legal platform access with 26 agents",
      },
    ];

    for (const p of subscriptionProducts) {
      if (existingNames.has(p.name)) {
        const prod = existing.data.find((x) => x.name === p.name);
        if (prod) {
          const prices = await stripe.prices.list({ product: prod.id, active: true, limit: 1 });
          if (prices.data[0]) {
            results[p.envKey] = prices.data[0].id;
            continue;
          }
        }
      }
      const product = await stripe.products.create({
        name: p.name,
        description: p.description,
        metadata: { platform: "unykorn-law" },
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: p.amount,
        currency: "usd",
        recurring: { interval: p.interval },
      });
      results[p.envKey] = price.id;
    }

    // ── À La Carte Products ──
    const alaCarteProducts = [
      { name: "UNYKORN Law — AI Legal Research", envKey: "NEXT_PUBLIC_STRIPE_ALA_RESEARCH_PRICE_ID", amount: 4900 },
      { name: "UNYKORN Law — Document Drafting", envKey: "NEXT_PUBLIC_STRIPE_ALA_DRAFTING_PRICE_ID", amount: 9900 },
      { name: "UNYKORN Law — Forensic Trace", envKey: "NEXT_PUBLIC_STRIPE_ALA_FORENSICS_PRICE_ID", amount: 19900 },
      { name: "UNYKORN Law — Case Strategy", envKey: "NEXT_PUBLIC_STRIPE_ALA_STRATEGY_PRICE_ID", amount: 14900 },
      { name: "UNYKORN Law — Evidence Analysis", envKey: "NEXT_PUBLIC_STRIPE_ALA_EVIDENCE_PRICE_ID", amount: 7900 },
    ];

    for (const p of alaCarteProducts) {
      if (existingNames.has(p.name)) {
        const prod = existing.data.find((x) => x.name === p.name);
        if (prod) {
          const prices = await stripe.prices.list({ product: prod.id, active: true, limit: 1 });
          if (prices.data[0]) {
            results[p.envKey] = prices.data[0].id;
            continue;
          }
        }
      }
      const product = await stripe.products.create({
        name: p.name,
        metadata: { platform: "unykorn-law", type: "ala_carte" },
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: p.amount,
        currency: "usd",
      });
      results[p.envKey] = price.id;
    }

    return NextResponse.json({
      ok: true,
      message: "Stripe products & prices ready",
      priceIds: results,
      envBlock: Object.entries(results)
        .map(([k, v]) => `${k}=${v}`)
        .join("\n"),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
