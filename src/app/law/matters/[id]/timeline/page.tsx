"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { use, useState } from "react";
import { SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON } from "@/lib/data/seed";
import MatterTabs from "@/components/law/MatterTabs";

const ALL_MATTERS = [SEED_MATTER_CREAMER, SEED_MATTER_DELCAMPO, SEED_MATTER_TRON];

function getMatter(id: string) {
  return ALL_MATTERS.find(m => m.id === id) || null;
}

type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  type: "deadline" | "evidence" | "milestone" | "created" | "updated";
  status?: string;
  notes?: string;
};

const TYPE_ICONS: Record<string, string> = {
  deadline: "⏰",
  evidence: "📄",
  milestone: "🏁",
  created: "🟢",
  updated: "🔄",
};

const TYPE_COLORS: Record<string, string> = {
  deadline: "border-[var(--gold)]",
  evidence: "border-[rgba(96,165,250,0.5)]",
  milestone: "border-[var(--success)]",
  created: "border-[var(--success)]",
  updated: "border-[rgba(156,163,175,0.3)]",
};

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-[rgba(201,168,76,0.15)]", text: "text-[var(--gold)]" },
  met: { bg: "bg-[rgba(34,197,94,0.15)]", text: "text-[var(--success)]" },
  missed: { bg: "bg-[rgba(239,68,68,0.15)]", text: "text-red-400" },
  extended: { bg: "bg-[rgba(96,165,250,0.15)]", text: "text-blue-400" },
  verified: { bg: "bg-[rgba(34,197,94,0.15)]", text: "text-[var(--success)]" },
  supported: { bg: "bg-[rgba(201,168,76,0.15)]", text: "text-[var(--gold)]" },
  alleged: { bg: "bg-[rgba(156,163,175,0.15)]", text: "text-[var(--text-muted)]" },
  disputed: { bg: "bg-[rgba(239,68,68,0.15)]", text: "text-red-400" },
};

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.startsWith("TBD")) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const matter = getMatter(id);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  if (!matter) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-[104px] pb-16 px-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-[var(--gold)]">Matter Not Found</h1>
          <Link href="/law" className="text-[var(--gold)] mt-4 inline-block">← Back to Cases</Link>
        </main>
        <Footer />
      </>
    );
  }



  // Build unified timeline from all sources
  const events: TimelineEvent[] = [];

  // Case creation / update
  events.push({
    id: "evt-created",
    date: matter.createdAt,
    title: "Case Created",
    type: "created",
    notes: `${matter.matterId} — ${matter.type.replace(/_/g, " ")}`,
  });

  if (matter.updatedAt !== matter.createdAt) {
    events.push({
      id: "evt-updated",
      date: matter.updatedAt,
      title: "Case Updated",
      type: "updated",
    });
  }

  // Deadlines
  matter.deadlines.forEach(dl => {
    events.push({
      id: dl.id,
      date: dl.date,
      title: dl.title,
      type: "deadline",
      status: dl.status,
      notes: dl.notes,
    });
  });

  // Evidence items with dates
  matter.evidence.forEach(ev => {
    const date = ev.dateObtained || ev.dateOfDocument;
    if (date) {
      events.push({
        id: ev.id,
        date,
        title: ev.title,
        type: "evidence",
        status: ev.status,
        notes: ev.description,
      });
    }
  });

  // Sort: items with parseable dates first (chronological), TBD items at bottom
  events.sort((a, b) => {
    const da = parseDate(a.date);
    const db = parseDate(b.date);
    if (da && db) return da.getTime() - db.getTime();
    if (da) return -1;
    if (db) return 1;
    return 0;
  });

  const filteredEvents = typeFilter === "all"
    ? events
    : events.filter(e => e.type === typeFilter);

  const typeCounts = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const upcomingDeadlines = matter.deadlines.filter(dl => {
    const d = parseDate(dl.date);
    return d && d > new Date() && dl.status === "pending";
  }).sort((a, b) => {
    const da = parseDate(a.date)!;
    const db = parseDate(b.date)!;
    return da.getTime() - db.getTime();
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mb-6">
            <Link href="/law" className="text-[var(--gold)] no-underline hover:underline">Cases</Link>
            <span>/</span>
            <Link href={`/law/matters/${id}`} className="text-[var(--gold)] no-underline hover:underline">{matter.matterId}</Link>
            <span>/</span>
            <span>Timeline</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Case Timeline</h1>
          <p className="text-[var(--text-muted)] mb-8">
            {events.length} events — {matter.title}
          </p>

          {/* Tabs */}
          <MatterTabs matterId={id} />

          {/* Upcoming Deadlines Alert */}
          {upcomingDeadlines.length > 0 && (
            <div className="bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] rounded-lg p-6 mb-8">
              <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-3">
                ⏰ Upcoming Deadlines ({upcomingDeadlines.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {upcomingDeadlines.map(dl => {
                  const d = parseDate(dl.date)!;
                  const daysAway = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={dl.id} className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">{dl.title}</div>
                        <div className="text-xs font-mono text-[var(--text-muted)]">{formatDate(dl.date)}</div>
                      </div>
                      <span className={`text-xs font-mono font-bold ${daysAway <= 7 ? "text-red-400" : daysAway <= 30 ? "text-[var(--gold)]" : "text-[var(--text-muted)]"}`}>
                        {daysAway}d
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors border ${
                typeFilter === "all"
                  ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)]"
                  : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:border-[var(--gold)]"
              }`}>
              All ({events.length})
            </button>
            {Object.entries(typeCounts).map(([type, count]) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors border ${
                  typeFilter === type
                    ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)]"
                    : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:border-[var(--gold)]"
                }`}>
                {TYPE_ICONS[type] || "📌"} {type} ({count})
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[rgba(201,168,76,0.15)]" />

            <div className="space-y-0">
              {filteredEvents.map((event, i) => {
                const badge = event.status ? STATUS_BADGES[event.status] : null;
                return (
                  <div key={event.id} className="relative pl-16 pb-8">
                    {/* Dot */}
                    <div className={`absolute left-4 top-1 w-5 h-5 rounded-full border-2 bg-[var(--midnight)] ${TYPE_COLORS[event.type] || "border-[var(--gold)]"} flex items-center justify-center`}>
                      <span className="text-[10px]">{TYPE_ICONS[event.type] || "📌"}</span>
                    </div>

                    {/* Content */}
                    <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-serif text-sm font-semibold">{event.title}</span>
                            {badge && (
                              <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                                {event.status}
                              </span>
                            )}
                          </div>
                          {event.notes && (
                            <p className="text-xs text-[var(--text-muted)] mt-1">{event.notes}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono text-[var(--gold)]">{formatDate(event.date)}</div>
                          <div className="text-[10px] font-mono text-[var(--text-muted)] capitalize">{event.type}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {filteredEvents.length === 0 && (
            <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">📅</div>
              <p className="font-serif text-lg text-[var(--text-muted)]">No events match this filter</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
