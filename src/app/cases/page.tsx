"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface OrchestratorStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  failed: number;
  totalStepsRun: number;
  avgConfidence: number;
}

interface WorkflowInfo {
  id: string;
  name: string;
  description: string;
  stepCount: number;
  pipelineCount: number;
}

const PRACTICE_AREAS = [
  {
    icon: "⚖️",
    title: "Civil Litigation",
    types: ["Property Disputes", "Business Disputes", "Personal Injury"],
    description: "AI-powered case analysis with blockchain-verified evidence chains.",
  },
  {
    icon: "🔐",
    title: "Criminal Defense",
    types: ["Criminal Appeals", "Wrongful Charge Defense"],
    description: "Automated investigation with AI preliminary reports and defense strategy.",
  },
  {
    icon: "🌐",
    title: "Web3 & Crypto",
    types: ["Cryptocurrency Fraud", "Smart Contract Disputes"],
    description: "Blockchain forensic analysis with on-chain evidence tracing.",
  },
  {
    icon: "📋",
    title: "Compliance & Regulatory",
    types: ["Regulatory Defense", "Compliance Audit"],
    description: "AI compliance screening with multi-jurisdiction analysis.",
  },
];

const SECURITY_FEATURES = [
  { label: "AES-256-GCM", detail: "Military-grade encryption for all client data" },
  { label: "Web3 Vault", detail: "Blockchain-anchored content hashes for data integrity" },
  { label: "Private Links", detail: "HMAC-signed tokens with time-limited access" },
  { label: "Zero-PII Views", detail: "Public dashboards never expose client information" },
  { label: "Truth Kernel", detail: "11-layer verification system for all legal artifacts" },
  { label: "Audit Trail", detail: "Immutable blockchain-backed chain of custody" },
];

export default function CasesOverviewPage() {
  const [stats, setStats] = useState<OrchestratorStats | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowInfo[]>([]);

  useEffect(() => {
    fetch("/api/orchestrator?view=stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});

    fetch("/api/orchestrator?view=workflows")
      .then((r) => r.json())
      .then((data) => {
        if (data.workflows) setWorkflows(data.workflows);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-3">
              CASE MANAGEMENT
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              INTELLIGENCE-DRIVEN<br />
              <span className="text-[var(--gold)]">LEGAL OPERATIONS.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              Every case is processed through our AI investigation pipeline, secured in a Web3 Privacy Vault,
              and verified by the Truth Kernel. No client information is ever exposed publicly.
            </p>
          </div>

          {/* Orchestrator Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              <StatCard label="TOTAL MATTERS" value={stats.total} />
              <StatCard label="ACTIVE INVESTIGATIONS" value={stats.active} accent />
              <StatCard label="COMPLETED" value={stats.completed} />
              <StatCard
                label="AVG CONFIDENCE"
                value={`${Math.round((stats.avgConfidence || 0) * 100)}%`}
              />
            </div>
          )}

          {/* Practice Areas */}
          <section className="mb-16">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-6 text-center">
              PRACTICE AREAS
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {PRACTICE_AREAS.map((area) => (
                <div
                  key={area.title}
                  className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 hover:border-[var(--gold)]/30 transition-colors"
                >
                  <div className="text-3xl mb-4">{area.icon}</div>
                  <h3 className="font-serif text-xl font-bold mb-2">{area.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">{area.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {area.types.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-mono bg-[var(--navy)] border border-[rgba(201,168,76,0.1)] rounded px-3 py-1 text-[var(--text-muted)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Workflows */}
          <section className="mb-16">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-6 text-center">
              AI INVESTIGATION WORKFLOWS
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {workflows.length > 0
                ? workflows.map((wf) => (
                    <div
                      key={wf.id}
                      className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6"
                    >
                      <h3 className="font-serif text-lg font-bold mb-2">{wf.name}</h3>
                      <p className="text-sm text-[var(--text-muted)] mb-4">{wf.description}</p>
                      <div className="flex gap-4 text-xs font-mono text-[var(--text-muted)]">
                        <span>{wf.pipelineCount} pipelines</span>
                        <span>{wf.stepCount} steps</span>
                      </div>
                    </div>
                  ))
                : [
                    {
                      name: "Intake Investigation",
                      desc: "Conflict check, jurisdiction analysis, viability scoring, and preliminary research.",
                      pipelines: 3,
                      steps: 7,
                    },
                    {
                      name: "Case File Builder",
                      desc: "Evidence collection, chain of custody, legal analysis, and motion drafting.",
                      pipelines: 3,
                      steps: 7,
                    },
                    {
                      name: "Full Defense",
                      desc: "End-to-end defense workflow combining investigation and case file assembly.",
                      pipelines: 6,
                      steps: 14,
                    },
                  ].map((wf) => (
                    <div
                      key={wf.name}
                      className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6"
                    >
                      <h3 className="font-serif text-lg font-bold mb-2">{wf.name}</h3>
                      <p className="text-sm text-[var(--text-muted)] mb-4">{wf.desc}</p>
                      <div className="flex gap-4 text-xs font-mono text-[var(--text-muted)]">
                        <span>{wf.pipelines} pipelines</span>
                        <span>{wf.steps} steps</span>
                      </div>
                    </div>
                  ))}
            </div>
          </section>

          {/* Security Features */}
          <section className="mb-16">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-6 text-center">
              SECURITY &amp; PRIVACY
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SECURITY_FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="bg-[var(--navy-card)] border border-emerald-500/10 rounded-lg p-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-mono text-emerald-400">{f.label}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{f.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pipeline Visualization */}
          <section className="mb-16">
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
              <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-6">
                CASE LIFECYCLE
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                {[
                  { label: "Intake", color: "bg-[var(--gold)]" },
                  { label: "PII Vaulted", color: "bg-emerald-400" },
                  { label: "Conflict Check", color: "bg-blue-400" },
                  { label: "Jurisdiction", color: "bg-blue-400" },
                  { label: "Investigation", color: "bg-purple-400" },
                  { label: "Research", color: "bg-purple-400" },
                  { label: "Report", color: "bg-orange-400" },
                  { label: "Attorney Review", color: "bg-[var(--gold)]" },
                  { label: "Case File", color: "bg-emerald-400" },
                  { label: "Defense", color: "bg-emerald-400" },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${step.color}`} />
                    <span>{step.label}</span>
                    {i < 9 && <span className="text-[var(--text-muted)]">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* No PII Guarantee */}
          <div className="text-center bg-[var(--navy)] border border-emerald-500/20 rounded-lg p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="font-mono text-sm text-emerald-400">ZERO-PII GUARANTEE</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto">
              This page contains no client information. All personally identifiable information is encrypted
              with AES-256-GCM and locked in the Web3 Privacy Vault. Access requires authenticated private
              links with HMAC-signed tokens. Public views display only aggregate statistics and case types.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5 text-center">
      <p className="text-xs font-mono text-[var(--text-muted)] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-[var(--gold)]" : ""}`}>{value}</p>
    </div>
  );
}
