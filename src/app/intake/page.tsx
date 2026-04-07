"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
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
            <p className="text-lg text-[var(--text-muted)] mb-8">
              Our system has received your intake submission. A conflict check will be initiated automatically,
              and you will be contacted within 24 hours regarding next steps.
            </p>
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
                Your data is encrypted at rest and in transit. No AI-generated content will be sent to third parties
                without human attorney approval.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-4 px-8 bg-[var(--gold)] text-[var(--midnight)] font-serif font-bold text-lg rounded hover:bg-[var(--gold-light)] transition-colors cursor-pointer"
            >
              SUBMIT INTAKE
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
