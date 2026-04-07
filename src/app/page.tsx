"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ACTIVE_CASES, AGENT_NETWORK, IMAGE_GALLERY } from "@/lib/data/seed";
import { store } from "@/lib/store";
import { useStore } from "@/lib/hooks";

export default function Home() {
  const stats = useStore();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", caseType: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.caseType || !formData.description.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    store.createIntake({
      clientName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      matterType: formData.caseType,
      urgency: "routine",
      description: formData.description.trim(),
    });
    setSubmitted(true);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ═══ TICKER ═══ */}
        <div className="fixed top-[72px] left-0 right-0 z-40 bg-[var(--navy)] border-b border-[rgba(201,168,76,0.1)] overflow-hidden h-8 flex items-center">
          <div className="animate-ticker whitespace-nowrap flex gap-16 text-xs font-mono tracking-wider">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-16">
                <span className="text-[var(--gold)]">NTI-LEAVITT-2026-001 &nbsp;/// &nbsp;$36,150 Crypto Fraud &nbsp;/// &nbsp;INVESTIGATION ACTIVE</span>
                <span className="text-[var(--text-muted)]">State v. Delcampo &nbsp;/// &nbsp;Illegal Sentence &nbsp;/// &nbsp;APPEAL FILED — MAY 2026</span>
                <span className="text-[var(--gold)]">169 Creamer Drive &nbsp;/// &nbsp;$1M Proceeds Dispute &nbsp;/// &nbsp;PRE-LITIGATION</span>
                <span className="text-[var(--text-muted)]">350 AI Agents &nbsp;/// &nbsp;x402 Pay Rails &nbsp;/// &nbsp;$0 Cost to You &nbsp;/// &nbsp;24/7 Coverage</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ HERO ═══ */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 pt-32 pb-16 relative overflow-hidden"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.04) 0%, transparent 70%), linear-gradient(180deg, var(--midnight) 0%, var(--navy) 100%)" }}>
          <div className="flex items-center gap-2 mb-8 text-xs font-mono tracking-wider text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            System Online &nbsp;&middot;&nbsp; 350 Agents Active &nbsp;&middot;&nbsp; x402 Protocol &nbsp;&middot;&nbsp; Chain 7332
          </div>
          <div className="relative mb-8">
            <Image src="/media/images/legal-helix-1.webp" alt="UNYKORN Legal DNA" width={200} height={200} className="rounded-full opacity-90" />
          </div>
          <p className="font-serif text-sm tracking-[0.4em] uppercase text-[var(--gold)] mb-4">UNYKORN // LAW</p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
            COME AS ACCUSED.<br/>
            <span className="text-[var(--gold)]">LEAVE AS VINDICATED.</span>
          </h1>
          <div className="w-24 h-px bg-[var(--gold)] mx-auto mb-6 opacity-50" />
          <p className="text-xl md:text-2xl text-[var(--text-primary)] max-w-3xl leading-relaxed mb-10">
            The most advanced AI legal advocacy system ever built — 350 autonomous agents fighting for the falsely accused and those who cannot afford an attorney. Zero cost. x402 funded. Relentless.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link href="/intake" className="bg-[var(--gold)] text-[var(--midnight)] px-8 py-3 font-serif text-sm font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[var(--gold-light)] transition-colors no-underline">
              Get Free Case Review
            </Link>
            <Link href="#process" className="border border-[var(--gold)] text-[var(--gold)] px-8 py-3 font-serif text-sm font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[rgba(201,168,76,0.1)] transition-colors no-underline">
              See How It Works ↓
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl">
            {[
              { num: String(stats.agentCount), label: "AI Agents" },
              { num: "x402", label: "Pay Protocol" },
              { num: "$0", label: "Cost to You" },
              { num: String(stats.activeCases), label: "Active Cases" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif text-3xl md:text-4xl font-bold text-[var(--gold)]">{s.num}</div>
                <div className="text-xs tracking-[0.15em] uppercase text-[var(--text-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ CAPABILITY ICONS ═══ */}
        <section className="py-16 px-8 bg-[var(--navy)] border-y border-[rgba(201,168,76,0.1)]">
          <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {[
              { icon: "△", title: "$0 Cost. Ever.", sub: "x402 autonomous funding" },
              { icon: "▣", title: "350 AI Agents", sub: "Full deployment on your case" },
              { icon: "◯", title: "24/7 Coverage", sub: "Agents never sleep" },
              { icon: "■", title: "Secure Portal", sub: "Your sovereign namespace" },
              { icon: "◆", title: "MCP Grade Systems", sub: "State-of-the-art AI stack" },
            ].map((c) => (
              <div key={c.title} className="flex flex-col items-center gap-2">
                <span className="text-3xl text-[var(--gold)]">{c.icon}</span>
                <span className="font-serif text-sm font-semibold tracking-wider uppercase">{c.title}</span>
                <span className="text-xs text-[var(--text-muted)]">{c.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ WHO WE FIGHT FOR ═══ */}
        <section className="py-24 px-8">
          <div className="max-w-[1200px] mx-auto">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Who We Fight For</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              WE EXIST<br/><span className="text-[var(--gold)]">FOR ONE REASON.</span>
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mb-16">
              Every person charged without cause deserves the most powerful legal intelligence on the planet. That is why we exist.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { num: "01", tag: "THE ACCUSED", title: "Falsely Accused & Fighting Back", text: "You did not do it — and we fight like we believe you until the case is closed. Our 350 AI agents launch immediately: pulling case law, reviewing every piece of evidence, modeling strategy, and building the most aggressive defense the technology can provide." },
                { num: "02", tag: "ACCESS", title: "No Funds. No Problem. Period.", text: "A $500,000 defense budget should never determine the outcome of justice. Our AI runners operate on x402 pay rails — court filing fees, research subscriptions, forensic analysis, expert witness deposits — all funded autonomously. Your wallet stays closed." },
                { num: "03", tag: "STANDARD", title: "Best in the Industry. For Everyone.", text: "The same MCP-grade agentic systems that institutional clients pay millions for — deployed in full for every single person we represent. No tiers. No second-class service. No case too small." },
              ].map((item) => (
                <div key={item.num} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 card-lift">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-xs text-[var(--gold)] opacity-60">{item.num} /</span>
                    <span className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)]">{item.tag}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-[var(--text-muted)] text-base leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ THE PROCESS ═══ */}
        <section id="process" className="py-24 px-8 bg-[var(--navy)]">
          <div className="max-w-[1200px] mx-auto">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">The Process</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              INTAKE TO<br/><span className="text-[var(--gold)]">VINDICATION.</span>
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mb-16">
              Three phases. Total coverage. Simple for your family — powered by the most advanced AI legal system ever deployed.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Submit", sub: "Tell us your story. We listen.", text: "Fill out the free case review form. No legal knowledge required. Our AI agents immediately begin triage — classifying charges, flagging urgent deadlines, identifying precedents, and assembling your defense resources. You hear back within 24 hours." },
                { step: "02", title: "Namespace", sub: "Your sovereign case portal.", text: "Every client receives a private subdomain on unykorn.org — your own secured digital fortress. Case documents, evidence matrix, legal strategy, timelines, and agent activity reports live there. Accessible 24/7. Updated in real time." },
                { step: "03", title: "Deploy", sub: "350 agents activate on your case.", text: "Research. Motions. Forensics. Public advocacy. MCP legal agents coordinate across every dimension of your defense simultaneously. x402 runners fund every operation automatically. We do not stop until your name is cleared." },
              ].map((s) => (
                <div key={s.step} className="relative bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 card-lift">
                  <div className="font-serif text-5xl font-bold text-[var(--gold)] opacity-20 absolute top-4 right-6">{s.step}</div>
                  <h3 className="font-serif text-xl font-bold mb-1">Step {s.step} — {s.title}</h3>
                  <p className="text-[var(--gold)] text-sm mb-4">{s.sub}</p>
                  <p className="text-[var(--text-muted)] text-base leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ACTIVE CASES ═══ */}
        <section className="py-24 px-8">
          <div className="max-w-[1200px] mx-auto">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Case Results</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-16">
              WE FIGHT.<br/><span className="text-[var(--gold)]">WE WIN.</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {ACTIVE_CASES.map((c) => (
                <Link key={c.id} href={c.id === "creamer-drive-169" ? "/law/matters/a1b2c3d4-e5f6-7890-abcd-ef1234567890" : `/portal/${c.namespace?.split(".")[0] || "marquis"}`}
                  className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg p-8 card-lift no-underline block">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-mono tracking-wider uppercase ${c.status === "investigation" ? "text-[var(--gold)]" : c.status === "appeal" ? "text-red-400" : "text-[var(--success)]"}`}>
                      {c.status.replace("_", " ")}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">{c.chains}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-1">{c.title}</h3>
                  <p className="text-sm text-[var(--gold)] mb-3">{c.subtitle}</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">{c.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-bold text-[var(--gold)]">{c.amount}</span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">{c.namespace}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ VISUAL SHOWCASE ═══ */}
        <section className="py-24 px-8 bg-[var(--navy)]">
          <div className="max-w-[1200px] mx-auto">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">The Legal Chain</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              WEB3 MEETS<br/><span className="text-[var(--gold)]">JUSTICE.</span>
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mb-16">
              Where blockchain evidence preservation, AI advocacy, and autonomous legal intelligence converge.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {IMAGE_GALLERY.slice(0, 6).map((img) => (
                <div key={img.id} className="relative aspect-video overflow-hidden rounded-lg border border-[rgba(201,168,76,0.1)] card-lift group">
                  <Image src={img.file} alt={img.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="font-serif text-sm font-semibold">{img.title}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/media" className="text-[var(--gold)] font-serif text-sm tracking-[0.1em] uppercase hover:text-[var(--gold-light)] transition-colors no-underline">
                View Full Media Gallery →
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ THE NETWORK ═══ */}
        <section id="network" className="py-24 px-8">
          <div className="max-w-[1200px] mx-auto">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">The Network</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              350 RUNNERS.<br/><span className="text-[var(--gold)]">ZERO HESITATION.</span>
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mb-16">
              Autonomous AI agents holding sovereign ATP wallets on Apostle Chain 7332. Funded, registered, and operational.
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6 mb-16">
              {[
                { val: "350", label: "Total Agents" },
                { val: "15", label: "Control Agents" },
                { val: "x402", label: "Pay Protocol" },
                { val: "7332", label: "Chain ID" },
                { val: "ATP", label: "Reserve Token" },
                { val: "∞", label: "Fight Capacity" },
              ].map((s) => (
                <div key={s.label} className="text-center bg-[var(--navy-card)] rounded-lg p-4 border border-[rgba(201,168,76,0.1)]">
                  <div className="font-serif text-2xl font-bold text-[var(--gold)]">{s.val}</div>
                  <div className="text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { tier: "Control", sub: "Command Layer", agents: "15 AGENTS", badge: "SOVEREIGN WALLETS", desc: AGENT_NETWORK.control.description, color: "text-[var(--gold)]" },
                { tier: "Execution", sub: "Runner Layer", agents: "7 AGENTS", badge: "AUTO-PAY ENABLED", desc: AGENT_NETWORK.execution.description, color: "text-[var(--success)]" },
                { tier: "Intelligence", sub: "Analysis Layer", agents: "2 AGENTS", badge: "24H OPERATION", desc: AGENT_NETWORK.intelligence.description, color: "text-blue-400" },
                { tier: "Interface", sub: "Client Layer", agents: "2 AGENTS", badge: "ALWAYS ON", desc: AGENT_NETWORK.interface.description, color: "text-purple-400" },
              ].map((t) => (
                <div key={t.tier} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 card-lift">
                  <span className={`font-serif text-xs tracking-[0.2em] uppercase ${t.color}`}>{t.tier}</span>
                  <h3 className="font-serif text-lg font-bold mt-1 mb-2">{t.sub}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">{t.desc}</p>
                  <div className="text-xs font-mono text-[var(--text-muted)]">{t.agents} &middot; {t.badge}</div>
                </div>
              ))}
            </div>
            <div className="mt-12 bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg p-8 text-center">
              <div className="text-xs font-mono tracking-[0.2em] text-[var(--gold)] mb-4">x402 Pay Rail &middot; Apostle Chain 7332 &middot; ATP Reserve Token</div>
              <h3 className="font-serif text-2xl font-bold mb-3">Agents pay your fees. No approval needed. No delay. No case lost.</h3>
              <p className="text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
                The x402 protocol enables AI-to-AI micropayment transactions at machine speed. When a court filing deadline arrives, a research database requires ATP, or an expert witness needs a deposit — our execution agents authorize and settle in microseconds via Apostle Chain 7332.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ TECHNOLOGY STACK ═══ */}
        <section id="tech" className="py-24 px-8 bg-[var(--navy)]">
          <div className="max-w-[1200px] mx-auto">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Technology Stack</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-16">
              BEST IN<br/><span className="text-[var(--gold)]">THE INDUSTRY.</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { code: "LA", title: "MCP Legal Agents", desc: "Model Context Protocol agents with direct access to case law databases, statute libraries, motion templates, and judicial records.", badge: "MCP · AUTONOMOUS" },
                { code: "x4", title: "x402 Pay Rail", desc: "Autonomous fee payment via x402 protocol on Apostle Chain 7332. Filing fees, research costs, expert witness fees — settled in microseconds.", badge: "x402 · ATP · CHAIN 7332" },
                { code: "BF", title: "Blockchain Forensics", desc: "On-chain trace analysis across TRON, Ethereum, XRP Ledger, and Stellar. Court-ready evidence packaging.", badge: "TRON · ETH · XRP · XLM" },
                { code: "MK", title: "AI Marketing Ops", desc: "Full agentic marketing and public advocacy team. Case documentation, media strategy, social operations — all AI-driven.", badge: "MCP · AGENTIC · ALWAYS ON" },
                { code: "RE", title: "Agentic Research Engine", desc: "Research agents that never stop. Case law mining, expert witness ID, prosecutorial record review. Every angle explored.", badge: "350 AGENTS · 24/7" },
                { code: "NS", title: "Sovereign Namespaces", desc: "Every client owns their case portal. A secured subdomain on unykorn.org — Web3-native. Your case, your data, your fortress.", badge: "WEB3 · SECURED · SOVEREIGN" },
              ].map((t) => (
                <div key={t.code} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 card-lift">
                  <div className="font-mono text-xs text-[var(--gold)] opacity-60 mb-2">{t.code}</div>
                  <h3 className="font-serif text-lg font-bold mb-2">{t.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">{t.desc}</p>
                  <div className="text-xs font-mono text-[var(--gold)] tracking-wider">{t.badge}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FREE RESOURCES ═══ */}
        <section id="resources" className="py-24 px-8">
          <div className="max-w-[1200px] mx-auto">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Free Resources</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-16">
              EVERYTHING<br/><span className="text-[var(--gold)]">YOUR FAMILY NEEDS.</span>
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: "📄", title: "Your Rights When Falsely Charged", desc: "Constitutional protections from arrest through trial. 12-page plain-language guide." },
                { icon: "🔍", title: "How to Challenge False Evidence", desc: "Suppression motions, chain of custody, digital forensics — explained simply." },
                { icon: "⚖", title: "Understanding Criminal Proceedings", desc: "Arraignment through verdict — what to expect at every stage." },
                { icon: "🤖", title: "The AI Legal Defense Guide 2026", desc: "How 350 AI agents work together to fight your case." },
              ].map((r) => (
                <div key={r.title} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 card-lift">
                  <span className="text-3xl mb-4 block">{r.icon}</span>
                  <div className="text-xs font-mono text-[var(--gold)] tracking-wider mb-2">Free PDF Guide</div>
                  <h3 className="font-serif text-base font-bold mb-2">{r.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ NAMESPACES ═══ */}
        <section className="py-24 px-8 bg-[var(--navy)]">
          <div className="max-w-[1200px] mx-auto">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Active Namespaces</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-16">
              YOUR CASE.<br/><span className="text-[var(--gold)]">YOUR FORTRESS.</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[var(--navy-card)] border border-[var(--success)] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                  <span className="text-xs font-mono text-[var(--success)] tracking-wider">Active</span>
                </div>
                <h3 className="font-mono text-lg font-bold text-[var(--gold)] mb-1">tronfraud.unykorn.org</h3>
                <p className="text-sm text-[var(--text-muted)]">NTI-LEAVITT-2026-001 &middot; Crypto Fraud &middot; $36,150</p>
                <div className="text-xs font-mono text-[var(--text-muted)] mt-3">TRON / ETH &middot; Blockchain Forensics</div>
              </div>
              <div className="bg-[var(--navy-card)] border border-red-400 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-xs font-mono text-red-400 tracking-wider">Urgent — May 10, 2026</span>
                </div>
                <h3 className="font-mono text-lg font-bold text-[var(--gold)] mb-1">marquis.unykorn.org</h3>
                <p className="text-sm text-[var(--text-muted)]">State v. Delcampo &middot; Criminal Defense &middot; Appeal</p>
                <div className="text-xs font-mono text-[var(--text-muted)] mt-3">F.S. 784.045 &middot; Illegal Sentence</div>
              </div>
              <div className="bg-[var(--navy-card)] border border-[var(--gold)] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--gold)]" />
                  <span className="text-xs font-mono text-[var(--gold)] tracking-wider">Pre-Litigation</span>
                </div>
                <h3 className="font-mono text-lg font-bold text-[var(--gold)] mb-1">creamer.unykorn.org</h3>
                <p className="text-sm text-[var(--text-muted)]">169 Creamer Drive &middot; GA/FL &middot; ~$1M</p>
                <div className="text-xs font-mono text-[var(--text-muted)] mt-3">Joint Venture &middot; Post-Closing Accounting</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ INTAKE FORM ═══ */}
        <section id="intake" className="py-24 px-8">
          <div className="max-w-[800px] mx-auto">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Open a Case</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              YOUR FIGHT<br/><span className="text-[var(--gold)]">STARTS HERE.</span>
            </h2>
            <p className="text-lg text-[var(--text-muted)] mb-12">
              Tell us what happened. No legal knowledge required. No cost. No obligation. Just the truth — and 350 agents ready to go.
            </p>
            <div className="text-sm text-[var(--text-muted)] mb-8 space-y-1">
              <p>&#10003; Response within 24 hours guaranteed</p>
              <p>&#10003; Sovereign namespace provisioned immediately</p>
              <p>&#10003; $0 cost — x402 funded from day one</p>
              <p>&#10003; All documents downloadable for your family</p>
              <p>&#10003; 350 AI agents active from first submission</p>
              <p className="text-[var(--gold)]">Direct line: law@unykorn.org</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {formError && (
                <div className="bg-red-900/30 border border-red-500/30 rounded px-4 py-3 text-red-300 text-sm">{formError}</div>
              )}
              {submitted ? (
                <div className="bg-[rgba(201,168,76,0.08)] border border-[var(--gold)] rounded-lg p-8 text-center">
                  <div className="text-3xl mb-4">&#9878;</div>
                  <h3 className="font-serif text-2xl font-bold text-[var(--gold)] mb-2">Case Review Submitted</h3>
                  <p className="text-[var(--text-muted)] mb-4">Your intake has been received and assigned to our AI agents. You will hear from us within 24 hours.</p>
                  <p className="text-xs font-mono text-[var(--gold)]">350 agents now reviewing your case</p>
                </div>
              ) : (
                <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-serif text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">First Name *</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))} className="w-full bg-[var(--navy-card)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block font-serif text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">Last Name *</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))} className="w-full bg-[var(--navy-card)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block font-serif text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">Email Address *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full bg-[var(--navy-card)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block font-serif text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">Phone (optional)</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full bg-[var(--navy-card)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block font-serif text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">Case Type *</label>
                <select value={formData.caseType} onChange={(e) => setFormData(p => ({ ...p, caseType: e.target.value }))} className="w-full bg-[var(--navy-card)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors">
                  <option value="">Select your situation...</option>
                  <option value="criminal">Criminal Defense — Wrongful Charge</option>
                  <option value="appeal">Criminal Appeal — Excessive Sentence</option>
                  <option value="crypto">Cryptocurrency Fraud Recovery</option>
                  <option value="civil_property">Civil — Property / Joint Venture Dispute</option>
                  <option value="civil_contract">Civil — Contract / Accounting Dispute</option>
                  <option value="other">Other — Describe Below</option>
                </select>
              </div>
              <div>
                <label className="block font-serif text-xs tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">What Happened — Tell Us Everything *</label>
                <textarea rows={6} value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full bg-[var(--navy-card)] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors resize-none" placeholder="Describe the situation in plain language. No legal terms needed. Include any urgent dates or deadlines you know of." />
              </div>
              <button type="submit" className="w-full bg-[var(--gold)] text-[var(--midnight)] py-4 font-serif text-sm font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[var(--gold-light)] transition-colors cursor-pointer">
                Submit Free Case Review →
              </button>
                </>
              )}
              <p className="text-center text-xs text-[var(--text-muted)]">Private · Confidential · $0 cost · law@unykorn.org</p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
