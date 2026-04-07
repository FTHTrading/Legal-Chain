import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ACTIVE_CASES, AGENT_NETWORK } from "@/lib/data/seed";
import { SEED_APPROVALS, SEED_INTAKES, SEED_WORKFLOW_INTAKE } from "@/lib/data/seed-platform";

export const metadata = {
  title: "Operations Console — UNYKORN // LAW",
  description: "Internal legal operations command center. Manage approvals, tasks, research, forensics, communications, and audit trails.",
};

export default function OpsPage() {
  const pendingApprovals = SEED_APPROVALS.filter(a =>
    ["in_review", "requires_source_check", "requires_attorney_review"].includes(a.status)
  ).length;
  const urgentApprovals = SEED_APPROVALS.filter(a => a.priority === "urgent").length;
  const activeIntakes = SEED_INTAKES.filter(i => !["accepted", "declined", "referred_out", "withdrawn"].includes(i.status)).length;
  const activeTasks = SEED_WORKFLOW_INTAKE.tasks.filter(t => t.status === "in_progress" || t.status === "awaiting_approval").length;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-xs font-mono tracking-wider text-[var(--text-muted)]">
                {ACTIVE_CASES.length} Active Matters · {AGENT_NETWORK.total} Agents · Chain {AGENT_NETWORK.chainId}
              </span>
            </div>
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">OPERATIONS CONSOLE</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              COMMAND<br /><span className="text-[var(--gold)]">CENTER.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl">
              Central operations hub for UNYKORN // LAW. Monitor approvals, manage workflows, track research,
              oversee forensic investigations, and audit all system activity.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Pending Approvals", value: pendingApprovals, urgent: urgentApprovals > 0, urgentCount: urgentApprovals },
              { label: "Active Intakes", value: activeIntakes },
              { label: "Active Tasks", value: activeTasks },
              { label: "Active Matters", value: ACTIVE_CASES.length },
            ].map((stat) => (
              <div key={stat.label} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 text-center">
                <p className="text-3xl font-serif font-bold text-[var(--gold)] mb-1">{stat.value}</p>
                <p className="text-xs font-mono text-[var(--text-muted)] tracking-wider">{stat.label.toUpperCase()}</p>
                {"urgent" in stat && stat.urgent && (
                  <p className="text-xs text-red-400 mt-1">{stat.urgentCount} urgent</p>
                )}
              </div>
            ))}
          </div>

          {/* Operations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Approval Center",
                description: "Review and approve all outbound legal actions, documents, and communications. Nothing leaves without human sign-off.",
                href: "/ops/approvals",
                icon: "⚖️",
                count: pendingApprovals,
                countLabel: "pending",
                priority: urgentApprovals > 0,
              },
              {
                title: "Task Manager",
                description: "Track workflow tasks across all matters. Monitor agent assignments, dependencies, and deadlines.",
                href: "/ops/tasks",
                icon: "📋",
                count: activeTasks,
                countLabel: "active",
              },
              {
                title: "Research Workbench",
                description: "Legal research queries, authority tables, case law discovery, citation verification, and jurisdiction analysis.",
                href: "/ops/research",
                icon: "🔍",
                count: 3,
                countLabel: "queries",
              },
              {
                title: "Forensics Lab",
                description: "Web3 blockchain forensics — wallet tracing, transaction analysis, evidence packaging for TRON, ETH, Polygon, and more.",
                href: "/ops/forensics",
                icon: "🔗",
                count: 1,
                countLabel: "active case",
              },
              {
                title: "Communications",
                description: "Draft, review, and send emails and secure messages. All outbound communications require approval before sending.",
                href: "/ops/communications",
                icon: "📧",
                count: 0,
                countLabel: "drafts",
              },
              {
                title: "Audit Log",
                description: "Immutable audit trail of all system actions. Every document, approval, agent action, and user login is recorded.",
                href: "/ops/audit",
                icon: "📜",
                count: 0,
                countLabel: "entries",
              },
            ].map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="block no-underline bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 card-lift group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{section.icon}</span>
                  {section.count > 0 && (
                    <span className={`text-xs font-mono px-2 py-1 rounded ${
                      section.priority ? "bg-red-900/30 text-red-400 border border-red-800/30" : "bg-[var(--navy)] text-[var(--gold)]"
                    }`}>
                      {section.count} {section.countLabel}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-[var(--gold)] transition-colors">
                  {section.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {section.description}
                </p>
              </Link>
            ))}
          </div>

          {/* Recent Activity Feed */}
          <div className="mt-12 bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
            <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-6">RECENT ACTIVITY</h2>
            <div className="space-y-4">
              {[
                { time: "2 min ago", action: "Motion to Correct Illegal Sentence escalated to attorney review", type: "approval", matter: "State v. Delcampo" },
                { time: "15 min ago", action: "GA cotenant law research completed by Research Agent", type: "research", matter: "169 Creamer Drive" },
                { time: "1 hour ago", action: "Formal demand letter draft submitted for approval", type: "document", matter: "169 Creamer Drive" },
                { time: "3 hours ago", action: "TRON wallet TFake2...suspect1 traced — 47 transactions identified", type: "forensics", matter: "NTI-LEAVITT-2026-001" },
                { time: "6 hours ago", action: "New intake submission from web form — crypto fraud screening", type: "intake", matter: "New Intake" },
              ].map((event, i) => (
                <div key={i} className="flex items-start gap-4 py-2 border-b border-[rgba(201,168,76,0.05)] last:border-0">
                  <span className="text-xs font-mono text-[var(--text-muted)] w-20 shrink-0 mt-0.5">{event.time}</span>
                  <div className="flex-1">
                    <p className="text-sm">{event.action}</p>
                    <p className="text-xs font-mono text-[var(--gold)] mt-0.5">{event.matter}</p>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    event.type === "approval" ? "text-orange-400 bg-orange-900/20" :
                    event.type === "forensics" ? "text-red-400 bg-red-900/20" :
                    event.type === "research" ? "text-blue-400 bg-blue-900/20" :
                    event.type === "intake" ? "text-green-400 bg-green-900/20" :
                    "text-[var(--gold)] bg-[var(--navy)]"
                  }`}>
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
