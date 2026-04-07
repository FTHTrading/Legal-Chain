"use client";

import Link from "next/link";
import { useStore } from "@/lib/hooks";

export default function Footer() {
  const stats = useStore();

  return (
    <footer className="border-t border-[rgba(201,168,76,0.15)] bg-[var(--midnight)] py-16 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="font-serif text-lg font-bold tracking-[0.12em] uppercase mb-4">
              <span className="text-[var(--gold)]">UNYKORN</span>{" "}
              <span className="text-[var(--text-primary)] font-normal">{"// LAW"}</span>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              {stats.agentCount} AI agents. Zero cost. Fighting for the falsely accused and those without resources since 2026.
            </p>
            <p className="text-[var(--gold)] mt-4 text-sm">law@unykorn.org</p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-serif text-xs font-semibold tracking-[0.15em] uppercase text-[var(--gold)] mb-4">Platform</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">How It Works</Link>
              <Link href="/ops" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Operations</Link>
              <Link href="/media" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Media &amp; Evidence</Link>
              <Link href="/law" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Active Cases ({stats.activeCases})</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-serif text-xs font-semibold tracking-[0.15em] uppercase text-[var(--gold)] mb-4">Operations</h4>
            <div className="flex flex-col gap-2">
              <Link href="/ops/approvals" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Approvals ({stats.pendingApprovals})</Link>
              <Link href="/ops/tasks" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Tasks ({stats.activeTasks})</Link>
              <Link href="/ops/forensics" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Forensics</Link>
              <Link href="/ops/research" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Research</Link>
            </div>
          </div>

          {/* Case Portals */}
          <div>
            <h4 className="font-serif text-xs font-semibold tracking-[0.15em] uppercase text-[var(--gold)] mb-4">Case Portals</h4>
            <div className="flex flex-col gap-2">
              <Link href="/portal/tronfraud" className="text-[var(--text-muted)] text-sm font-mono hover:text-[var(--gold)] transition-colors no-underline">tronfraud.unykorn.org</Link>
              <Link href="/portal/marquis" className="text-[var(--text-muted)] text-sm font-mono hover:text-[var(--gold)] transition-colors no-underline">marquis.unykorn.org</Link>
              <Link href="/portal/creamer" className="text-[var(--text-muted)] text-sm font-mono hover:text-[var(--gold)] transition-colors no-underline">creamer.unykorn.org</Link>
              <Link href="/intake" className="text-[var(--gold)] text-sm hover:text-[var(--gold-light)] transition-colors no-underline">Open New Case</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(201,168,76,0.1)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-muted)] text-xs tracking-[0.05em]">
            &copy; 2026 UNYKORN &middot; All Rights Reserved &middot; Autonomous AI Legal Intelligence
          </p>
          <div className="flex items-center gap-4 text-[var(--text-muted)] text-xs font-mono">
            <span>x402 Protocol</span>
            <span>&middot;</span>
            <span>Chain 7332</span>
            <span>&middot;</span>
            <span>ATP Reserve</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
