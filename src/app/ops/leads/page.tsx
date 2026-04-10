"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState, useMemo } from "react";

/* ─── Lead Types ──────────────────────────────────────────────────────────── */

type Tier = 1 | 2 | 3 | 4;
type Urgency = "extreme" | "high" | "medium" | "low";
type LeadStatus = "new" | "commented" | "dm_sent" | "intake_review" | "active" | "screening" | "closed" | "skip";
type CaseType = "family_safety" | "truancy" | "child_abuse" | "post_conviction" | "protection_order" | "housing" | "arrest" | "custody" | "civil_rights" | "question" | "incomplete" | "not_a_lead";

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
    family_safety: 9, truancy: 7, child_abuse: 5, post_conviction: 7, protection_order: 6,
    housing: 8, arrest: 6, custody: 8, civil_rights: 5,
    question: 2, incomplete: 1, not_a_lead: 0,
  };
  return Math.min(100, urgencyWeight[lead.urgency] + tierWeight[lead.tier] + deadlineBonus + conversionBonus[lead.caseType]);
}

/* ─── Seed Leads ──────────────────────────────────────────────────────────── */

const INITIAL_LEADS: Lead[] = [
  // ── TIER 1: Immediate Action ──
  {
    id: "lead-001", name: "Ascarestayathomemom", state: "Unknown", tier: 1, urgency: "extreme",
    caseType: "family_safety", status: "new",
    description: "Pregnant with multiple kids. Husband moved male coworker on probation into small home. No consent, no disclosure. Safety concern for children. Control imbalance — spouse controls vehicle and income.",
    whatTheyNeed: "Safety documentation, household risk assessment, emergency custody positioning, financial control documentation",
    whatWeCanDo: "Build safety and household risk summary, document the cohabitation timeline, prep emergency custody or protective positioning materials, organize evidence of control imbalance for attorney referral",
    deadlineNote: "Active safety risk — children in home", score: 0,
  },
  {
    id: "lead-002", name: "Lauren L Edlund", state: "Unknown", tier: 1, urgency: "high",
    caseType: "truancy", status: "new",
    description: "Charged with contributing to truancy. Has documented discipline structure and enforcement actions. School pushing additional meetings before court date. Risk of saying wrong thing in school meetings that could hurt defense.",
    whatTheyNeed: "Defense narrative construction, compliance evidence packet, timeline of parental enforcement actions, pre-court prep on what to say and not say",
    whatWeCanDo: "Build compliance evidence packet from her records, construct timeline of enforcement actions, prep what-to-say/not-say guidance before court, organize school correspondence and discipline records",
    deadlineNote: "Court date pending — school meetings imminent", score: 0,
  },
  {
    id: "lead-003", name: "Anonymous (Kansas/Topeka)", state: "KS", tier: 1, urgency: "high",
    caseType: "housing", status: "new",
    description: "Claims illegal eviction for nonpayment. Has bank statements proving rent was paid. Cannot find attorney locally. Family with kids, housing currently blocked. Emotional, willing to engage — strong conversion signal.",
    whatTheyNeed: "Payment proof timeline, lease and notice organization, counterclaim or defense positioning, local attorney referral",
    whatWeCanDo: "Build payment proof timeline from bank records, organize lease agreements and eviction notices, research KS tenant protections and wrongful eviction remedies, prep counterclaim document stack",
    deadlineNote: "Active eviction — family displaced", score: 0,
  },
  {
    id: "lead-004", name: "Anonymous (GA)", state: "GA", tier: 1, urgency: "extreme",
    caseType: "civil_rights", status: "new",
    description: "Child abuse case with alleged police tampering and church influence. Officers involved in cover-up. Cannot go to DA. Needs evidence converted from emotion into structured documentation for external escalation.",
    whatTheyNeed: "Evidence index, who/what/when/proof mapping, external escalation path identification, structured documentation for outside counsel",
    whatWeCanDo: "Build evidence index and tampering timeline from available records, identify external escalation paths (state AG, FBI civil rights, DFCS oversight), organize testimony and correspondence, prep attorney-ready escalation packet",
    deadlineNote: "Active danger — child safety", score: 0,
  },
  {
    id: "lead-005", name: "Alisha Prather", state: "MS", tier: 1, urgency: "high",
    caseType: "post_conviction", status: "new",
    description: "Son incarcerated. Needs PCR filing help. Mother advocating. Likely ineffective assistance of counsel or due process claim. Needs full case reconstruction and attorney-ready packet.",
    whatTheyNeed: "Case timeline and document list, PCR grounds identification, trial record organization, attorney-ready summary",
    whatWeCanDo: "Organize trial record, build case timeline and evidence inconsistency log, research MS PCR standards and grounds, identify potential Brady or IAC issues, draft case summary for attorney referral",
    score: 0,
  },
  {
    id: "lead-006", name: "EnthusiasticArugula5160", state: "Unknown", tier: 1, urgency: "extreme",
    caseType: "protection_order", status: "new",
    description: "Active emergency protection order. Cannot retrieve personal belongings. Children need clothing and essentials. Police refusing standby assistance. Immediate court access and property issue.",
    whatTheyNeed: "Property list, urgency narrative for court, court request structure, enforcement gap documentation",
    whatWeCanDo: "Build itemized property list and urgency narrative, document enforcement gaps and police refusals, prep court request structure for property retrieval, organize EPO paperwork and violation timeline",
    deadlineNote: "IMMEDIATE — children without essentials", score: 0,
  },

  // ── TIER 2: Strong / High-Conversion ──
  {
    id: "lead-007", name: "Anonymous (Gas Leaks)", state: "Unknown", tier: 2, urgency: "high",
    caseType: "housing", status: "new",
    description: "Gas leaks and electrical issues in rental unit. Landlord refuses certified repairs. Attempting illegal 2-day eviction. Habitability violations and possible retaliation.",
    whatTheyNeed: "Violation and retaliation case documentation, photo/notice timeline, tenant rights research, eviction defense",
    whatWeCanDo: "Build violation and retaliation timeline, organize condition photos and landlord communications, research state-specific habitability protections and illegal eviction remedies, prep defense documentation",
    score: 0,
  },
  {
    id: "lead-008", name: "Mike Chene", state: "FL", tier: 2, urgency: "medium",
    caseType: "arrest", status: "new",
    description: "Florida arrest for failure to ID. Claims video evidence was deleted by officers. Officers refused to show badges. Possible civil rights violations. Needs incident reconstruction and records requests.",
    whatTheyNeed: "Incident reconstruction, body cam and records requests, civil rights complaint research, evidence timeline",
    whatWeCanDo: "Build incident reconstruction timeline, prep public records and FOIA requests for body cam footage, research FL civil rights complaint process and failure-to-ID statute, organize evidence for complaint or defense",
    score: 0,
  },
  {
    id: "lead-009", name: "SerenePhoenix4023", state: "OK", tier: 2, urgency: "medium",
    caseType: "custody", status: "new",
    description: "Six years pro se in Oklahoma custody case. Needs help drafting contempt motion and visitation modification. Overwhelmed by process. Long history of self-representation. Needs structured motion format and violation organization.",
    whatTheyNeed: "Clean contempt motion format, visitation modification drafting, violation organization, filing checklist",
    whatWeCanDo: "Structure clean motion format, organize violations and requested relief, research OK family court contempt and modification procedures, build filing checklist and deadline tracker",
    score: 0,
  },

  // ── TIER 3: Low Priority / Screen ──
  {
    id: "lead-010", name: "Anonymous (Bound Over)", state: "Unknown", tier: 3, urgency: "low",
    caseType: "question", status: "new",
    description: "Asked about what 'bound over' means. No additional facts provided. Basic procedural question — may have deeper case needs if screened.",
    whatTheyNeed: "Procedural explanation, possible deeper intake screening",
    whatWeCanDo: "Explain bind-over process, screen for underlying case complexity, offer full intake if warranted",
    score: 0,
  },
  {
    id: "lead-011", name: "Adam Skalski", state: "Unknown", tier: 3, urgency: "low",
    caseType: "incomplete", status: "screening",
    description: "Name provided but no usable case facts yet. Needs screening call to determine if there is an actionable matter.",
    whatTheyNeed: "Screening call to surface facts",
    whatWeCanDo: "Brief outreach to determine situation, screen for actionable issues, offer intake if warranted",
    score: 0,
  },
  {
    id: "lead-012", name: "International / Non-Relevant", state: "N/A", tier: 3, urgency: "low",
    caseType: "not_a_lead", status: "skip",
    description: "International inquiries (South Africa, India/Jaipur) and non-English posts. Outside US jurisdiction scope. No action.",
    whatTheyNeed: "N/A — outside scope", whatWeCanDo: "Polite redirect where appropriate, otherwise no action", score: 0,
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
    id: "pub-3", label: "Custody / Family Safety",
    text: "Family situations like this are overwhelming. We help people organize the facts, build safety documentation, and get prepared — not with generic templates, but with actual case-specific structure. Free initial review. DM me if you want help.",
  },
  {
    id: "pub-4", label: "Housing / Eviction",
    text: "If your landlord is threatening illegal eviction or ignoring habitability issues, there are real protections. We help organize evidence, research tenant rights, and build documentation. Free to start — DM me.",
  },
  {
    id: "pub-5", label: "Evidence / Police Misconduct",
    text: "Missing body cam footage, badge refusals, and erased evidence are serious. We help people organize what they have, file public records requests, and build incident timelines. Free initial review — reach out anytime.",
  },
  {
    id: "pub-6", label: "Parent Criminal Charge (Truancy)",
    text: "Being charged because of your kid's school attendance is terrifying, especially when you have documented enforcement. We help build compliance evidence packets and prep what to say — and what not to say — before court. DM me if you want a hand.",
  },
];

const DM_TEMPLATES = [
  {
    id: "dm-family-safety", label: "Family Safety / Custody Risk",
    text: `Hi — I saw your post and I want you to know you are not alone in this. What you described — someone moved into your home without your consent, around your children — is a real safety concern, not just a relationship issue.

We help people in situations like yours by:
- Building a household risk and safety summary
- Documenting the timeline of what happened and when
- Organizing facts for emergency custody or protective positioning
- Connecting you with resources and referrals

We are not attorneys — we are a case support team that helps you get organized so you are not scrambling when it matters. Free initial review. Want to tell me more?`,
  },
  {
    id: "dm-truancy-defense", label: "Truancy / Parent Criminal Charge",
    text: `Hi Lauren — I saw your post about the truancy charge. Being charged as a parent when you have documented enforcement is incredibly frustrating.

Here is what we can do:
- Build a compliance evidence packet from your records — discipline logs, school communications, attendance records
- Construct a clear timeline showing your enforcement actions
- Help you prep what to say (and what NOT to say) in school meetings before court
- Organize everything into a format a defense attorney can use immediately

Free initial review. No obligation. Want to send me some details about your situation?`,
  },
  {
    id: "dm-wrongful-eviction", label: "Wrongful Eviction (Kansas)",
    text: `Hi — I saw your post about the eviction situation in Topeka. If you have bank statements proving payment, that is strong evidence.

We help by:
- Building a payment proof timeline from your bank records
- Organizing your lease, notices, and landlord communications
- Researching Kansas tenant protections and wrongful eviction remedies
- Prepping a document stack for counterclaim or defense positioning

We are not a law firm — we help you get organized so an attorney (or you) can move fast. Free initial review. Want to share the details?`,
  },
  {
    id: "dm-ms-pcr", label: "Mississippi Post-Conviction",
    text: `Hi Alisha — I saw your post about your son's case. I work with UNYKORN Advocacy, and we help families dealing with wrongful convictions and sentencing issues.

What we can do:
- Organize the trial record and identify inconsistencies
- Research post-conviction relief standards in MS
- Build a clear timeline of what happened
- Prepare a case summary that an attorney can use immediately

We do the heavy lifting on the documents and research so you are not starting from scratch. Free initial review. Would you like to send me some details?`,
  },
  {
    id: "dm-ok-custody", label: "Oklahoma Custody (Pro Se)",
    text: `Hi — I saw you have been dealing with a custody situation in Oklahoma for 6 years pro se. That takes real persistence.

We help pro se parents get organized:
- Structure clean contempt motion format
- Organize your existing orders and evidence of violations
- Build filing checklists so nothing gets missed
- Create a clear timeline judges can follow

Free initial review. Want to tell me a bit more about where things stand now?`,
  },
  {
    id: "dm-general", label: "General Intake",
    text: `Hi — I saw your post and wanted to reach out. I work with UNYKORN Advocacy — we help people organize their cases, build evidence timelines, and get prepared before court dates or deadlines.

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
  family_safety: "Family Safety", truancy: "Truancy / Parent Charge", child_abuse: "Child Abuse",
  post_conviction: "Post-Conviction", protection_order: "Protection Order", housing: "Housing / Eviction",
  arrest: "Arrest / Misconduct", custody: "Custody", civil_rights: "Civil Rights",
  question: "Legal Question", incomplete: "Incomplete", not_a_lead: "Not a Lead",
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
