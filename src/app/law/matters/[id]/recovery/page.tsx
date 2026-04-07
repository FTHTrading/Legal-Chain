"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { use } from "react";
import { SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON } from "@/lib/data/seed";

const ALL_MATTERS = [SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON];

function getMatter(id: string) {
  return ALL_MATTERS.find(m => m.id === id) || null;
}

const STATUS_COLORS: Record<string, string> = {
  not_started: "text-[var(--text-muted)]",
  in_progress: "text-[var(--gold)]",
  ready: "text-[var(--success)]",
};

const RISK_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: "bg-[rgba(34,197,94,0.15)]", text: "text-[var(--success)]" },
  medium: { bg: "bg-[rgba(201,168,76,0.15)]", text: "text-[var(--gold)]" },
  high: { bg: "bg-[rgba(239,68,68,0.15)]", text: "text-red-400" },
  unknown: { bg: "bg-[rgba(156,163,175,0.15)]", text: "text-[var(--text-muted)]" },
};

export default function RecoveryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const matter = getMatter(id);

  if (!matter) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-[104px] pb-16 px-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-[var(--gold)]">Matter Not Found</h1>
          <Link href="/law" className="text-[var(--gold)] mt-4 inline-block">← Back to Cases</Link>
        </main>
        <Footer />
      </>
    );
  }

  const r = matter.recovery;
  const d = matter.damages;
  const riskStyle = RISK_COLORS[r.floridaHomesteadRisk.riskLevel] || RISK_COLORS.unknown;

  const tabs = [
    { label: "Overview", href: `/law/matters/${id}` },
    { label: "Claims", href: `/law/matters/${id}/claims` },
    { label: "Ledger", href: `/law/matters/${id}/ledger` },
    { label: "Evidence", href: `/law/matters/${id}/evidence` },
    { label: "Documents", href: `/law/matters/${id}/documents` },
    { label: "Jurisdiction", href: `/law/matters/${id}/jurisdiction` },
    { label: "Recovery", href: `/law/matters/${id}/recovery`, active: true },
    { label: "Timeline", href: `/law/matters/${id}/timeline` },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mb-6">
            <Link href="/law" className="text-[var(--gold)] no-underline hover:underline">Cases</Link>
            <span>/</span>
            <Link href={`/law/matters/${id}`} className="text-[var(--gold)] no-underline hover:underline">{matter.matterId}</Link>
            <span>/</span>
            <span>Recovery</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Recovery Path Analysis</h1>
          <p className="text-[var(--text-muted)] mb-8">{matter.title}</p>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-[rgba(201,168,76,0.1)] overflow-x-auto">
            {tabs.map((t) => (
              <Link key={t.label} href={t.href}
                className={`px-4 py-3 text-sm font-serif tracking-wider uppercase no-underline transition-colors whitespace-nowrap ${
                  t.active
                    ? "text-[var(--gold)] border-b-2 border-[var(--gold)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}>
                {t.label}
              </Link>
            ))}
          </div>

          {/* Damages Overview */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.2)] rounded-lg p-8 mb-8">
            <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6">Damages Model</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="font-serif text-2xl font-bold text-[var(--gold)]">
                  ${d.estimatedCaseValue.toLocaleString()}
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)] mt-1">Estimated Value</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl font-bold text-[var(--success)]">
                  ${d.verifiedSubtotal.toLocaleString()}
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)] mt-1">Verified</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl font-bold text-[var(--gold)]">
                  ${d.disputedSubtotal.toLocaleString()}
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)] mt-1">Disputed</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl font-bold">
                  {d.prejudgmentInterestEligible ? "✓" : "✗"}
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)] mt-1">Prejudgment Interest</div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[rgba(201,168,76,0.1)]">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[var(--text-muted)]">Claimant Net Position</span>
                <span className={`font-mono text-sm font-bold ${d.claimantNetPosition >= 0 ? "text-[var(--success)]" : "text-red-400"}`}>
                  ${Math.abs(d.claimantNetPosition).toLocaleString()}
                  {d.claimantNetPosition < 0 && " (deficit)"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[var(--text-muted)]">Respondent Net Position</span>
                <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                  ${Math.abs(d.respondentNetPosition).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Collection Readiness */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)]">Collection Readiness</h2>
              <span className={`text-xs font-mono tracking-wider uppercase px-3 py-1 rounded ${
                r.collectionReadiness === "ready" ? "bg-[rgba(34,197,94,0.15)] text-[var(--success)]" :
                r.collectionReadiness === "in_progress" ? "bg-[rgba(201,168,76,0.15)] text-[var(--gold)]" :
                "bg-[rgba(156,163,175,0.15)] text-[var(--text-muted)]"
              }`}>
                {r.collectionReadiness.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Two-Column: Georgia Path + Florida Path */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Georgia Judgment Path */}
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">🍑</span>
                <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)]">Georgia Judgment Path</h2>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono text-[var(--text-muted)]">Status:</span>
                <span className={`text-xs font-mono font-semibold ${STATUS_COLORS[r.georgiaJudgmentPath.status] || "text-[var(--text-primary)]"}`}>
                  {r.georgiaJudgmentPath.status.replace(/_/g, " ")}
                </span>
              </div>
              {r.georgiaJudgmentPath.nextSteps.length > 0 ? (
                <ol className="space-y-3">
                  {r.georgiaJudgmentPath.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center font-mono text-[10px] text-[var(--gold)] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[var(--text-primary)] leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-[var(--text-muted)] italic">No steps applicable</p>
              )}
            </div>

            {/* Florida Domestication Path */}
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">🌴</span>
                <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)]">Florida Domestication Path</h2>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-[var(--text-muted)]">Status:</span>
                <span className={`text-xs font-mono font-semibold ${STATUS_COLORS[r.floridaDomesticationPath.status] || "text-[var(--text-primary)]"}`}>
                  {r.floridaDomesticationPath.status.replace(/_/g, " ")}
                </span>
              </div>
              {r.floridaDomesticationPath.statute !== "N/A" && (
                <div className="text-xs text-[var(--text-muted)] mb-4 bg-[rgba(201,168,76,0.05)] rounded p-3 font-mono">
                  {r.floridaDomesticationPath.statute}
                </div>
              )}
              {r.floridaDomesticationPath.nextSteps.length > 0 ? (
                <ol className="space-y-3">
                  {r.floridaDomesticationPath.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center font-mono text-[10px] text-[var(--gold)] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[var(--text-primary)] leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-[var(--text-muted)] italic">No steps applicable</p>
              )}
            </div>
          </div>

          {/* Homestead Risk Assessment */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏠</span>
                <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)]">Florida Homestead Risk</h2>
              </div>
              <span className={`text-xs font-mono tracking-wider uppercase px-3 py-1 rounded ${riskStyle.bg} ${riskStyle.text}`}>
                {r.floridaHomesteadRisk.riskLevel}
              </span>
            </div>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{r.floridaHomesteadRisk.notes}</p>
          </div>

          {/* Non-Homestead Targets */}
          {r.nonHomesteadTargets.length > 0 && (
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
              <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-4">
                Non-Homestead Collection Targets ({r.nonHomesteadTargets.length})
              </h2>
              <div className="space-y-3">
                {r.nonHomesteadTargets.map((target, i) => (
                  <div key={i} className="flex items-start justify-between py-3 border-b border-[rgba(201,168,76,0.05)] last:border-0">
                    <div className="flex items-start gap-4">
                      <span className="font-mono text-xs text-[var(--gold)] w-6 shrink-0 pt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div className="font-serif text-sm font-semibold mb-1">{target.assetType}</div>
                        <div className="text-xs text-[var(--text-muted)]">{target.description}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded shrink-0 ${
                      target.status.includes("identified") || target.status.includes("progress")
                        ? "bg-[rgba(201,168,76,0.15)] text-[var(--gold)]"
                        : "bg-[rgba(156,163,175,0.15)] text-[var(--text-muted)]"
                    }`}>
                      {target.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
