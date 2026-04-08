"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { store } from "./store";

/** Stable empty snapshot for SSR (no localStorage on server) */
const SERVER_SNAPSHOT = {
  totalIntakes: 0, pendingIntakes: 0, totalApprovals: 0, pendingApprovals: 0,
  approvedCount: 0, totalTasks: 0, completedTasks: 0, activeTasks: 0,
  totalComms: 0, pendingComms: 0, totalAuditEntries: 0, agentCount: 26,
  activeCases: 0, notifications: 0, totalResearch: 0,
} as const;

/** Subscribe to the platform store — re-renders on any store mutation */
export function useStore() {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.stats,
    () => SERVER_SNAPSHOT
  );
}

/** Subscribe to intakes */
export function useIntakes() {
  const [, setTick] = useState(0);
  useEffect(() => store.subscribe(() => setTick((t) => t + 1)), []);
  return store.intakes;
}

/** Subscribe to approvals */
export function useApprovals() {
  const [, setTick] = useState(0);
  useEffect(() => store.subscribe(() => setTick((t) => t + 1)), []);
  return store.approvals;
}

/** Subscribe to tasks */
export function useTasks() {
  const [, setTick] = useState(0);
  useEffect(() => store.subscribe(() => setTick((t) => t + 1)), []);
  return store.tasks;
}

/** Subscribe to communications */
export function useCommunications() {
  const [, setTick] = useState(0);
  useEffect(() => store.subscribe(() => setTick((t) => t + 1)), []);
  return store.communications;
}

/** Subscribe to audit log */
export function useAudit() {
  const [, setTick] = useState(0);
  useEffect(() => store.subscribe(() => setTick((t) => t + 1)), []);
  return store.audit;
}

/** Subscribe to notifications */
export function useNotifications() {
  const [, setTick] = useState(0);
  useEffect(() => store.subscribe(() => setTick((t) => t + 1)), []);
  return store.notifications;
}

/** Subscribe to research queries */
export function useResearch() {
  const [, setTick] = useState(0);
  useEffect(() => store.subscribe(() => setTick((t) => t + 1)), []);
  return store.research;
}

/** Toast notification system */
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; type: string; title: string; message: string }>>([]);

  const toast = useCallback((type: "success" | "error" | "warning" | "info", title: string, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return { toasts, toast };
}
