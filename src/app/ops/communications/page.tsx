"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCommunications, useToast } from "@/lib/hooks";
import { store } from "@/lib/store";
import { Modal, Button, ToastContainer } from "@/components/ui";
import { SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON } from "@/lib/data/seed";

const MATTERS = [SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON];

export default function CommunicationsPage() {
  const comms = useCommunications();
  const { toasts, toast } = useToast();
  const [filter, setFilter] = useState<"all" | "email" | "letter" | "secure_message">("all");
  const [editModal, setEditModal] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [newDraftModal, setNewDraftModal] = useState(false);
  const [newDraft, setNewDraft] = useState({ subject: "", to: "", channel: "email" as string, body: "", privileged: false, matterId: "" });
  const filtered = filter === "all" ? comms : comms.filter(c => c.channel === filter);

  const statusBadge = (status: string) => {
    const m: Record<string, string> = {
      drafting: "text-gray-400 bg-gray-900/20",
      draft: "text-gray-400 bg-gray-900/20",
      pending_review: "text-yellow-400 bg-yellow-900/20",
      approved: "text-green-400 bg-green-900/20",
      sent: "text-blue-400 bg-blue-900/20",
    };
    return m[status] || "text-gray-400 bg-gray-900/20";
  };

  const typeIcon = (type: string) => {
    const m: Record<string, string> = { email: "📧", letter: "📄", secure_message: "🔒" };
    return m[type] || "📧";
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">OPERATIONS › COMMUNICATIONS</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              COMMUNICATIONS<br /><span className="text-[var(--gold)]">CENTER.</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-2xl">
              Draft, review, and dispatch all outbound communications. Every email, letter, and secure message
              requires approval before sending. Privileged communications are marked and protected.
            </p>
          </div>

          {/* Filter + New */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
              {(["all", "email", "letter", "secure_message"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-2 rounded text-xs font-mono tracking-wider border transition-colors cursor-pointer ${
                    filter === t
                      ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)]"
                      : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:border-[var(--gold)] hover:text-white"
                  }`}
                >
                  {t === "all" ? "ALL" : t.replace(/_/g, " ").toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={() => { setNewDraftModal(true); setNewDraft({ subject: "", to: "", channel: "email", body: "", privileged: false, matterId: "" }); }} className="px-4 py-2 bg-[var(--gold)] text-[var(--midnight)] rounded text-xs font-mono tracking-wider hover:bg-[var(--gold-light)] transition-colors cursor-pointer">
              + NEW DRAFT
            </button>
          </div>

          {/* Communications List */}
          <div className="space-y-4">
            {filtered.map(comm => (
              <div key={comm.id} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 card-lift">
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0">{typeIcon(comm.channel)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${statusBadge(comm.status)}`}>
                        {comm.status.replace(/_/g, " ")}
                      </span>
                      {comm.privileged && (
                        <span className="text-xs font-mono text-red-400 border border-red-800/30 px-2 py-0.5 rounded">
                          PRIVILEGED
                        </span>
                      )}
                      <span className="text-xs font-mono text-[var(--text-muted)]">{comm.channel.replace(/_/g, " ")}</span>
                    </div>
                    <h3 className="font-serif text-base font-bold mb-1">{comm.subject}</h3>
                    <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)] mb-3">
                      <span>To: {comm.to}</span>
                      <span>Matter: <span className="text-[var(--gold)]">{comm.matterId}</span></span>
                      <span>{new Date(comm.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Preview */}
                    <div className="bg-[var(--navy)] rounded p-4 border border-[rgba(201,168,76,0.05)]">
                      <p className="text-sm text-[var(--text-muted)] whitespace-pre-line leading-relaxed line-clamp-3">
                        {comm.body}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => { setEditModal(comm.id); setEditBody(comm.body); }} className="px-3 py-1.5 bg-transparent border border-[rgba(201,168,76,0.2)] text-[var(--text-muted)] rounded text-xs font-mono hover:border-[var(--gold)] hover:text-white transition-colors cursor-pointer">
                      EDIT
                    </button>
                    {comm.status === "draft" && (
                      <button onClick={() => { store.updateCommStatus(comm.id, "pending_review"); toast("info", "Submitted", `"${comm.subject}" submitted for review`); }} className="px-3 py-1.5 bg-[var(--gold)] text-[var(--midnight)] rounded text-xs font-mono hover:bg-[var(--gold-light)] transition-colors cursor-pointer">
                        SUBMIT
                      </button>
                    )}
                    {comm.status === "pending_review" && (
                      <button onClick={() => { store.updateCommStatus(comm.id, "approved"); toast("success", "Approved", `"${comm.subject}" approved for dispatch`); }} className="px-3 py-1.5 bg-green-800/30 text-green-400 rounded text-xs font-mono hover:bg-green-800/40 transition-colors cursor-pointer">
                        APPROVE
                      </button>
                    )}
                    {comm.status === "approved" && (
                      <button onClick={() => { store.updateCommStatus(comm.id, "sent"); toast("success", "Sent", `"${comm.subject}" dispatched successfully`); }} className="px-3 py-1.5 bg-blue-800/30 text-blue-400 rounded text-xs font-mono hover:bg-blue-800/40 transition-colors cursor-pointer">
                        SEND
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-[rgba(201,168,76,0.1)] pt-6">
            <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed">
              OUTBOUND CONTROL: No communication leaves this system without human approval. Privileged communications are
              encrypted at rest and marked with attorney-client privilege headers. All drafts, revisions, and approvals are
              recorded in the immutable audit log with full provenance tracking.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Communication" size="lg" actions={<><Button variant="ghost" onClick={() => setEditModal(null)}>Cancel</Button><Button variant="primary" onClick={() => { if (editModal) { store.updateCommBody(editModal, editBody); toast("success", "Saved", "Communication updated"); setEditModal(null); } }}>Save</Button></>}>
        <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} className="w-full bg-[var(--midnight)] border border-[var(--gold)]/20 rounded-lg px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--gold)]/50 min-h-[200px] resize-y font-mono" />
      </Modal>
      <Modal open={newDraftModal} onClose={() => setNewDraftModal(false)} title="New Communication Draft" size="md" actions={<><Button variant="ghost" onClick={() => setNewDraftModal(false)}>Cancel</Button><Button variant="primary" onClick={() => { if (!newDraft.subject.trim() || !newDraft.to.trim()) return; store.createCommunication({ channel: newDraft.channel, subject: newDraft.subject, to: newDraft.to, privileged: newDraft.privileged, workProduct: false, matterId: newDraft.matterId, body: newDraft.body }); toast("success", "Draft Created", `"${newDraft.subject}" created`); setNewDraftModal(false); }}>Create Draft</Button></>}>
        <div className="space-y-3">
          <div><label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Matter</label><select value={newDraft.matterId} onChange={(e) => setNewDraft(p => ({ ...p, matterId: e.target.value }))} className="w-full bg-[var(--midnight)] border border-[var(--gold)]/20 rounded px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--gold)]/50"><option value="">— Select Matter —</option>{MATTERS.map(m => (<option key={m.id} value={m.id}>{m.matterId} — {m.title}</option>))}</select></div>
          <div><label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Subject</label><input value={newDraft.subject} onChange={(e) => setNewDraft(p => ({ ...p, subject: e.target.value }))} className="w-full bg-[var(--midnight)] border border-[var(--gold)]/20 rounded px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--gold)]/50" /></div>
          <div><label className="block text-xs font-mono text-[var(--text-muted)] mb-1">To</label><input value={newDraft.to} onChange={(e) => setNewDraft(p => ({ ...p, to: e.target.value }))} className="w-full bg-[var(--midnight)] border border-[var(--gold)]/20 rounded px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--gold)]/50" /></div>
          <div><label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Type</label><select value={newDraft.channel} onChange={(e) => setNewDraft(p => ({ ...p, channel: e.target.value }))} className="w-full bg-[var(--midnight)] border border-[var(--gold)]/20 rounded px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--gold)]/50"><option value="email">Email</option><option value="letter">Letter</option><option value="secure_message">Secure Message</option></select></div>
          <div><label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Body</label><textarea value={newDraft.body} onChange={(e) => setNewDraft(p => ({ ...p, body: e.target.value }))} className="w-full bg-[var(--midnight)] border border-[var(--gold)]/20 rounded px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--gold)]/50 min-h-[120px] resize-y" /></div>
          <label className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]"><input type="checkbox" checked={newDraft.privileged} onChange={(e) => setNewDraft(p => ({ ...p, privileged: e.target.checked }))} /> Privileged Communication</label>
        </div>
      </Modal>
      <ToastContainer toasts={toasts} />
    </>
  );
}
