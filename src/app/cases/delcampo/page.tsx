"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  CASE_OVERVIEW,
  CASE_ACTORS,
  CASE_TIMELINE,
  CASE_CONTRADICTIONS,
  EVIDENCE_MATRIX,
  LEGAL_ISSUES,
  BLOCKCHAIN_ANCHORS,
  CASE_STATS,
} from "@/lib/data/delcampo-case";

type Tab =
  | "overview"
  | "timeline"
  | "evidence"
  | "contradictions"
  | "legal"
  | "blockchain";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "⚖" },
  { key: "timeline", label: "Timeline", icon: "◷" },
  { key: "evidence", label: "Evidence", icon: "🔗" },
  { key: "contradictions", label: "Contradictions", icon: "⚡" },
  { key: "legal", label: "Legal Strategy", icon: "📋" },
  { key: "blockchain", label: "Chain Anchors", icon: "⬡" },
];

// ── Stat Badge ──────────────────────────────────────────────────────────────

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-4 text-center">
      <div className={`font-mono text-2xl font-bold ${accent ? "text-red-400" : "text-[var(--gold)]"}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-[var(--text-muted)] tracking-wider uppercase mt-1">{label}</div>
    </div>
  );
}

// ── Severity Badge ──────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-900/40 text-red-300 border-red-700/30",
    high: "bg-orange-900/40 text-orange-300 border-orange-700/30",
    medium: "bg-yellow-900/30 text-yellow-300 border-yellow-700/30",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-mono rounded border ${colors[severity] || "text-[var(--text-muted)]"}`}>
      {severity.toUpperCase()}
    </span>
  );
}

// ── Status Dot ──────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    obtained: "bg-[var(--success)]",
    "known-to-exist": "bg-[var(--gold)]",
    partial: "bg-orange-400",
    "not-obtained": "bg-red-400",
    "likely-lost": "bg-[var(--text-muted)]",
  };
  return <span className={`w-2 h-2 rounded-full inline-block mr-2 ${colors[status] || "bg-gray-500"}`} />;
}

// ── Strength Meter ──────────────────────────────────────────────────────────

function StrengthMeter({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`w-3 h-3 rounded-sm ${
            n <= value ? "bg-[var(--gold)]" : "bg-[rgba(201,168,76,0.15)]"
          }`}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function DelcampoCasePage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mb-6">
          <Link href="/law" className="text-[var(--gold)] no-underline hover:underline">
            Cases
          </Link>
          <span>/</span>
          <span>UNY-CRIM-2026-001</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-mono tracking-wider uppercase text-red-400">
              ACTIVE APPEAL
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Case #{CASE_OVERVIEW.caseNumber}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-2">
            <span className="text-[var(--gold)]">State of Florida</span>{" "}
            <span className="text-[var(--text-muted)] text-2xl md:text-3xl">v.</span>{" "}
            Marquis Anthony Delcampo
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-3xl mt-3">
            Aggravated Battery — F.S. § 784.045(1)(a). 20-year sentence imposed on a charge with a 15-year
            statutory maximum. Ten major contradictions identified. Self-defense evidence suppressed.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-10">
          <Stat label="Days Incarcerated" value={CASE_STATS.daysIncarcerated} accent />
          <Stat label="Appeal Deadline" value={`${CASE_STATS.daysToAppealDeadline}d`} accent />
          <Stat label="Evidence Items" value={`${CASE_STATS.evidenceObtained}/${CASE_STATS.evidenceTotal}`} />
          <Stat label="Contradictions" value={CASE_STATS.contradictionsFound} />
          <Stat label="Critical Issues" value={CASE_STATS.criticalContradictions} accent />
          <Stat label="Legal Issues" value={CASE_STATS.legalIssuesIdentified} />
          <Stat label="Motions Ready" value={CASE_STATS.motionsReadyToFile} />
          <Stat label="Chain Anchors" value={CASE_STATS.documentsAnchored} />
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[rgba(201,168,76,0.1)] pb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-mono text-sm tracking-wider px-4 py-2 rounded-sm border transition-colors ${
                tab === t.key
                  ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)] font-semibold"
                  : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:text-[var(--gold)] hover:border-[var(--gold)]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && <OverviewTab />}
        {tab === "timeline" && <TimelineTab />}
        {tab === "evidence" && <EvidenceTab />}
        {tab === "contradictions" && <ContradictionsTab />}
        {tab === "legal" && <LegalTab />}
        {tab === "blockchain" && <BlockchainTab />}
      </main>
      <Footer />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Case Details */}
      <section className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
        <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6">
          CASE DETAILS
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Detail label="Charge" value={CASE_OVERVIEW.charge} />
          <Detail label="Case Number" value={`#${CASE_OVERVIEW.caseNumber}`} />
          <Detail label="Warrant" value={`#${CASE_OVERVIEW.warrantNumber}`} />
          <Detail label="Court" value={CASE_OVERVIEW.court} />
          <Detail label="Judge" value={CASE_OVERVIEW.judge} />
          <Detail label="Prosecutors" value={CASE_OVERVIEW.prosecutors.join(", ")} />
          <Detail label="State Attorney" value={CASE_OVERVIEW.stateAttorney} />
          <Detail label="Incident Date" value={CASE_OVERVIEW.incidentDate} />
          <Detail label="Incident Location" value={CASE_OVERVIEW.incidentLocation} />
          <Detail label="Sentencing Date" value={CASE_OVERVIEW.sentencingDate} />
          <Detail label="Appeal Court" value={CASE_OVERVIEW.appealCourt} />
          <Detail label="Booking ID" value={`#${CASE_OVERVIEW.bookingId}`} />
        </div>
      </section>

      {/* Sentence Analysis */}
      <section className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
        <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6">
          SENTENCE ANALYSIS
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-[rgba(204,68,68,0.08)] border border-[rgba(204,68,68,0.2)] rounded-lg">
            <div className="font-mono text-4xl font-bold text-red-400">20</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">Years Imposed</div>
          </div>
          <div className="text-center p-6 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-lg">
            <div className="font-mono text-4xl font-bold text-[var(--gold)]">15</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">Statutory Maximum</div>
          </div>
          <div className="text-center p-6 bg-[rgba(204,68,68,0.08)] border border-[rgba(204,68,68,0.2)] rounded-lg">
            <div className="font-mono text-4xl font-bold text-red-400">+5</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">Years Over Maximum</div>
          </div>
        </div>
        <p className="text-[var(--text-muted)] text-sm mt-4">
          <strong className="text-red-400">Breakdown:</strong> {CASE_OVERVIEW.sentenceBreakdown}. F.S. § 775.082(3)(d)
          provides a 15-year maximum for second-degree felonies. This sentence is facially illegal under Rule 3.800(a)
          and can be challenged at any time with no filing deadline.
        </p>
      </section>

      {/* Key Actors */}
      <section className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
        <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6">
          KEY ACTORS ({CASE_ACTORS.length})
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {CASE_ACTORS.map((actor) => (
            <div
              key={actor.id}
              className={`p-4 rounded-lg border ${
                actor.critical
                  ? "border-red-700/30 bg-[rgba(204,68,68,0.05)]"
                  : "border-[rgba(201,168,76,0.1)] bg-[rgba(201,168,76,0.02)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${
                    actor.side === "defense"
                      ? "bg-blue-900/40 text-blue-300"
                      : actor.side === "prosecution"
                      ? "bg-red-900/30 text-red-300"
                      : actor.side === "witness"
                      ? "bg-yellow-900/30 text-yellow-300"
                      : actor.side === "corporate"
                      ? "bg-purple-900/30 text-purple-300"
                      : "bg-green-900/30 text-green-300"
                  }`}
                >
                  {actor.side}
                </span>
                {actor.critical && (
                  <span className="text-xs font-mono text-red-400">★ CRITICAL</span>
                )}
              </div>
              <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)] mt-1">
                {actor.name}
              </h3>
              <p className="text-sm text-[var(--gold)] mb-1">{actor.role}</p>
              <p className="text-xs text-[var(--text-muted)]">{actor.details}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Defense Thesis */}
      <section className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
        <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6">
          DEFENSE THESIS
        </h2>
        <div className="space-y-4 text-[var(--text-primary)]">
          <p>
            The prosecution&apos;s narrative begins at the wrong point in the sequence of events. The official account
            states &quot;Marquis started punching&quot; — but omits everything the Uber driver did before that moment:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-[var(--text-muted)]">
            <li>Driver stopped at <strong className="text-[var(--text-primary)]">wrong location</strong> — ride was NOT at GPS destination</li>
            <li>Driver <strong className="text-[var(--text-primary)]">opened the rear door</strong> and physically grabbed Marquis</li>
            <li>Driver attempted <strong className="text-[var(--text-primary)]">forcible removal</strong> from the vehicle (Marquis&apos;s belongings still inside)</li>
            <li>Driver attempted a <strong className="text-[var(--text-primary)]">physical takedown</strong></li>
            <li>Driver retrieved an <strong className="text-[var(--text-primary)]">umbrella as a weapon</strong> and swung it at Marquis</li>
          </ol>
          <p className="text-[var(--text-muted)]">
            Under Florida&apos;s Stand Your Ground law (F.S. § 776.032), a person in an occupied vehicle has a
            <strong className="text-[var(--gold)]"> statutory presumption of reasonable fear</strong> when another person
            unlawfully and forcefully enters or attempts to remove them. Trial counsel never requested a SYG immunity hearing.
          </p>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[var(--text-muted)] font-mono tracking-wider uppercase mb-1">{label}</div>
      <div className="text-sm text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: TIMELINE
// ══════════════════════════════════════════════════════════════════════════════

function TimelineTab() {
  const [filter, setFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(CASE_TIMELINE.map((e) => e.category));
    return ["all", ...Array.from(cats)];
  }, []);

  const filtered =
    filter === "all"
      ? CASE_TIMELINE
      : CASE_TIMELINE.filter((e) => e.category === filter);

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`text-xs font-mono tracking-wider px-3 py-1.5 rounded border transition-colors ${
              filter === c
                ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)]"
                : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:text-[var(--gold)]"
            }`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-[rgba(201,168,76,0.15)]" />

        <div className="space-y-6">
          {filtered.map((event) => (
            <div key={event.id} className="relative pl-16">
              {/* Dot */}
              <div
                className={`absolute left-[18px] w-4 h-4 rounded-full border-2 ${
                  event.critical
                    ? "bg-red-400 border-red-600"
                    : event.category === "deadline"
                    ? "bg-orange-400 border-orange-600"
                    : "bg-[var(--gold)] border-[var(--gold-dark)]"
                }`}
              />

              <div
                className={`p-5 rounded-lg border ${
                  event.critical
                    ? "border-red-700/30 bg-[rgba(204,68,68,0.05)]"
                    : "border-[rgba(201,168,76,0.1)] bg-[var(--navy-card)]"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xs text-[var(--gold)]">{event.timestamp}</span>
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded ${
                      event.category === "incident"
                        ? "bg-blue-900/40 text-blue-300"
                        : event.category === "investigation"
                        ? "bg-yellow-900/30 text-yellow-300"
                        : event.category === "legal"
                        ? "bg-purple-900/30 text-purple-300"
                        : event.category === "appeal"
                        ? "bg-green-900/30 text-green-300"
                        : "bg-red-900/30 text-red-300"
                    }`}
                  >
                    {event.category}
                  </span>
                  {event.critical && (
                    <span className="text-xs font-mono text-red-400">★ CRITICAL</span>
                  )}
                </div>
                <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-1">
                  {event.label}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {event.description}
                </p>
                {event.contradictions && event.contradictions.length > 0 && (
                  <div className="mt-3 p-3 bg-[rgba(204,68,68,0.06)] border-l-2 border-red-400 rounded-r">
                    <p className="text-xs font-mono text-red-400 mb-1">⚡ CONTRADICTION</p>
                    {event.contradictions.map((c, i) => (
                      <p key={i} className="text-xs text-[var(--text-muted)]">
                        {c}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: EVIDENCE
// ══════════════════════════════════════════════════════════════════════════════

function EvidenceTab() {
  const [statusFilter, setStatusFilter] = useState("all");

  const statuses = ["all", "obtained", "not-obtained", "partial", "known-to-exist", "likely-lost"];
  const filtered =
    statusFilter === "all"
      ? EVIDENCE_MATRIX
      : EVIDENCE_MATRIX.filter((e) => e.status === statusFilter);

  const byCritical = filtered.filter((e) => e.priority === "critical");
  const byOther = filtered.filter((e) => e.priority !== "critical");

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs font-mono text-[var(--text-muted)]">
        <span><StatusDot status="obtained" /> Obtained</span>
        <span><StatusDot status="partial" /> Partial</span>
        <span><StatusDot status="known-to-exist" /> Known to Exist</span>
        <span><StatusDot status="not-obtained" /> Not Obtained</span>
        <span><StatusDot status="likely-lost" /> Likely Lost</span>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs font-mono tracking-wider px-3 py-1.5 rounded border transition-colors ${
              statusFilter === s
                ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)]"
                : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:text-[var(--gold)]"
            }`}
          >
            {s.toUpperCase().replace(/-/g, " ")}
          </button>
        ))}
      </div>

      {/* Critical Evidence */}
      {byCritical.length > 0 && (
        <div className="mb-8">
          <h3 className="font-serif text-xs tracking-[0.2em] uppercase text-red-400 mb-4">
            CRITICAL EVIDENCE ({byCritical.length})
          </h3>
          <div className="grid gap-4">
            {byCritical.map((e) => (
              <EvidenceCard key={e.id} item={e} />
            ))}
          </div>
        </div>
      )}

      {/* Other Evidence */}
      {byOther.length > 0 && (
        <div>
          <h3 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-4">
            ADDITIONAL EVIDENCE ({byOther.length})
          </h3>
          <div className="grid gap-4">
            {byOther.map((e) => (
              <EvidenceCard key={e.id} item={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceCard({ item }: { item: (typeof EVIDENCE_MATRIX)[number] }) {
  return (
    <div
      className={`p-5 rounded-lg border ${
        item.priority === "critical"
          ? "border-red-700/30 bg-[rgba(204,68,68,0.04)]"
          : "border-[rgba(201,168,76,0.1)] bg-[var(--navy-card)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusDot status={item.status} />
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {item.status.replace(/-/g, " ").toUpperCase()}
            </span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded border ${
                item.priority === "critical"
                  ? "border-red-700/30 text-red-300"
                  : item.priority === "high"
                  ? "border-orange-700/30 text-orange-300"
                  : "border-[rgba(201,168,76,0.2)] text-[var(--text-muted)]"
              }`}
            >
              {item.priority}
            </span>
          </div>
          <h4 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-1">
            {item.title}
          </h4>
          <p className="text-xs text-[var(--gold)] mb-2">{item.source}</p>
          <p className="text-sm text-[var(--text-muted)]">{item.description}</p>
        </div>
        {item.blockchainHash && (
          <div className="shrink-0 text-right">
            <span className="text-xs font-mono text-[var(--success)]">⬡ ANCHORED</span>
            <div className="text-xs font-mono text-[var(--text-muted)] mt-1 max-w-[140px] truncate">
              {item.blockchainHash}
            </div>
            <div className="text-xs font-mono text-[var(--gold)]">Block #{item.anchoredBlock}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CONTRADICTIONS
// ══════════════════════════════════════════════════════════════════════════════

function ContradictionsTab() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[var(--text-muted)] max-w-3xl">
          Forensic analysis identified <strong className="text-red-400">{CASE_CONTRADICTIONS.length} major contradictions</strong> between
          the official prosecution narrative and the documented evidence. Each contradiction has been
          blockchain-anchored for immutable verification.
        </p>
      </div>

      <div className="space-y-6">
        {CASE_CONTRADICTIONS.map((c) => (
          <div
            key={c.id}
            className={`rounded-lg border p-6 ${
              c.severity === "critical"
                ? "border-red-700/30 bg-[rgba(204,68,68,0.04)]"
                : c.severity === "high"
                ? "border-orange-700/20 bg-[rgba(200,120,20,0.03)]"
                : "border-[rgba(201,168,76,0.1)] bg-[var(--navy-card)]"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-sm text-[var(--gold)]">#{c.number}</span>
              <SeverityBadge severity={c.severity} />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="p-4 rounded border-l-3 border-l-red-500 bg-[rgba(204,68,68,0.04)]">
                <p className="text-xs font-mono text-red-400 mb-2 tracking-wider">OFFICIAL NARRATIVE</p>
                <p className="text-sm text-[var(--text-primary)]">{c.officialNarrative}</p>
              </div>
              <div className="p-4 rounded border-l-3 border-l-[var(--success)] bg-[rgba(68,170,136,0.04)]">
                <p className="text-xs font-mono text-[var(--success)] mb-2 tracking-wider">ACTUAL EVIDENCE</p>
                <p className="text-sm text-[var(--text-primary)]">{c.actualEvidence}</p>
              </div>
            </div>

            <div className="p-3 bg-[rgba(201,168,76,0.05)] rounded">
              <p className="text-xs font-mono text-[var(--gold)] mb-1 tracking-wider">LEGAL IMPACT</p>
              <p className="text-sm text-[var(--text-muted)]">{c.legalImpact}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: LEGAL STRATEGY
// ══════════════════════════════════════════════════════════════════════════════

function LegalTab() {
  return (
    <div>
      {/* Deadline Alert */}
      <div className="bg-[rgba(204,68,68,0.08)] border border-red-700/30 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-red-400 font-mono text-lg">⚠</span>
          <h3 className="font-serif text-lg font-bold text-red-400">CRITICAL DEADLINES</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-[rgba(204,68,68,0.06)] rounded text-center">
            <div className="font-mono text-2xl font-bold text-red-400">
              {CASE_STATS.daysToAppealDeadline}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Days to Direct Appeal</div>
            <div className="text-xs font-mono text-red-300 mt-1">May 10, 2026</div>
          </div>
          <div className="p-4 bg-[rgba(201,168,76,0.06)] rounded text-center">
            <div className="font-mono text-2xl font-bold text-[var(--gold)]">∞</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Rule 3.800(a)</div>
            <div className="text-xs font-mono text-[var(--gold)] mt-1">No Time Limit</div>
          </div>
          <div className="p-4 bg-[rgba(201,168,76,0.06)] rounded text-center">
            <div className="font-mono text-2xl font-bold text-[var(--gold)]">~Feb 2028</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Rule 3.850</div>
            <div className="text-xs font-mono text-[var(--gold)] mt-1">2-Year Window</div>
          </div>
        </div>
      </div>

      {/* Issues Ranked */}
      <div className="space-y-4">
        {LEGAL_ISSUES.map((issue) => (
          <div
            key={issue.id}
            className="p-6 rounded-lg border border-[rgba(201,168,76,0.1)] bg-[var(--navy-card)]"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[var(--gold)]">#{issue.rank}</span>
                <StrengthMeter value={issue.strength} />
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    issue.status === "ready-to-file"
                      ? "border-[var(--success)] text-[var(--success)]"
                      : issue.status === "filed"
                      ? "border-blue-400 text-blue-400"
                      : issue.status === "drafting"
                      ? "border-[var(--gold)] text-[var(--gold)]"
                      : "border-[var(--text-muted)] text-[var(--text-muted)]"
                  }`}
                >
                  {issue.status.replace(/-/g, " ").toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">{issue.deadline}</span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-1">
              {issue.title}
            </h3>
            <p className="text-xs font-mono text-[var(--gold)] mb-2">{issue.statuteRule}</p>
            <p className="text-sm text-[var(--text-muted)]">{issue.description}</p>
            <p className="text-xs font-mono text-[var(--text-muted)] mt-2">
              Vehicle: <span className="text-[var(--gold)]">{issue.vehicle}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: BLOCKCHAIN INVESTIGATION
// ══════════════════════════════════════════════════════════════════════════════

function BlockchainTab() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[var(--text-muted)] max-w-3xl">
          All case documents, evidence analyses, and legal strategies are anchored on the Legal-Chain
          Substrate blockchain. Each anchor creates an immutable, time-stamped, cryptographically
          verified record that can be independently verified through Merkle state proofs.
        </p>
      </div>

      {/* Anchor Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Documents Anchored" value={BLOCKCHAIN_ANCHORS.length} />
        <Stat label="Verified" value={BLOCKCHAIN_ANCHORS.filter((a) => a.verified).length} />
        <Stat
          label="Latest Block"
          value={`#${Math.max(...BLOCKCHAIN_ANCHORS.map((a) => a.blockNumber))}`}
        />
        <Stat
          label="Pallets Used"
          value={new Set(BLOCKCHAIN_ANCHORS.map((a) => a.palletUsed)).size}
        />
      </div>

      {/* Anchor Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[rgba(201,168,76,0.2)]">
              <th className="font-mono text-xs tracking-wider uppercase text-[var(--gold-muted)] py-3 px-4">
                Document
              </th>
              <th className="font-mono text-xs tracking-wider uppercase text-[var(--gold-muted)] py-3 px-4">
                Block
              </th>
              <th className="font-mono text-xs tracking-wider uppercase text-[var(--gold-muted)] py-3 px-4">
                Pallet
              </th>
              <th className="font-mono text-xs tracking-wider uppercase text-[var(--gold-muted)] py-3 px-4">
                Content Hash
              </th>
              <th className="font-mono text-xs tracking-wider uppercase text-[var(--gold-muted)] py-3 px-4">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {BLOCKCHAIN_ANCHORS.map((anchor) => (
              <tr
                key={anchor.id}
                className="border-b border-[rgba(201,168,76,0.05)] hover:bg-[rgba(201,168,76,0.03)] transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="text-sm text-[var(--text-primary)]">{anchor.documentTitle}</div>
                  <div className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                    {new Date(anchor.anchoredAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="font-mono text-sm text-[var(--gold)] py-3 px-4">#{anchor.blockNumber}</td>
                <td className="font-mono text-xs text-[var(--text-muted)] py-3 px-4">{anchor.palletUsed}</td>
                <td className="font-mono text-xs text-[var(--text-muted)] py-3 px-4 max-w-[200px] truncate">
                  {anchor.contentHash}
                </td>
                <td className="py-3 px-4">
                  {anchor.verified ? (
                    <span className="text-xs font-mono text-[var(--success)]">✓ VERIFIED</span>
                  ) : (
                    <span className="text-xs font-mono text-[var(--text-muted)]">PENDING</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Merkle Proof Section */}
      <div className="mt-12 bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
        <h3 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-4">
          HOW BLOCKCHAIN VERIFICATION WORKS
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">🔐</div>
            <h4 className="font-serif text-sm font-semibold text-[var(--text-primary)] mb-2">
              1. Hash & Anchor
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              Each document is SHA-256 hashed and the hash is submitted as an extrinsic to the
              Legal-Chain Substrate blockchain.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">⬡</div>
            <h4 className="font-serif text-sm font-semibold text-[var(--text-primary)] mb-2">
              2. Block Inclusion
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              The hash is included in a finalized block with a Merkle state root. The block number,
              timestamp, and Merkle proof create an irrefutable record.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">✓</div>
            <h4 className="font-serif text-sm font-semibold text-[var(--text-primary)] mb-2">
              3. Independent Verification
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              Anyone can verify a document&apos;s integrity by hashing it and checking the hash against
              the blockchain state proof — no trust in any party required.
            </p>
          </div>
        </div>
      </div>

      {/* Chain Info Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
          <h4 className="font-serif text-sm font-semibold text-[var(--gold)] mb-3">Evidence Pallet</h4>
          <p className="text-xs text-[var(--text-muted)]">
            Stores evidence content hashes with custodian, type, and chain-of-custody metadata. 
            Every access logged to pallet-audit.
          </p>
        </div>
        <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
          <h4 className="font-serif text-sm font-semibold text-[var(--gold)] mb-3">Documents Pallet</h4>
          <p className="text-xs text-[var(--text-muted)]">
            Anchors legal documents — motions, briefs, analysis reports. Links to matters via
            matter ID. Tracks versions with predecessor hashes.
          </p>
        </div>
        <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
          <h4 className="font-serif text-sm font-semibold text-[var(--gold)] mb-3">Audit Pallet</h4>
          <p className="text-xs text-[var(--text-muted)]">
            Immutable audit trail of all actions. Every evidence registration, document anchor,
            and access event is permanently recorded.
          </p>
        </div>
      </div>
    </div>
  );
}
