"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SEED_NAMESPACE_MARQUIS, SEED_NAMESPACE_TRONFRAUD, SEED_NAMESPACE_CREAMER } from "@/lib/data/seed-platform";
import { useCommunications, useApprovals } from "@/lib/hooks";
import { use } from "react";

export default function PortalPage({
  params,
}: {
  params: Promise<{ namespace: string }>;
}) {
  const { namespace: slug } = use(params);
  const comms = useCommunications();
  const approvals = useApprovals();

  const NAMESPACES: Record<string, typeof SEED_NAMESPACE_MARQUIS> = {
    marquis: SEED_NAMESPACE_MARQUIS,
    tronfraud: SEED_NAMESPACE_TRONFRAUD,
    creamer: SEED_NAMESPACE_CREAMER,
  };

  const ns = NAMESPACES[slug] || null;

  // Pull live data for this namespace's matter
  const matterComms = comms.filter(c => c.matterId === (ns as any)?.matterId || c.tags?.some(t => t.includes(slug)));
  const matterApprovals = approvals.filter(a => a.matterId === (ns as any)?.matterId);

  if (!ns) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-[104px] pb-16 px-8">
          <div className="max-w-[800px] mx-auto text-center py-20">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-3">ACCESS DENIED</p>
            <h1 className="font-serif text-4xl font-bold mb-4">Namespace Not Found</h1>
            <p className="text-lg text-[var(--text-muted)]">
              The client workspace <span className="font-mono text-[var(--gold)]">{slug}</span> does not exist or you do not have access.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const statusColor = ns.status === "active" ? "text-[var(--success)]" : "text-[var(--gold)]";

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Portal Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-2 h-2 rounded-full ${ns.status === "active" ? "bg-[var(--success)]" : "bg-[var(--gold)]"} animate-pulse`} />
              <span className={`text-xs font-mono tracking-wider uppercase ${statusColor}`}>{ns.status}</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">·</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">{ns.caseType.replace(/_/g, " ")}</span>
            </div>
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">CLIENT PORTAL</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">{ns.title}</h1>
            {ns.subtitle && <p className="text-xl text-[var(--text-muted)]">{ns.subtitle}</p>}
            {ns.jurisdiction && (
              <p className="text-sm font-mono text-[var(--text-muted)] mt-2">{ns.jurisdiction}</p>
            )}
          </div>

          {/* Status Summary */}
          {ns.statusSummary && (
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 mb-8">
              <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-3">CURRENT STATUS</h2>
              <p className="text-lg">{ns.statusSummary}</p>
              {ns.nextAction && (
                <p className="text-sm text-[var(--gold)] mt-3 font-mono">NEXT: {ns.nextAction}</p>
              )}
            </div>
          )}

          {/* Milestones */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8 mb-8">
            <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-6">CASE MILESTONES</h2>
            <div className="space-y-4">
              {ns.milestones.filter(m => m.visibleToClient).map((milestone, i) => (
                <div key={milestone.id} className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className="flex flex-col items-center mt-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      milestone.status === "completed"
                        ? "bg-[var(--success)] border-[var(--success)]"
                        : milestone.status === "in_progress"
                        ? "border-[var(--gold)] bg-transparent"
                        : "border-[var(--text-muted)] bg-transparent"
                    }`}>
                      {milestone.status === "completed" && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {i < ns.milestones.filter(m => m.visibleToClient).length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${
                        milestone.status === "completed" ? "bg-[var(--success)]" : "bg-[var(--navy)]"
                      }`} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <h3 className={`font-bold ${milestone.status === "completed" ? "" : "text-[var(--text-muted)]"}`}>
                      {milestone.title}
                    </h3>
                    {milestone.completedAt && (
                      <p className="text-xs font-mono text-[var(--text-muted)]">
                        Completed {new Date(milestone.completedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                    {milestone.targetDate && milestone.status !== "completed" && (
                      <p className="text-xs font-mono text-[var(--gold)]">
                        Target: {milestone.targetDate}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download Packets / Secure Messages placeholder */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
              <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-4">DOCUMENTS</h2>
              {matterApprovals.length > 0 ? (
                <div className="space-y-3">
                  {matterApprovals.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-[rgba(201,168,76,0.06)] last:border-none">
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">{a.category} &middot; v{a.contentVersion}</p>
                      </div>
                      <span className={`text-xs font-mono tracking-wider uppercase ${
                        a.status === "approved" || a.status === "filed" ? "text-[var(--success)]" : "text-[var(--gold)]"
                      }`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-muted)]">
                  {ns.packets.length > 0
                    ? `${ns.packets.length} download packets available`
                    : "No documents available for download yet. Your legal team will publish case documents here as they become available."}
                </p>
              )}
            </div>
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
              <h2 className="font-serif text-sm tracking-[0.2em] uppercase text-[var(--gold)] mb-4">SECURE MESSAGES</h2>
              {matterComms.length > 0 ? (
                <div className="space-y-3">
                  {matterComms.map(c => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-[rgba(201,168,76,0.06)] last:border-none">
                      <div>
                        <p className="text-sm font-medium">{c.subject}</p>
                        <p className="text-xs text-[var(--text-muted)]">{c.channel} &middot; {new Date(c.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-mono tracking-wider uppercase ${
                        c.status === "sent" || c.status === "delivered" ? "text-[var(--success)]" :
                        c.privileged ? "text-red-400" : "text-[var(--gold)]"
                      }`}>{c.privileged ? "⚖ " : ""}{c.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-muted)]">
                  {ns.messages.length > 0
                    ? `${ns.messages.length} messages`
                    : "No messages yet. Your legal team will communicate with you through this secure channel."}
                </p>
              )}
            </div>
          </div>

          {/* Privilege Notice */}
          <div className="bg-[var(--navy)] border border-[rgba(201,168,76,0.06)] rounded-lg p-6">
            <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed">
              <span className="text-[var(--gold)]">CONFIDENTIAL:</span> This portal contains information protected by
              attorney-client privilege and work product doctrine. Unauthorized access, disclosure, or distribution
              is strictly prohibited. All access is logged and audited.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
