"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useTasks, useToast } from "@/lib/hooks";
import { store } from "@/lib/store";
import { ToastContainer } from "@/components/ui";

const AGENT_OPTIONS = [
  { id: "compliance-agent-001", label: "Compliance Agent" },
  { id: "research-agent-001", label: "Research Agent" },
  { id: "filing-agent-001", label: "Filing Agent" },
  { id: "forensic-chain-agent-001", label: "Forensic Agent" },
  { id: "kevan-burns", label: "Kevan Burns" },
];

export default function TasksPage() {
  const tasks = useTasks();
  const { toasts, toast } = useToast();
  const [reassignId, setReassignId] = useState<string | null>(null);
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const statusColor = (status: string) => {
    const m: Record<string, string> = {
      completed: "text-green-400 bg-green-900/20",
      in_progress: "text-yellow-400 bg-yellow-900/20",
      awaiting_approval: "text-orange-400 bg-orange-900/20",
      pending: "text-gray-400 bg-gray-900/20",
      blocked: "text-red-400 bg-red-900/20",
      cancelled: "text-gray-500 bg-gray-900/10",
      failed: "text-red-500 bg-red-900/30",
    };
    return m[status] || "text-gray-400 bg-gray-900/20";
  };

  const priorityIcon = (priority: string) => {
    const m: Record<string, string> = {
      low: "○",
      normal: "●",
      high: "▲",
      urgent: "⚠",
      court_deadline: "⛔",
    };
    return m[priority] || "●";
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">OPERATIONS › TASKS</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              TASK<br /><span className="text-[var(--gold)]">MANAGER.</span>
            </h1>
            <p className="text-[var(--text-muted)] max-w-2xl">
              Track workflow execution across all matters. Monitor agent assignments, task dependencies, and completion status.
            </p>
          </div>

          {/* Workflow Progress */}
          <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold">Case Intake & Evidence Gathering</h2>
                <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
                  Type: case_intake · {tasks.length} tasks
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-serif font-bold text-[var(--gold)]">{progressPct}%</p>
                <p className="text-xs font-mono text-[var(--text-muted)]">{completedCount}/{tasks.length} complete</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-[var(--navy)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--gold)] rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {tasks.length === 0 && (
              <div className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-12 text-center">
                <p className="text-3xl mb-3">📋</p>
                <h3 className="font-serif text-lg font-bold mb-2">No Tasks Yet</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Tasks will appear here as workflows are initiated for active matters.
                </p>
              </div>
            )}
            {tasks.map((task, idx) => (
              <div key={task.id}
                className={`bg-[var(--navy-card)] border rounded-lg p-5 ${
                  task.status === "in_progress"
                    ? "border-[var(--gold)]"
                    : "border-[rgba(201,168,76,0.1)]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Step number */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ${
                    task.status === "completed"
                      ? "bg-green-900/30 text-green-400"
                      : task.status === "in_progress"
                        ? "bg-[var(--gold)] text-[var(--midnight)]"
                        : "bg-[var(--navy)] text-[var(--text-muted)]"
                  }`}>
                    {task.status === "completed" ? "✓" : idx + 1}
                  </div>

                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-serif text-base font-bold ${
                        task.status === "completed" ? "text-[var(--text-muted)] line-through" : ""
                      }`}>
                        {task.title}
                      </h3>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${statusColor(task.status)}`}>
                        {task.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mb-2">{task.description}</p>

                    <div className="flex flex-wrap gap-4 text-xs font-mono text-[var(--text-muted)]">
                      <span title="Priority">{priorityIcon(task.priority)} {task.priority}</span>
                      {task.assignedToAgent && (
                        <span>Agent: <span className="text-[var(--gold)]">{task.assignedToAgent.slice(0, 8)}…</span></span>
                      )}
                      {task.dependsOn.length > 0 && (
                        <span>Depends on: {task.dependsOn.length} task(s)</span>
                      )}
                    </div>

                    {/* Completion Details */}
                    {task.completedAt && (
                      <div className="mt-2 text-xs font-mono text-green-400/70">
                        Completed: {new Date(task.completedAt).toLocaleString()}
                      </div>
                    )}
                    {task.status !== "completed" && task.status !== "cancelled" && (
                      <div className="flex gap-2 mt-3">
                        {task.status === "pending" && (
                          <button onClick={() => { store.updateTaskStatus(task.id, "in_progress"); toast("info", "Task Started", `"${task.title}" is now in progress`); }} className="px-3 py-1 bg-[var(--gold)] text-[var(--midnight)] rounded text-xs font-mono hover:bg-[var(--gold-light)] transition-colors cursor-pointer">START</button>
                        )}
                        {(task.status === "in_progress" || task.status === "waiting_approval") && (
                          <button onClick={() => { store.updateTaskStatus(task.id, "completed"); toast("success", "Task Completed", `"${task.title}" marked complete`); }} className="px-3 py-1 bg-green-800/30 text-green-400 rounded text-xs font-mono hover:bg-green-800/40 transition-colors cursor-pointer">COMPLETE</button>
                        )}
                        <button onClick={() => { store.updateTaskStatus(task.id, "blocked"); toast("warning", "Task Blocked", `"${task.title}" marked as blocked`); }} className="px-3 py-1 bg-transparent border border-red-800/30 text-red-400 rounded text-xs font-mono hover:bg-red-900/20 transition-colors cursor-pointer">BLOCK</button>
                        {reassignId === task.id ? (
                          <div className="flex gap-1 items-center">
                            <select onChange={(e) => { if (e.target.value) { store.reassignTask(task.id, e.target.value); const label = AGENT_OPTIONS.find(a => a.id === e.target.value)?.label || e.target.value; toast("info", "Reassigned", `"${task.title}" → ${label}`); setReassignId(null); } }} defaultValue="" className="bg-[var(--midnight)] border border-[var(--gold)]/20 rounded px-2 py-1 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]/50">
                              <option value="" disabled>Select agent…</option>
                              {AGENT_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                            </select>
                            <button onClick={() => setReassignId(null)} className="text-xs text-[var(--text-muted)] hover:text-white cursor-pointer">✕</button>
                          </div>
                        ) : (
                          <button onClick={() => setReassignId(task.id)} className="px-3 py-1 bg-transparent border border-[rgba(201,168,76,0.2)] text-[var(--text-muted)] rounded text-xs font-mono hover:border-[var(--gold)] hover:text-white transition-colors cursor-pointer">REASSIGN</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 border-t border-[rgba(201,168,76,0.1)] pt-6">
            <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed">
              WORKFLOW ENGINE: Tasks are executed by assigned agents and advance automatically when dependencies are met.
              Tasks requiring approval pause execution until an authorized reviewer approves continuation.
              All task state transitions are recorded in the immutable audit log.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <ToastContainer toasts={toasts} />
    </>
  );
}
