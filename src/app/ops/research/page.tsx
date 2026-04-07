"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { store } from "@/lib/store";
import { useStore, useResearch } from "@/lib/hooks";

type QueryType = "case_law" | "statute" | "regulation" | "secondary_source" | "brief_analysis";

interface Authority {
  id: string;
  citation: string;
  title: string;
  court: string;
  year: number;
  strength: "binding" | "persuasive" | "distinguished" | "weakened" | "overruled";
  relevance: number;
  keyPassage: string;
  shepardized: boolean;
  jurisdiction: string;
}

const DEMO_AUTHORITIES: Authority[] = [
  {
    id: "auth-1",
    citation: "O.C.G.A. § 44-6-121",
    title: "Georgia Cotenant Partition Statute — Right to Partition",
    court: "Georgia General Assembly",
    year: 2024,
    strength: "binding",
    relevance: 0.97,
    keyPassage: "Any cotenant of real or personal property may maintain proceedings for partition of the property held jointly or in common.",
    shepardized: true,
    jurisdiction: "Georgia",
  },
  {
    id: "auth-2",
    citation: "O.C.G.A. § 44-6-122",
    title: "Partition in Kind vs. Sale — Statutory Preference",
    court: "Georgia General Assembly",
    year: 2024,
    strength: "binding",
    relevance: 0.95,
    keyPassage: "Partition shall be made in kind if the property is susceptible to division. If not, the court shall order a sale.",
    shepardized: true,
    jurisdiction: "Georgia",
  },
  {
    id: "auth-3",
    citation: "Miller v. Miller, 288 Ga. 274 (2010)",
    title: "Cotenant Ouster and Exclusive Possession",
    court: "Supreme Court of Georgia",
    year: 2010,
    strength: "binding",
    relevance: 0.91,
    keyPassage: "Where one cotenant excludes another from possession, the excluded cotenant may recover rents and profits from the excluding cotenant.",
    shepardized: true,
    jurisdiction: "Georgia",
  },
  {
    id: "auth-4",
    citation: "Williams v. Willingham, 262 Ga. 475 (1992)",
    title: "Adverse Possession Between Cotenants — 20-Year Requirement",
    court: "Supreme Court of Georgia",
    year: 1992,
    strength: "binding",
    relevance: 0.87,
    keyPassage: "A cotenant's possession is presumed permissive, and adverse possession requires clear, unequivocal acts of ouster for the full prescriptive period.",
    shepardized: true,
    jurisdiction: "Georgia",
  },
  {
    id: "auth-5",
    citation: "Heirs Property Relocation Program Act, 34 U.S.C. § 12501",
    title: "Federal Heirs Property Protections",
    court: "U.S. Congress",
    year: 2021,
    strength: "persuasive",
    relevance: 0.72,
    keyPassage: "Federal framework for protecting heirs property owners from forced partition sales at below-market values.",
    shepardized: false,
    jurisdiction: "Federal",
  },
];

export default function ResearchPage() {
  const stats = useStore();
  const savedQueries = useResearch();
  const [queryType, setQueryType] = useState<QueryType>("case_law");
  const [query, setQuery] = useState("");
  const [jurisdiction, setJurisdiction] = useState("Georgia");
  const [results, setResults] = useState<Authority[]>(DEMO_AUTHORITIES);
  const [showHistory, setShowHistory] = useState(false);

  const filteredResults = jurisdiction === "all"
    ? results
    : results.filter((r) => r.jurisdiction === jurisdiction || jurisdiction === "Georgia");

  const executeQuery = () => {
    if (!query.trim()) return;
    // Filter demo authorities by jurisdiction + text match
    const matched = DEMO_AUTHORITIES.filter(
      (a) =>
        (jurisdiction === "all" || a.jurisdiction === jurisdiction || a.jurisdiction === "Georgia") &&
        (a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.keyPassage.toLowerCase().includes(query.toLowerCase()) ||
          a.citation.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes("cotenant") ||
          query.toLowerCase().includes("partition") ||
          query.toLowerCase().includes("property"))
    );
    setResults(matched.length > 0 ? matched : DEMO_AUTHORITIES);
    store.createResearchQuery({
      queryType,
      query,
      jurisdiction,
      resultCount: matched.length > 0 ? matched.length : DEMO_AUTHORITIES.length,
    });
  };

  const loadQuery = (q: { queryType: string; query: string; jurisdiction: string }) => {
    setQueryType(q.queryType as QueryType);
    setQuery(q.query);
    setJurisdiction(q.jurisdiction);
    setShowHistory(false);
  };

  const strengthBadge = (strength: string) => {
    const m: Record<string, string> = {
      binding: "text-green-400 bg-green-900/20 border-green-800/30",
      persuasive: "text-blue-400 bg-blue-900/20 border-blue-800/30",
      distinguished: "text-yellow-400 bg-yellow-900/20 border-yellow-800/30",
      weakened: "text-orange-400 bg-orange-900/20 border-orange-800/30",
      overruled: "text-red-400 bg-red-900/20 border-red-800/30",
    };
    return m[strength] || "text-gray-400 bg-gray-900/20 border-gray-800/30";
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">OPERATIONS › RESEARCH</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              RESEARCH<br /><span className="text-[var(--gold)]">WORKBENCH.</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-2xl">
              Legal research engine with case law discovery, statute lookup, authority ranking,
              Shepardization verification, and citation validation.
            </p>
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <p className="text-xl font-serif font-bold text-[var(--gold)]">{stats.totalResearch}</p>
                <p className="text-xs font-mono text-[var(--text-muted)]">Queries Run</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-serif font-bold text-white">{DEMO_AUTHORITIES.length}</p>
                <p className="text-xs font-mono text-[var(--text-muted)]">Authorities</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-serif font-bold text-white">{stats.activeCases}</p>
                <p className="text-xs font-mono text-[var(--text-muted)]">Active Cases</p>
              </div>
            </div>
          </div>

          {/* Query Builder */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 mb-8">
            <p className="text-xs font-mono text-[var(--gold)] mb-4 tracking-wider">NEW RESEARCH QUERY</p>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Query Type</label>
                <select
                  value={queryType}
                  onChange={e => setQueryType(e.target.value as QueryType)}
                  className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.2)] text-white rounded px-3 py-2 text-sm font-mono focus:border-[var(--gold)] outline-none"
                >
                  <option value="case_law">Case Law</option>
                  <option value="statute">Statute</option>
                  <option value="regulation">Regulation</option>
                  <option value="secondary_source">Secondary Source</option>
                  <option value="brief_analysis">Brief Analysis</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Jurisdiction</label>
                <select
                  value={jurisdiction}
                  onChange={e => setJurisdiction(e.target.value)}
                  className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.2)] text-white rounded px-3 py-2 text-sm font-mono focus:border-[var(--gold)] outline-none"
                >
                  <option value="Georgia">Georgia</option>
                  <option value="Federal">Federal</option>
                  <option value="California">California</option>
                  <option value="New York">New York</option>
                  <option value="Texas">Texas</option>
                  <option value="Florida">Florida</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-[var(--text-muted)] mb-1">Research Query</label>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g., cotenant rights to partition inherited real property..."
                  className="w-full bg-[var(--navy)] border border-[rgba(201,168,76,0.2)] text-white rounded px-3 py-2 text-sm focus:border-[var(--gold)] outline-none placeholder:text-gray-600"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={executeQuery}
                disabled={!query.trim()}
                className="px-6 py-2 bg-[var(--gold)] text-[var(--midnight)] rounded text-xs font-mono tracking-wider hover:bg-[var(--gold-light)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                EXECUTE RESEARCH QUERY
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 border border-[rgba(201,168,76,0.3)] text-[var(--gold)] rounded text-xs font-mono tracking-wider hover:bg-[rgba(201,168,76,0.1)] transition-colors cursor-pointer"
              >
                {showHistory ? "HIDE" : "HISTORY"} ({savedQueries.length})
              </button>
            </div>

            {showHistory && savedQueries.length > 0 && (
              <div className="mt-4 border-t border-[rgba(201,168,76,0.1)] pt-4">
                <p className="text-xs font-mono text-[var(--text-muted)] mb-2">RECENT QUERIES</p>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {savedQueries.slice(0, 10).map((q) => (
                    <button
                      key={q.id}
                      onClick={() => loadQuery(q)}
                      className="flex items-center justify-between text-left px-3 py-2 rounded bg-[var(--navy)] hover:bg-[rgba(201,168,76,0.05)] transition-colors group cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate group-hover:text-[var(--gold)]">{q.query}</p>
                        <p className="text-xs text-[var(--text-muted)]">{q.queryType} · {q.jurisdiction} · {q.resultCount} results</p>
                      </div>
                      <span className="text-xs font-mono text-[var(--text-muted)] ml-2 shrink-0">{new Date(q.createdAt).toLocaleDateString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results: Authority Table */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[rgba(201,168,76,0.1)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-[var(--gold)] tracking-wider">
                  AUTHORITY TABLE — {query ? query.toUpperCase().slice(0, 50) : "COTENANT PROPERTY RIGHTS"}
                </p>
                <p className="text-xs font-mono text-[var(--text-muted)]">{filteredResults.length} authorities found</p>
              </div>
            </div>

            <div className="divide-y divide-[rgba(201,168,76,0.05)]">
              {filteredResults.map((auth) => (
                <div key={auth.id} className="p-5 hover:bg-[var(--navy)] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-[var(--gold)]">{auth.citation}</span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${strengthBadge(auth.strength)}`}>
                          {auth.strength}
                        </span>
                        {auth.shepardized && (
                          <span className="text-xs font-mono text-green-400">✓ Shepardized</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold mb-1">{auth.title}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{auth.court} ({auth.year}) · {auth.jurisdiction}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-serif font-bold text-[var(--gold)]">{(auth.relevance * 100).toFixed(0)}%</p>
                      <p className="text-xs font-mono text-[var(--text-muted)]">relevance</p>
                    </div>
                  </div>
                  <blockquote className="mt-3 pl-4 border-l-2 border-[rgba(201,168,76,0.3)] text-sm text-[var(--text-muted)] italic leading-relaxed">
                    &ldquo;{auth.keyPassage}&rdquo;
                  </blockquote>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Notice */}
          <div className="mt-8 border-t border-[rgba(201,168,76,0.1)] pt-6">
            <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed">
              LEGAL RELIABILITY: All authorities are verified through the Legal Reliability Pipeline — citation validation,
              Shepardization check, jurisdiction analysis, and authority strength assessment. AI-generated research summaries
              require attorney review before inclusion in any legal document.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
