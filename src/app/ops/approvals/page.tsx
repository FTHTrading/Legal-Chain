"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useApprovals, useToast } from "@/lib/hooks";
import { store } from "@/lib/store";
import { Modal, Button, ToastContainer } from "@/components/ui";

type FilterStatus = "all" | "in_review" | "requires_source_check" | "requires_attorney_review" | "approved" | "rejected";

export default function ApprovalsPage() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [actionModal, setActionModal] = useState<{ id: string; action: "approve" | "reject" | "revise" } | null>(null);
  const [actionComment, setActionComment] = useState("");
  const { toasts, toast } = useToast();
  const approvals = useApprovals();

  const filtered = statusFilter === "all"
    ? approvals
    : approvals.filter(a => a.status === statusFilter);

  function handleAction() {
    if (!actionModal) return;
    const { id, action } = actionModal;
    if (action === "approve") { store.approveItem(id, actionComment); toast("success", "Approved", "Item has been approved"); }
    else if (action === "reject") { if (!actionComment.trim()) return; store.rejectItem(id, actionComment); toast("warning", "Rejected", "Item has been rejected"); }
    else { if (!actionComment.trim()) return; store.requestChanges(id, actionComment); toast("info", "Revision Requested", "Changes have been requested"); }
    setActionModal(null);
    setActionComment("");
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "text-gray-400 bg-gray-900/20",
      in_review: "text-yellow-400 bg-yellow-900/20",
      requires_source_check: "text-orange-400 bg-orange-900/20",
      requires_attorney_review: "text-red-400 bg-red-900/20",
      approved: "text-green-400 bg-green-900/20",
      sent: "text-blue-400 bg-blue-900/20",
      filed: "text-blue-400 bg-blue-900/20",
      rejected: "text-red-400 bg-red-900/20",
    };
    return colors[status] || "text-gray-400 bg-gray-900/20";
  };

  const priorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      routine: "text-gray-400",
      elevated: "text-yellow-400",
      urgent: "text-red-400",
      court_deadline: "text-red-500 font-bold",
    };
    return colors[priority] || "text-gray-400";
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">OPERATIONS › APPROVALS</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              APPROVAL<br /><span className="text-[var(--gold)]">CENTER.</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-2xl">
              Every outbound legal action, communication, and document requires human approval.
              Nothing leaves this system without attorney sign-off.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 mb-8">
            {(["all", "in_review", "requires_source_check", "requires_attorney_review", "approved", "rejected"] as FilterStatus[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded text-xs font-mono tracking-wider border transition-colors cursor-pointer ${
                  statusFilter === s
                    ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)]"
                    : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:border-[var(--gold)] hover:text-white"
                }`}
              >
                {s === "all" ? "ALL" : s.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}
          </div>

          {/* Approval Queue */}
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-12 text-center">
                <p className="text-[var(--text-muted)] font-mono text-sm">No items match the selected filter.</p>
              </div>
            )}
            {filtered.map((item) => (
              <div key={item.id} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 card-lift">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Left: Item Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${statusBadge(item.status)}`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                      <span className={`text-xs font-mono ${priorityBadge(item.priority)}`}>
                        ● {item.priority.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-mono text-[var(--text-muted)]">{item.category.replace(/_/g, " ")}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-3">{item.summary}</p>

                    {/* Matter Link */}
                    <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                      <span>Matter: <span className="text-[var(--gold)]">{(item.matterId ?? "").slice(0, 8)}…</span></span>
                      <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                      <span>By: {item.submittedBy}</span>
                    </div>

                    {/* Provenance */}
                    <div className="mt-4 p-4 bg-[var(--navy)] rounded border border-[rgba(201,168,76,0.05)]">
                      <p className="text-xs font-mono text-[var(--gold)] mb-2">PROVENANCE</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-[var(--text-muted)]">Confidence</p>
                          <p className="font-mono">{((item.confidenceScore ?? 0) * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)]">Source Citations</p>
                          <p className="font-mono">{item.citations.length}</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)]">Agent Generated</p>
                          <p className="font-mono">{item.submittedBy.includes("Agent") ? "Yes" : "No"}</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)]">Reviews</p>
                          <p className="font-mono">{item.reviews.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Source Citations */}
                    {item.citations.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-mono text-[var(--gold)]">CITATIONS</p>
                        {item.citations.map((cite, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-[var(--text-muted)] font-mono">[{cite.citationType}]</span>
                            <span>{cite.source}</span>
                            <span className="text-[var(--text-muted)]">{cite.pinCite}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    {item.status !== "approved" && item.status !== "rejected" && item.status !== "sent" && (
                      <>
                        <button onClick={() => { setActionModal({ id: item.id, action: "approve" }); setActionComment(""); }} className="px-4 py-2 bg-[var(--gold)] text-[var(--midnight)] rounded text-xs font-mono tracking-wider hover:bg-[var(--gold-light)] transition-colors cursor-pointer">
                          APPROVE
                        </button>
                        <button onClick={() => { setActionModal({ id: item.id, action: "reject" }); setActionComment(""); }} className="px-4 py-2 bg-transparent border border-red-800/30 text-red-400 rounded text-xs font-mono tracking-wider hover:bg-red-900/20 transition-colors cursor-pointer">
                          REJECT
                        </button>
                        <button onClick={() => { setActionModal({ id: item.id, action: "revise" }); setActionComment(""); }} className="px-4 py-2 bg-transparent border border-[rgba(201,168,76,0.2)] text-[var(--text-muted)] rounded text-xs font-mono tracking-wider hover:border-[var(--gold)] hover:text-white transition-colors cursor-pointer">
                          REQUEST REVISION
                        </button>
                      </>
                    )}
                    {item.reviews.length > 0 && (
                      <div className="mt-2 text-xs text-[var(--text-muted)]">
                        <p className="font-mono text-[var(--gold)] mb-1">REVIEWS ({item.reviews.length})</p>
                        {item.reviews.map((rev, i) => (
                          <div key={i} className="mb-1">
                            <span className="font-mono">{rev.reviewerId.slice(0, 8)}…</span>
                            <span className="ml-1 text-[var(--text-muted)]">{rev.decision}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Governance Notice */}
          <div className="mt-8 border-t border-[rgba(201,168,76,0.1)] pt-6">
            <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed">
              GOVERNANCE: All approval decisions are permanently recorded in the audit log with cryptographic hash chain integrity.
              Attorney-client privilege applies to all documents in this queue. Approved documents are signed with provenance metadata
              before dispatch. Rejections require written rationale.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={actionModal?.action === "approve" ? "Confirm Approval" : actionModal?.action === "reject" ? "Reject Item" : "Request Revision"} size="sm" actions={<><Button variant="ghost" onClick={() => setActionModal(null)}>Cancel</Button><Button variant={actionModal?.action === "reject" ? "danger" : "primary"} onClick={handleAction}>{actionModal?.action === "approve" ? "Approve" : actionModal?.action === "reject" ? "Reject" : "Request Changes"}</Button></>}>
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-muted)]">{actionModal?.action === "approve" ? "Add optional comments:" : "Provide rationale (required):"}</p>
          <textarea value={actionComment} onChange={(e) => setActionComment(e.target.value)} placeholder={actionModal?.action === "approve" ? "Optional comments..." : "Required rationale..."} className="w-full bg-[var(--midnight)] border border-[var(--gold)]/20 rounded-lg px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--gold)]/50 min-h-[80px] resize-y" />
        </div>
      </Modal>
      <ToastContainer toasts={toasts} />
    </>
  );
}
