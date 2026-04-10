"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState, useMemo } from "react";

/* ─── Types ───────────────────────────────────────────────────────────────── */

type CaseStatus = "intake" | "fact_building" | "document_prep" | "active" | "attorney_handoff" | "closed";
type CaseUrgency = "critical" | "high" | "medium" | "low";
type CaseType =
  | "family_safety" | "truancy" | "child_abuse" | "post_conviction"
  | "protection_order" | "housing" | "arrest" | "custody"
  | "civil_rights" | "crypto_fraud" | "property_dispute" | "general";

interface CaseParty {
  name: string;
  role: "client" | "opposing" | "witness" | "court" | "other";
  notes?: string;
}

interface CaseDeadline {
  id: string;
  title: string;
  date: string;
  type: "court_date" | "filing" | "response" | "internal" | "statute_of_limitations";
  status: "upcoming" | "met" | "missed" | "extended";
}

interface CaseWorkspace {
  id: string;
  caseRef: string;
  title: string;
  clientName: string;
  caseType: CaseType;
  status: CaseStatus;
  urgency: CaseUrgency;
  jurisdiction: string;
  createdAt: string;
  updatedAt: string;
  leadId?: string;
  parties: CaseParty[];
  deadlines: CaseDeadline[];
  factCount: number;
  documentCount: number;
  taskCount: number;
  noteCount: number;
  estimatedValue: string;
  nextAction: string;
}

/* ─── Seed Cases ──────────────────────────────────────────────────────────── */

const SEED_CASES: CaseWorkspace[] = [
  {
    id: "case-001",
    caseRef: "UNY-ADV-2026-001",
    title: "Pregnant Mother — Household Safety Emergency",
    clientName: "Ascarestayathomemom",
    caseType: "family_safety",
    status: "intake",
    urgency: "critical",
    jurisdiction: "Unknown — pending intake",
    createdAt: "2026-04-10T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    leadId: "lead-001",
    parties: [
      { name: "Ascarestayathomemom", role: "client", notes: "Pregnant, probationer moved into home without consent" },
      { name: "Male on probation", role: "opposing", notes: "Moved in with children present, possible safety risk" },
    ],
    deadlines: [
      { id: "dl-001a", title: "Initial intake call", date: "2026-04-12", type: "internal", status: "upcoming" },
      { id: "dl-001b", title: "Safety assessment", date: "2026-04-14", type: "internal", status: "upcoming" },
    ],
    factCount: 0,
    documentCount: 0,
    taskCount: 3,
    noteCount: 1,
    estimatedValue: "$149 – $299",
    nextAction: "Complete intake call — assess safety, identify jurisdiction, determine if EPO needed",
  },
  {
    id: "case-002",
    caseRef: "UNY-ADV-2026-002",
    title: "Truancy Parent Criminal Charge — Lauren L Edlund",
    clientName: "Lauren L Edlund",
    caseType: "truancy",
    status: "intake",
    urgency: "critical",
    jurisdiction: "Unknown — criminal charge pending",
    createdAt: "2026-04-10T09:15:00Z",
    updatedAt: "2026-04-10T09:15:00Z",
    leadId: "lead-002",
    parties: [
      { name: "Lauren L Edlund", role: "client", notes: "Parent charged with truancy — claims ongoing enforcement" },
      { name: "School district", role: "opposing", notes: "Initiated truancy complaint" },
    ],
    deadlines: [
      { id: "dl-002a", title: "DM follow-up", date: "2026-04-11", type: "internal", status: "upcoming" },
      { id: "dl-002b", title: "Court date discovery", date: "2026-04-15", type: "internal", status: "upcoming" },
    ],
    factCount: 0,
    documentCount: 0,
    taskCount: 4,
    noteCount: 1,
    estimatedValue: "$149 – $299",
    nextAction: "Get compliance records — attendance logs, discipline documentation, school communications",
  },
  {
    id: "case-003",
    caseRef: "UNY-ADV-2026-003",
    title: "Wrongful Eviction — Kansas / Topeka",
    clientName: "Anonymous (Kansas)",
    caseType: "housing",
    status: "intake",
    urgency: "high",
    jurisdiction: "Kansas — Shawnee County",
    createdAt: "2026-04-10T09:30:00Z",
    updatedAt: "2026-04-10T09:30:00Z",
    leadId: "lead-003",
    parties: [
      { name: "Anonymous Tenant", role: "client", notes: "Has bank statements proving rent payments" },
      { name: "Landlord (unknown)", role: "opposing", notes: "Alleged wrongful eviction despite payment" },
    ],
    deadlines: [
      { id: "dl-003a", title: "Payment proof collection", date: "2026-04-14", type: "internal", status: "upcoming" },
      { id: "dl-003b", title: "Eviction hearing (if scheduled)", date: "2026-04-20", type: "court_date", status: "upcoming" },
    ],
    factCount: 0,
    documentCount: 0,
    taskCount: 3,
    noteCount: 1,
    estimatedValue: "$149",
    nextAction: "Collect bank statements, lease, and any notices received",
  },
  {
    id: "case-004",
    caseRef: "UNY-ADV-2026-004",
    title: "GA Police Misconduct — Child Abuse Report Tampering",
    clientName: "Anonymous (GA)",
    caseType: "civil_rights",
    status: "fact_building",
    urgency: "critical",
    jurisdiction: "Georgia — county unknown",
    createdAt: "2026-04-09T14:00:00Z",
    updatedAt: "2026-04-10T08:00:00Z",
    leadId: "lead-004",
    parties: [
      { name: "Anonymous Parent", role: "client", notes: "Alleges police refused to file child abuse report" },
      { name: "Local PD (unknown)", role: "opposing", notes: "Alleged refusal to document / tampering" },
      { name: "DFCS", role: "other", notes: "May have parallel involvement" },
    ],
    deadlines: [
      { id: "dl-004a", title: "Incident timeline draft", date: "2026-04-13", type: "internal", status: "upcoming" },
      { id: "dl-004b", title: "IA complaint deadline research", date: "2026-04-15", type: "internal", status: "upcoming" },
    ],
    factCount: 3,
    documentCount: 1,
    taskCount: 5,
    noteCount: 2,
    estimatedValue: "$299 + referral",
    nextAction: "Build incident timeline — need exact dates, officer names, report numbers (if any)",
  },
  {
    id: "case-005",
    caseRef: "UNY-ADV-2026-005",
    title: "MS Post-Conviction — Alisha Prather",
    clientName: "Alisha Prather",
    caseType: "post_conviction",
    status: "fact_building",
    urgency: "high",
    jurisdiction: "Mississippi — county TBD",
    createdAt: "2026-04-08T10:00:00Z",
    updatedAt: "2026-04-10T07:00:00Z",
    leadId: "lead-005",
    parties: [
      { name: "Alisha Prather", role: "client", notes: "Son's conviction — alleges misconduct / sentencing issues" },
      { name: "State of Mississippi", role: "opposing" },
    ],
    deadlines: [
      { id: "dl-005a", title: "Trial record request", date: "2026-04-14", type: "internal", status: "upcoming" },
      { id: "dl-005b", title: "PCR filing deadline research", date: "2026-04-18", type: "filing", status: "upcoming" },
    ],
    factCount: 2,
    documentCount: 0,
    taskCount: 4,
    noteCount: 1,
    estimatedValue: "$299 + referral",
    nextAction: "Request trial record and sentencing transcript — identify appealable issues",
  },
  {
    id: "case-006",
    caseRef: "UNY-ADV-2026-006",
    title: "Emergency Protection Order — EnthusiasticArugula5160",
    clientName: "EnthusiasticArugula5160",
    caseType: "protection_order",
    status: "intake",
    urgency: "critical",
    jurisdiction: "Unknown — emergency",
    createdAt: "2026-04-10T10:00:00Z",
    updatedAt: "2026-04-10T10:00:00Z",
    leadId: "lead-006",
    parties: [
      { name: "EnthusiasticArugula5160", role: "client", notes: "Needs emergency protective order — details pending" },
    ],
    deadlines: [
      { id: "dl-006a", title: "IMMEDIATE: Safety check + intake", date: "2026-04-10", type: "internal", status: "upcoming" },
    ],
    factCount: 0,
    documentCount: 0,
    taskCount: 2,
    noteCount: 0,
    estimatedValue: "$149 – $299",
    nextAction: "URGENT — complete intake, identify jurisdiction, assess immediate safety",
  },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<CaseStatus, { label: string; color: string }> = {
  intake: { label: "INTAKE", color: "text-blue-400 bg-blue-900/20" },
  fact_building: { label: "FACT BUILDING", color: "text-cyan-400 bg-cyan-900/20" },
  document_prep: { label: "DOC PREP", color: "text-purple-400 bg-purple-900/20" },
  active: { label: "ACTIVE", color: "text-green-400 bg-green-900/20" },
  attorney_handoff: { label: "ATTORNEY HANDOFF", color: "text-[var(--gold)] bg-[rgba(201,168,76,0.1)]" },
  closed: { label: "CLOSED", color: "text-gray-500 bg-gray-900/20" },
};

const URGENCY_CONFIG: Record<CaseUrgency, { label: string; color: string; dot: string }> = {
  critical: { label: "CRITICAL", color: "text-red-400", dot: "bg-red-400" },
  high: { label: "HIGH", color: "text-orange-400", dot: "bg-orange-400" },
  medium: { label: "MEDIUM", color: "text-yellow-400", dot: "bg-yellow-400" },
  low: { label: "LOW", color: "text-gray-400", dot: "bg-gray-400" },
};

const TYPE_LABELS: Record<CaseType, string> = {
  family_safety: "Family Safety",
  truancy: "Truancy / Parent Charge",
  child_abuse: "Child Abuse",
  post_conviction: "Post-Conviction",
  protection_order: "Protection Order",
  housing: "Housing / Eviction",
  arrest: "Arrest / Misconduct",
  custody: "Custody",
  civil_rights: "Civil Rights",
  crypto_fraud: "Crypto Fraud",
  property_dispute: "Property Dispute",
  general: "General",
};

const PIPELINE: { key: CaseStatus; label: string; icon: string }[] = [
  { key: "intake", label: "Intake", icon: "📥" },
  { key: "fact_building", label: "Facts", icon: "🔍" },
  { key: "document_prep", label: "Docs", icon: "📄" },
  { key: "active", label: "Active", icon: "⚡" },
  { key: "attorney_handoff", label: "Handoff", icon: "🤝" },
  { key: "closed", label: "Closed", icon: "✓" },
];

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function CasesPage() {
  const [cases] = useState<CaseWorkspace[]>(SEED_CASES);
  const [filterStatus, setFilterStatus] = useState<CaseStatus | "all">("all");
  const [filterUrgency, setFilterUrgency] = useState<CaseUrgency | "all">("all");

  const filtered = useMemo(() => {
    let result = cases;
    if (filterStatus !== "all") result = result.filter((c) => c.status === filterStatus);
    if (filterUrgency !== "all") result = result.filter((c) => c.urgency === filterUrgency);
    return result.sort((a, b) => {
      const urgOrder: Record<CaseUrgency, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return urgOrder[a.urgency] - urgOrder[b.urgency];
    });
  }, [cases, filterStatus, filterUrgency]);

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const stage of PIPELINE) counts[stage.key] = cases.filter((c) => c.status === stage.key).length;
    return counts;
  }, [cases]);

  const stats = {
    total: cases.length,
    critical: cases.filter((c) => c.urgency === "critical").length,
    deadlineSoon: cases.flatMap((c) => c.deadlines).filter((d) => d.status === "upcoming" && daysUntil(d.date) <= 3).length,
    totalTasks: cases.reduce((sum, c) => sum + c.taskCount, 0),
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/ops" className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors no-underline">
                ← Operations
              </Link>
            </div>
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">CASE WORKSPACES</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              ACTIVE<br /><span className="text-[var(--gold)]">CASES.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl">
              Every case gets a workspace. Facts, deadlines, documents, timelines, and task tracking — 
              organized so you deliver and attorneys can pick up instantly.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active Cases", value: stats.total, color: "text-[var(--gold)]" },
              { label: "Critical", value: stats.critical, color: "text-red-400" },
              { label: "Deadlines ≤ 3d", value: stats.deadlineSoon, color: "text-orange-400" },
              { label: "Open Tasks", value: stats.totalTasks, color: "text-cyan-400" },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5 text-center">
                <p className={`text-3xl font-serif font-bold mb-1 ${s.color}`}>{s.value}</p>
                <p className="text-xs font-mono text-[var(--text-muted)] tracking-wider">{s.label.toUpperCase()}</p>
              </div>
            ))}
          </div>

          {/* Pipeline */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 mb-8">
            <p className="text-xs font-mono tracking-wider text-[var(--text-muted)] mb-4">CASE PIPELINE</p>
            <div className="flex items-center gap-2 overflow-x-auto">
              {PIPELINE.map((stage, i) => (
                <div key={stage.key} className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterStatus(filterStatus === stage.key ? "all" : stage.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-mono transition-all cursor-pointer ${
                      filterStatus === stage.key
                        ? "bg-[var(--gold)] text-[var(--midnight)] font-bold"
                        : "bg-[var(--navy)] text-[var(--text-muted)] hover:text-[var(--gold)]"
                    }`}
                  >
                    <span>{stage.icon}</span>
                    <span>{stage.label}</span>
                    <span className="text-xs opacity-70">({pipelineCounts[stage.key] || 0})</span>
                  </button>
                  {i < PIPELINE.length - 1 && <span className="text-[var(--text-muted)] text-xs">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value as CaseUrgency | "all")}
              className="glass-input text-sm px-3 py-2 rounded"
            >
              <option value="all">All Urgencies</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {filtered.length} of {cases.length} cases
            </span>
          </div>

          {/* Case Cards */}
          <div className="space-y-4">
            {filtered.map((c) => {
              const statusCfg = STATUS_CONFIG[c.status];
              const urgCfg = URGENCY_CONFIG[c.urgency];
              const nextDeadline = c.deadlines
                .filter((d) => d.status === "upcoming")
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
              const daysLeft = nextDeadline ? daysUntil(nextDeadline.date) : null;

              return (
                <Link
                  key={c.id}
                  href={`/ops/cases/${c.id}`}
                  className="block no-underline bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 card-lift group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${urgCfg.dot} ${c.urgency === "critical" ? "animate-pulse" : ""}`} />
                      <span className="text-xs font-mono text-[var(--text-muted)]">{c.caseRef}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${statusCfg.color}`}>{statusCfg.label}</span>
                      <span className={`text-xs font-mono ${urgCfg.color}`}>{urgCfg.label}</span>
                    </div>
                    {nextDeadline && (
                      <span className={`text-xs font-mono px-2 py-1 rounded ${
                        daysLeft !== null && daysLeft <= 1 ? "bg-red-900/30 text-red-400 border border-red-800/30" :
                        daysLeft !== null && daysLeft <= 3 ? "bg-orange-900/30 text-orange-400 border border-orange-800/30" :
                        "bg-[var(--navy)] text-[var(--text-muted)]"
                      }`}>
                        {daysLeft !== null && daysLeft <= 0 ? "OVERDUE" : `${daysLeft}d`} — {nextDeadline.title}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold mb-1 group-hover:text-[var(--gold)] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-3">
                    <span className="text-[var(--gold)]">{c.clientName}</span> · {TYPE_LABELS[c.caseType]} · {c.jurisdiction}
                  </p>

                  {/* Next Action */}
                  <div className="bg-[var(--navy)] rounded px-4 py-3 mb-4 border-l-2 border-[var(--gold)]">
                    <p className="text-xs font-mono text-[var(--gold)] mb-1">NEXT ACTION</p>
                    <p className="text-sm">{c.nextAction}</p>
                  </div>

                  {/* Metrics Row */}
                  <div className="flex items-center gap-6 text-xs font-mono text-[var(--text-muted)]">
                    <span>📋 {c.factCount} facts</span>
                    <span>📄 {c.documentCount} docs</span>
                    <span>✓ {c.taskCount} tasks</span>
                    <span>📝 {c.noteCount} notes</span>
                    <span>👥 {c.parties.length} parties</span>
                    <span className="ml-auto text-[var(--gold)]">{c.estimatedValue}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Revenue Summary */}
          <div className="mt-8 bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
            <p className="text-xs font-mono tracking-wider text-[var(--text-muted)] mb-4">PIPELINE VALUE</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-serif font-bold text-[var(--gold)]">{cases.length}</p>
                <p className="text-xs font-mono text-[var(--text-muted)]">ACTIVE CASES</p>
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-[var(--gold)]">$894 – $1,794</p>
                <p className="text-xs font-mono text-[var(--text-muted)]">EST. PIPELINE</p>
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-green-400">2</p>
                <p className="text-xs font-mono text-[var(--text-muted)]">ATTORNEY REFERRAL POTENTIAL</p>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
