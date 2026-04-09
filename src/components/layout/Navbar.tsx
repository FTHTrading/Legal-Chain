"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/hooks";
import { AI_LINE, telLink } from "@/lib/legal-numbers";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const pathname = usePathname();
  const stats = useStore();
  const toolsRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);

  const pendingTotal = stats.pendingApprovals + stats.pendingComms + stats.pendingIntakes;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
      if (platformRef.current && !platformRef.current.contains(e.target as Node)) setPlatformOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const QUICK_TOOLS = [
    { href: "/rapid-intake", label: "Rapid Case Intake", sub: "False accusation · Urgent review", num: "888-LAW" },
    { href: "/demand-letter", label: "Demand Letter", sub: "Unpaid invoice · Breach dispute", num: "888-763-LAW" },
    { href: "/crypto-recovery", label: "Crypto Recovery", sub: "Stolen crypto · Wallet tracing", num: "888-974-LAW" },
    { href: "/evidence-timeline", label: "Evidence Timeline", sub: "Upload · Organize · Prove", num: "888-649-LAW" },
    { href: "/client-status", label: "Client Status", sub: "Matter status · Next steps", num: "833-LAW" },
  ];

  const PLATFORM_LINKS = [
    { href: "/ops", label: "Operations", badge: pendingTotal > 0 ? pendingTotal : null },
    { href: "/chain", label: "Chain Explorer" },
    { href: "/media", label: "Media & Evidence" },
    { href: "/documents", label: "Documents" },
    { href: "/proof", label: "Proof" },
    { href: "/beta", label: "Beta" },
  ];

  const isToolsActive = ["/rapid-intake", "/demand-letter", "/crypto-recovery", "/evidence-timeline", "/client-status", "/widgets"].some(p => pathname.startsWith(p));
  const isPlatformActive = ["/ops", "/chain", "/media", "/documents", "/proof", "/beta"].some(p => pathname.startsWith(p));

  return (
    <nav className="fixed top-0 left-0 right-0 h-[72px] z-50 flex items-center justify-center border-b border-[rgba(201,168,76,0.15)]"
      style={{ background: "rgba(8,11,22,0.95)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-[1200px] w-full px-8 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <svg className="w-[42px] h-[42px]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#c9a84c" strokeWidth="1.5"/>
            <circle cx="50" cy="50" r="43" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.5"/>
            <text x="50" y="58" textAnchor="middle" fill="#c9a84c" fontFamily="serif" fontSize="32">&#9878;</text>
            <text x="50" y="22" textAnchor="middle" fill="#c9a84c" fontFamily="serif" fontSize="7" letterSpacing="2" fontWeight="600">UNYKORN</text>
            <text x="50" y="88" textAnchor="middle" fill="#c9a84c" fontFamily="serif" fontSize="6" letterSpacing="3">EST. MMXXVI</text>
          </svg>
          <div className="font-serif text-[1.35rem] font-bold tracking-[0.12em] uppercase hidden lg:block">
            <span className="text-[var(--gold)]">Unykorn</span>{" "}
            <span className="text-[var(--text-primary)] font-normal tracking-[0.06em]">Law</span>
          </div>
        </Link>

        {/* Mobile toggle */}
        <button className="md:hidden text-[var(--gold)] text-2xl bg-transparent border-none" onClick={() => setOpen(!open)}>
          &#9776;
        </button>

        {/* Desktop Nav */}
        <div className={`${open ? "flex" : "hidden"} md:flex flex-col md:flex-row fixed md:static top-[72px] left-0 right-0 md:top-auto bg-[var(--midnight)] md:bg-transparent p-8 md:p-0 gap-6 md:gap-6 items-center border-b md:border-none border-[rgba(201,168,76,0.15)]`}>
          <NavLink href="/" active={pathname === "/"}>Home</NavLink>
          <NavLink href="/law" active={pathname.startsWith("/law")}>Cases</NavLink>
          <NavLink href="/intake" active={pathname === "/intake"}>Intake</NavLink>

          {/* Quick Tools Dropdown */}
          <div ref={toolsRef} className="relative">
            <button
              onClick={() => { setToolsOpen(!toolsOpen); setPlatformOpen(false); }}
              className={`font-serif text-[0.85rem] font-medium tracking-[0.1em] uppercase transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1 ${
                isToolsActive ? "text-[var(--gold)]" : "text-[var(--text-muted)] hover:text-[var(--gold)]"
              }`}
            >
              Tools <span className="text-[0.6rem]">{toolsOpen ? "▲" : "▼"}</span>
            </button>
            {toolsOpen && (
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[320px] rounded-lg border border-[rgba(201,168,76,0.2)] shadow-2xl overflow-hidden"
                style={{ background: "rgba(14,18,37,0.98)", backdropFilter: "blur(20px)" }}>
                <div className="p-3 border-b border-[rgba(201,168,76,0.1)]">
                  <p className="text-[10px] font-mono tracking-[0.2em] text-[var(--gold)]">QUICK LEGAL TOOLS</p>
                  <p className="text-[10px] text-[var(--text-muted)]">AI-powered · Each solves one thing</p>
                </div>
                {QUICK_TOOLS.map(t => (
                  <Link key={t.href} href={t.href} onClick={() => setToolsOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[rgba(201,168,76,0.06)] transition-colors no-underline border-b border-[rgba(201,168,76,0.05)] last:border-none">
                    <div>
                      <div className="text-sm font-serif text-[var(--text-primary)]">{t.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{t.sub}</div>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--gold)] opacity-70">{t.num}</span>
                  </Link>
                ))}
                <Link href="/widgets" onClick={() => setToolsOpen(false)}
                  className="block text-center py-2.5 text-xs font-serif text-[var(--gold)] hover:bg-[rgba(201,168,76,0.08)] transition-colors no-underline border-t border-[rgba(201,168,76,0.1)]">
                  View All Tools →
                </Link>
              </div>
            )}
          </div>

          {/* Platform Dropdown */}
          <div ref={platformRef} className="relative">
            <button
              onClick={() => { setPlatformOpen(!platformOpen); setToolsOpen(false); }}
              className={`font-serif text-[0.85rem] font-medium tracking-[0.1em] uppercase transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1 ${
                isPlatformActive ? "text-[var(--gold)]" : "text-[var(--text-muted)] hover:text-[var(--gold)]"
              }`}
            >
              Platform <span className="text-[0.6rem]">{platformOpen ? "▲" : "▼"}</span>
            </button>
            {platformOpen && (
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[220px] rounded-lg border border-[rgba(201,168,76,0.2)] shadow-2xl overflow-hidden"
                style={{ background: "rgba(14,18,37,0.98)", backdropFilter: "blur(20px)" }}>
                {PLATFORM_LINKS.map(l => (
                  <Link key={l.href} href={l.href} onClick={() => setPlatformOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[rgba(201,168,76,0.06)] transition-colors no-underline border-b border-[rgba(201,168,76,0.05)] last:border-none">
                    <span className="text-sm font-serif text-[var(--text-primary)]">{l.label}</span>
                    {l.badge && (
                      <span className="min-w-[18px] h-[18px] rounded-full bg-[var(--gold)] text-[var(--midnight)] text-[10px] font-bold flex items-center justify-center px-1">
                        {l.badge > 99 ? "99+" : l.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink href="/subscribe" active={pathname === "/subscribe"}>Pricing</NavLink>

          {/* AI Phone Line */}
          <a href={telLink(AI_LINE.numeric)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.06)] hover:bg-[rgba(52,211,153,0.12)] transition-colors no-underline"
            title="AI answers 24/7 — powered by NEED AI">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[0.7rem] text-emerald-400 tracking-wider">888-LAW</span>
          </a>

          <Link href="/intake"
            className="font-serif text-[0.8rem] font-semibold tracking-[0.1em] uppercase px-5 py-2 rounded-sm bg-[var(--gold)] text-[var(--midnight)] hover:bg-[var(--gold-light)] transition-colors no-underline">
            Free Case Review
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      className={`font-serif text-[0.85rem] font-medium tracking-[0.1em] uppercase transition-colors no-underline relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-px after:bg-[var(--gold)] after:transition-[width] after:duration-300 ${
        active
          ? "text-[var(--gold)] after:w-full"
          : "text-[var(--text-muted)] hover:text-[var(--gold)] after:w-0 hover:after:w-full"
      }`}>
      {children}
    </Link>
  );
}
