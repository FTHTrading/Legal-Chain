"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState, useMemo } from "react";

/* ─── Types ───────────────────────────────────────────────────────────────── */

type Tab = "facts" | "timeline" | "deadlines" | "tasks" | "documents" | "notes";
type FactStatus = "alleged" | "verified" | "disputed" | "pending";
type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
type DocStatus = "needed" | "requested" | "received" | "reviewed" | "filed";

interface Fact {
  id: string;
  category: string;
  text: string;
  source: string;
  status: FactStatus;
  date?: string;
  linkedEvidence: string[];
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: "incident" | "filing" | "communication" | "evidence" | "court" | "internal";
  source?: string;
}

interface Deadline {
  id: string;
  title: string;
  date: string;
  type: "court_date" | "filing" | "response" | "internal" | "statute_of_limitations";
  status: "upcoming" | "met" | "missed" | "extended";
  notes?: string;
  autoCalculated?: boolean;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: "critical" | "high" | "medium" | "low";
  assignee: string;
  description: string;
  dependsOn?: string;
  dueDate?: string;
}

interface Document {
  id: string;
  title: string;
  category: string;
  status: DocStatus;
  notes?: string;
  dateReceived?: string;
}

interface CaseNote {
  id: string;
  timestamp: string;
  author: string;
  text: string;
  pinned: boolean;
}

interface CaseParty {
  name: string;
  role: "client" | "opposing" | "witness" | "court" | "other";
  notes?: string;
}

interface CaseDetail {
  id: string;
  caseRef: string;
  title: string;
  clientName: string;
  caseType: string;
  status: string;
  urgency: string;
  jurisdiction: string;
  createdAt: string;
  parties: CaseParty[];
  facts: Fact[];
  timeline: TimelineEvent[];
  deadlines: Deadline[];
  tasks: Task[];
  documents: Document[];
  notes: CaseNote[];
}

/* ─── Demo Case Data ──────────────────────────────────────────────────────── */

const DEMO_CASES: Record<string, CaseDetail> = {
  "case-001": {
    id: "case-001",
    caseRef: "UNY-ADV-2026-001",
    title: "Pregnant Mother — Household Safety Emergency",
    clientName: "Ascarestayathomemom",
    caseType: "Family Safety",
    status: "intake",
    urgency: "critical",
    jurisdiction: "Unknown — pending intake",
    createdAt: "2026-04-10T09:00:00Z",
    parties: [
      { name: "Ascarestayathomemom", role: "client", notes: "Pregnant, children in home, probationer moved in without consent" },
      { name: "Male on probation", role: "opposing", notes: "Moved into home with children present — potential safety risk" },
    ],
    facts: [
      { id: "f1", category: "Household", text: "Male on probation moved into client's home without her consent", source: "Reddit post", status: "alleged", linkedEvidence: [] },
      { id: "f2", category: "Safety", text: "Client is pregnant and has existing children in the home", source: "Reddit post", status: "alleged", linkedEvidence: [] },
      { id: "f3", category: "Legal Status", text: "Male is on probation — exact terms and jurisdiction unknown", source: "Reddit post", status: "pending", linkedEvidence: [] },
    ],
    timeline: [
      { id: "t1", date: "2026-04-09", title: "Reddit post identified", description: "Lead triaged from legal advice subreddit — Tier 1 immediate", category: "internal" },
      { id: "t2", date: "2026-04-10", title: "Case workspace created", description: "Graduated from lead pipeline to active case workspace", category: "internal" },
    ],
    deadlines: [
      { id: "dl1", title: "Initial intake call", date: "2026-04-12", type: "internal", status: "upcoming" },
      { id: "dl2", title: "Safety assessment complete", date: "2026-04-14", type: "internal", status: "upcoming" },
      { id: "dl3", title: "Jurisdiction identification", date: "2026-04-15", type: "internal", status: "upcoming" },
    ],
    tasks: [
      { id: "tk1", title: "Complete intake call", status: "todo", priority: "critical", assignee: "Kevan", description: "Call client — assess immediate safety, identify state/county, get probation details" },
      { id: "tk2", title: "Identify jurisdiction", status: "todo", priority: "high", assignee: "System", description: "Determine state and county from intake — needed for EPO research" },
      { id: "tk3", title: "Research EPO requirements", status: "todo", priority: "high", assignee: "Research Agent", description: "Once jurisdiction known — research emergency protection order process, forms, and timelines", dependsOn: "tk2" },
      { id: "tk4", title: "Build safety assessment document", status: "todo", priority: "high", assignee: "Document Agent", description: "Compile risk factors into structured safety assessment for court or attorney", dependsOn: "tk1" },
      { id: "tk5", title: "Prepare attorney referral packet", status: "todo", priority: "medium", assignee: "Kevan", description: "If EPO needed — compile fact sheet + timeline + safety assessment for handoff", dependsOn: "tk4" },
    ],
    documents: [
      { id: "doc1", title: "Client intake form", category: "Intake", status: "needed" },
      { id: "doc2", title: "Probation order / conditions", category: "Court Records", status: "needed", notes: "Need to determine if probation has residency restrictions" },
      { id: "doc3", title: "Safety assessment summary", category: "Case Work", status: "needed" },
      { id: "doc4", title: "EPO petition (if applicable)", category: "Filing", status: "needed", notes: "Jurisdiction-dependent — research required" },
    ],
    notes: [
      { id: "n1", timestamp: "2026-04-10T09:15:00Z", author: "Kevan", text: "This is urgent — pregnant mother with children and an uninvited probationer. Need to assess whether the probation terms prohibit this living arrangement. If so, that's leverage. If not, EPO route.", pinned: true },
    ],
  },
  "case-002": {
    id: "case-002",
    caseRef: "UNY-ADV-2026-002",
    title: "Truancy Parent Criminal Charge — Lauren L Edlund",
    clientName: "Lauren L Edlund",
    caseType: "Truancy / Parent Charge",
    status: "intake",
    urgency: "critical",
    jurisdiction: "Unknown — criminal charge",
    createdAt: "2026-04-10T09:15:00Z",
    parties: [
      { name: "Lauren L Edlund", role: "client", notes: "Charged with truancy — claims documented enforcement efforts" },
      { name: "School district", role: "opposing", notes: "Initiated truancy complaint" },
      { name: "Court / Prosecutor", role: "court", notes: "Criminal charge filed — case details unknown" },
    ],
    facts: [
      { id: "f1", category: "Criminal", text: "Parent charged with criminal truancy — exact statute unknown", source: "Reddit post", status: "alleged", linkedEvidence: [] },
      { id: "f2", category: "Defense", text: "Client claims she has documented enforcement efforts and school communications", source: "Reddit post", status: "pending", linkedEvidence: [] },
      { id: "f3", category: "Evidence", text: "Discipline logs and attendance records may exist to support defense", source: "Reddit post", status: "pending", linkedEvidence: [] },
    ],
    timeline: [
      { id: "t1", date: "2026-04-09", title: "Lead identified", description: "Reddit post about truancy charge — parent claims compliance", category: "internal" },
      { id: "t2", date: "2026-04-10", title: "DM sent", description: "Personalized DM with case support offer and compliance packet description", category: "communication" },
    ],
    deadlines: [
      { id: "dl1", title: "DM follow-up", date: "2026-04-11", type: "internal", status: "upcoming" },
      { id: "dl2", title: "Court date discovery", date: "2026-04-15", type: "internal", status: "upcoming" },
      { id: "dl3", title: "Compliance packet draft", date: "2026-04-18", type: "internal", status: "upcoming" },
    ],
    tasks: [
      { id: "tk1", title: "Follow up on DM", status: "todo", priority: "critical", assignee: "Kevan", description: "Check for DM response — if no response in 24h, try public comment" },
      { id: "tk2", title: "Identify state and court", status: "todo", priority: "high", assignee: "Kevan", description: "Determine jurisdiction — needed for statute lookup and filing requirements" },
      { id: "tk3", title: "Research truancy defense standards", status: "todo", priority: "high", assignee: "Research Agent", description: "State-specific: what constitutes parental compliance? Good faith defense?", dependsOn: "tk2" },
      { id: "tk4", title: "Build compliance evidence packet", status: "todo", priority: "high", assignee: "Document Agent", description: "Organize discipline logs, school communications, attendance records into structured format", dependsOn: "tk1" },
      { id: "tk5", title: "Draft pre-court preparation guide", status: "todo", priority: "medium", assignee: "Document Agent", description: "What to say / not say at school meetings and court — based on jurisdiction", dependsOn: "tk3" },
    ],
    documents: [
      { id: "doc1", title: "Client intake form", category: "Intake", status: "needed" },
      { id: "doc2", title: "School attendance records", category: "Evidence", status: "needed" },
      { id: "doc3", title: "Discipline logs", category: "Evidence", status: "needed" },
      { id: "doc4", title: "School communications (emails, letters)", category: "Evidence", status: "needed" },
      { id: "doc5", title: "Compliance evidence packet", category: "Case Work", status: "needed" },
      { id: "doc6", title: "Charging document / citation", category: "Court Records", status: "needed" },
    ],
    notes: [
      { id: "n1", timestamp: "2026-04-10T09:30:00Z", author: "Kevan", text: "Key angle: if she can show documented good-faith enforcement efforts, most states have a parental compliance defense. The compliance packet IS the deliverable here — organized evidence a defense attorney can use immediately.", pinned: true },
    ],
  },
  "case-004": {
    id: "case-004",
    caseRef: "UNY-ADV-2026-004",
    title: "GA Police Misconduct — Child Abuse Report Tampering",
    clientName: "Anonymous (GA)",
    caseType: "Civil Rights",
    status: "fact_building",
    urgency: "critical",
    jurisdiction: "Georgia — county unknown",
    createdAt: "2026-04-09T14:00:00Z",
    parties: [
      { name: "Anonymous Parent", role: "client", notes: "Alleges police refused to file child abuse report, possible tampering" },
      { name: "Local Police Department", role: "opposing", notes: "Alleged refusal to document or tampering with report" },
      { name: "DFCS / CPS", role: "other", notes: "May have parallel involvement — needs verification" },
    ],
    facts: [
      { id: "f1", category: "Misconduct", text: "Police allegedly refused to file a child abuse report", source: "Reddit post", status: "alleged", linkedEvidence: [] },
      { id: "f2", category: "Misconduct", text: "Possible tampering with or suppression of report", source: "Reddit post", status: "alleged", linkedEvidence: [] },
      { id: "f3", category: "Impact", text: "Child safety concern — abuse report not documented means no CPS follow-up", source: "Inference", status: "alleged", linkedEvidence: [] },
    ],
    timeline: [
      { id: "t1", date: "2026-04-08", title: "Lead identified in r/legaladvice", description: "Post describing police refusing to take child abuse report in GA", category: "internal" },
      { id: "t2", date: "2026-04-09", title: "DM sent", description: "Outreach with civil rights angle — IA complaint and evidence preservation", category: "communication" },
      { id: "t3", date: "2026-04-10", title: "Moved to fact building", description: "Client responded — providing additional detail on incident", category: "internal" },
    ],
    deadlines: [
      { id: "dl1", title: "Incident timeline draft", date: "2026-04-13", type: "internal", status: "upcoming" },
      { id: "dl2", title: "IA complaint deadline research", date: "2026-04-15", type: "internal", status: "upcoming" },
      { id: "dl3", title: "Evidence preservation letter", date: "2026-04-16", type: "internal", status: "upcoming" },
    ],
    tasks: [
      { id: "tk1", title: "Build incident timeline", status: "in_progress", priority: "critical", assignee: "Kevan", description: "Need exact dates, officer names/badge numbers, report numbers if any, department name" },
      { id: "tk2", title: "Research GA IA complaint process", status: "todo", priority: "high", assignee: "Research Agent", description: "How to file internal affairs complaint, deadlines, and what documentation is needed" },
      { id: "tk3", title: "Draft evidence preservation letter", status: "todo", priority: "high", assignee: "Document Agent", description: "Put department on notice to preserve body cam, dispatch records, incident reports", dependsOn: "tk1" },
      { id: "tk4", title: "Research federal civil rights angle", status: "todo", priority: "medium", assignee: "Research Agent", description: "42 USC § 1983 — failure to investigate, deliberate indifference to child safety" },
      { id: "tk5", title: "Compile referral packet for civil rights attorney", status: "todo", priority: "medium", assignee: "Kevan", description: "Once facts and timeline are solid — package for attorney consultation", dependsOn: "tk3" },
    ],
    documents: [
      { id: "doc1", title: "Client intake form", category: "Intake", status: "received" },
      { id: "doc2", title: "Incident timeline", category: "Case Work", status: "needed" },
      { id: "doc3", title: "IA complaint draft", category: "Filing", status: "needed" },
      { id: "doc4", title: "Evidence preservation letter", category: "Filing", status: "needed" },
      { id: "doc5", title: "Body cam / dispatch records request", category: "Records Request", status: "needed" },
    ],
    notes: [
      { id: "n1", timestamp: "2026-04-09T15:00:00Z", author: "Kevan", text: "This has real civil rights potential. If police refused to document a child abuse report, that's deliberate indifference. The deliverable here is (1) organized incident timeline, (2) IA complaint ready to file, (3) evidence preservation letter to prevent destruction. Then hand to a civil rights attorney with everything packaged.", pinned: true },
      { id: "n2", timestamp: "2026-04-10T08:00:00Z", author: "Kevan", text: "Client confirmed additional details coming. Need officer names and department. Also need to check if DFCS was ever contacted independently.", pinned: false },
    ],
  },
  "case-005": {
    id: "case-005",
    caseRef: "UNY-ADV-2026-005",
    title: "MS Post-Conviction — Alisha Prather",
    clientName: "Alisha Prather",
    caseType: "Post-Conviction",
    status: "fact_building",
    urgency: "high",
    jurisdiction: "Mississippi — county TBD",
    createdAt: "2026-04-08T10:00:00Z",
    parties: [
      { name: "Alisha Prather", role: "client", notes: "Son convicted — alleges misconduct and sentencing issues" },
      { name: "State of Mississippi", role: "opposing" },
      { name: "Son (name TBD)", role: "other", notes: "Defendant in original case — need case number" },
    ],
    facts: [
      { id: "f1", category: "Conviction", text: "Son was convicted — mother alleges wrongful conviction", source: "Reddit post", status: "alleged", linkedEvidence: [] },
      { id: "f2", category: "Sentencing", text: "Possible sentencing issues — disproportionate or exceeding guidelines", source: "Reddit post", status: "pending", linkedEvidence: [] },
    ],
    timeline: [
      { id: "t1", date: "2026-04-07", title: "Lead identified", description: "Reddit post by mother seeking help with son's conviction", category: "internal" },
      { id: "t2", date: "2026-04-08", title: "DM sent", description: "Mississippi PCR-specific outreach — trial record organization offer", category: "communication" },
      { id: "t3", date: "2026-04-10", title: "Moved to fact building", description: "Client engaging — beginning case record collection", category: "internal" },
    ],
    deadlines: [
      { id: "dl1", title: "Trial record request", date: "2026-04-14", type: "internal", status: "upcoming" },
      { id: "dl2", title: "PCR filing deadline research", date: "2026-04-18", type: "filing", status: "upcoming" },
      { id: "dl3", title: "Case summary for attorney review", date: "2026-04-25", type: "internal", status: "upcoming" },
    ],
    tasks: [
      { id: "tk1", title: "Get case number and county", status: "in_progress", priority: "critical", assignee: "Kevan", description: "Need MS case number, county, judge name, and approximate conviction date" },
      { id: "tk2", title: "Request trial record and transcript", status: "todo", priority: "high", assignee: "Kevan", description: "Guide client through obtaining trial record from clerk of court", dependsOn: "tk1" },
      { id: "tk3", title: "Research MS PCR standards", status: "todo", priority: "high", assignee: "Research Agent", description: "Mississippi post-conviction relief — time limits, grounds, procedural requirements" },
      { id: "tk4", title: "Identify appellate issues", status: "todo", priority: "high", assignee: "Research Agent", description: "Review trial record for ineffective assistance, Brady violations, sentencing errors", dependsOn: "tk2" },
      { id: "tk5", title: "Build case summary for attorney", status: "todo", priority: "medium", assignee: "Document Agent", description: "Organized packet: timeline, identified issues, supporting evidence, PCR analysis", dependsOn: "tk4" },
    ],
    documents: [
      { id: "doc1", title: "Client intake form", category: "Intake", status: "received" },
      { id: "doc2", title: "Trial transcript", category: "Court Records", status: "needed", notes: "Client needs to request from clerk" },
      { id: "doc3", title: "Sentencing order", category: "Court Records", status: "needed" },
      { id: "doc4", title: "PCR timeline analysis", category: "Case Work", status: "needed" },
      { id: "doc5", title: "Attorney referral packet", category: "Handoff", status: "needed" },
    ],
    notes: [
      { id: "n1", timestamp: "2026-04-08T11:00:00Z", author: "Kevan", text: "Key: we're not doing the PCR filing — we're organizing the case so an attorney can assess it quickly. The deliverable is a clear case summary with identified issues, organized records, and a timeline. Most PCR attorneys charge $5K+ — if we hand them a pre-organized packet, we're the referral source they want.", pinned: true },
    ],
  },
};

/* ─── Fallback for unknown case IDs ───────────────────────────────────────── */

function getCase(id: string): CaseDetail | null {
  return DEMO_CASES[id] || null;
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const FACT_COLORS: Record<FactStatus, string> = {
  alleged: "text-yellow-400 bg-yellow-900/20",
  verified: "text-green-400 bg-green-900/20",
  disputed: "text-red-400 bg-red-900/20",
  pending: "text-blue-400 bg-blue-900/20",
};

const TASK_COLORS: Record<TaskStatus, string> = {
  todo: "text-blue-400 bg-blue-900/20",
  in_progress: "text-cyan-400 bg-cyan-900/20",
  blocked: "text-red-400 bg-red-900/20",
  done: "text-green-400 bg-green-900/20",
};

const DOC_COLORS: Record<DocStatus, string> = {
  needed: "text-red-400 bg-red-900/20",
  requested: "text-orange-400 bg-orange-900/20",
  received: "text-blue-400 bg-blue-900/20",
  reviewed: "text-cyan-400 bg-cyan-900/20",
  filed: "text-green-400 bg-green-900/20",
};

const EVENT_COLORS: Record<string, string> = {
  incident: "border-red-400",
  filing: "border-purple-400",
  communication: "border-cyan-400",
  evidence: "border-orange-400",
  court: "border-[var(--gold)]",
  internal: "border-gray-500",
};

const PRIORITY_ICONS: Record<string, string> = {
  critical: "⛔",
  high: "▲",
  medium: "●",
  low: "○",
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

/* ─── Page Component ──────────────────────────────────────────────────────── */

export default function CaseWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("facts");
  const [taskFilter, setTaskFilter] = useState<TaskStatus | "all">("all");
  const [docFilter, setDocFilter] = useState<DocStatus | "all">("all");

  // Resolve async params
  if (!resolvedParams) {
    params.then(setResolvedParams);
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-[104px] pb-16 px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="animate-pulse text-[var(--text-muted)]">Loading case workspace…</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const caseData = getCase(resolvedParams.id);

  if (!caseData) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-[104px] pb-16 px-8">
          <div className="max-w-[1400px] mx-auto text-center py-20">
            <p className="text-6xl mb-4">📁</p>
            <h1 className="font-serif text-3xl font-bold mb-2">Case Not Found</h1>
            <p className="text-[var(--text-muted)] mb-6">No workspace found for this case ID.</p>
            <Link href="/ops/cases" className="glass-button px-6 py-3 rounded no-underline text-sm">
              ← Back to Cases
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return <CaseWorkspaceInner caseData={caseData} activeTab={activeTab} setActiveTab={setActiveTab} taskFilter={taskFilter} setTaskFilter={setTaskFilter} docFilter={docFilter} setDocFilter={setDocFilter} />;
}

/* ─── Inner Component (avoids hooks-after-return issue) ───────────────────── */

function CaseWorkspaceInner({
  caseData, activeTab, setActiveTab, taskFilter, setTaskFilter, docFilter, setDocFilter,
}: {
  caseData: CaseDetail; activeTab: Tab; setActiveTab: (t: Tab) => void;
  taskFilter: TaskStatus | "all"; setTaskFilter: (s: TaskStatus | "all") => void;
  docFilter: DocStatus | "all"; setDocFilter: (s: DocStatus | "all") => void;
}) {
  const filteredTasks = useMemo(() => {
    if (taskFilter === "all") return caseData.tasks;
    return caseData.tasks.filter((t) => t.status === taskFilter);
  }, [caseData.tasks, taskFilter]);

  const filteredDocs = useMemo(() => {
    if (docFilter === "all") return caseData.documents;
    return caseData.documents.filter((d) => d.status === docFilter);
  }, [caseData.documents, docFilter]);

  const taskStats = {
    total: caseData.tasks.length,
    done: caseData.tasks.filter((t) => t.status === "done").length,
    inProgress: caseData.tasks.filter((t) => t.status === "in_progress").length,
    blocked: caseData.tasks.filter((t) => t.status === "blocked").length,
  };

  const docStats = {
    total: caseData.documents.length,
    received: caseData.documents.filter((d) => d.status === "received" || d.status === "reviewed" || d.status === "filed").length,
    needed: caseData.documents.filter((d) => d.status === "needed").length,
  };

  const urgentDeadlines = caseData.deadlines.filter((d) => d.status === "upcoming" && daysUntil(d.date) <= 3);

  const TABS: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: "facts", label: "Fact Sheet", icon: "📋", count: caseData.facts.length },
    { key: "timeline", label: "Timeline", icon: "📅", count: caseData.timeline.length },
    { key: "deadlines", label: "Deadlines", icon: "⏰", count: caseData.deadlines.length },
    { key: "tasks", label: "Tasks", icon: "✓", count: caseData.tasks.length },
    { key: "documents", label: "Documents", icon: "📄", count: caseData.documents.length },
    { key: "notes", label: "Notes", icon: "📝", count: caseData.notes.length },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-4">
            <Link href="/ops" className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors no-underline">
              Operations
            </Link>
            <span className="text-xs text-[var(--text-muted)]">›</span>
            <Link href="/ops/cases" className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors no-underline">
              Cases
            </Link>
            <span className="text-xs text-[var(--text-muted)]">›</span>
            <span className="text-xs font-mono text-[var(--gold)]">{caseData.caseRef}</span>
          </div>

          {/* Case Header */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${caseData.urgency === "critical" ? "bg-red-400 animate-pulse" : caseData.urgency === "high" ? "bg-orange-400" : "bg-yellow-400"}`} />
                  <span className="text-xs font-mono text-[var(--text-muted)]">{caseData.caseRef}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    caseData.urgency === "critical" ? "text-red-400 bg-red-900/20" :
                    caseData.urgency === "high" ? "text-orange-400 bg-orange-900/20" : "text-yellow-400 bg-yellow-900/20"
                  }`}>{caseData.urgency.toUpperCase()}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded text-blue-400 bg-blue-900/20">{caseData.status.toUpperCase().replace("_", " ")}</span>
                </div>
                <h1 className="font-serif text-3xl font-bold mb-2">{caseData.title}</h1>
                <p className="text-[var(--text-muted)]">
                  <span className="text-[var(--gold)]">{caseData.clientName}</span> · {caseData.caseType} · {caseData.jurisdiction}
                </p>
              </div>
            </div>

            {/* Urgent Deadline Banner */}
            {urgentDeadlines.length > 0 && (
              <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 mt-4">
                <p className="text-xs font-mono text-red-400 mb-2">⚠ URGENT DEADLINES</p>
                {urgentDeadlines.map((d) => (
                  <p key={d.id} className="text-sm text-red-300">
                    <span className="font-bold">{daysUntil(d.date) <= 0 ? "OVERDUE" : `${daysUntil(d.date)} day${daysUntil(d.date) === 1 ? "" : "s"}`}</span>
                    {" — "}{d.title} ({d.date})
                  </p>
                ))}
              </div>
            )}

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
              {[
                { label: "Facts", value: caseData.facts.length, sub: `${caseData.facts.filter((f) => f.status === "verified").length} verified` },
                { label: "Deadlines", value: caseData.deadlines.length, sub: `${urgentDeadlines.length} urgent` },
                { label: "Tasks", value: `${taskStats.done}/${taskStats.total}`, sub: `${taskStats.inProgress} active` },
                { label: "Documents", value: `${docStats.received}/${docStats.total}`, sub: `${docStats.needed} needed` },
                { label: "Parties", value: caseData.parties.length, sub: `${caseData.notes.length} notes` },
              ].map((s) => (
                <div key={s.label} className="bg-[var(--navy)] rounded-lg p-3 text-center">
                  <p className="text-xl font-serif font-bold text-[var(--gold)]">{s.value}</p>
                  <p className="text-xs font-mono text-[var(--text-muted)]">{s.label}</p>
                  <p className="text-xs text-[var(--text-muted)] opacity-60">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Parties */}
            <div className="mt-6">
              <p className="text-xs font-mono tracking-wider text-[var(--text-muted)] mb-3">PARTIES</p>
              <div className="flex flex-wrap gap-3">
                {caseData.parties.map((p, i) => (
                  <div key={i} className="bg-[var(--navy)] rounded-lg px-4 py-2 border border-[rgba(201,168,76,0.05)]">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                        p.role === "client" ? "text-green-400 bg-green-900/20" :
                        p.role === "opposing" ? "text-red-400 bg-red-900/20" :
                        "text-gray-400 bg-gray-900/20"
                      }`}>{p.role.toUpperCase()}</span>
                      <span className="text-sm font-bold">{p.name}</span>
                    </div>
                    {p.notes && <p className="text-xs text-[var(--text-muted)] mt-1">{p.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto border-b border-[rgba(201,168,76,0.1)] pb-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t text-sm font-mono transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-[var(--navy-card)] text-[var(--gold)] border border-[rgba(201,168,76,0.2)] border-b-0"
                    : "text-[var(--text-muted)] hover:text-[var(--gold)]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className="text-xs opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 min-h-[400px]">

            {/* ═══ FACTS TAB ═══ */}
            {activeTab === "facts" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-bold">Fact Sheet</h2>
                  <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                    <span className="text-yellow-400">● {caseData.facts.filter((f) => f.status === "alleged").length} alleged</span>
                    <span className="text-green-400">● {caseData.facts.filter((f) => f.status === "verified").length} verified</span>
                    <span className="text-blue-400">● {caseData.facts.filter((f) => f.status === "pending").length} pending</span>
                    <span className="text-red-400">● {caseData.facts.filter((f) => f.status === "disputed").length} disputed</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {caseData.facts.map((fact) => (
                    <div key={fact.id} className="bg-[var(--navy)] rounded-lg p-4 border-l-3 border-l-[rgba(201,168,76,0.3)]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-mono px-2 py-0.5 rounded ${FACT_COLORS[fact.status]}`}>
                            {fact.status.toUpperCase()}
                          </span>
                          <span className="text-xs font-mono text-[var(--gold)]">{fact.category}</span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">Source: {fact.source}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{fact.text}</p>
                      {fact.date && <p className="text-xs text-[var(--text-muted)] mt-1">Date: {fact.date}</p>}
                    </div>
                  ))}
                </div>
                {caseData.facts.length === 0 && (
                  <div className="text-center py-12 text-[var(--text-muted)]">
                    <p className="text-4xl mb-2">📋</p>
                    <p>No facts documented yet. Complete intake to begin fact building.</p>
                  </div>
                )}
              </div>
            )}

            {/* ═══ TIMELINE TAB ═══ */}
            {activeTab === "timeline" && (
              <div>
                <h2 className="font-serif text-xl font-bold mb-6">Evidence Timeline</h2>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-[rgba(201,168,76,0.2)]" />
                  <div className="space-y-6">
                    {caseData.timeline
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((event) => (
                        <div key={event.id} className="flex gap-6 relative">
                          <div className={`w-8 h-8 rounded-full bg-[var(--navy)] border-2 ${EVENT_COLORS[event.category] || "border-gray-500"} flex items-center justify-center shrink-0 z-10`}>
                            <span className="text-xs">
                              {event.category === "incident" ? "⚠" : event.category === "filing" ? "📄" :
                               event.category === "communication" ? "💬" : event.category === "evidence" ? "🔍" :
                               event.category === "court" ? "⚖" : "●"}
                            </span>
                          </div>
                          <div className="bg-[var(--navy)] rounded-lg p-4 flex-1 border border-[rgba(201,168,76,0.05)]">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-bold">{event.title}</h3>
                              <span className="text-xs font-mono text-[var(--text-muted)]">{event.date}</span>
                            </div>
                            <p className="text-sm text-[var(--text-muted)]">{event.description}</p>
                            {event.source && <p className="text-xs text-[var(--gold)] mt-1">Source: {event.source}</p>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                {caseData.timeline.length === 0 && (
                  <div className="text-center py-12 text-[var(--text-muted)]">
                    <p className="text-4xl mb-2">📅</p>
                    <p>No timeline events yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* ═══ DEADLINES TAB ═══ */}
            {activeTab === "deadlines" && (
              <div>
                <h2 className="font-serif text-xl font-bold mb-6">Deadline Engine</h2>
                <div className="space-y-3">
                  {caseData.deadlines
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((deadline) => {
                      const days = daysUntil(deadline.date);
                      const isOverdue = days < 0 && deadline.status === "upcoming";
                      const isUrgent = days <= 3 && days >= 0 && deadline.status === "upcoming";
                      return (
                        <div key={deadline.id} className={`bg-[var(--navy)] rounded-lg p-4 border-l-3 ${
                          isOverdue ? "border-l-red-500" : isUrgent ? "border-l-orange-400" :
                          deadline.status === "met" ? "border-l-green-400" : "border-l-[rgba(201,168,76,0.3)]"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                                isOverdue ? "text-red-400 bg-red-900/20" :
                                isUrgent ? "text-orange-400 bg-orange-900/20" :
                                deadline.status === "met" ? "text-green-400 bg-green-900/20" :
                                "text-blue-400 bg-blue-900/20"
                              }`}>
                                {isOverdue ? "OVERDUE" : deadline.status === "met" ? "MET" : `${days}d`}
                              </span>
                              <span className="text-xs font-mono px-2 py-0.5 rounded text-[var(--text-muted)] bg-[var(--navy-card)]">
                                {deadline.type.replace("_", " ").toUpperCase()}
                              </span>
                              <span className="text-sm font-bold">{deadline.title}</span>
                            </div>
                            <span className="text-xs font-mono text-[var(--text-muted)]">{deadline.date}</span>
                          </div>
                          {deadline.notes && <p className="text-xs text-[var(--text-muted)] mt-2 ml-8">{deadline.notes}</p>}
                        </div>
                      );
                    })}
                </div>
                <div className="mt-6 bg-[var(--navy)] rounded-lg p-4 border border-[rgba(201,168,76,0.1)]">
                  <p className="text-xs font-mono text-[var(--gold)] mb-2">DEADLINE INTELLIGENCE</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Auto-calculated deadlines will appear here once jurisdiction is confirmed. 
                    Filing windows, response deadlines, and statute of limitations are computed from case type and jurisdiction rules.
                  </p>
                </div>
              </div>
            )}

            {/* ═══ TASKS TAB ═══ */}
            {activeTab === "tasks" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-bold">Task Board</h2>
                  <div className="flex items-center gap-2">
                    {(["all", "todo", "in_progress", "blocked", "done"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setTaskFilter(s)}
                        className={`text-xs font-mono px-3 py-1 rounded cursor-pointer transition-colors ${
                          taskFilter === s ? "bg-[var(--gold)] text-[var(--midnight)]" : "text-[var(--text-muted)] hover:text-[var(--gold)]"
                        }`}
                      >
                        {s === "all" ? "All" : s.replace("_", " ").toUpperCase()} ({s === "all" ? caseData.tasks.length : caseData.tasks.filter((t) => t.status === s).length})
                      </button>
                    ))}
                  </div>
                </div>
                {/* Progress */}
                <div className="bg-[var(--navy)] rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-[var(--text-muted)]">PROGRESS</span>
                    <span className="text-xs font-mono text-[var(--gold)]">{Math.round((taskStats.done / Math.max(taskStats.total, 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-[var(--navy-card)] rounded-full h-2">
                    <div
                      className="bg-[var(--gold)] h-2 rounded-full transition-all"
                      style={{ width: `${(taskStats.done / Math.max(taskStats.total, 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredTasks.map((task, i) => (
                    <div key={task.id} className="bg-[var(--navy)] rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg shrink-0 mt-0.5">
                          {task.status === "done" ? "✅" : task.status === "blocked" ? "🔴" : task.status === "in_progress" ? "🔵" : "⬜"}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-[var(--text-muted)]">#{i + 1}</span>
                            <span className={`text-xs font-mono px-2 py-0.5 rounded ${TASK_COLORS[task.status]}`}>
                              {task.status.replace("_", " ").toUpperCase()}
                            </span>
                            <span className="text-sm">{PRIORITY_ICONS[task.priority]}</span>
                            <span className="text-xs font-mono text-[var(--text-muted)]">{task.assignee}</span>
                          </div>
                          <h4 className="text-sm font-bold mb-1">{task.title}</h4>
                          <p className="text-xs text-[var(--text-muted)]">{task.description}</p>
                          {task.dependsOn && (
                            <p className="text-xs text-orange-400 mt-1">
                              Depends on: #{caseData.tasks.findIndex((t) => t.id === task.dependsOn) + 1}
                            </p>
                          )}
                          {task.dueDate && (
                            <p className="text-xs text-[var(--gold)] mt-1">Due: {task.dueDate}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ DOCUMENTS TAB ═══ */}
            {activeTab === "documents" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-bold">Document Tracker</h2>
                  <div className="flex items-center gap-2">
                    {(["all", "needed", "requested", "received", "reviewed", "filed"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setDocFilter(s)}
                        className={`text-xs font-mono px-3 py-1 rounded cursor-pointer transition-colors ${
                          docFilter === s ? "bg-[var(--gold)] text-[var(--midnight)]" : "text-[var(--text-muted)] hover:text-[var(--gold)]"
                        }`}
                      >
                        {s === "all" ? "All" : s.toUpperCase()} ({s === "all" ? caseData.documents.length : caseData.documents.filter((d) => d.status === s).length})
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredDocs.map((doc) => (
                    <div key={doc.id} className="bg-[var(--navy)] rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-xl">
                          {doc.status === "needed" ? "❌" : doc.status === "requested" ? "📤" :
                           doc.status === "received" ? "📥" : doc.status === "reviewed" ? "✅" : "📁"}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold">{doc.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-[var(--text-muted)]">{doc.category}</span>
                            {doc.notes && <span className="text-xs text-[var(--text-muted)]">· {doc.notes}</span>}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${DOC_COLORS[doc.status]}`}>
                        {doc.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Document Checklist Summary */}
                <div className="mt-6 bg-[var(--navy)] rounded-lg p-4 border border-[rgba(201,168,76,0.1)]">
                  <p className="text-xs font-mono text-[var(--gold)] mb-2">DOCUMENT COMPLETENESS</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-[var(--navy-card)] rounded-full h-2">
                        <div
                          className="bg-[var(--gold)] h-2 rounded-full transition-all"
                          style={{ width: `${(docStats.received / Math.max(docStats.total, 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[var(--gold)]">
                      {docStats.received}/{docStats.total} collected
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ NOTES TAB ═══ */}
            {activeTab === "notes" && (
              <div>
                <h2 className="font-serif text-xl font-bold mb-6">Case Notes</h2>
                {/* Pinned notes first */}
                {caseData.notes.filter((n) => n.pinned).length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-mono text-[var(--gold)] mb-3">📌 PINNED</p>
                    <div className="space-y-3">
                      {caseData.notes.filter((n) => n.pinned).map((note) => (
                        <div key={note.id} className="bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-mono text-[var(--gold)]">{note.author}</span>
                            <span className="text-xs text-[var(--text-muted)]">
                              {new Date(note.timestamp).toLocaleDateString()} {new Date(note.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* All notes */}
                <div className="space-y-3">
                  {caseData.notes.filter((n) => !n.pinned).map((note) => (
                    <div key={note.id} className="bg-[var(--navy)] rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-[var(--text-muted)]">{note.author}</span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(note.timestamp).toLocaleDateString()} {new Date(note.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-[var(--text-muted)]">{note.text}</p>
                    </div>
                  ))}
                </div>
                {caseData.notes.length === 0 && (
                  <div className="text-center py-12 text-[var(--text-muted)]">
                    <p className="text-4xl mb-2">📝</p>
                    <p>No notes yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
