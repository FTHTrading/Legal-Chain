"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

// ── Types ──

interface DocType {
  type: string;
  label: string;
  description: string;
  category: string;
}

interface GenerationState {
  status: "idle" | "generating" | "complete" | "error";
  progress: string;
  elapsed: number;
  agentName?: string;
  confidence?: number;
  model?: string;
  tokensUsed?: number;
  processingTimeMs?: number;
  pageCount?: number;
  documentId?: string;
  filename?: string;
  blobUrl?: string;
  error?: string;
}

// ── Category Icons ──

const CATEGORY_ICONS: Record<string, string> = {
  motion: "⚖",
  correspondence: "✉",
  brief: "📋",
  filing: "📄",
};

// ── Page ──

export default function DocumentsPage() {
  const [docTypes, setDocTypes] = useState<DocType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [caseCaption, setCaseCaption] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [court, setCourt] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [attorneyName, setAttorneyName] = useState("");
  const [movingParty, setMovingParty] = useState("Defendant");
  const [additionalContext, setAdditionalContext] = useState("");
  const [gen, setGen] = useState<GenerationState>({ status: "idle", progress: "", elapsed: 0 });
  const [recentDocs, setRecentDocs] = useState<Array<{ filename: string; blobUrl: string; type: string; timestamp: string; confidence: number }>>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load available document types
  useEffect(() => {
    fetch("/api/documents/generate")
      .then((r) => r.json())
      .then((d) => setDocTypes(d.documentTypes || []))
      .catch(() => {});
  }, []);

  // Timer during generation
  useEffect(() => {
    if (gen.status === "generating") {
      setGen((g) => ({ ...g, elapsed: 0 }));
      timerRef.current = setInterval(() => setGen((g) => ({ ...g, elapsed: g.elapsed + 100 })), 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gen.status]);

  const generateDocument = useCallback(async () => {
    if (!selectedType || !caseCaption.trim() || gen.status === "generating") return;

    setGen({ status: "generating", progress: "Routing to Document Drafting team...", elapsed: 0 });

    // Progress updates
    const progressUpdates = [
      { at: 2000, msg: "Agent analyzing case context and selecting strategy..." },
      { at: 5000, msg: "Researching applicable statutes and case law..." },
      { at: 8000, msg: "Drafting substantive legal arguments..." },
      { at: 12000, msg: "Applying governance constraints and citation checks..." },
      { at: 16000, msg: "Computing confidence score..." },
      { at: 20000, msg: "Rendering court-standard PDF..." },
      { at: 25000, msg: "Complex document — agent being thorough..." },
      { at: 35000, msg: "Finalizing document with certificate of service..." },
    ];

    const progressTimers = progressUpdates.map((u) =>
      setTimeout(() => setGen((g) => g.status === "generating" ? { ...g, progress: u.msg } : g), u.at)
    );

    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          caseCaption: caseCaption.trim(),
          caseNumber: caseNumber.trim() || undefined,
          court: court.trim() || undefined,
          jurisdiction: jurisdiction.trim() || undefined,
          movingParty,
          attorneyName: attorneyName.trim() || undefined,
          additionalContext: additionalContext.trim() || undefined,
        }),
      });

      progressTimers.forEach(clearTimeout);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Generation failed" }));
        setGen({ status: "error", progress: "", elapsed: 0, error: err.error || err.detail || "Unknown error" });
        return;
      }

      // Get metadata from headers
      const agentName = res.headers.get("X-Agent-Name") || "Document Agent";
      const confidence = parseFloat(res.headers.get("X-Confidence-Score") || "0");
      const model = res.headers.get("X-Model") || "unknown";
      const tokensUsed = parseInt(res.headers.get("X-Tokens-Used") || "0", 10);
      const processingTimeMs = parseInt(res.headers.get("X-Processing-Time-Ms") || "0", 10);
      const pageCount = parseInt(res.headers.get("X-Page-Count") || "1", 10);
      const documentId = res.headers.get("X-Document-Id") || "";
      const disposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename="(.+?)"/);
      const filename = filenameMatch ? filenameMatch[1] : `document-${Date.now()}.pdf`;

      // Create blob URL for download
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      setGen({
        status: "complete",
        progress: "",
        elapsed: 0,
        agentName, confidence, model, tokensUsed, processingTimeMs,
        pageCount, documentId, filename, blobUrl,
      });

      // Add to recent documents
      setRecentDocs((prev) => [
        { filename, blobUrl, type: selectedType, timestamp: new Date().toISOString(), confidence },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      progressTimers.forEach(clearTimeout);
      setGen({ status: "error", progress: "", elapsed: 0, error: err instanceof Error ? err.message : "Network error" });
    }
  }, [selectedType, caseCaption, caseNumber, court, jurisdiction, movingParty, attorneyName, additionalContext, gen.status]);

  const resetForm = () => {
    if (gen.blobUrl) URL.revokeObjectURL(gen.blobUrl);
    setGen({ status: "idle", progress: "", elapsed: 0 });
  };

  const selectedInfo = docTypes.find((d) => d.type === selectedType);
  const categories = [...new Set(docTypes.map((d) => d.category))];

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1200px] mx-auto">

          {/* ═══ HEADER ═══ */}
          <div className="mb-12">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Document Generator</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              COURT-READY<br /><span className="text-[var(--gold)]">DOCUMENTS.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl">
              Our AI agents draft real legal documents with proper court formatting —
              caption, numbered paragraphs, signature blocks, and certificate of service.
              Every document includes a confidence score and requires attorney review before filing.
            </p>
          </div>

          {/* ═══ HOW IT DIFFERS FROM CHATGPT ═══ */}
          <section className="mb-12 grid md:grid-cols-4 gap-4">
            {[
              { title: "Governed Agents", detail: "Each agent has forbidden actions, escalation triggers, and approval gates. ChatGPT has none.", icon: "🛡" },
              { title: "Court Formatting", detail: "Real caption blocks, numbered paragraphs, certificate of service. Not markdown in a chat window.", icon: "⚖" },
              { title: "Confidence Scoring", detail: "Every output scored 0-100%. Below 60% = flagged for human review. Below 40% = auto-escalated.", icon: "📊" },
              { title: "PDF Download", detail: "Production-ready PDF with DRAFT watermark. Download, review with your attorney, finalize, file.", icon: "📄" },
            ].map((item) => (
              <div key={item.title} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5">
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <h3 className="font-serif text-sm font-bold text-[var(--gold)] mb-1">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </section>

          {/* ═══ SAMPLE DOCUMENTS — One-Click Demo ═══ */}
          <section className="mb-12">
            <h2 className="font-serif text-xl font-bold mb-4">Try a Sample Document</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">Generate a court-ready PDF instantly with pre-filled case details. See exactly what our AI agents produce.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  label: "Motion to Dismiss",
                  type: "motion_to_dismiss",
                  caption: "STATE OF FLORIDA v. JAMES MITCHELL",
                  caseNum: "2026-CF-004821",
                  courtName: "CIRCUIT COURT OF THE EIGHTEENTH JUDICIAL CIRCUIT",
                  jurisdictionName: "IN AND FOR SEMINOLE COUNTY, FLORIDA",
                  party: "Defendant",
                  icon: "⚖",
                },
                {
                  label: "Demand Letter",
                  type: "demand_letter",
                  caption: "APEX TECHNOLOGIES INC v. SILVERLINE PARTNERS LLC",
                  caseNum: "2026-CV-001157",
                  courtName: "UNITED STATES DISTRICT COURT, MIDDLE DISTRICT OF FLORIDA",
                  jurisdictionName: "ORLANDO DIVISION",
                  party: "Plaintiff",
                  icon: "✉",
                },
                {
                  label: "Legal Brief",
                  type: "legal_brief",
                  caption: "IN RE: ESTATE OF MARGARET THORNTON",
                  caseNum: "2026-CP-000392",
                  courtName: "PROBATE DIVISION, NINTH JUDICIAL CIRCUIT",
                  jurisdictionName: "IN AND FOR ORANGE COUNTY, FLORIDA",
                  party: "Petitioner",
                  icon: "📋",
                },
              ].map((sample) => (
                <button
                  key={sample.type}
                  onClick={() => {
                    setSelectedType(sample.type);
                    setCaseCaption(sample.caption);
                    setCaseNumber(sample.caseNum);
                    setCourt(sample.courtName);
                    setJurisdiction(sample.jurisdictionName);
                    setMovingParty(sample.party);
                  }}
                  className="text-left bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5 hover:border-[var(--gold)] transition-all cursor-pointer group"
                >
                  <span className="text-2xl mb-2 block">{sample.icon}</span>
                  <h3 className="font-serif text-sm font-bold text-[var(--gold)] mb-1 group-hover:text-[var(--gold-light)]">{sample.label}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{sample.caption}</p>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to fill form →
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* ═══ LEFT — FORM ═══ */}
            <div>
              {gen.status === "idle" || gen.status === "error" ? (
                <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg overflow-hidden">
                  {/* Form Header */}
                  <div className="bg-[rgba(201,168,76,0.04)] border-b border-[rgba(201,168,76,0.1)] px-8 py-5">
                    <h2 className="font-serif text-xl font-bold">Generate a Document</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Select a type, enter your case details, and our AI agent will draft it.</p>
                  </div>

                  <div className="p-8 space-y-6">
                    {/* Document Type Selection */}
                    <div>
                      <label className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)] mb-3 block">Document Type *</label>
                      <div className="space-y-3">
                        {categories.map((cat) => (
                          <div key={cat}>
                            <span className="text-xs font-mono text-[var(--gold)] tracking-wider uppercase mb-2 block">
                              {CATEGORY_ICONS[cat] || "📁"} {cat}
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {docTypes.filter((d) => d.category === cat).map((dt) => (
                                <button
                                  key={dt.type}
                                  onClick={() => setSelectedType(dt.type)}
                                  className={`text-left px-4 py-3 rounded-lg border transition-all cursor-pointer ${
                                    selectedType === dt.type
                                      ? "border-[var(--gold)] bg-[rgba(201,168,76,0.08)]"
                                      : "border-[rgba(255,255,255,0.06)] bg-[var(--midnight)] hover:border-[rgba(201,168,76,0.2)]"
                                  }`}
                                >
                                  <span className={`text-sm font-bold block ${selectedType === dt.type ? "text-[var(--gold)]" : "text-[var(--text-primary)]"}`}>
                                    {dt.label}
                                  </span>
                                  <span className="text-xs text-[var(--text-muted)]">{dt.description}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Case Caption */}
                    <div>
                      <label className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2 block">Case Caption *</label>
                      <input
                        type="text"
                        value={caseCaption}
                        onChange={(e) => setCaseCaption(e.target.value)}
                        placeholder="e.g. STATE OF FLORIDA v. JOHN DOE"
                        className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Attorney / Your Name */}
                    <div>
                      <label className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2 block">Your Name (for signature block)</label>
                      <input
                        type="text"
                        value={attorneyName}
                        onChange={(e) => setAttorneyName(e.target.value)}
                        placeholder="e.g. Jane Smith"
                        className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                      />
                      <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Appears on signature block and certificate of service. Leave blank for placeholder.</span>
                    </div>

                    {/* Case Number + Court — two columns */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2 block">Case Number</label>
                        <input
                          type="text"
                          value={caseNumber}
                          onChange={(e) => setCaseNumber(e.target.value)}
                          placeholder="e.g. 2026-CF-001234"
                          className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2 block">Moving Party</label>
                        <select
                          value={movingParty}
                          onChange={(e) => setMovingParty(e.target.value)}
                          className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                        >
                          <option value="Defendant">Defendant</option>
                          <option value="Plaintiff">Plaintiff</option>
                          <option value="Petitioner">Petitioner</option>
                          <option value="Respondent">Respondent</option>
                          <option value="Appellant">Appellant</option>
                        </select>
                      </div>
                    </div>

                    {/* Court + Jurisdiction — two columns */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2 block">Court</label>
                        <input
                          type="text"
                          value={court}
                          onChange={(e) => setCourt(e.target.value)}
                          placeholder="e.g. CIRCUIT COURT OF THE EIGHTEENTH JUDICIAL CIRCUIT"
                          className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2 block">Jurisdiction</label>
                        <input
                          type="text"
                          value={jurisdiction}
                          onChange={(e) => setJurisdiction(e.target.value)}
                          placeholder="e.g. IN AND FOR SEMINOLE COUNTY, FLORIDA"
                          className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold)] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Additional Context */}
                    <div>
                      <label className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2 block">Additional Context / Facts</label>
                      <textarea
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        placeholder="Provide any specific facts, arguments, or details you want the AI to incorporate into the document..."
                        rows={4}
                        maxLength={2000}
                        className="w-full bg-[var(--midnight)] border border-[rgba(201,168,76,0.2)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold)] focus:outline-none resize-none transition-colors"
                      />
                      <span className="text-xs text-[var(--text-muted)] font-mono mt-1 block text-right">{additionalContext.length}/2000</span>
                    </div>

                    {/* Error Display */}
                    {gen.status === "error" && gen.error && (
                      <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
                        <p className="text-red-400 text-sm font-bold mb-1">Generation Failed</p>
                        <p className="text-red-400/80 text-sm">{gen.error}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      onClick={generateDocument}
                      disabled={!selectedType || !caseCaption.trim()}
                      className="w-full bg-[var(--gold)] text-[var(--midnight)] py-4 font-serif text-sm font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[var(--gold-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Generate Document with AI Agent
                    </button>
                  </div>
                </div>
              ) : gen.status === "generating" ? (
                /* ═══ GENERATING STATE ═══ */
                <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-5 h-5 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                    <h2 className="font-serif text-xl font-bold">Generating Document</h2>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="bg-[var(--midnight)] rounded-lg p-4 border border-[rgba(201,168,76,0.08)]">
                      <p className="text-sm text-[var(--gold)] font-mono">{gen.progress}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Elapsed: {(gen.elapsed / 1000).toFixed(1)}s</p>
                    </div>

                    {/* Visual pipeline */}
                    <div className="space-y-3">
                      {[
                        { label: "Route to Agent", done: gen.elapsed > 500 },
                        { label: "Research & Analysis", done: gen.elapsed > 5000 },
                        { label: "Draft Content", done: gen.elapsed > 10000 },
                        { label: "Governance Check", done: gen.elapsed > 15000 },
                        { label: "Render PDF", done: false },
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            step.done ? "bg-emerald-500/20 text-emerald-400" : "bg-[rgba(201,168,76,0.1)] text-[var(--text-muted)]"
                          }`}>
                            {step.done ? "✓" : i + 1}
                          </div>
                          <span className={`text-sm ${step.done ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[rgba(201,168,76,0.03)] rounded p-3">
                    <p className="text-xs text-[var(--text-muted)] italic">
                      Document type: {selectedInfo?.label || selectedType} &middot; This process runs through our governed AI agent pipeline — the same system used for all client work.
                    </p>
                  </div>
                </div>
              ) : gen.status === "complete" ? (
                /* ═══ COMPLETE STATE ═══ */
                <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.15)] rounded-lg overflow-hidden">
                  <div className="bg-emerald-500/5 border-b border-emerald-500/20 px-8 py-5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-emerald-400 text-lg">✓</span>
                      <h2 className="font-serif text-xl font-bold text-emerald-400">Document Generated</h2>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Your {selectedInfo?.label || selectedType} is ready for download and attorney review.</p>
                  </div>

                  <div className="p-8 space-y-6">
                    {/* Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: "Agent", value: gen.agentName || "—" },
                        { label: "Confidence", value: gen.confidence ? `${Math.round(gen.confidence * 100)}%` : "—" },
                        { label: "Model", value: gen.model || "—" },
                        { label: "Tokens", value: String(gen.tokensUsed || 0) },
                        { label: "Time", value: gen.processingTimeMs ? `${(gen.processingTimeMs / 1000).toFixed(1)}s` : "—" },
                        { label: "Pages", value: String(gen.pageCount || 1) },
                      ].map((m) => (
                        <div key={m.label} className="bg-[var(--midnight)] rounded-lg px-4 py-3 border border-[rgba(255,255,255,0.05)]">
                          <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] block mb-0.5">{m.label}</span>
                          <span className="text-sm font-bold text-[var(--gold)]">{m.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Confidence Bar */}
                    {gen.confidence && (
                      <div>
                        <span className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2 block">Confidence Score</span>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                gen.confidence >= 0.85 ? "bg-emerald-400" : gen.confidence >= 0.6 ? "bg-[var(--gold)]" : "bg-red-400"
                              }`}
                              style={{ width: `${Math.round(gen.confidence * 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-mono font-bold ${
                            gen.confidence >= 0.85 ? "text-emerald-400" : gen.confidence >= 0.6 ? "text-[var(--gold)]" : "text-red-400"
                          }`}>
                            {Math.round(gen.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Download Button */}
                    {gen.blobUrl && (
                      <a
                        href={gen.blobUrl}
                        download={gen.filename}
                        className="flex items-center justify-center gap-3 w-full bg-[var(--gold)] text-[var(--midnight)] py-4 font-serif text-sm font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[var(--gold-light)] transition-colors no-underline"
                      >
                        <span className="text-lg">⬇</span>
                        Download PDF — {gen.filename}
                      </a>
                    )}

                    {/* Disclaimer */}
                    <div className="flex items-start gap-2 p-4 bg-amber-500/5 rounded border border-amber-500/15">
                      <span className="text-amber-400 text-sm mt-0.5">⚠</span>
                      <p className="text-xs text-amber-400/90 leading-relaxed">
                        <strong>AI-GENERATED DRAFT — NOT FOR FILING.</strong> This document was drafted by an AI agent and contains a DRAFT watermark.
                        It must be reviewed and approved by a licensed attorney before submission to any court, agency, or opposing party.
                        UNYKORN Law does not provide legal advice through AI-generated documents.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button
                        onClick={resetForm}
                        className="flex-1 border border-[var(--gold)] text-[var(--gold)] py-3 font-serif text-sm font-bold tracking-[0.1em] uppercase rounded-sm hover:bg-[rgba(201,168,76,0.1)] transition-colors cursor-pointer bg-transparent"
                      >
                        Generate Another
                      </button>
                      <Link
                        href="/intake"
                        className="flex-1 text-center border border-[rgba(255,255,255,0.1)] text-[var(--text-primary)] py-3 font-serif text-sm font-bold tracking-[0.1em] uppercase rounded-sm hover:border-[var(--gold)] transition-colors no-underline"
                      >
                        Submit Full Case
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* ═══ RIGHT SIDEBAR ═══ */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
                <h3 className="font-serif text-sm font-bold text-[var(--gold)] mb-3">How It Works</h3>
                <ol className="space-y-3 text-sm text-[var(--text-muted)]">
                  <li className="flex gap-2"><span className="text-[var(--gold)] font-bold">1.</span> Select document type and enter case details</li>
                  <li className="flex gap-2"><span className="text-[var(--gold)] font-bold">2.</span> AI agent researches law and drafts content</li>
                  <li className="flex gap-2"><span className="text-[var(--gold)] font-bold">3.</span> System renders court-standard PDF with DRAFT watermark</li>
                  <li className="flex gap-2"><span className="text-[var(--gold)] font-bold">4.</span> Download, review with attorney, finalize, file</li>
                </ol>
              </div>

              {/* What ChatGPT Can't Do */}
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
                <h3 className="font-serif text-sm font-bold text-[var(--gold)] mb-3">Why Not Just Use ChatGPT?</h3>
                <div className="space-y-3 text-xs text-[var(--text-muted)]">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    <p>ChatGPT outputs markdown text. We output <strong className="text-[var(--text-primary)]">court-ready PDFs</strong> with proper legal formatting.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    <p>ChatGPT has no escalation. Our agents <strong className="text-[var(--text-primary)]">auto-flag low-confidence outputs</strong> for attorney review.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    <p>ChatGPT has no forbidden actions. Our agents <strong className="text-[var(--text-primary)]">cannot file documents, contact parties, or sign pleadings</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    <p>ChatGPT has no audit trail. Every document we produce is <strong className="text-[var(--text-primary)]">logged with agent ID, confidence, and timestamp</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✕</span>
                    <p>ChatGPT hallucination goes unchecked. Our confidence scoring <strong className="text-[var(--text-primary)]">flags uncertainty markers</strong> and deducts score.</p>
                  </div>
                </div>
              </div>

              {/* Recent Documents */}
              {recentDocs.length > 0 && (
                <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6">
                  <h3 className="font-serif text-sm font-bold text-[var(--gold)] mb-3">Recent Documents</h3>
                  <div className="space-y-2">
                    {recentDocs.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.blobUrl}
                        download={doc.filename}
                        className="flex items-center justify-between p-3 rounded bg-[var(--midnight)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(201,168,76,0.2)] transition-colors no-underline block"
                      >
                        <div>
                          <span className="text-xs text-[var(--text-primary)] font-mono block">{doc.filename.slice(0, 35)}...</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{new Date(doc.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className={`text-xs font-bold ${doc.confidence >= 0.85 ? "text-emerald-400" : doc.confidence >= 0.6 ? "text-[var(--gold)]" : "text-red-400"}`}>
                          {Math.round(doc.confidence * 100)}%
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.15)] rounded-lg p-6 text-center">
                <p className="font-serif text-sm font-bold mb-2">Need comprehensive representation?</p>
                <p className="text-xs text-[var(--text-muted)] mb-4">Submit a full case and get all 26 agents working for you.</p>
                <Link
                  href="/intake"
                  className="inline-block bg-[var(--gold)] text-[var(--midnight)] px-6 py-2.5 font-serif text-xs font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[var(--gold-light)] transition-colors no-underline"
                >
                  Free Case Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
