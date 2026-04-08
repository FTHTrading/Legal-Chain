"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WalletConnect from "@/components/ui/WalletConnect";
import { PLANS, ALA_CARTE, founderSpotsRemaining, isFounderSpotsAvailable } from "@/lib/plans";
import { AGENT_NETWORK } from "@/lib/data/seed";

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [hardshipForm, setHardshipForm] = useState({ name: "", email: "", situation: "", caseType: "" });
  const [hardshipSubmitted, setHardshipSubmitted] = useState(false);
  const [hardshipError, setHardshipError] = useState("");
  const spotsLeft = founderSpotsRemaining();
  const founderAvailable = isFounderSpotsAvailable();

  async function handleCheckout(priceId: string | undefined, mode: "subscription" | "payment" = "subscription") {
    if (!priceId) {
      alert("Stripe is being configured. Please contact us directly at legal@unykorn.org");
      return;
    }
    setLoading(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode, email: email || undefined }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Checkout failed");
    } catch {
      alert("Network error — please try again");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[72px]">
        {/* ═══ HERO ═══ */}
        <section className="py-20 px-8 text-center">
          <div className="max-w-[900px] mx-auto">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Pricing</p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              AI-Powered Legal<br />Intelligence.<br />
              <span className="text-[var(--gold)]">Starting at $25/month.</span>
            </h1>
            <p className="font-serif text-lg text-[var(--text-muted)] max-w-[600px] mx-auto mb-4">
              {AGENT_NETWORK.total} autonomous AI agents. Full legal research. Document drafting.
              Forensic analysis. Web3 payments. Everything you need.
            </p>
            <p className="font-serif text-sm text-emerald-400 mb-4">
              Can&apos;t afford it? Apply for hardship access below — no one is turned away.
            </p>
            {founderAvailable && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--gold)] bg-[rgba(201,168,76,0.06)]">
                <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                <span className="font-mono text-xs text-[var(--gold)] tracking-wider">
                  FOUNDERS SPECIAL — {spotsLeft} OF 100 SPOTS REMAINING
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ═══ PLANS ═══ */}
        <section className="py-12 px-8">
          <div className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg border p-8 flex flex-col ${
                  plan.highlighted
                    ? "border-[var(--gold)] bg-[rgba(201,168,76,0.04)] shadow-[0_0_60px_rgba(201,168,76,0.08)]"
                    : "border-[rgba(201,168,76,0.12)] bg-[rgba(201,168,76,0.02)]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--gold)] text-[var(--midnight)] font-mono text-[10px] font-bold tracking-wider whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <h2 className="font-serif text-xl font-bold text-[var(--text-primary)] mt-2">{plan.name}</h2>
                <p className="font-serif text-sm text-[var(--text-muted)] mt-1 mb-6">{plan.tagline}</p>

                <div className="mb-6">
                  {plan.price === 0 ? (
                    <span className="font-serif text-3xl font-bold text-[var(--gold)]">Custom</span>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      {plan.originalPrice && (
                        <span className="font-serif text-lg text-[var(--text-muted)] line-through">${plan.originalPrice}</span>
                      )}
                      <span className="font-serif text-4xl font-bold text-[var(--gold)]">${plan.price}</span>
                      <span className="font-mono text-xs text-[var(--text-muted)]">/mo</span>
                    </div>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--gold)]" viewBox="0 0 16 16" fill="none">
                        <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[var(--text-secondary)]">{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.price === 0 ? (
                  <a
                    href="mailto:legal@unykorn.org?subject=Enterprise%20Inquiry"
                    className="block text-center font-serif text-sm font-semibold tracking-wider px-6 py-3 rounded-sm border border-[var(--gold)] text-[var(--gold)] hover:bg-[rgba(201,168,76,0.1)] transition-colors no-underline"
                  >
                    Contact Sales
                  </a>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.stripePriceId)}
                    disabled={loading === plan.stripePriceId}
                    className={`w-full font-serif text-sm font-semibold tracking-wider px-6 py-3 rounded-sm transition-colors disabled:opacity-50 ${
                      plan.highlighted
                        ? "bg-[var(--gold)] text-[var(--midnight)] hover:bg-[var(--gold-light)]"
                        : "border border-[var(--gold)] text-[var(--gold)] hover:bg-[rgba(201,168,76,0.1)]"
                    }`}
                  >
                    {loading === plan.stripePriceId ? "Processing..." : plan.highlighted ? "Lock In Founders Rate" : "Subscribe"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══ EMAIL CAPTURE ═══ */}
        <section className="py-8 px-8">
          <div className="max-w-[500px] mx-auto">
            <label className="block font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-2">
              Enter email before checkout for receipt
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-sm bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] text-[var(--text-primary)] font-mono text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)]"
            />
          </div>
        </section>

        {/* ═══ À LA CARTE ═══ */}
        <section className="py-20 px-8 border-t border-[rgba(201,168,76,0.08)]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">À La Carte</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Individual Services</h2>
              <p className="font-serif text-sm text-[var(--text-muted)] mt-2">
                Need a single service? Purchase individual AI-powered legal services without a subscription.
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {ALA_CARTE.map((svc) => (
                <div key={svc.id} className="rounded-lg border border-[rgba(201,168,76,0.1)] bg-[rgba(201,168,76,0.02)] p-5 flex flex-col">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--gold)] mb-2">{svc.category}</div>
                  <h3 className="font-serif text-sm font-bold text-[var(--text-primary)] mb-1">{svc.name}</h3>
                  <p className="font-serif text-xs text-[var(--text-muted)] flex-1 mb-4">{svc.description}</p>
                  <div className="mb-3">
                    <span className="font-serif text-2xl font-bold text-[var(--gold)]">${svc.price}</span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]"> {svc.unit}</span>
                  </div>
                  <button
                    onClick={() => handleCheckout(svc.stripePriceId, "payment")}
                    disabled={loading === svc.stripePriceId}
                    className="w-full font-mono text-[11px] tracking-wider px-3 py-2 rounded-sm border border-[rgba(201,168,76,0.3)] text-[var(--gold)] hover:bg-[rgba(201,168,76,0.1)] transition-colors disabled:opacity-50"
                  >
                    {loading === svc.stripePriceId ? "..." : "Purchase"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WEB3 ═══ */}
        <section className="py-20 px-8 border-t border-[rgba(201,168,76,0.08)]">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center mb-12">
              <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Web3 Payments</p>
              <h2 className="font-serif text-3xl font-bold mb-3">Pay with Crypto</h2>
              <p className="font-serif text-sm text-[var(--text-muted)]">
                Connect your wallet to pay with USDC on Polygon, or ATP/USDF on Apostle Chain (7332).
                x402 AI-to-AI payment protocol supported.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <WalletConnect />

              <div className="rounded-lg border border-[rgba(201,168,76,0.15)] bg-[rgba(201,168,76,0.03)] p-6">
                <h3 className="font-serif text-sm font-bold text-[var(--text-primary)] mb-4">How It Works</h3>
                <ol className="space-y-3">
                  {[
                    "Connect your MetaMask or Web3 wallet",
                    "Choose Polygon (USDC) or Apostle Chain (ATP/USDF)",
                    "Select a plan or à la carte service",
                    "Sign the transaction in your wallet",
                    "Access activates instantly after verification",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full border border-[var(--gold)] text-[var(--gold)] font-mono text-xs flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[var(--text-secondary)]">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 pt-4 border-t border-[rgba(201,168,76,0.08)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex -space-x-1">
                      {["USDC"].map((t) => (
                        <span key={t} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(38,117,217,0.15)] border border-[rgba(38,117,217,0.4)] font-mono text-[9px] text-blue-400">
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      Polygon Mainnet (Chain 137)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {["ATP", "USDF"].map((t) => (
                        <span key={t} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] font-mono text-[9px] text-[var(--gold)]">
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      Apostle Chain (Chain 7332)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ AI CAPABILITIES ═══ */}
        <section className="py-20 px-8 border-t border-[rgba(201,168,76,0.08)]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">What You Get</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Full AI Legal System</h2>
              <p className="font-serif text-sm text-[var(--text-muted)]">
                Every subscription unlocks the complete UNYKORN AI agent network — {AGENT_NETWORK.total} agents working in concert.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "⚖️", title: "Case Strategy", desc: "Atlas AI analyzes claims for viability, risk, and optimal litigation strategy with real-time precedent mapping." },
                { icon: "📚", title: "Legal Research", desc: "Lexis AI conducts deep case law, statute, and regulation research with RAG-powered citation finding." },
                { icon: "🔍", title: "Evidence Analysis", desc: "Sentinel AI classifies evidence, checks authenticity, screens for privilege, and tracks chain of custody." },
                { icon: "📝", title: "Document Drafting", desc: "Scribe AI drafts demand letters, motions, briefs, and filings with confidence scoring and attorney review." },
                { icon: "🔗", title: "Blockchain Forensics", desc: "Trace funds across TRON, Ethereum, and Polygon. Identify suspect wallets and recovery paths." },
                { icon: "🛡️", title: "Compliance Engine", desc: "Automated conflict checks, privilege screening, and regulatory compliance with full audit trail." },
                { icon: "⛓️", title: "Web3 Integration", desc: "Apostle Chain (7332) for immutable legal records. x402 protocol for AI-to-AI payment processing." },
                { icon: "📊", title: "Operations Dashboard", desc: "Real-time case tracking, task management, communications, and AI agent performance monitoring." },
              ].map((cap) => (
                <div key={cap.title} className="rounded-lg border border-[rgba(201,168,76,0.1)] bg-[rgba(201,168,76,0.02)] p-5">
                  <div className="text-2xl mb-3">{cap.icon}</div>
                  <h3 className="font-serif text-sm font-bold text-[var(--text-primary)] mb-2">{cap.title}</h3>
                  <p className="font-serif text-xs text-[var(--text-muted)] leading-relaxed">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-20 px-8 border-t border-[rgba(201,168,76,0.08)]">
          <div className="max-w-[700px] mx-auto">
            <h2 className="font-serif text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: "What if I can't afford a subscription?", a: "We believe access to legal tools should never depend on your financial situation. Apply for hardship access below — you'll get full platform access at no cost. No proof of income required. No documentation. No one is turned away." },
                { q: "What happens after the first 100 founders spots fill up?", a: "The introductory $25/month rate is permanently locked for founders. After 100 spots fill, new subscribers pay the standard $99/month rate. Your founder pricing never increases." },
                { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from your billing portal. Your access continues through the end of your current billing period. No contract, no cancellation fees." },
                { q: "What AI models power the agents?", a: "We use GPT-4o and Claude for analysis, with specialized model configs per agent team. Research agents use low-temperature for precision. Drafting agents use higher creativity settings. All calls go through our governance layer." },
                { q: "Is my data secure?", a: "All case data is encrypted at rest and in transit. We maintain attorney-client privilege protections. The audit trail is immutable and hash-chained. Web3 records are anchored on Apostle Chain (7332)." },
                { q: "Do I need a crypto wallet?", a: "No. Traditional card payments via Stripe work perfectly. Web3 wallet connection is optional for users who want to pay with USDC on Polygon, or ATP/USDF on Apostle Chain, or anchor records on-chain." },
                { q: "What à la carte services can I purchase without a subscription?", a: "Any individual service — research queries ($49), document drafts ($99), forensic traces ($199), case strategy ($149), or evidence analysis ($79) — can be purchased standalone with no subscription required." },
              ].map((faq) => (
                <div key={faq.q} className="border-b border-[rgba(201,168,76,0.08)] pb-5">
                  <h3 className="font-serif text-sm font-bold text-[var(--text-primary)] mb-2">{faq.q}</h3>
                  <p className="font-serif text-sm text-[var(--text-muted)] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HARDSHIP ACCESS ═══ */}
        <section id="hardship" className="py-20 px-8 border-t border-[rgba(201,168,76,0.08)]">
          <div className="max-w-[700px] mx-auto">
            <div className="text-center mb-10">
              <p className="font-serif text-xs tracking-[0.4em] uppercase text-emerald-400 mb-2">No One Turned Away</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">
                Hardship Access<br /><span className="text-emerald-400">Program</span>
              </h2>
              <p className="font-serif text-sm text-[var(--text-muted)] max-w-[500px] mx-auto">
                Justice should not have a price tag. If you cannot afford a subscription, apply for
                full platform access at no cost. No proof of income required. No documentation.
                Simply tell us your situation.
              </p>
            </div>

            {hardshipSubmitted ? (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-8 text-center">
                <div className="text-3xl mb-4">&#10003;</div>
                <h3 className="font-serif text-2xl font-bold text-emerald-400 mb-2">Application Received</h3>
                <p className="text-[var(--text-muted)] mb-4">
                  Your hardship access application has been submitted. You will receive full platform access
                  within 24 hours at the email you provided. No one is turned away.
                </p>
                <p className="text-xs font-mono text-emerald-400">Direct line if urgent: law@unykorn.org</p>
              </div>
            ) : (
              <form
                className="bg-[var(--navy-card)] border border-emerald-500/15 rounded-lg p-8 space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setHardshipError("");
                  if (!hardshipForm.name.trim() || !hardshipForm.email.trim() || !hardshipForm.situation.trim()) {
                    setHardshipError("Please fill in all required fields.");
                    return;
                  }
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hardshipForm.email)) {
                    setHardshipError("Please enter a valid email address.");
                    return;
                  }
                  try {
                    const res = await fetch("/api/hardship/apply", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(hardshipForm),
                    });
                    if (!res.ok) {
                      const data = await res.json().catch(() => ({}));
                      setHardshipError(data.error || "Submission failed. Please email law@unykorn.org directly.");
                      return;
                    }
                    setHardshipSubmitted(true);
                  } catch {
                    setHardshipError("Network error. Please email law@unykorn.org directly.");
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs text-emerald-400 tracking-wider">100% OF APPLICATIONS APPROVED</span>
                </div>

                {hardshipError && (
                  <div className="bg-red-900/30 border border-red-500/30 rounded px-4 py-3 text-red-300 text-sm">{hardshipError}</div>
                )}

                <div>
                  <label className="block font-serif text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={hardshipForm.name}
                    onChange={(e) => setHardshipForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-emerald-400 focus:outline-none transition-colors"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block font-serif text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={hardshipForm.email}
                    onChange={(e) => setHardshipForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-emerald-400 focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block font-serif text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">Case Type</label>
                  <select
                    value={hardshipForm.caseType}
                    onChange={(e) => setHardshipForm((p) => ({ ...p, caseType: e.target.value }))}
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-emerald-400 focus:outline-none transition-colors"
                  >
                    <option value="">Select if applicable...</option>
                    <option value="criminal">Criminal Defense</option>
                    <option value="appeal">Criminal Appeal</option>
                    <option value="crypto">Crypto Fraud Recovery</option>
                    <option value="civil">Civil Dispute</option>
                    <option value="family">Family Law</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-serif text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">Tell Us Your Situation *</label>
                  <textarea
                    value={hardshipForm.situation}
                    onChange={(e) => setHardshipForm((p) => ({ ...p, situation: e.target.value }))}
                    rows={4}
                    className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-emerald-400 focus:outline-none resize-none transition-colors"
                    placeholder="Briefly describe why you need hardship access. No financial proof or documentation is required."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-white py-4 font-serif text-sm font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Apply for Hardship Access
                </button>

                <p className="text-center text-xs text-[var(--text-muted)]">
                  Private &middot; Confidential &middot; All applications approved &middot; Full access granted within 24 hours
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
