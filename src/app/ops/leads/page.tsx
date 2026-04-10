"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState, useMemo } from "react";

/* ─── Lead Types ──────────────────────────────────────────────────────────── */

type Tier = 1 | 2 | 3 | 4;
type Urgency = "extreme" | "high" | "medium" | "low";
type LeadStatus = "new" | "commented" | "dm_sent" | "intake_review" | "active" | "screening" | "closed" | "skip";
type CaseType = "divorce" | "child_abuse" | "post_conviction" | "protection_order" | "housing" | "arrest" | "custody" | "construction" | "simple_divorce" | "question" | "harassment" | "weak" | "out_of_scope" | "not_a_lead";

interface Lead {
  id: string;
  name: string;
  state: string;
  tier: Tier;
  urgency: Urgency;
  caseType: CaseType;
  status: LeadStatus;
  description: string;
  whatTheyNeed: string;
  whatWeCanDo: string;
  deadlineNote?: string;
  score: number;
}

/* ─── Scoring Engine ──────────────────────────────────────────────────────── */

function computeScore(lead: Lead): number {
  const urgencyWeight: Record<Urgency, number> = { extreme: 40, high: 30, medium: 20, low: 10 };
  const tierWeight: Record<Tier, number> = { 1: 35, 2: 25, 3: 12, 4: 0 };
  const deadlineBonus = lead.deadlineNote ? 15 : 0;
  const conversionBonus: Record<CaseType, number> = {
    divorce: 8, child_abuse: 5, post_conviction: 7, protection_order: 6,
    housing: 7, arrest: 6, custody: 8, construction: 9,
    simple_divorce: 4, question: 2, harassment: 3, weak: 1, out_of_scope: 0, not_a_lead: 0,
  };
  return Math.min(100, urgencyWeight[lead.urgency] + tierWeight[lead.tier] + deadlineBonus + conversionBonus[lead.caseType]);
}

/* ─── Seed Leads ──────────────────────────────────────────────────────────── */

const INITIAL_LEADS: Lead[] = [
  // ── TIER 1: Immediate Action ──
  {
    id: "lead-001", name: "Anonymous (CT)", state: "CT", tier: 1, urgency: "extreme",
    caseType: "divorce", status: "new",
    description: "Divorce with hidden assets. Pre-trial hearing next week. Safety concerns. Spouse hiding financial records. Needs immediate document organization and timeline.",
    whatTheyNeed: "Asset tracing, financial document organization, pre-trial prep, safety plan documentation",
    whatWeCanDo: "Financial timeline construction, document stack building, public records pull on spouse business interests, evidence organization for hearing, referral to licensed counsel",
    deadlineNote: "Pre-trial hearing NEXT WEEK", score: 0,
  },
  {
    id: "lead-002", name: "Anonymous (GA)", state: "GA", tier: 1, urgency: "extreme",
    caseType: "child_abuse", status: "new",
    description: "Child abuse case with police tampering and church influence. Officers involved in cover-up. Institutional interference. Evidence of falsified reports.",
    whatTheyNeed: "Evidence preservation, public records on officers, institutional correspondence organization, timeline of tampering events",
    whatWeCanDo: "Build tampering timeline from public records, organize evidence chain, FOIA/open records request prep, referral to child advocacy attorney",
    deadlineNote: "Active danger — child safety", score: 0,
  },
  {
    id: "lead-003", name: "Alisha Prather", state: "MS", tier: 1, urgency: "high",
    caseType: "post_conviction", status: "new",
    description: "Son incarcerated. Claims fabricated evidence. Mississippi post-conviction relief case. Mother advocating. Possible Brady violations and ineffective assistance of counsel.",
    whatTheyNeed: "Trial transcript review, evidence audit, PCR motion research, Brady violation analysis",
    whatWeCanDo: "Organize trial record, build evidence inconsistency timeline, research MS PCR standards, draft case summary for attorney referral",
    score: 0,
  },
  {
    id: "lead-004", name: "Anonymous (EPO)", state: "Unknown", tier: 1, urgency: "extreme",
    caseType: "protection_order", status: "new",
    description: "Emergency protection order situation. Cannot retrieve personal belongings. Children need clothing and essentials. Active court order but enforcement issues.",
    whatTheyNeed: "EPO enforcement documentation, property retrieval plan, emergency motion support",
    whatWeCanDo: "Document the enforcement gaps, organize EPO paperwork, build timeline of violations, connect with local DV advocacy resources",
    deadlineNote: "IMMEDIATE — children without essentials", score: 0,
  },

  // ── TIER 2: Strong / High-Conversion ──
  {
    id: "lead-005", name: "Anonymous (Tenant)", state: "Unknown", tier: 2, urgency: "high",
    caseType: "housing", status: "new",
    description: "Gas leaks in rental unit. Landlord threatening illegal eviction. Habitability violations. Needs documentation of conditions and tenant rights research.",
    whatTheyNeed: "Habitability documentation, tenant rights research, eviction defense prep, condition photo/video organization",
    whatWeCanDo: "Research state-specific tenant protections, organize condition evidence, draft complaint letter framework, build violation timeline",
    score: 0,
  },
  {
    id: "lead-006", name: "Mike Chene", state: "FL", tier: 2, urgency: "medium",
    caseType: "arrest", status: "new",
    description: "Florida arrest. Claims video evidence was erased. Officers refused to show badges. Possible civil rights violations. Needs evidence preservation and complaint organization.",
    whatTheyNeed: "Body cam FOIA request, complaint organization, civil rights violation research, evidence timeline",
    whatWeCanDo: "Public records request prep for body cam footage, organize incident timeline, research FL civil rights complaint process, build document stack",
    score: 0,
  },
  {
    id: "lead-007", name: "Anonymous (OK)", state: "OK", tier: 2, urgency: "medium",
    caseType: "custody", status: "new",
    description: "Pro se litigant in Oklahoma custody case. Needs help with contempt filing and visitation modification. Self-represented, overwhelmed by process.",
    whatTheyNeed: "Contempt motion research, visitation modification procedures, court filing organization, deadline tracking",
    whatWeCanDo: "Research OK family court procedures, organize existing orders and violations, build filing checklist, draft motion framework for attorney review",
    score: 0,
  },
  {
    id: "lead-008", name: "Anonymous (FL Construction)", state: "FL", tier: 2, urgency: "medium",
    caseType: "construction", status: "new",
    description: "Florida construction dispute. $7,500 at stake. Mediation coming up. Contractor dispute with documentation gaps.",
    whatTheyNeed: "Contract review organization, mediation prep, damage documentation, payment timeline",
    whatWeCanDo: "Organize contract and payment records, build chronological timeline, research FL construction lien law, prep mediation document stack",
    deadlineNote: "Mediation date approaching", score: 0,
  },

  // ── TIER 3: Light Touch / Screen ──
  {
    id: "lead-009", name: "Nikki Betz", state: "Unknown", tier: 3, urgency: "low",
    caseType: "simple_divorce", status: "new",
    description: "Simple divorce paperwork needs. Appears straightforward, no contested issues mentioned.",
    whatTheyNeed: "Basic divorce paperwork guidance, filing requirements",
    whatWeCanDo: "Provide state-specific filing checklist, organize documents, refer to legal aid if appropriate",
    score: 0,
  },
  {
    id: "lead-010", name: "Anonymous (Bound Over)", state: "Unknown", tier: 3, urgency: "low",
    caseType: "question", status: "new",
    description: "Asked about what 'bound over' means in their case. Basic procedural question. May have deeper case needs.",
    whatTheyNeed: "Procedural explanation, possible deeper intake",
    whatWeCanDo: "Explain bind-over process, screen for underlying case complexity, offer full intake if warranted",
    score: 0,
  },
  {
    id: "lead-011", name: "Anonymous (DoorDash)", state: "Unknown", tier: 3, urgency: "low",
    caseType: "harassment", status: "new",
    description: "DoorDash-related harassment complaint. Details limited. Needs screening to determine actionability.",
    whatTheyNeed: "Incident documentation guidance, platform complaint process",
    whatWeCanDo: "Screen for actionable claims, organize incident records, advise on reporting channels",
    score: 0,
  },

  // ── TIER 4: Skip / No Action ──
  {
    id: "lead-012", name: "Adam", state: "Unknown", tier: 4, urgency: "low",
    caseType: "weak", status: "skip",
    description: "Ex introduced children to new partner. No custody order violation. Emotionally difficult but legally weak without more facts.",
    whatTheyNeed: "Screening only", whatWeCanDo: "Brief response — no actionable issue without custody order violation", score: 0,
  },
  {
    id: "lead-013", name: "Anonymous (South Africa)", state: "South Africa", tier: 4, urgency: "low",
    caseType: "out_of_scope", status: "skip",
    description: "Located in South Africa. Outside US jurisdiction scope.",
    whatTheyNeed: "N/A — outside scope", whatWeCanDo: "Polite redirect — outside geographic scope", score: 0,
  },
  {
    id: "lead-014", name: "Anonymous (India/Jaipur)", state: "India", tier: 4, urgency: "low",
    caseType: "not_a_lead", status: "skip",
    description: "India/Jaipur inquiry. Not a viable lead for US-focused advocacy platform.",
    whatTheyNeed: "N/A", whatWeCanDo: "No action", score: 0,
  },
  {
    id: "lead-015", name: "YouTube Content", state: "N/A", tier: 4, urgency: "low",
    caseType: "not_a_lead", status: "skip",
    description: "YouTube content interaction. Not a lead.",
    whatTheyNeed: "N/A", whatWeCanDo: "No action", score: 0,
  },
];

/* ─── Canned Templates ────────────────────────────────────────────────────── */

const PUBLIC_COMMENTS = [
  {
    id: "pub-1", label: "General Support",
    text: "Hey — I work with an advocacy support team that helps people organize case documents, build timelines, and get prepared before court. If you need a hand making sense of things, feel free to reach out. No cost for the initial review.",
  },
  {
    id: "pub-2", label: "Criminal / Post-Conviction",
    text: "I saw your post — if your family member is dealing with a wrongful charge or sentencing issue, we help organize records, audit trial evidence, and build clear timelines. Free initial review. DM if you want to talk.",
  },
  {
    id: "pub-3", label: "Custody / Family",
    text: "Custody battles are overwhelming, especially pro se. We help people get organized — documents, timelines, filing checklists — so you walk into court prepared, not guessing. Happy to take a look if you want to message me.",
  },
  {
    id: "pub-4", label: "Housing / Tenant",
    text: "If your landlord is threatening illegal eviction or ignoring habitability issues, there are real protections. We help organize evidence, research tenant rights, and build documentation. Free to start — DM me.",
  },
  {
    id: "pub-5", label: "Evidence / Police Misconduct",
    text: "Missing body cam footage, badge refusals, and erased evidence are serious. We help people organize what they have, file public records requests, and build incident timelines. Free initial review — reach out anytime.",
  },
];

const DM_TEMPLATES = [
  {
    id: "dm-ms-pcr", label: "Mississippi Post-Conviction",
    text: `Hi [Name] — I saw your post about your son's case. I work with UNYKORN Advocacy, and we help families dealing with wrongful convictions and sentencing issues in Mississippi.

What we can do:
- Organize the trial record and identify inconsistencies
- Research post-conviction relief standards in MS
- Build a clear timeline of what happened
- Prepare a case summary that an attorney can use

We do the heavy lifting on the documents and research so you are not starting from scratch. Free initial review. Would you like to send me some details?`,
  },
  {
    id: "dm-ok-custody", label: "Oklahoma Custody",
    text: `Hi — I saw you are dealing with a custody situation in Oklahoma. That can feel impossible when you are representing yourself.

We help pro se parents get organized:
- Research your state's procedures for contempt and modification
- Organize your existing orders and evidence of violations  
- Build filing checklists so nothing gets missed
- Create a clear timeline judges can follow

Free initial review. Want to tell me a bit more about your situation?`,
  },
  {
    id: "dm-fl-construction", label: "Florida Construction Dispute",
    text: `Hi — I saw your post about the contractor situation. $7,500 disputes like this are exactly what mediation prep is for.

We help by:
- Organizing all your contracts, receipts, and communications
- Building a payment and work timeline
- Researching FL construction/lien law relevant to your case
- Preparing your mediation document stack

Free initial review. Want to send me the details?`,
  },
  {
    id: "dm-general", label: "General Intake",
    text: `Hi [Name] — I saw your post and wanted to reach out. I work with UNYKORN Advocacy — we help people organize their cases, build evidence timelines, and get prepared before court dates or deadlines.

We are not a law firm — we are a case support and advocacy organization that uses AI tools and real human review to help people who are overwhelmed by legal processes.

Free initial review. No obligation. Want to tell me what is going on?`,
  },
];

const FIRST_CALL_SCRIPT = [
  { step: "1", label: "Warm Open", text: "Thanks for reaching out. I want to understand your situation so we can figure out the best way to help. There is no obligation here — just a conversation." },
  { step: "2", label: "Listen First", text: "Tell me what happened. Start wherever makes sense. I will ask questions as we go, but take your time." },
  { step: "3", label: "Key Facts", text: "Pull out: state, court dates/deadlines, parties involved, documents they have, documents they need, prior attorney involvement, key dates." },
  { step: "4", label: "Set Expectations", text: "We help with case organization, document building, research, and timelines. We are not attorneys and do not give legal advice. Where attorney involvement is needed, we help connect you with licensed counsel." },
  { step: "5", label: "Next Steps", text: "If it sounds like we can help: 'Here is what I recommend — let us get your documents organized and build a timeline. I will send you our intake form and we will go from there.'" },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const TIER_LABELS: Record<Tier, { label: string; color: string; bg: string }> = {
  1: { label: "IMMEDIATE", color: "text-red-400", bg: "bg-red-900/20 border-red-800/30" },
  2: { label: "STRONG", color: "text-orange-400", bg: "bg-orange-900/20 border-orange-800/30" },
  3: { label: "SCREEN", color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-800/30" },
  4: { label: "SKIP", color: "text-gray-500", bg: "bg-gray-900/20 border-gray-800/30" },
};

const URGENCY_COLORS: Record<Urgency, string> = {
  extreme: "text-red-400", high: "text-orange-400", medium: "text-yellow-400", low: "text-gray-400",
};

const STATUS_LABELS: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: "NEW", color: "text-blue-400 bg-blue-900/20" },
  commented: { label: "COMMENTED", color: "text-cyan-400 bg-cyan-900/20" },
  dm_sent: { label: "DM SENT", color: "text-purple-400 bg-purple-900/20" },
  intake_review: { label: "INTAKE REVIEW", color: "text-[var(--gold)] bg-[rgba(201,168,76,0.1)]" },
  active: { label: "ACTIVE", color: "text-green-400 bg-green-900/20" },
  screening: { label: "SCREENING", color: "text-yellow-400 bg-yellow-900/20" },
  closed: { label: "CLOSED", color: "text-gray-500 bg-gray-900/20" },
  skip: { label: "SKIP", color: "text-gray-600 bg-gray-900/10" },
};

const CASE_LABELS: Record<CaseType, string> = {
  divorce: "Divorce / Assets", child_abuse: "Child Abuse", post_conviction: "Post-Conviction",
  protection_order: "Protection Order", housing: "Housing / Tenant", arrest: "Arrest / Misconduct",
  custody: "Custody", construction: "Construction Dispute", simple_divorce: "Simple Divorce",
  question: "Legal Question", harassment: "Harassment", weak: "Weak / No Action",
  out_of_scope: "Out of Scope", not_a_lead: "Not a Lead",
};

const PIPELINE_STAGES: { key: LeadStatus; label: string; icon: string }[] = [
  { key: "new", label: "New", icon: "●" },
  { key: "commented", label: "Comment", icon: "💬" },
  { key: "dm_sent", label: "DM", icon: "✉" },
  { key: "intake_review", label: "Intake", icon: "📋" },
  { key: "active", label: "Active", icon: "⚡" },
];

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function LeadTriagePage() {
  const [leads, setLeads] = useState<Lead[]>(() =>
    INITIAL_LEADS.map((l) => ({ ...l, score: computeScore(l) }))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<Tier | "all">("all");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = leads;
    if (filterTier !== "all") result = result.filter((l) => l.tier === filterTier);
    if (filterStatus !== "all") result = result.filter((l) => l.status === filterStatus);
    return result.sort((a, b) => b.score - a.score);
  }, [leads, filterTier, filterStatus]);

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const stage of PIPELINE_STAGES) counts[stage.key] = leads.filter((l) => l.status === stage.key).length;
    counts["screening"] = leads.filter((l) => l.status === "screening").length;
    counts["closed"] = leads.filter((l) => l.status === "closed").length;
    counts["skip"] = leads.filter((l) => l.status === "skip").length;
    return counts;
  }, [leads]);

  function updateStatus(id: string, status: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const tierStats = {
    immediate: leads.filter((l) => l.tier === 1).length,
    strong: leads.filter((l) => l.tier === 2).length,
    screen: leads.filter((l) => l.tier === 3).length,
    skip: leads.filter((l) => l.tier === 4).length,
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
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">LEAD TRIAGE</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              CASE INTAKE<br /><span className="text-[var(--gold)]">TRIAGE BOARD.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-3xl">
              Real human case triage. Not generic prompts or AI scores. We organize facts, documents, deadlines, and pressure points in actual cases so people stop guessing and start moving with a clear plan.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "IMMEDIATE", value: tierStats.immediate, color: "text-red-400" },
              { label: "STRONG", value: tierStats.strong, color: "text-orange-400" },
              { label: "SCREEN", value: tierStats.screen, color: "text-yellow-400" },
              { label: "SKIP", value: tierStats.skip, color: "text-gray-500" },
              { label: "TOTAL", value: leads.length, color: "text-[var(--gold)]" },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-4 text-center">
                <p className={`text-2xl font-serif font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs font-mono text-[var(--text-muted)] tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pipeline */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 mb-8">
            <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-4">PIPELINE</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {PIPELINE_STAGES.map((stage, i) => (
                <div key={stage.key} className="flex items-center gap-2">
                  {i > 0 && <span className="text-[var(--text-muted)] opacity-30">→</span>}
                  <button
                    onClick={() => setFilterStatus(filterStatus === stage.key ? "all" : stage.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded border text-xs font-mono transition-colors cursor-pointer ${
                      filterStatus === stage.key
                        ? "border-[var(--gold)] bg-[rgba(201,168,76,0.1)] text-[var(--gold)]"
                        : "border-[rgba(201,168,76,0.1)] text-[var(--text-muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                    }`}
                  >
                    <span>{stage.icon}</span>
                    <span>{stage.label}</span>
                    <span className="bg-[var(--navy)] px-1.5 py-0.5 rounded text-[10px]">{pipelineCounts[stage.key] || 0}</span>
                  </button>
                </div>
              ))}
              <span className="text-[var(--text-muted)] opacity-30 ml-2">|</span>
              {(["screening", "closed", "skip"] as LeadStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(filterStatus === st ? "all" : st)}
                  className={`px-3 py-2 rounded border text-xs font-mono transition-colors cursor-pointer ${
                    filterStatus === st
                      ? "border-[var(--gold)] bg-[rgba(201,168,76,0.1)] text-[var(--gold)]"
                      : "border-[rgba(201,168,76,0.1)] text-[var(--text-muted)] hover:text-[var(--gold)]"
                  }`}
                >
                  {st.toUpperCase()} ({pipelineCounts[st] || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Filters + Actions */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--text-muted)]">TIER:</span>
              {(["all", 1, 2, 3, 4] as const).map((t) => (
                <button
                  key={String(t)}
                  onClick={() => setFilterTier(t)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer border ${
                    filterTier === t
                      ? "border-[var(--gold)] bg-[rgba(201,168,76,0.1)] text-[var(--gold)]"
                      : "border-[rgba(201,168,76,0.1)] text-[var(--text-muted)] hover:text-[var(--gold)]"
                  }`}
                >
                  {t === "all" ? "ALL" : TIER_LABELS[t].label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-4 py-2 rounded border border-[rgba(201,168,76,0.2)] text-xs font-mono text-[var(--gold)] hover:bg-[rgba(201,168,76,0.1)] transition-colors cursor-pointer"
              >
                {showTemplates ? "HIDE" : "SHOW"} TEMPLATES
              </button>
              <button
                onClick={() => setShowScript(!showScript)}
                className="px-4 py-2 rounded border border-[rgba(201,168,76,0.2)] text-xs font-mono text-[var(--gold)] hover:bg-[rgba(201,168,76,0.1)] transition-colors cursor-pointer"
              >
                {showScript ? "HIDE" : "SHOW"} CALL SCRIPT
              </button>
            </div>
          </div>

          {/* First Call Script */}
          {showScript && (
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg p-8 mb-8">
              <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-6">FIRST CALL SCRIPT</h2>
              <div className="space-y-4">
                {FIRST_CALL_SCRIPT.map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[rgba(201,168,76,0.1)] border border-[var(--gold)] flex items-center justify-center shrink-0">
                      <span className="text-xs font-mono text-[var(--gold)]">{s.step}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)] mb-1">{s.label}</p>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Canned Templates */}
          {showTemplates && (
            <div className="space-y-8 mb-8">
              {/* Public Comments */}
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg p-8">
                <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-6">PUBLIC COMMENTS — COPY & PASTE</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {PUBLIC_COMMENTS.map((c) => (
                    <div key={c.id} className="border border-[rgba(201,168,76,0.1)] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-[var(--gold)]">{c.label}</span>
                        <button
                          onClick={() => copyText(c.text, c.id)}
                          className="text-xs font-mono px-2 py-1 rounded bg-[var(--navy)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors cursor-pointer"
                        >
                          {copied === c.id ? "COPIED ✓" : "COPY"}
                        </button>
                      </div>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DM Templates */}
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg p-8">
                <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-6">DM TEMPLATES — COPY & PASTE</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {DM_TEMPLATES.map((d) => (
                    <div key={d.id} className="border border-[rgba(201,168,76,0.1)] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-[var(--gold)]">{d.label}</span>
                        <button
                          onClick={() => copyText(d.text, d.id)}
                          className="text-xs font-mono px-2 py-1 rounded bg-[var(--navy)] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors cursor-pointer"
                        >
                          {copied === d.id ? "COPIED ✓" : "COPY"}
                        </button>
                      </div>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{d.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lead Cards */}
          <div className="space-y-4">
            {filtered.map((lead) => {
              const tier = TIER_LABELS[lead.tier];
              const statusInfo = STATUS_LABELS[lead.status];
              const expanded = expandedId === lead.id;

              return (
                <div
                  key={lead.id}
                  className={`bg-[var(--navy-card)] border rounded-lg transition-all ${
                    lead.tier === 1 ? "border-red-800/30" : lead.tier === 2 ? "border-orange-800/20" : "border-[rgba(201,168,76,0.1)]"
                  }`}
                >
                  {/* Collapsed Row */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : lead.id)}
                    className="w-full text-left p-6 cursor-pointer bg-transparent border-none"
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Score */}
                      <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0" style={{
                        borderColor: lead.score >= 70 ? "#f87171" : lead.score >= 50 ? "#fb923c" : lead.score >= 30 ? "#facc15" : "#6b7280",
                      }}>
                        <span className="text-sm font-mono font-bold" style={{
                          color: lead.score >= 70 ? "#f87171" : lead.score >= 50 ? "#fb923c" : lead.score >= 30 ? "#facc15" : "#6b7280",
                        }}>{lead.score}</span>
                      </div>

                      {/* Tier Badge */}
                      <span className={`text-[10px] font-mono px-2 py-1 rounded border ${tier.bg} ${tier.color}`}>
                        T{lead.tier} {tier.label}
                      </span>

                      {/* Status */}
                      <span className={`text-[10px] font-mono px-2 py-1 rounded ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>

                      {/* Name + State */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{lead.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{CASE_LABELS[lead.caseType]} · {lead.state}</p>
                      </div>

                      {/* Urgency */}
                      <span className={`text-xs font-mono ${URGENCY_COLORS[lead.urgency]}`}>
                        {lead.urgency.toUpperCase()}
                      </span>

                      {/* Deadline */}
                      {lead.deadlineNote && (
                        <span className="text-[10px] font-mono px-2 py-1 rounded bg-red-900/30 text-red-400 border border-red-800/30 animate-pulse">
                          ⚠ {lead.deadlineNote}
                        </span>
                      )}

                      {/* Expand */}
                      <span className="text-[var(--text-muted)] text-sm">{expanded ? "▾" : "▸"}</span>
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {expanded && (
                    <div className="px-6 pb-6 border-t border-[rgba(201,168,76,0.05)]">
                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        {/* Left: Details */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-mono text-[var(--gold)] mb-1">SITUATION</p>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{lead.description}</p>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-[var(--gold)] mb-1">WHAT THEY NEED</p>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{lead.whatTheyNeed}</p>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-[var(--gold)] mb-1">WHAT WE CAN DO</p>
                            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{lead.whatWeCanDo}</p>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-mono text-[var(--gold)] mb-2">UPDATE STATUS</p>
                            <div className="flex flex-wrap gap-2">
                              {(["new", "commented", "dm_sent", "intake_review", "active", "screening", "closed", "skip"] as LeadStatus[]).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => updateStatus(lead.id, st)}
                                  className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors cursor-pointer ${
                                    lead.status === st
                                      ? "border-[var(--gold)] bg-[rgba(201,168,76,0.15)] text-[var(--gold)]"
                                      : "border-[rgba(201,168,76,0.1)] text-[var(--text-muted)] hover:text-[var(--gold)] hover:border-[var(--gold)]"
                                  }`}
                                >
                                  {STATUS_LABELS[st].label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-mono text-[var(--gold)] mb-2">SCORE BREAKDOWN</p>
                            <div className="text-xs text-[var(--text-muted)] space-y-1 font-mono">
                              <p>Urgency: {lead.urgency} ({lead.urgency === "extreme" ? 40 : lead.urgency === "high" ? 30 : lead.urgency === "medium" ? 20 : 10}pts)</p>
                              <p>Tier: {lead.tier} ({lead.tier === 1 ? 35 : lead.tier === 2 ? 25 : lead.tier === 3 ? 12 : 0}pts)</p>
                              <p>Deadline: {lead.deadlineNote ? "+15pts" : "none"}</p>
                              <p>Total: <span className="text-[var(--gold)] font-bold">{lead.score}/100</span></p>
                            </div>
                          </div>

                          {/* Quick Copy actions for this case type */}
                          <div>
                            <p className="text-xs font-mono text-[var(--gold)] mb-2">QUICK COPY</p>
                            <div className="flex flex-wrap gap-2">
                              {PUBLIC_COMMENTS.map((c) => (
                                <button
                                  key={c.id}
                                  onClick={() => copyText(c.text, `${lead.id}-${c.id}`)}
                                  className="text-[10px] font-mono px-2 py-1 rounded border border-[rgba(201,168,76,0.1)] text-[var(--text-muted)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors cursor-pointer"
                                >
                                  {copied === `${lead.id}-${c.id}` ? "✓" : "💬"} {c.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <p className="text-lg mb-2">No leads match current filters.</p>
              <button onClick={() => { setFilterTier("all"); setFilterStatus("all"); }} className="text-[var(--gold)] text-sm cursor-pointer bg-transparent border-none">
                Clear Filters
              </button>
            </div>
          )}

          {/* Operating System Summary */}
          <div className="mt-12 bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg p-8">
            <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-6">4-STAGE OPERATING SYSTEM</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { stage: "01", title: "Comment", desc: "Public reply on their post. Warm, case-specific, personal. Shows you actually read what they wrote. Never generic." },
                { stage: "02", title: "DM", desc: "Private message with specific help framed around their situation. What we can do, what they should prepare, clear next step." },
                { stage: "03", title: "Intake Review", desc: "Structured intake — basic info, documents needed, screening questions. Score the case for urgency, evidence strength, and conversion." },
                { stage: "04", title: "Deliverable", desc: "Case timeline, document stack, issue summary, or research memo. Something tangible they can hold and use — not just advice." },
              ].map((s) => (
                <div key={s.stage} className="relative">
                  <div className="font-serif text-4xl font-bold text-[var(--gold)] opacity-15 absolute -top-2 right-0">{s.stage}</div>
                  <h3 className="font-serif text-base font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Competitive Positioning Note */}
          <div className="mt-8 bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg p-8">
            <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-4">POSITIONING — OUR LANE</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-mono text-red-400 mb-2">WHAT GENERIC AI TOOLS OFFER</p>
                <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc list-inside">
                  <li>AI-generated scores and generic prompts</li>
                  <li>Self-guided prep with templates</li>
                  <li>Software-first, no human triage</li>
                  <li>Same output regardless of case complexity</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-mono text-[var(--gold)] mb-2">WHAT WE DO DIFFERENTLY</p>
                <ul className="text-sm text-[var(--text-primary)] space-y-1 list-disc list-inside">
                  <li>Real human case triage — not a chatbot quiz</li>
                  <li>Document stack building from actual records</li>
                  <li>Timeline construction with pressure points</li>
                  <li>Evidence organization judges can follow</li>
                  <li>Issue spotting by case type and jurisdiction</li>
                  <li>Attorney and referral escalation where needed</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 border border-[rgba(201,168,76,0.2)] rounded bg-[rgba(201,168,76,0.03)]">
              <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">
                &ldquo;We do not just give you a score or generic prompts. We help you organize the facts, documents, deadlines, and pressure points in your actual case — so you can stop guessing and start moving with a clear plan.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
