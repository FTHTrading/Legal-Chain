'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════════════
   DEMO DOCUMENTS — pre-filled showcases of the full pipeline
   ═══════════════════════════════════════════════════════════════ */

interface DemoDocument {
  id: string;
  type: string;
  label: string;
  icon: string;
  caseCaption: string;
  caseNumber: string;
  court: string;
  jurisdiction: string;
  movingParty: string;
  attorneyName: string;
  agentName: string;
  confidence: number;
  model: string;
  tokensUsed: number;
  processingTimeMs: number;
  pageCount: number;
  generatedAt: string;
  paragraphs: string[];
  certificateOfService: string;
}

const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    id: 'DEMO-MTD-001',
    type: 'motion_to_dismiss',
    label: 'Motion to Dismiss',
    icon: '⚖',
    caseCaption: 'STATE OF FLORIDA v. JAMES A. MITCHELL',
    caseNumber: '2026-CF-004821',
    court: 'CIRCUIT COURT OF THE EIGHTEENTH JUDICIAL CIRCUIT',
    jurisdiction: 'IN AND FOR SEMINOLE COUNTY, FLORIDA',
    movingParty: 'Defendant',
    attorneyName: 'Sarah J. Whitfield, Esq.',
    agentName: 'Scribe-7 (Document Drafting)',
    confidence: 0.87,
    model: 'legal-llm-v3.1',
    tokensUsed: 4218,
    processingTimeMs: 12400,
    pageCount: 4,
    generatedAt: '2026-04-09T14:32:00Z',
    paragraphs: [
      'COMES NOW the Defendant, JAMES A. MITCHELL, by and through undersigned counsel, and respectfully moves this Honorable Court to dismiss the Information filed against him in the above-styled cause, and in support thereof states as follows:',
      'The Information filed by the State on March 15, 2026, charges the Defendant with one count of Aggravated Battery in violation of Florida Statute § 784.045. The Defendant respectfully submits that the State has failed to allege facts sufficient to establish a prima facie case and that the charges should be dismissed with prejudice pursuant to Florida Rule of Criminal Procedure 3.190(c)(4).',
      'The sworn facts demonstrate that on the alleged date of the incident, the Defendant was located at his place of employment, Apex Manufacturing, Inc., at 4200 Commerce Parkway, Sanford, Florida, from 7:00 a.m. through 6:45 p.m. Time-stamped security footage from the facility, employment records, and the testimony of no fewer than three co-workers corroborate the Defendant\'s presence at his workplace during the entirety of the timeframe alleged in the Information. See Exhibit A (Security Camera Log); Exhibit B (Timecard Records); Exhibit C (Affidavits of Co-Workers).',
      'Under Florida law, a motion to dismiss based on undisputed facts shall be granted where "the facts alleged, if true, do not establish a prima facie case of guilt against the defendant." Fla. R. Crim. P. 3.190(c)(4). The burden upon the moving party is to demonstrate that the undisputed material facts negate the essential elements of the charged offense. State v. Kalogeropolous, 758 So. 2d 110, 112 (Fla. 2000). Here, the physical impossibility of the Defendant\'s presence at the scene negates the element of commission beyond dispute.',
      'Furthermore, the State\'s sole basis for the charge appears to rest upon a single eyewitness identification made under circumstances this Court should find unreliable. The witness viewed the individual in question from a distance of approximately 150 feet, at night, for a duration estimated at 3–5 seconds. Under the factors established in Neil v. Biggers, 409 U.S. 188 (1972), and adopted by Florida courts in Grant v. State, 390 So. 2d 341 (Fla. 1980), such an identification is insufficient to withstand scrutiny, particularly when contradicted by the alibi evidence described above.',
      'The Defendant has been subjected to the pendency of these charges for a period exceeding twenty-one (21) days, during which time he has suffered demonstrable harm to his professional reputation, personal relationships, and financial standing. The continuation of baseless criminal proceedings violates the principles of due process guaranteed by the Fifth and Fourteenth Amendments to the United States Constitution and Article I, Section 9, of the Florida Constitution.',
      'WHEREFORE, the Defendant, JAMES A. MITCHELL, respectfully requests that this Honorable Court enter an Order dismissing the Information with prejudice, and granting such other and further relief as this Court deems just and proper.',
    ],
    certificateOfService: 'I HEREBY CERTIFY that a true and correct copy of the foregoing Motion to Dismiss has been furnished by electronic mail to the Office of the State Attorney, Eighteenth Judicial Circuit, at sa18@sa18.org, this 9th day of April, 2026.',
  },
  {
    id: 'DEMO-DL-002',
    type: 'demand_letter',
    label: 'Demand Letter',
    icon: '✉',
    caseCaption: 'APEX TECHNOLOGIES, INC. v. SILVERLINE PARTNERS, LLC',
    caseNumber: '2026-CV-001157',
    court: 'UNITED STATES DISTRICT COURT, MIDDLE DISTRICT OF FLORIDA',
    jurisdiction: 'ORLANDO DIVISION',
    movingParty: 'Plaintiff',
    attorneyName: 'Marcus D. Rivera, Esq.',
    agentName: 'Scribe-7 (Document Drafting)',
    confidence: 0.91,
    model: 'legal-llm-v3.1',
    tokensUsed: 3842,
    processingTimeMs: 9800,
    pageCount: 3,
    generatedAt: '2026-04-09T15:10:00Z',
    paragraphs: [
      'This firm represents APEX TECHNOLOGIES, INC. ("Apex" or "Client") in connection with the outstanding contractual obligations owed by SILVERLINE PARTNERS, LLC ("Silverline") under the Master Services Agreement dated September 12, 2025 (the "Agreement"). We write to demand immediate payment of all amounts due and owing.',
      'Pursuant to Section 4.2 of the Agreement, Silverline agreed to remit payment for all professional services rendered by Apex within thirty (30) days of receipt of each invoice. Apex has duly performed all obligations under the Agreement, delivering the complete Phase II software integration package on December 3, 2025, as confirmed by Silverline\'s written acceptance transmitted via email on December 8, 2025. See Exhibit A (Acceptance Letter from Thomas Crane, CTO, Silverline Partners).',
      'Despite repeated written demands dated January 15, 2026, February 20, 2026, and March 10, 2026, Silverline has failed and refused to remit payment of the following outstanding invoices: Invoice #APX-2025-0847 ($142,500.00), Invoice #APX-2025-0912 ($87,250.00), and Invoice #APX-2026-0031 ($48,400.00), for a total outstanding balance of TWO HUNDRED SEVENTY-EIGHT THOUSAND ONE HUNDRED FIFTY DOLLARS ($278,150.00).',
      'Silverline\'s failure to render payment constitutes a material breach of the Agreement under Florida law. Pursuant to Section 12.1 of the Agreement and Florida Statute § 687.01, Apex is entitled to recover the principal amount owed, plus interest at the contractual rate of 1.5% per month (18% per annum) from the date each invoice became past due, together with all costs of collection including reasonable attorney\'s fees as provided in Section 12.4 of the Agreement and Florida Statute § 57.105.',
      'As of the date of this letter, accrued interest on the outstanding invoices totals FOURTEEN THOUSAND TWO HUNDRED THIRTY-ONE DOLLARS AND 50/100 ($14,231.50). The total amount demanded is therefore TWO HUNDRED NINETY-TWO THOUSAND THREE HUNDRED EIGHTY-ONE DOLLARS AND 50/100 ($292,381.50).',
      'DEMAND IS HEREBY MADE that Silverline Partners, LLC remit payment in full in the amount of $292,381.50 within TEN (10) BUSINESS DAYS of receipt of this letter. Payment shall be made by wire transfer to the account designated on the attached payment instruction form. Failure to comply with this demand within the stated period will result in Apex pursuing all available legal remedies, including but not limited to the filing of a civil action in the United States District Court for the Middle District of Florida, Orlando Division, seeking compensatory damages, prejudgment interest, attorney\'s fees, and costs.',
    ],
    certificateOfService: 'I HEREBY CERTIFY that a true and correct copy of the foregoing Demand Letter has been served via certified mail, return receipt requested, and via email to Silverline Partners, LLC, Attn: General Counsel, at legal@silverlinepartners.com, this 9th day of April, 2026.',
  },
  {
    id: 'DEMO-MOL-003',
    type: 'memorandum_of_law',
    label: 'Memorandum of Law',
    icon: '📋',
    caseCaption: 'IN RE: THE ESTATE OF MARGARET L. THORNTON, Deceased',
    caseNumber: '2026-CP-000392',
    court: 'PROBATE DIVISION, NINTH JUDICIAL CIRCUIT',
    jurisdiction: 'IN AND FOR ORANGE COUNTY, FLORIDA',
    movingParty: 'Petitioner',
    attorneyName: 'Elena V. Castillo, Esq.',
    agentName: 'Scribe-7 (Document Drafting)',
    confidence: 0.82,
    model: 'legal-llm-v3.1',
    tokensUsed: 5103,
    processingTimeMs: 15200,
    pageCount: 6,
    generatedAt: '2026-04-09T16:45:00Z',
    paragraphs: [
      'COMES NOW the Petitioner, ROBERT A. THORNTON, as nominated Personal Representative under the Last Will and Testament of MARGARET L. THORNTON, deceased, and submits this Memorandum of Law in support of his Petition for Admission of Will to Probate and Issuance of Letters of Administration, and in support thereof states as follows:',
      'I. STATEMENT OF FACTS. Margaret L. Thornton ("Decedent") passed away on February 14, 2026, a resident of Orange County, Florida. At the time of her death, the Decedent was 78 years of age and held assets including real property located at 2847 Lakeview Drive, Orlando, Florida 32806, valued at approximately $685,000; investment accounts at Fidelity Investments totaling approximately $1,240,000; and personal property valued at approximately $125,000. The total estimated value of the estate exceeds TWO MILLION DOLLARS ($2,050,000.00).',
      'On June 3, 2023, the Decedent executed her Last Will and Testament (the "Will") at the offices of Crawford & Associates, P.A., in the presence of two subscribing witnesses, Diane R. Crawford and Michael P. Ortiz, and a notary public, Janet L. Simmons. The Will was executed in compliance with all formalities required by Florida Statute § 732.502, including the Decedent\'s signature at the end of the instrument, the signatures of two attesting witnesses in the presence of the Decedent and each other, and the execution of a self-proving affidavit pursuant to Florida Statute § 732.503.',
      'II. THE WILL IS VALID AND SHOULD BE ADMITTED TO PROBATE. Under Florida Statute § 733.201, any interested person may petition the court to admit a will to probate. Here, the Will satisfies all statutory requirements for validity. The Decedent possessed testamentary capacity at the time of execution, as evidenced by the contemporaneous medical records from Dr. Patricia Hernandez, M.D., which confirm the Decedent\'s cognitive faculties were fully intact. See Exhibit B (Medical Evaluation dated May 28, 2023). Florida courts have consistently held that testamentary capacity requires only that the testator understand the nature and extent of her property, the natural objects of her bounty, and the practical effect of her testamentary act. In Re Estate of Carpenter, 253 So. 2d 697, 701 (Fla. 1971).',
      'III. ROBERT A. THORNTON IS QUALIFIED TO SERVE AS PERSONAL REPRESENTATIVE. The Petitioner, Robert A. Thornton, is the Decedent\'s eldest son and is specifically nominated as Personal Representative under Article V of the Will. Pursuant to Florida Statute § 733.302, a person nominated as personal representative in a will is entitled to preference in appointment. The Petitioner is a resident of the State of Florida, is over the age of 18, has never been convicted of a felony, and is not otherwise disqualified from serving under Florida Statute § 733.303. The Petitioner stands ready, willing, and able to fulfill all fiduciary duties attendant to the administration of the estate.',
      'IV. NO OBJECTION EXISTS TO ADMISSION OF THE WILL. To the personal knowledge of the Petitioner and undersigned counsel, no interested party has filed or expressed an intent to file an objection to the admission of the Will, nor has any party contested the Petitioner\'s qualification to serve as Personal Representative. A Formal Notice pursuant to Florida Probate Rule 5.040(a) has been served upon all interested persons, including the Decedent\'s three children and one grandchild, all of whom have acknowledged receipt.',
      'WHEREFORE, the Petitioner, ROBERT A. THORNTON, respectfully requests that this Honorable Court: (a) admit the Last Will and Testament of Margaret L. Thornton, dated June 3, 2023, to probate; (b) issue Letters of Administration to the Petitioner as Personal Representative; (c) authorize the Petitioner to administer the estate in accordance with the terms of the Will and applicable Florida law; and (d) grant such other and further relief as this Court deems just and proper.',
    ],
    certificateOfService: 'I HEREBY CERTIFY that a true and correct copy of the foregoing Memorandum of Law has been furnished via Formal Notice to all interested parties as identified in the Petition, including David R. Thornton, Patricia A. Thornton-Wells, and Catherine M. Thornton, this 9th day of April, 2026.',
  },
];

/* ═══ Pipeline Step Visualizer ═══ */
const PIPELINE_STEPS = [
  { label: 'Request Received', detail: 'Document type + case details validated', icon: '📥' },
  { label: 'Agent Routing', detail: 'Routed to Scribe-7 (Document Drafting team)', icon: '🔄' },
  { label: 'Legal Research', detail: 'Statutes, case law, and rules analyzed', icon: '📚' },
  { label: 'Content Drafting', detail: 'AI drafts substantive legal arguments', icon: '✍️' },
  { label: 'Governance Check', detail: 'Forbidden actions, escalation triggers verified', icon: '🛡' },
  { label: 'Confidence Scoring', detail: 'Output scored for accuracy and completeness', icon: '📊' },
  { label: 'PDF Rendering', detail: 'Court-standard formatting with DRAFT watermark', icon: '📄' },
  { label: 'Ready for Review', detail: 'Download for attorney review before filing', icon: '✅' },
];

export default function DocumentDemoPage() {
  const [activeDoc, setActiveDoc] = useState(0);
  const [showPipeline, setShowPipeline] = useState(false);
  const doc = DEMO_DOCUMENTS[activeDoc];

  const confidenceColor = doc.confidence >= 0.85 ? 'text-emerald-400' : doc.confidence >= 0.6 ? 'text-[var(--gold)]' : 'text-red-400';
  const confidenceBg = doc.confidence >= 0.85 ? 'bg-emerald-400' : doc.confidence >= 0.6 ? 'bg-[var(--gold)]' : 'bg-red-400';

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* ═══ HEADER ═══ */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Live Demo
              </span>
              <span className="text-xs text-[var(--text-muted)]">·</span>
              <Link href="/documents" className="text-xs text-[var(--gold)] no-underline hover:underline">
                Open Document Generator →
              </Link>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold mb-3">
              COURT-READY<br /><span className="text-[var(--gold)]">DOCUMENTS.</span>
            </h1>
            <p className="text-base md:text-lg text-[var(--text-muted)] max-w-3xl">
              Our AI agents draft real legal documents with proper court formatting —
              caption, numbered paragraphs, signature blocks, and certificate of service.
              Every document includes a confidence score and requires attorney review before filing.
            </p>
          </div>

          {/* ═══ DOCUMENT SELECTOR TABS ═══ */}
          <div className="flex flex-wrap gap-3 mb-6">
            {DEMO_DOCUMENTS.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setActiveDoc(i)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg border text-left transition-all cursor-pointer ${
                  activeDoc === i
                    ? 'border-[var(--gold)] bg-[rgba(201,168,76,0.08)]'
                    : 'border-[rgba(255,255,255,0.08)] bg-[var(--navy-card)] hover:border-[rgba(201,168,76,0.25)]'
                }`}
              >
                <span className="text-xl">{d.icon}</span>
                <div>
                  <span className={`text-sm font-bold block ${activeDoc === i ? 'text-[var(--gold)]' : 'text-[var(--text-primary)]'}`}>
                    {d.label}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">{d.caseNumber}</span>
                </div>
              </button>
            ))}
          </div>

          {/* ═══ MAIN CONTENT: 2-column ═══ */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-6">

            {/* ═══ LEFT — DOCUMENT PREVIEW ═══ */}
            <div>
              {/* Document Paper */}
              <div className="bg-white rounded-lg shadow-2xl shadow-black/40 overflow-hidden relative">
                {/* DRAFT Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                  <span className="text-[120px] md:text-[160px] font-serif font-bold text-gray-200/20 -rotate-45 tracking-[0.3em]">
                    DRAFT
                  </span>
                </div>

                <div className="relative z-20 px-8 md:px-16 py-12 md:py-16" style={{ fontFamily: "'Times New Roman', 'Liberation Serif', serif", color: '#111', lineHeight: '1.6' }}>

                  {/* Court Header */}
                  <div className="text-center mb-8" style={{ fontSize: '13px' }}>
                    <p className="font-bold uppercase tracking-wide" style={{ fontSize: '14px' }}>
                      {doc.court}
                    </p>
                    {doc.jurisdiction && (
                      <p className="uppercase tracking-wide" style={{ fontSize: '13px' }}>{doc.jurisdiction}</p>
                    )}
                  </div>

                  {/* Caption Block */}
                  <div className="mb-8" style={{ fontSize: '13px' }}>
                    <div className="flex">
                      <div className="flex-1 pr-4">
                        {doc.caseCaption.split(' v. ').length === 2 ? (
                          <>
                            <p className="font-bold">{doc.caseCaption.split(' v. ')[0]},</p>
                            <p className="ml-8 italic">
                              {doc.movingParty === 'Plaintiff' || doc.movingParty === 'Petitioner' ? doc.movingParty : ''},
                            </p>
                            <p className="my-2 ml-4">v.</p>
                            <p className="font-bold">{doc.caseCaption.split(' v. ')[1]},</p>
                            <p className="ml-8 italic">
                              {doc.movingParty === 'Defendant' || doc.movingParty === 'Respondent' ? doc.movingParty : 'Defendant'}.
                            </p>
                          </>
                        ) : (
                          <p className="font-bold">{doc.caseCaption}</p>
                        )}
                      </div>
                      <div className="border-l-2 border-black pl-4 flex flex-col justify-center shrink-0" style={{ minWidth: '180px' }}>
                        <p>Case No. {doc.caseNumber}</p>
                        <p className="mt-1 font-bold uppercase" style={{ fontSize: '11px' }}>
                          {doc.label.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="border-b-2 border-black mt-4" />
                  </div>

                  {/* Document Title */}
                  <h2 className="text-center font-bold uppercase tracking-wide mb-8" style={{ fontSize: '15px' }}>
                    {doc.movingParty.toUpperCase()}&apos;S {doc.label.toUpperCase()}
                  </h2>

                  {/* Body Paragraphs */}
                  <div className="space-y-4" style={{ fontSize: '13px', textAlign: 'justify' }}>
                    {doc.paragraphs.map((para, i) => (
                      <p key={i}>
                        <span className="font-mono mr-2" style={{ fontSize: '11px', color: '#666' }}>{i + 1}.</span>
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Signature Block */}
                  <div className="mt-16 ml-auto" style={{ maxWidth: '320px', fontSize: '13px' }}>
                    <p className="mb-1">Respectfully submitted,</p>
                    <div className="mt-8 mb-2 border-b border-black w-56" />
                    <p className="font-bold">{doc.attorneyName}</p>
                    <p>Florida Bar No. [_______]</p>
                    <p>UNYKORN // LAW</p>
                    <p>Counsel for {doc.movingParty}</p>
                    <p className="text-xs mt-1" style={{ color: '#666' }}>law@unykorn.org</p>
                  </div>

                  {/* Certificate of Service */}
                  <div className="mt-12 border-t border-gray-300 pt-6" style={{ fontSize: '12px' }}>
                    <p className="font-bold uppercase mb-3" style={{ fontSize: '11px', letterSpacing: '0.1em' }}>
                      Certificate of Service
                    </p>
                    <p>{doc.certificateOfService}</p>
                    <div className="mt-6">
                      <div className="border-b border-black w-48 mb-1" />
                      <p>{doc.attorneyName}</p>
                    </div>
                  </div>

                  {/* Page Footer */}
                  <div className="mt-12 text-center border-t border-gray-200 pt-4" style={{ fontSize: '10px', color: '#999' }}>
                    <p>Page 1 of {doc.pageCount} — Generated by UNYKORN // LAW AI Agent System</p>
                    <p>Document ID: {doc.id} — DRAFT — Not for Filing</p>
                  </div>
                </div>
              </div>

              {/* ChatGPT Comparison */}
              <div className="mt-6 bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
                <h3 className="font-serif text-base font-bold text-[var(--gold)] mb-4">Why This Isn&apos;t ChatGPT</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-xs font-mono tracking-wider uppercase text-red-400 mb-2">❌ What ChatGPT gives you</p>
                    <div className="bg-[var(--midnight)] rounded p-3 border border-[rgba(255,255,255,0.05)]">
                      <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed">
                        [Subject: Request for Dismissal]<br /><br />
                        Dear Judge,<br /><br />
                        I am writing regarding case #12345. I believe the charges should be dismissed because...<br /><br />
                        *No caption. No formatting. No numbered paragraphs. No citations. No signature block. No certificate of service. Just markdown text in a chat window.*
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-mono tracking-wider uppercase text-emerald-400 mb-2">✓ What our agents produce</p>
                    <div className="bg-[var(--midnight)] rounded p-3 border border-emerald-500/15">
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        <span className="text-emerald-400 font-bold">Court-standard PDF</span> with proper caption block, case number, numbered paragraphs with real case law citations, signature block with attorney bar number, certificate of service, DRAFT watermark, and confidence scoring.
                        <br /><br />
                        <span className="text-emerald-400 font-bold">Governed AI agent</span> with forbidden actions (cannot file, cannot sign, cannot contact parties), escalation triggers, and full audit trail.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ RIGHT SIDEBAR ═══ */}
            <div className="space-y-5">

              {/* Agent & Metadata */}
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg overflow-hidden">
                <div className="bg-emerald-500/5 border-b border-emerald-500/20 px-5 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-400">✓</span>
                    <span className="font-serif text-sm font-bold text-emerald-400">Document Generated</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{doc.label} — ready for attorney review</p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Agent', value: doc.agentName.split(' (')[0] },
                      { label: 'Confidence', value: `${Math.round(doc.confidence * 100)}%` },
                      { label: 'Model', value: doc.model },
                      { label: 'Tokens', value: doc.tokensUsed.toLocaleString() },
                      { label: 'Time', value: `${(doc.processingTimeMs / 1000).toFixed(1)}s` },
                      { label: 'Pages', value: String(doc.pageCount) },
                    ].map((m) => (
                      <div key={m.label} className="bg-[var(--midnight)] rounded px-3 py-2 border border-[rgba(255,255,255,0.05)]">
                        <span className="text-[9px] font-mono tracking-wider uppercase text-[var(--text-muted)] block">{m.label}</span>
                        <span className={`text-sm font-bold ${m.label === 'Confidence' ? confidenceColor : 'text-[var(--gold)]'}`}>{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Confidence Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)]">Confidence Score</span>
                      <span className={`text-sm font-mono font-bold ${confidenceColor}`}>
                        {Math.round(doc.confidence * 100)}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${confidenceBg}`}
                        style={{ width: `${Math.round(doc.confidence * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[9px] text-red-400">0% — Auto-Escalate</span>
                      <span className="text-[9px] text-[var(--text-muted)]">60% — Flag</span>
                      <span className="text-[9px] text-emerald-400">85%+ — High</span>
                    </div>
                  </div>

                  {/* Download Mock */}
                  <Link
                    href="/documents"
                    className="flex items-center justify-center gap-2 w-full bg-[var(--gold)] text-[var(--midnight)] py-3.5 font-serif text-sm font-bold tracking-[0.1em] uppercase rounded-sm hover:bg-[var(--gold-light)] transition-colors no-underline"
                  >
                    <span>⬇</span> Generate Your Own Document
                  </Link>

                  {/* Attorney Review Warning */}
                  <div className="flex items-start gap-2 p-3 bg-amber-500/5 rounded border border-amber-500/15">
                    <span className="text-amber-400 text-sm mt-0.5">⚠</span>
                    <p className="text-[11px] text-amber-400/90 leading-relaxed">
                      <strong>AI-GENERATED DRAFT.</strong> Must be reviewed by a licensed attorney before filing with any court.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pipeline Toggle */}
              <button
                onClick={() => setShowPipeline(!showPipeline)}
                className="w-full bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-4 text-left hover:border-[rgba(201,168,76,0.25)] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-[var(--gold)]">
                    {showPipeline ? '▾' : '▸'} View Agent Pipeline
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">8/8 COMPLETE</span>
                </div>
              </button>

              {showPipeline && (
                <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5">
                  <div className="space-y-3">
                    {PIPELINE_STEPS.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs shrink-0 mt-0.5">
                          {step.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">{step.label}</span>
                            <span className="text-[9px] text-emerald-400 font-mono">✓</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)]">{step.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[rgba(201,168,76,0.08)]">
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                      Total pipeline: {(doc.processingTimeMs / 1000).toFixed(1)}s · Agent: {doc.agentName} · Doc ID: {doc.id}
                    </p>
                  </div>
                </div>
              )}

              {/* Case Details Card */}
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5">
                <h3 className="font-serif text-sm font-bold text-[var(--gold)] mb-3">Case Details (Pre-Filled)</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Caption', value: doc.caseCaption },
                    { label: 'Case No.', value: doc.caseNumber },
                    { label: 'Court', value: doc.court },
                    { label: 'Jurisdiction', value: doc.jurisdiction },
                    { label: 'Moving Party', value: doc.movingParty },
                    { label: 'Attorney', value: doc.attorneyName },
                  ].map((f) => (
                    <div key={f.label}>
                      <span className="text-[9px] font-mono tracking-wider uppercase text-[var(--text-muted)] block">{f.label}</span>
                      <span className="text-xs text-[var(--text-primary)]">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What the System Checks */}
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5">
                <h3 className="font-serif text-sm font-bold text-[var(--gold)] mb-3">Governance Constraints</h3>
                <div className="space-y-2">
                  {[
                    { rule: 'Cannot file documents with any court', type: 'forbidden' },
                    { rule: 'Cannot contact opposing parties', type: 'forbidden' },
                    { rule: 'Cannot sign pleadings or enter appearances', type: 'forbidden' },
                    { rule: 'Must include DRAFT watermark', type: 'required' },
                    { rule: 'Must flag confidence below 60%', type: 'escalation' },
                    { rule: 'Must auto-escalate below 40%', type: 'escalation' },
                    { rule: 'Every output logged with agent ID', type: 'audit' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${
                        r.type === 'forbidden' ? 'text-red-400' :
                        r.type === 'escalation' ? 'text-amber-400' :
                        r.type === 'required' ? 'text-blue-400' : 'text-[var(--text-muted)]'
                      }`}>
                        {r.type === 'forbidden' ? '✕' : r.type === 'escalation' ? '⚠' : '●'}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">{r.rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Types Available */}
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5">
                <h3 className="font-serif text-sm font-bold text-[var(--gold)] mb-3">10 Document Types</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Motion to Dismiss',
                    'Motion to Suppress',
                    'Motion for Discovery',
                    'Motion for Continuance',
                    'Demand Letter',
                    'Legal Brief',
                    'Cease & Desist',
                    'Affidavit',
                    'Notice of Appearance',
                    'Memorandum of Law',
                  ].map((name) => (
                    <span key={name} className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <span className="text-[var(--gold)] text-[8px]">▪</span> {name}
                    </span>
                  ))}
                </div>
                <Link href="/documents" className="block mt-3 text-xs text-[var(--gold)] no-underline hover:underline font-mono">
                  Generate any document →
                </Link>
              </div>

              {/* CTA */}
              <div className="bg-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.15)] rounded-lg p-5 text-center">
                <p className="font-serif text-sm font-bold mb-1.5">Ready to generate your own?</p>
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  Choose from 10 document types. Enter your case details. Get a court-ready PDF in seconds.
                </p>
                <Link
                  href="/documents"
                  className="inline-block bg-[var(--gold)] text-[var(--midnight)] px-6 py-2.5 font-serif text-xs font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[var(--gold-light)] transition-colors no-underline"
                >
                  Open Document Generator
                </Link>
              </div>
            </div>
          </div>

          {/* ═══ ALL THREE DOCUMENTS OVERVIEW ═══ */}
          <section className="mt-16 mb-8">
            <h2 className="font-serif text-2xl font-bold mb-2">Three Demo Documents</h2>
            <p className="text-sm text-[var(--text-muted)] mb-8">Each demonstrates a different document type with realistic case data, proper court formatting, and full agent metadata.</p>

            <div className="grid md:grid-cols-3 gap-5">
              {DEMO_DOCUMENTS.map((d, i) => {
                const cc = d.confidence >= 0.85 ? 'text-emerald-400' : d.confidence >= 0.6 ? 'text-[var(--gold)]' : 'text-red-400';
                return (
                  <button
                    key={d.id}
                    onClick={() => { setActiveDoc(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-left bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg overflow-hidden hover:border-[var(--gold)] transition-all cursor-pointer group"
                  >
                    {/* Mini doc preview */}
                    <div className="bg-white/95 px-5 py-4 relative" style={{ fontFamily: "'Times New Roman', serif", color: '#111' }}>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[40px] font-serif font-bold text-gray-300/30 -rotate-45">DRAFT</span>
                      </div>
                      <p className="text-[8px] text-center font-bold uppercase tracking-wide mb-1 relative z-10">{d.court}</p>
                      <p className="text-[9px] font-bold relative z-10">{d.caseCaption}</p>
                      <p className="text-[8px] text-gray-500 relative z-10">Case No. {d.caseNumber}</p>
                      <p className="text-[7px] mt-2 text-gray-600 line-clamp-3 relative z-10">{d.paragraphs[0].substring(0, 180)}...</p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{d.icon}</span>
                        <h3 className="font-serif text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">{d.label}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-muted)]">
                        <span className={cc}>
                          {Math.round(d.confidence * 100)}% confidence
                        </span>
                        <span>·</span>
                        <span>{d.pageCount} pages</span>
                        <span>·</span>
                        <span>{(d.processingTimeMs / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
