import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SEED_WORKFLOW_INTAKE } from "@/lib/data/seed-platform";

export const metadata = {
  title: "Task Manager — UNYKORN // LAW",
  description: "Track workflow tasks, agent assignments, dependencies, and deadlines.",
};

export default function TasksPage() {
  const tasks = SEED_WORKFLOW_INTAKE.tasks;
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

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
                <h2 className="font-serif text-lg font-bold">{SEED_WORKFLOW_INTAKE.title}</h2>
                <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
                  Type: {SEED_WORKFLOW_INTAKE.workflowType} · Matter: {SEED_WORKFLOW_INTAKE.matterId.slice(0, 8)}…
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
                      {task.requiresApproval && (
                        <span className="text-orange-400">Requires Approval</span>
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
    </>
  );
}
