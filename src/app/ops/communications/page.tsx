"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface CommDraft {
  id: string;
  type: "email" | "letter" | "secure_message";
  subject: string;
  to: string;
  matterId: string;
  matterName: string;
  status: "drafting" | "pending_review" | "approved" | "sent";
  privileged: boolean;
  body: string;
  createdAt: string;
}

const DEMO_COMMS: CommDraft[] = [
  {
    id: "comm-1",
    type: "email",
    subject: "Formal Demand — Unauthorized Occupancy of 169 Creamer Drive, Statesboro GA",
    to: "troy.miller@email.com",
    matterId: "c7f3a1b2-8d4e-4f5a-9c6b-1d2e3f4a5b6c",
    matterName: "169 Creamer Drive",
    status: "pending_review",
    privileged: false,
    body: "Dear Mr. Miller,\n\nThis firm represents the cotenant owners of the property at 169 Creamer Drive, Statesboro, Georgia 30458. This letter serves as formal demand that you vacate the premises within thirty (30) days of receipt of this notice...",
    createdAt: "2026-04-03T10:00:00Z",
  },
  {
    id: "comm-2",
    type: "secure_message",
    subject: "Case Status Update — Motion Filing Timeline",
    to: "client:marquis-delcampo",
    matterId: "d8e4b2c3-9f5e-4a6b-8d7c-2e3f4a5b6c7d",
    matterName: "State v. Delcampo",
    status: "drafting",
    privileged: true,
    body: "Dear Mr. Delcampo,\n\nThis is a privileged communication regarding your pending motion. We have completed the initial review of your sentencing records and identified multiple grounds for relief under Georgia state law...",
    createdAt: "2026-04-03T14:30:00Z",
  },
  {
    id: "comm-3",
    type: "letter",
    subject: "Victim Impact Statement — Cryptocurrency Fraud Investigation",
    to: "FBI IC3 / TRON Foundation Compliance",
    matterId: "e9f5c3d4-0a6f-4b7c-9e8d-3f4a5b6c7d8e",
    matterName: "NTI-LEAVITT-2026-001",
    status: "drafting",
    privileged: false,
    body: "To Whom It May Concern,\n\nThis letter accompanies a formal complaint regarding cryptocurrency fraud perpetrated through the TRON blockchain network. Our client has suffered documented losses of approximately $36,150 USD...",
    createdAt: "2026-04-02T16:00:00Z",
  },
];

export default function CommunicationsPage() {
  const [filter, setFilter] = useState<"all" | "email" | "letter" | "secure_message">("all");
  const filtered = filter === "all" ? DEMO_COMMS : DEMO_COMMS.filter(c => c.type === filter);

  const statusBadge = (status: string) => {
    const m: Record<string, string> = {
      drafting: "text-gray-400 bg-gray-900/20",
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
            <button className="px-4 py-2 bg-[var(--gold)] text-[var(--midnight)] rounded text-xs font-mono tracking-wider hover:bg-[var(--gold-light)] transition-colors cursor-pointer">
              + NEW DRAFT
            </button>
          </div>

          {/* Communications List */}
          <div className="space-y-4">
            {filtered.map(comm => (
              <div key={comm.id} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 card-lift">
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0">{typeIcon(comm.type)}</span>
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
                      <span className="text-xs font-mono text-[var(--text-muted)]">{comm.type.replace(/_/g, " ")}</span>
                    </div>
                    <h3 className="font-serif text-base font-bold mb-1">{comm.subject}</h3>
                    <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)] mb-3">
                      <span>To: {comm.to}</span>
                      <span>Matter: <span className="text-[var(--gold)]">{comm.matterName}</span></span>
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
                    <button className="px-3 py-1.5 bg-transparent border border-[rgba(201,168,76,0.2)] text-[var(--text-muted)] rounded text-xs font-mono hover:border-[var(--gold)] hover:text-white transition-colors cursor-pointer">
                      EDIT
                    </button>
                    {comm.status === "drafting" && (
                      <button className="px-3 py-1.5 bg-[var(--gold)] text-[var(--midnight)] rounded text-xs font-mono hover:bg-[var(--gold-light)] transition-colors cursor-pointer">
                        SUBMIT
                      </button>
                    )}
                    {comm.status === "pending_review" && (
                      <button className="px-3 py-1.5 bg-green-800/30 text-green-400 rounded text-xs font-mono hover:bg-green-800/40 transition-colors cursor-pointer">
                        APPROVE
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
    </>
  );
}
