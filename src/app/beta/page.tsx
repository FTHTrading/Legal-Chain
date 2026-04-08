"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AGENT_NETWORK } from "@/lib/data/seed";

function BetaContent() {
  const params = useSearchParams();
  const refCode = params.get("ref");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    inviteCode: string;
    position: number;
    totalSignups: number;
    shareUrl: string;
  } | null>(null);
  const [stats, setStats] = useState({ totalSignups: 0, spotsRemaining: 100 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/beta/signup")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/beta/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role, referralCode: refCode || undefined }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data);
        setStats((s) => ({ ...s, totalSignups: data.totalSignups, spotsRemaining: Math.max(0, 100 - data.totalSignups) }));
      } else {
        alert(data.error || "Signup failed");
      }
    } catch {
      alert("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  function copyInvite() {
    if (!result) return;
    navigator.clipboard.writeText(result.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="py-20 px-8 text-center">
        <div className="max-w-[800px] mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--gold)] bg-[rgba(201,168,76,0.06)] mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="font-mono text-xs text-[var(--gold)] tracking-wider">
              BETA NOW OPEN — {stats.spotsRemaining} OF 100 FOUNDERS SPOTS REMAINING
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
            Join the<br />
            <span className="text-[var(--gold)]">UNYKORN // LAW</span><br />
            Beta Test
          </h1>
          <p className="font-serif text-lg text-[var(--text-muted)] max-w-[600px] mx-auto mb-2">
            {AGENT_NETWORK.total} AI agents. Court-standard documents. Blockchain forensics.
            Be one of the first 100 founders at <span className="text-[var(--gold)] font-bold">$25/mo forever</span>.
          </p>
          <p className="font-mono text-xs text-[var(--text-muted)]">
            Standard price will be $99/mo after founders spots fill up.
          </p>
        </div>
      </section>

      {/* ═══ SIGNUP ═══ */}
      <section className="py-12 px-8">
        <div className="max-w-[500px] mx-auto">
          {result ? (
            <div className="rounded-lg border border-[var(--gold)] bg-[rgba(201,168,76,0.04)] p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center mx-auto mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2">{result.message}</h2>
              <p className="font-mono text-sm text-[var(--text-muted)] mb-6">
                You&apos;re #{result.position} of {result.totalSignups} beta testers
              </p>

              <div className="bg-[rgba(201,168,76,0.06)] rounded-lg p-4 mb-6">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Your Invite Code</p>
                <p className="font-mono text-lg text-[var(--gold)] font-bold">{result.inviteCode}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={copyInvite}
                  className="w-full font-serif text-sm font-semibold tracking-wider px-6 py-3 rounded-sm bg-[var(--gold)] text-[var(--midnight)] hover:bg-[var(--gold-light)] transition-colors"
                >
                  {copied ? "Copied!" : "Copy Invite Link"}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just joined the UNYKORN // LAW beta — ${AGENT_NETWORK.total} AI agents for legal research & document drafting. Join with my invite:\n\n${result.shareUrl}\n\n#LegalTech #AI`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full font-serif text-sm font-semibold tracking-wider px-6 py-3 rounded-sm border border-[var(--gold)] text-[var(--gold)] hover:bg-[rgba(201,168,76,0.1)] transition-colors no-underline text-center"
                >
                  Share on X / Twitter
                </a>
                <a
                  href="/subscribe"
                  className="block w-full font-serif text-sm font-semibold tracking-wider px-6 py-3 rounded-sm border border-[rgba(201,168,76,0.3)] text-[var(--text-muted)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors no-underline text-center"
                >
                  View Pricing & Subscribe
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-lg border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.03)] p-8">
              <h2 className="font-serif text-xl font-bold text-center mb-6">Sign Up for Beta Access</h2>

              {refCode && (
                <div className="bg-[rgba(201,168,76,0.08)] rounded-sm px-4 py-2 mb-4 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">REFERRED BY:</span>
                  <span className="font-mono text-xs text-[var(--gold)]">{refCode}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-sm bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] text-[var(--text-primary)] font-mono text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-sm bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] text-[var(--text-primary)] font-mono text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mb-1.5">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-sm bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[var(--gold)]"
                  >
                    <option value="">Select your role...</option>
                    <option value="attorney">Attorney</option>
                    <option value="paralegal">Paralegal / Legal Assistant</option>
                    <option value="law_student">Law Student</option>
                    <option value="legal_tech">Legal Tech Professional</option>
                    <option value="developer">Developer / Engineer</option>
                    <option value="investor">Investor / VC</option>
                    <option value="journalist">Journalist / Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full mt-6 font-serif text-sm font-semibold tracking-wider px-6 py-3.5 rounded-sm bg-[var(--gold)] text-[var(--midnight)] hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join the Beta"}
              </button>

              <p className="font-mono text-[10px] text-[var(--text-muted)] text-center mt-4">
                No credit card required. Beta testers get the $25/mo founder rate locked forever.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ═══ WHAT YOU GET ═══ */}
      <section className="py-20 px-8 border-t border-[rgba(201,168,76,0.08)]">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Beta Access Includes</p>
            <h2 className="font-serif text-3xl font-bold">Full Platform Access</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🤖", title: `${AGENT_NETWORK.total} AI Agents`, desc: "Specialized agents for case strategy, legal research, document drafting, evidence analysis, and forensics." },
              { icon: "📄", title: "Document Generation", desc: "Court-standard PDFs — motions, briefs, demand letters, discovery responses, and 6 more types." },
              { icon: "🔍", title: "Blockchain Forensics", desc: "Trace funds across TRON, Ethereum, and Polygon. Identify suspect wallets and recovery paths." },
              { icon: "📚", title: "Legal Research (RAG)", desc: "AI-powered research with citation finding, precedent analysis, and confidence scoring." },
              { icon: "⛓️", title: "Web3 Audit Trail", desc: "Every action logged. Hash-chained integrity. Anchored on Apostle Chain 7332." },
              { icon: "🛡️", title: "Attorney Review Gates", desc: "AI suggests, humans decide. Nothing auto-sends. Confidence scoring on every output." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-[rgba(201,168,76,0.1)] bg-[rgba(201,168,76,0.02)] p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-serif text-sm font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="font-serif text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 px-8 border-t border-[rgba(201,168,76,0.08)]">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold mb-10">How the Beta Works</h2>

          <div className="space-y-8">
            {[
              { step: "1", title: "Sign Up", desc: "Enter your email above. No credit card needed. You'll get an invite code instantly." },
              { step: "2", title: "Share Your Code", desc: "Share your unique invite code with peers. Build your network. Everyone who joins gets founders pricing." },
              { step: "3", title: "Access the Platform", desc: "Full access to all 26 AI agents, document generation, legal research, and blockchain forensics." },
              { step: "4", title: "Give Feedback", desc: "Use the platform on real cases. Tell us what works, what doesn't, and what you need. Shape the product." },
              { step: "5", title: "Lock In Founders Rate", desc: "Subscribe at $25/mo when ready. Founders rate is locked forever — even after it goes to $99/mo." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 text-left">
                <span className="w-10 h-10 rounded-full border-2 border-[var(--gold)] text-[var(--gold)] font-serif text-lg font-bold flex items-center justify-center flex-shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[var(--text-primary)] mb-1">{item.title}</h3>
                  <p className="font-serif text-sm text-[var(--text-muted)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LIVE COUNTER ═══ */}
      <section className="py-16 px-8 border-t border-[rgba(201,168,76,0.08)]">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="font-serif text-4xl font-bold text-[var(--gold)]">{stats.totalSignups}</div>
              <div className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mt-1">Beta Testers</div>
            </div>
            <div>
              <div className="font-serif text-4xl font-bold text-[var(--gold)]">{stats.spotsRemaining}</div>
              <div className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mt-1">Founders Spots Left</div>
            </div>
            <div>
              <div className="font-serif text-4xl font-bold text-[var(--gold)]">{AGENT_NETWORK.total}</div>
              <div className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase mt-1">AI Agents Active</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function BetaPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[72px]">
        <Suspense fallback={
          <div className="py-32 text-center">
            <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        }>
          <BetaContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
