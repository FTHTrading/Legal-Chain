"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { store, type Priority } from "@/lib/store";
import { useToast } from "@/lib/hooks";
import { ToastContainer } from "@/components/ui";

const MATTER_TYPES = [
  { value: "civil_property", label: "Civil — Property Dispute" },
  { value: "criminal_appeal", label: "Criminal Appeal" },
  { value: "wrongful_charge", label: "Wrongful Charge Defense" },
  { value: "crypto_fraud", label: "Cryptocurrency Fraud" },
  { value: "smart_contract", label: "Smart Contract / Web3" },
  { value: "business_dispute", label: "Business Dispute" },
  { value: "personal_injury", label: "Personal Injury" },
  { value: "other", label: "Other" },
];

const URGENCY_LEVELS = [
  { value: "routine", label: "Routine", color: "text-[var(--text-muted)]" },
  { value: "elevated", label: "Elevated", color: "text-[var(--gold)]" },
  { value: "urgent", label: "Urgent", color: "text-orange-400" },
  { value: "emergency", label: "Emergency", color: "text-red-400" },
];

export default function IntakePage() {
  const [submitted, setSubmitted] = useState(false);
  const [caseRef, setCaseRef] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [investigationStatus, setInvestigationStatus] = useState<string>("launching");
  const [privateToken, setPrivateToken] = useState<string | null>(null);
  const { toasts, toast } = useToast();
  const [formData, setFormData] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    matterType: "",
    jurisdiction: "",
    urgency: "routine",
    briefDescription: "",
    adversePartyName: "",
    estimatedValue: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => { const next = { ...prev }; delete next[e.target.name]; return next; });
  }

  const launchInvestigation = useCallback(async (record: { caseReference: string; clientName: string; email: string; phone: string; matterType: string; description: string }) => {
    try {
      setInvestigationStatus("launching");
      const res = await fetch("/api/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: "wf-intake-investigation",
          matterId: record.caseReference,
          input: {
            clientName: record.clientName,
            email: record.email,
            phone: record.phone,
            matterType: record.matterType,
            description: record.description,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setInvestigationId(data.id);
        setPrivateToken(data.privateLink?.token || null);
        setInvestigationStatus("running");
      } else {
        setInvestigationStatus("queued");
      }
    } catch {
      setInvestigationStatus("queued");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!formData.contactName.trim()) errs.contactName = "Full name is required";
    if (!formData.matterType) errs.matterType = "Case type is required";
    if (!formData.briefDescription.trim()) errs.briefDescription = "Case description is required";
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) errs.contactEmail = "Invalid email address";
    if (formData.contactPhone && !/^[\d\s\-().+]+$/.test(formData.contactPhone)) errs.contactPhone = "Invalid phone number";
    if (formData.estimatedValue && (isNaN(Number(formData.estimatedValue)) || Number(formData.estimatedValue) < 0)) errs.estimatedValue = "Value must be a positive number";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const record = store.createIntake({
        clientName: formData.contactName.trim(),
        email: formData.contactEmail.trim(),
        phone: formData.contactPhone.trim(),
        matterType: formData.matterType,
        urgency: formData.urgency as Priority,
        description: formData.briefDescription.trim(),
      });
      setCaseRef(record.caseReference);
      toast("success", "Intake Submitted", `Case ${record.caseReference} created successfully`);
      setSubmitted(true);
      // Auto-launch AI investigation workflow
      launchInvestigation({
        caseReference: record.caseReference,
        clientName: formData.contactName.trim(),
        email: formData.contactEmail.trim(),
        phone: formData.contactPhone.trim(),
        matterType: formData.matterType,
        description: formData.briefDescription.trim(),
      });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-[104px] pb-16 px-8">
          <div className="max-w-[700px] mx-auto text-center py-20">
            <div className="w-16 h-16 rounded-full bg-[var(--success)] mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-3">INTAKE RECEIVED</p>
            <h1 className="font-serif text-4xl font-bold mb-4">Your case is in the queue.</h1>
            {caseRef && (
              <div className="inline-block bg-[var(--navy-card)] border border-[var(--gold)]/20 rounded-lg px-6 py-3 mb-6">
                <p className="text-xs text-[var(--text-muted)] mb-1">CASE REFERENCE</p>
                <p className="text-xl font-mono text-[var(--gold)] font-bold">{caseRef}</p>
              </div>
            )}
            <p className="text-lg text-[var(--text-muted)] mb-8">
              Our AI system has secured your data in the Web3 Privacy Vault and initiated
              an automated preliminary investigation. No personal information is stored in plaintext.
            </p>

            {/* Web3 Security Badge */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-[var(--navy)] border border-emerald-500/30 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400">WEB3 VAULT SECURED</span>
              </div>
              <div className="flex items-center gap-2 bg-[var(--navy)] border border-[var(--gold)]/30 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-[var(--gold)]" />
                <span className="text-xs font-mono text-[var(--gold)]">AES-256-GCM</span>
              </div>
            </div>

            {/* Investigation Status */}
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 text-left mb-6">
              <p className="font-mono text-xs text-[var(--text-muted)] mb-3">AI INVESTIGATION STATUS</p>
              <div className="flex items-center gap-3 mb-4">
                {investigationStatus === "running" && (
                  <>
                    <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-sm text-blue-400">Investigation Active</span>
                  </>
                )}
                {investigationStatus === "launching" && (
                  <>
                    <span className="w-3 h-3 rounded-full bg-[var(--gold)] animate-pulse" />
                    <span className="text-sm text-[var(--gold)]">Launching Investigation...</span>
                  </>
                )}
                {investigationStatus === "queued" && (
                  <>
                    <span className="w-3 h-3 rounded-full bg-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-muted)]">Queued for Review</span>
                  </>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                  <span>PII encrypted &amp; vaulted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${investigationStatus === "running" ? "bg-[var(--success)]" : "bg-[var(--gold)] animate-pulse"}`} />
                  <span>Conflict check</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${investigationStatus === "running" ? "bg-blue-400 animate-pulse" : "bg-[var(--text-muted)]"}`} />
                  <span>Jurisdiction analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                  <span>Legal research</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                  <span>Preliminary report generation</span>
                </div>
              </div>
            </div>

            {/* Private Link */}
            {privateToken && (
              <div className="bg-[var(--navy-card)] border border-[var(--gold)]/20 rounded-lg p-6 text-left mb-6">
                <p className="font-mono text-xs text-[var(--gold)] mb-2">PRIVATE ACCESS LINK</p>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  This link provides secure access to your case. It expires in 30 days. Save it — it will not be shown again.
                </p>
                <code className="block bg-[var(--navy)] border border-[rgba(201,168,76,0.1)] rounded px-4 py-2 text-xs text-[var(--gold)] break-all">
                  {typeof window !== "undefined" ? `${window.location.origin}/api/cases/private?token=${privateToken}` : privateToken}
                </code>
              </div>
            )}

            {/* Investigation ID */}
            {investigationId && (
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-4 text-left mb-6">
                <p className="font-mono text-xs text-[var(--text-muted)] mb-1">INVESTIGATION ID</p>
                <code className="text-xs text-[var(--text-muted)]">{investigationId}</code>
              </div>
            )}

            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 text-left">
              <p className="font-mono text-xs text-[var(--text-muted)] mb-2">STATUS PIPELINE</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                <span>Submitted</span>
                <span className="text-[var(--text-muted)]">→</span>
                <span className="text-[var(--gold)]">Screening</span>
                <span className="text-[var(--text-muted)]">→</span>
                <span className="text-[var(--text-muted)]">Conflict Check</span>
                <span className="text-[var(--text-muted)]">→</span>
                <span className="text-[var(--text-muted)]">Review</span>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">CLIENT INTAKE</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              BEGIN YOUR<br /><span className="text-[var(--gold)]">CASE.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl">
              Submit your case details below. All information is protected by attorney-client privilege.
              Our AI intake system will screen, conflict-check, and route your matter to the appropriate team.
            </p>
          </div>

          {/* Intake Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <section className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
              <h2 className="font-serif text-xl font-bold mb-6 text-[var(--gold)]">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-mono text-[var(--text-muted)] mb-2">Full Name *</label>
                  <input
                    type="text" name="contactName" required value={formData.contactName} onChange={handleChange}
                    className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.15)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                    placeholder="Your full legal name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-[var(--text-muted)] mb-2">Email</label>
                  <input
                    type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                    className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.15)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-[var(--text-muted)] mb-2">Phone</label>
                  <input
                    type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange}
                    className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.15)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>
            </section>

            {/* Case Details */}
            <section className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-8">
              <h2 className="font-serif text-xl font-bold mb-6 text-[var(--gold)]">Case Details</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-mono text-[var(--text-muted)] mb-2">Case Type *</label>
                  <select
                    name="matterType" required value={formData.matterType} onChange={handleChange}
                    className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.15)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                  >
                    <option value="">Select case type...</option>
                    {MATTER_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-mono text-[var(--text-muted)] mb-2">Jurisdiction</label>
                  <input
                    type="text" name="jurisdiction" value={formData.jurisdiction} onChange={handleChange}
                    className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.15)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                    placeholder="e.g. Fulton County, GA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-[var(--text-muted)] mb-2">Urgency Level</label>
                  <select
                    name="urgency" value={formData.urgency} onChange={handleChange}
                    className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.15)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                  >
                    {URGENCY_LEVELS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-mono text-[var(--text-muted)] mb-2">Estimated Value ($)</label>
                  <input
                    type="text" name="estimatedValue" value={formData.estimatedValue} onChange={handleChange}
                    className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.15)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                    placeholder="Amount in dispute"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-mono text-[var(--text-muted)] mb-2">Adverse Party Name</label>
                <input
                  type="text" name="adversePartyName" value={formData.adversePartyName} onChange={handleChange}
                  className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.15)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                  placeholder="Name of the opposing party (if known)"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-[var(--text-muted)] mb-2">Case Description *</label>
                <textarea
                  name="briefDescription" required value={formData.briefDescription} onChange={handleChange}
                  rows={6}
                  className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.15)] rounded px-4 py-3 text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors resize-none"
                  placeholder="Describe your situation in detail. Include dates, parties involved, and what outcome you seek. All information shared is confidential."
                />
              </div>
            </section>

            {/* Privilege Notice */}
            <div className="bg-[var(--navy)] border border-[rgba(201,168,76,0.08)] rounded-lg p-6">
              <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed">
                <span className="text-[var(--gold)]">PRIVILEGE NOTICE:</span> All information submitted through this intake form
                is protected by attorney-client privilege. This submission does not create an attorney-client relationship.
                Your data is encrypted with AES-256-GCM and stored in a Web3 Privacy Vault — no plaintext PII is retained.
                Private access links use HMAC-signed tokens with time-limited expiry. No AI-generated content will be sent
                to third parties without human attorney approval.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-8 bg-[var(--gold)] text-[var(--midnight)] font-serif font-bold text-lg rounded hover:bg-[var(--gold-light)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "SUBMITTING..." : "SUBMIT INTAKE"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
      <ToastContainer toasts={toasts} />
    </>
  );
}
