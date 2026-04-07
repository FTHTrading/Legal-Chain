"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { store } from "./store";

/** Subscribe to the platform store — re-renders on any store mutation */
export function useStore() {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.stats,
    () => store.stats
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
