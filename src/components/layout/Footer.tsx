"use client";

import Link from "next/link";
import { useStore } from "@/lib/hooks";
import { LEGAL_NUMBERS, AI_LINE, telLink } from "@/lib/legal-numbers";

export default function Footer() {
  const stats = useStore();
  const lawNumbers = LEGAL_NUMBERS.filter(n => n.category === "law-routing" && n.active);

  return (
    <footer className="border-t border-[rgba(201,168,76,0.15)] bg-[var(--midnight)] py-16 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="font-serif text-lg font-bold tracking-[0.12em] uppercase mb-4">
              <span className="text-[var(--gold)]">UNYKORN</span>{" "}
              <span className="text-[var(--text-primary)] font-normal">{"// ADVOCACY"}</span>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              AI-powered legal advocacy and case-support platform. {stats.agentCount} agents supporting research, evidence organization, document assembly, and referrals.
            </p>
            <p className="text-[var(--gold)] mt-4 text-sm">law@unykorn.org</p>
          </div>

          {/* Quick Tools */}
          <div>
            <h4 className="font-serif text-xs font-semibold tracking-[0.15em] uppercase text-[var(--gold)] mb-4">Quick Tools</h4>
            <div className="flex flex-col gap-2">
              <Link href="/rapid-intake" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Rapid Case Intake</Link>
              <Link href="/demand-letter" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Demand Letter</Link>
              <Link href="/crypto-recovery" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Crypto Recovery</Link>
              <Link href="/evidence-timeline" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Evidence Timeline</Link>
              <Link href="/client-status" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Client Status</Link>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-serif text-xs font-semibold tracking-[0.15em] uppercase text-[var(--gold)] mb-4">Platform</h4>
            <div className="flex flex-col gap-2">
              <Link href="/ops" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Operations</Link>
              <Link href="/law" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Active Cases ({stats.activeCases})</Link>
              <Link href="/chain" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Chain Explorer</Link>
              <Link href="/media" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Media &amp; Evidence</Link>
              <Link href="/subscribe" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Pricing</Link>
            </div>
          </div>

          {/* AI Hotlines */}
          <div>
            <h4 className="font-serif text-xs font-semibold tracking-[0.15em] uppercase text-[var(--gold)] mb-4">AI Hotlines</h4>
            <div className="flex flex-col gap-2">
              <a href={telLink(AI_LINE.numeric)} className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors no-underline font-mono">
                {AI_LINE.vanity} — AI Line
              </a>
              {lawNumbers.slice(0, 5).map(n => (
                <a key={n.id} href={telLink(n.numeric)} className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline font-mono">
                  {n.vanity}
                </a>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="font-serif text-xs font-semibold tracking-[0.15em] uppercase text-[var(--gold)] mb-4">About</h4>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-primary)]">UNYKORN</span>
              <span>Legal Advocacy &amp; Case Support</span>
              <span>Norcross, GA</span>
              <span className="text-[var(--gold)]">law@unykorn.org</span>
              <p className="text-[10px] mt-2 leading-relaxed">We are not a law firm and do not provide legal advice. Where appropriate, users may be referred to licensed counsel.</p>
            </div>
          </div>
        </div>

        {/* NEED AI Badge */}
        <div className="border-t border-[rgba(201,168,76,0.1)] pt-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <a href="https://needai.unykorn.org" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(201,168,76,0.15)] bg-[rgba(201,168,76,0.03)] hover:bg-[rgba(201,168,76,0.08)] transition-colors no-underline">
              <span className="font-mono text-[var(--text-muted)] tracking-wider">NEED AI</span>
              <span className="text-[var(--text-muted)]">&mdash; AI phone answering (separate service)</span>
            </a>
          </div>
        </div>

        {/* Legal Disclaimers */}
        <div className="border-t border-[rgba(201,168,76,0.1)] pt-6 mb-6">
          <div className="max-w-4xl mx-auto text-center space-y-2 text-[10px] text-[var(--text-muted)] leading-relaxed">
            <p><strong className="text-[var(--text-muted)]">Important Notice:</strong> We are a legal advocacy and case-support platform. We are not a law firm, do not provide legal advice, and do not represent clients. No attorney-client relationship is created by using this site or submitting information. Where appropriate, users may be referred to licensed counsel.</p>
            <p><strong className="text-[var(--text-muted)]">AI Disclosure:</strong> This platform uses artificial intelligence to assist with research, document organization, and case preparation. AI-generated materials are informational tools and should be reviewed by a licensed attorney before any legal action.</p>
            <p><strong className="text-[var(--text-muted)]">Jurisdiction:</strong> Services described on this site may not be available in all jurisdictions. Results vary by situation and are not guaranteed.</p>
          </div>
        </div>

        <div className="border-t border-[rgba(201,168,76,0.1)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-muted)] text-xs tracking-[0.05em]">
            &copy; 2026 UNYKORN &middot; All Rights Reserved &middot; AI-Powered Legal Advocacy &amp; Case Support
          </p>
          <div className="flex items-center gap-4 text-[var(--text-muted)] text-xs font-mono">
            <span>x402 Protocol</span>
            <span>&middot;</span>
            <span>Chain 7332</span>
            <span>&middot;</span>
            <span>ATP Reserve</span>
            <span>&middot;</span>
            <a href="https://needai.unykorn.org" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] no-underline hover:text-[var(--gold)]">NEED AI</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
