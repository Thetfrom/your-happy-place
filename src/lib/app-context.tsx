import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { subscriber as defaultSubscriber, snapshots as allSnapshots, initialActionStates, type Plan, type Subscriber, type Snapshot, type ActionState } from "./mock-data";

interface AppState {
  subscriber: Subscriber;
  snapshots: Snapshot[];
  latest: Snapshot | null;
  previous: Snapshot | null;
  actionStates: ActionState[];
  setPlan: (p: Plan) => void;
  setStatus: (s: Subscriber["status"]) => void;
  setReportCount: (n: number) => void;
  toggleAction: (snapshotId: string) => void;
  updateSubscriber: (patch: Partial<Subscriber>) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [subscriber, setSubscriber] = useState<Subscriber>(defaultSubscriber);
  const [reportCount, setReportCount] = useState<number>(allSnapshots.length);
  const [actionStates, setActionStates] = useState<ActionState[]>(initialActionStates);

  const snapshots = useMemo(
    () => allSnapshots.slice(0, reportCount),
    [reportCount]
  );
  const latest = snapshots[snapshots.length - 1] ?? null;
  const previous = snapshots[snapshots.length - 2] ?? null;

  const value: AppState = {
    subscriber,
    snapshots,
    latest,
    previous,
    actionStates,
    setPlan: (plan) => setSubscriber((s) => ({ ...s, plan })),
    setStatus: (status) => setSubscriber((s) => ({ ...s, status })),
    setReportCount,
    toggleAction: (snapshot_id) =>
      setActionStates((prev) =>
        prev.map((a) =>
          a.snapshot_id === snapshot_id ? { ...a, is_done: !a.is_done } : a
        )
      ),
    updateSubscriber: (patch) => setSubscriber((s) => ({ ...s, ...patch })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export const PLAN_ACCESS: Record<Plan, { trends: boolean; compare: boolean; actions: boolean; agency: boolean; signalCount: number }> = {
  lite: { trends: false, compare: false, actions: false, agency: false, signalCount: 3 },
  pro: { trends: true, compare: true, actions: true, agency: false, signalCount: 8 },
  agency: { trends: true, compare: true, actions: true, agency: true, signalCount: 15 },
};

export const PLAN_PRICES = { lite: 27, pro: 67, agency: 147 } as const;
