import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(201,168,76,0.15)] bg-[var(--midnight)] py-16 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="font-serif text-lg font-bold tracking-[0.12em] uppercase mb-4">
              <span className="text-[var(--gold)]">UNYKORN</span>{" "}
              <span className="text-[var(--text-primary)] font-normal">// LAW</span>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              350 AI agents. Zero cost. Fighting for the falsely accused and those without resources since 2026.
            </p>
            <p className="text-[var(--gold)] mt-4 text-sm">law@unykorn.org</p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-serif text-xs font-semibold tracking-[0.15em] uppercase text-[var(--gold)] mb-4">Platform</h4>
            <div className="flex flex-col gap-2">
              <Link href="/#process" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">How It Works</Link>
              <Link href="/#network" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">The Network</Link>
              <Link href="/#tech" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Technology Stack</Link>
              <Link href="/law" className="text-[var(--text-muted)] text-sm hover:text-[var(--gold)] transition-colors no-underline">Active Cases</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-serif text-xs font-semibold tracking-[0.15em] uppercase text-[var(--gold)] mb-4">Free Resources</h4>
            <div className="flex flex-col gap-2">
              <span className="text-[var(--text-muted)] text-sm">Your Rights Guide</span>
              <span className="text-[var(--text-muted)] text-sm">Challenge Evidence</span>
              <span className="text-[var(--text-muted)] text-sm">Criminal Proceedings</span>
              <span className="text-[var(--text-muted)] text-sm">AI Defense Guide</span>
            </div>
          </div>

          {/* Case Portals */}
          <div>
            <h4 className="font-serif text-xs font-semibold tracking-[0.15em] uppercase text-[var(--gold)] mb-4">Case Portals</h4>
            <div className="flex flex-col gap-2">
              <span className="text-[var(--text-muted)] text-sm font-mono">tronfraud.unykorn.org</span>
              <span className="text-[var(--text-muted)] text-sm font-mono">marquis.unykorn.org</span>
              <span className="text-[var(--text-muted)] text-sm font-mono">creamer.unykorn.org</span>
              <Link href="/#intake" className="text-[var(--gold)] text-sm hover:text-[var(--gold-light)] transition-colors no-underline">Open New Case</Link>
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
