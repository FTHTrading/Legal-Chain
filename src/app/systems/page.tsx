'use client';

import Link from 'next/link';
import { FIRM } from '@/lib/firm';
import {
  Scale, FileCheck, FileText, Shield, Camera, BarChart3,
  Search, FileOutput, CheckSquare, Fingerprint, Mail, Radio,
  ArrowRight, ArrowDown, Layers,
} from 'lucide-react';

// ── System Definitions ──────────────────────────────────────────────

interface SystemDef {
  id: string;
  name: string;
  icon: React.ElementType;
  accent: string;
  purpose: string;
  when: string;
  inputs: string[];
  outputs: string[];
  advancement: string;
  facing: 'client' | 'internal' | 'both';
  href?: string;
}

const SYSTEMS: SystemDef[] = [
  {
    id: 'rapid-intake',
    name: 'Rapid Intake',
    icon: FileCheck,
    accent: '#34d399',
    purpose: 'Collect case information from clients and the public as fast as possible — mobile-first, QR-accessible, no login required.',
    when: 'When a new matter arises. A client scans a QR code, fills out a form, or calls in. The first touch point.',
    inputs: ['Client name and contact', 'Issue description', 'Urgency level', 'Jurisdiction', 'Uploaded documents or photos'],
    outputs: ['Intake record', 'Conflict check trigger', 'Matter draft', 'Confirmation receipt', 'Audit log entry'],
    advancement: 'Creates the matter record that every other system depends on. Without intake, nothing moves.',
    facing: 'client',
    href: '/rapid-intake',
  },
  {
    id: 'demand-letter-engine',
    name: 'Demand Letter Engine',
    icon: FileText,
    accent: '#60a5fa',
    purpose: 'Generate professional, jurisdiction-aware demand letters from structured client input using AI drafting agents.',
    when: 'After intake is accepted and a civil claim is identified — consumer disputes, landlord issues, employer conflicts, debt collection.',
    inputs: ['Matter details', 'Adverse party info', 'Claim type', 'Damages amount', 'Supporting evidence references'],
    outputs: ['Draft demand letter (Markdown/PDF)', 'Source citations', 'Approval request', 'Audit trail'],
    advancement: 'Moves the case from investigation to pre-litigation. A demand letter is often the first formal legal action.',
    facing: 'both',
    href: '/demand-letter',
  },
  {
    id: 'crypto-recovery',
    name: 'Crypto Recovery System',
    icon: Shield,
    accent: '#a78bfa',
    purpose: 'Track stolen cryptocurrency across chains, build forensic evidence packages, and generate recovery reports for law enforcement.',
    when: 'When a client reports crypto fraud, wallet theft, rug pull, or exchange exploitation.',
    inputs: ['Wallet addresses', 'Transaction hashes', 'Chain identifiers', 'Exchange accounts', 'Screenshots and receipts'],
    outputs: ['Traced wallet map', 'Transaction flow analysis', 'Risk-scored entities', 'Forensic evidence bundle', 'Law enforcement report'],
    advancement: 'Provides the forensic proof needed to pursue recovery — through exchanges, law enforcement, or civil action.',
    facing: 'both',
    href: '/crypto-recovery',
  },
  {
    id: 'evidence-timeline',
    name: 'Evidence Timeline / Evidence Drop',
    icon: Camera,
    accent: '#fbbf24',
    purpose: 'Capture, timestamp, hash, and preserve evidence before it can be altered or destroyed. Build a chronological evidence chain.',
    when: 'Continuously — from first contact through case resolution. Clients can upload evidence at any time.',
    inputs: ['Photos, documents, screenshots', 'Text messages, emails', 'Voice notes', 'Blockchain records', 'Metadata'],
    outputs: ['Timestamped evidence records', 'SHA-256 content hashes', 'Chain-of-custody log', 'Evidence timeline view', 'Proof receipts'],
    advancement: 'Creates the evidentiary foundation. Every claim needs evidence — this system makes sure nothing is lost.',
    facing: 'both',
    href: '/evidence-timeline',
  },
  {
    id: 'client-portal',
    name: 'Client Status Portal',
    icon: BarChart3,
    accent: '#f472b6',
    purpose: 'Give clients and families a private, real-time view of their case status, milestones, documents, and next steps.',
    when: 'After a matter is created and a namespace is provisioned. Available 24/7 for the duration of the case.',
    inputs: ['Matter status updates', 'Milestone completions', 'Document releases', 'Task assignments', 'Secure messages'],
    outputs: ['Status dashboard', 'Timeline view', 'Document downloads', 'Acknowledgment confirmations', 'Message threads'],
    advancement: 'Keeps clients informed and engaged without manual follow-up. Reduces status inquiry calls.',
    facing: 'client',
  },
  {
    id: 'matter-orchestrator',
    name: 'Matter Orchestrator',
    icon: Layers,
    accent: '#2dd4bf',
    purpose: 'Manage the full lifecycle of a legal matter — parties, claims, deadlines, jurisdiction, recovery paths, and assigned personnel.',
    when: 'From the moment intake is accepted through case closure. The central nervous system of every matter.',
    inputs: ['Intake data', 'Party information', 'Claim elements', 'Court deadlines', 'Jurisdiction analysis'],
    outputs: ['Matter record', 'Party roster', 'Claim strength scores', 'Deadline calendar', 'Assignment matrix', 'Status transitions'],
    advancement: 'Coordinates all other systems. The orchestrator decides what happens next and who does it.',
    facing: 'internal',
    href: '/law',
  },
  {
    id: 'research-citations',
    name: 'Research + Citation Verification',
    icon: Search,
    accent: '#38bdf8',
    purpose: 'Execute legal research queries, find authorities, verify citations, and Shepardize case law to ensure accuracy.',
    when: 'During document drafting, motion preparation, or when evaluating claim strength against precedent.',
    inputs: ['Natural language legal queries', 'Jurisdiction filters', 'Topic tags', 'Date ranges', 'Linked claims'],
    outputs: ['Legal authorities with relevance scores', 'Verified citation status', 'Shepardization results', 'Authority tables', 'Good law confirmation'],
    advancement: 'Ensures every legal argument is backed by verified, current authority. Prevents citing overturned or irrelevant law.',
    facing: 'internal',
    href: '/ops/research',
  },
  {
    id: 'document-engine',
    name: 'Document Generation Engine',
    icon: FileOutput,
    accent: '#818cf8',
    purpose: 'Generate professional legal documents — motions, briefs, complaints, affidavits, settlement agreements — from structured matter data.',
    when: 'When a legal filing, client communication, or internal memo needs to be drafted.',
    inputs: ['Matter context', 'Document type', 'Referenced evidence', 'Legal authorities', 'Template selection'],
    outputs: ['Draft document (Markdown)', 'PDF/DOCX export', 'Version history', 'Source citations', 'Confidence score', 'Approval request'],
    advancement: 'Transforms research and evidence into formal legal documents ready for human review and filing.',
    facing: 'internal',
    href: '/documents',
  },
  {
    id: 'approval-queue',
    name: 'Approval Queue',
    icon: CheckSquare,
    accent: '#fb923c',
    purpose: 'Route all outbound legal actions through mandatory human review. No email, filing, or communication exits the system without approval.',
    when: 'Before any document is finalized, any communication is sent, or any legal action is taken.',
    inputs: ['Draft documents', 'Email drafts', 'Filing packages', 'Agent-generated content', 'Confidence scores'],
    outputs: ['Approval/rejection decisions', 'Redline markups', 'Reviewer comments', 'Escalation triggers', 'Audit records'],
    advancement: 'The constitutional gate. Ensures human oversight over every action that affects clients or courts.',
    facing: 'internal',
    href: '/ops/approvals',
  },
  {
    id: 'forensics-proof',
    name: 'Forensics / Proof Bundle System',
    icon: Fingerprint,
    accent: '#e879f9',
    purpose: 'Package evidence, documents, timelines, and chain-of-custody records into court-ready proof bundles with cryptographic integrity.',
    when: 'Before filing, before law enforcement referral, or when preparing for hearing/trial.',
    inputs: ['Evidence items with hashes', 'Timeline events', 'Documents with provenance', 'Approval records', 'Audit chain'],
    outputs: ['Proof bundle (PDF)', 'Hash manifest', 'Chain-of-custody certificate', 'Blockchain anchor receipt', 'Filing-ready package'],
    advancement: 'Converts raw evidence and analysis into admissible, verifiable proof that stands up in court.',
    facing: 'internal',
    href: '/proof',
  },
  {
    id: 'email-system',
    name: 'Internal Email / Notification System',
    icon: Mail,
    accent: '#f87171',
    purpose: 'Generate, template, approve, send, and log all system communications — intake confirmations, status updates, escalation alerts, document deliveries.',
    when: 'Triggered by system events: intake received, evidence uploaded, approval needed, status changed, deadline approaching.',
    inputs: ['System event triggers', 'Recipient roles', 'Matter linkage', 'Email template', 'Approval gate status'],
    outputs: ['Templated email', 'Delivery confirmation', 'Read receipt', 'Audit log entry', 'Attachment manifest'],
    advancement: 'Ensures no communication falls through the cracks. Every stakeholder gets the right information at the right time.',
    facing: 'both',
  },
  {
    id: 'ops-center',
    name: 'Ops Command Center',
    icon: Radio,
    accent: '#4ade80',
    purpose: 'Unified operational dashboard showing agent activity, task queues, system health, pending approvals, and deadlines across all matters.',
    when: 'Always — the command center is the operational heartbeat of the firm.',
    inputs: ['Agent heartbeats', 'Task statuses', 'Approval queue depth', 'Deadline proximity', 'System health metrics'],
    outputs: ['Real-time dashboard', 'Alert prioritization', 'Workload distribution', 'Performance metrics', 'Escalation triggers'],
    advancement: 'Gives operators a single pane of glass over the entire platform. Nothing is hidden, nothing is missed.',
    facing: 'internal',
    href: '/ops',
  },
];

const CASE_FLOW_STEPS = [
  { step: 1, label: 'Scan QR / Open Rescue App', system: 'Rapid Intake' },
  { step: 2, label: 'Submit Intake / Upload Proof', system: 'Evidence Drop' },
  { step: 3, label: 'Matter Created', system: 'Matter Orchestrator' },
  { step: 4, label: 'Evidence Logged + Timeline Built', system: 'Evidence Timeline' },
  { step: 5, label: 'Research + Analysis Performed', system: 'Research + Citations' },
  { step: 6, label: 'Document Draft Generated', system: 'Document Engine' },
  { step: 7, label: 'Human Review + Approval', system: 'Approval Queue' },
  { step: 8, label: 'Client Updated', system: 'Email System + Portal' },
  { step: 9, label: 'Proof / Audit Bundle Preserved', system: 'Forensics / Proof' },
];

function FacingBadge({ facing }: { facing: 'client' | 'internal' | 'both' }) {
  const colors = {
    client: { bg: 'rgba(52,211,153,0.12)', text: '#34d399' },
    internal: { bg: 'rgba(96,165,250,0.12)', text: '#60a5fa' },
    both: { bg: 'rgba(201,168,76,0.12)', text: 'var(--gold)' },
  };
  const labels = { client: 'Client-Facing', internal: 'Internal', both: 'Client + Internal' };
  const c = colors[facing];
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wider uppercase"
      style={{ background: c.bg, color: c.text }}>
      {labels[facing]}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function SystemsPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--midnight)' }}>
      {/* ═══ HEADER ═══ */}
      <header className="text-center pt-12 pb-8 px-4 border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Scale size={24} style={{ color: 'var(--gold)' }} />
          <span className="font-serif text-sm tracking-[0.3em] uppercase" style={{ color: 'var(--gold)' }}>
            UNYKORN // LAW
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
          Systems Overview
        </h1>
        <p className="text-base md:text-lg max-w-2xl mx-auto mb-2" style={{ color: 'var(--text-muted)' }}>
          How a case moves from intake to action to proof.
        </p>
        <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
          Every system is purpose-built, auditable, and orchestrated by AI agents under human oversight.
        </p>
      </header>

      {/* ═══ CASE FLOW ═══ */}
      <section className="py-12 px-4" style={{ background: 'var(--navy)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="font-serif text-xs tracking-[0.4em] uppercase mb-2" style={{ color: 'var(--gold)' }}>Case Flow</p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
            FROM SCAN <span style={{ color: 'var(--gold)' }}>TO PROOF.</span>
          </h2>
          <div className="space-y-0">
            {CASE_FLOW_STEPS.map((s, i) => (
              <div key={s.step}>
                <div className="flex items-start gap-4 py-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.25)' }}>
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.system}</p>
                  </div>
                </div>
                {i < CASE_FLOW_STEPS.length - 1 && (
                  <div className="flex justify-start ml-[14px]">
                    <ArrowDown size={14} style={{ color: 'rgba(201,168,76,0.3)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SYSTEM CARDS ═══ */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="font-serif text-xs tracking-[0.4em] uppercase mb-2" style={{ color: 'var(--gold)' }}>12 Core Systems</p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-12" style={{ color: 'var(--text-primary)' }}>
            WHAT EACH SYSTEM <span style={{ color: 'var(--gold)' }}>DOES.</span>
          </h2>
          <div className="space-y-6">
            {SYSTEMS.map((sys) => (
              <div key={sys.id}
                className="rounded-lg p-6 md:p-8 border"
                style={{ background: 'var(--navy-card)', borderColor: `${sys.accent}20` }}>
                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${sys.accent}12` }}>
                    <sys.icon size={20} style={{ color: sys.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h3 className="font-serif text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {sys.name}
                      </h3>
                      <FacingBadge facing={sys.facing} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {sys.purpose}
                    </p>
                  </div>
                </div>

                {/* When */}
                <div className="mb-4">
                  <p className="text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: sys.accent }}>When Used</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{sys.when}</p>
                </div>

                {/* Inputs / Outputs */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-mono tracking-wider uppercase mb-1.5" style={{ color: sys.accent }}>Inputs</p>
                    <ul className="space-y-1">
                      {sys.inputs.map((inp) => (
                        <li key={inp} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: sys.accent }} />
                          {inp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono tracking-wider uppercase mb-1.5" style={{ color: sys.accent }}>Outputs</p>
                    <ul className="space-y-1">
                      {sys.outputs.map((out) => (
                        <li key={out} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: sys.accent }} />
                          {out}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* How it advances */}
                <div className="pt-3 border-t" style={{ borderColor: `${sys.accent}15` }}>
                  <p className="text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: sys.accent }}>How It Moves the Case Forward</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{sys.advancement}</p>
                </div>

                {/* Link */}
                {sys.href && (
                  <div className="mt-4">
                    <Link href={sys.href} className="inline-flex items-center gap-1.5 text-xs font-medium no-underline transition-opacity hover:opacity-80"
                      style={{ color: sys.accent }}>
                      Open System <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FIRM IDENTITY ═══ */}
      <section className="py-12 px-4 border-t" style={{ borderColor: 'rgba(201,168,76,0.1)', background: 'var(--navy)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif text-sm tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)' }}>
            {FIRM.legalName}
          </p>
          <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
            {FIRM.address.full}
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            {FIRM.email.cases} · {FIRM.email.intake} · {FIRM.email.support}
          </p>
          <p className="text-xs max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
            {FIRM.disclaimer}
          </p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t py-4 px-4 text-center" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:text-[var(--gold)] transition-colors">Home</Link>
          <span>·</span>
          <Link href="/rescue" className="hover:text-[var(--gold)] transition-colors">Rescue Apps</Link>
          <span>·</span>
          <Link href="/intake" className="hover:text-[var(--gold)] transition-colors">Full Intake</Link>
          <span>·</span>
          <span>{FIRM.copyright}</span>
        </div>
      </footer>
    </div>
  );
}
