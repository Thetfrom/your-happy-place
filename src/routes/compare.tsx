import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp, PLAN_ACCESS } from "@/lib/app-context";
import { tierSignals, formatMonth, computeRag } from "@/lib/signals";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { Snapshot } from "@/lib/mock-data";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare · TAMEYO Monitor" }] }),
  component: ComparePage,
});

function ComparePage() {
  const { subscriber, snapshots } = useApp();
  const [aIdx, setAIdx] = useState(Math.max(0, snapshots.length - 2));
  const [bIdx, setBIdx] = useState(Math.max(0, snapshots.length - 1));

  if (!PLAN_ACCESS[subscriber.plan].compare) {
    return <Navigate to="/upgrade" search={{ feature: "compare" }} />;
  }

  if (snapshots.length < 2) {
    return (
      <div className="bg-card border border-border rounded-xl p-10 text-center">
        <h1 className="text-2xl mb-2">Compare</h1>
        <p className="text-text-secondary">
          Your first comparison will be available after your second report.
        </p>
      </div>
    );
  }

  const a = snapshots[aIdx];
  const b = snapshots[bIdx];
  const delta = b.presence_score - a.presence_score;
  const sigs = tierSignals(subscriber.plan);

  return (
    <div>
      <h1 className="text-3xl mb-1">Compare</h1>
      <p className="text-text-secondary mb-6">Select any two months from the dropdowns below to see a side-by-side comparison of every signal — useful for tracking progress over a quarter or spotting what drove a score change.</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Picker label="Month A" value={aIdx} onChange={setAIdx} snapshots={snapshots} />
        <Picker label="Month B" value={bIdx} onChange={setBIdx} snapshots={snapshots} />
      </div>

      <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-around mb-6">
        <div className="text-center">
          <div className="text-xs uppercase text-text-muted font-semibold">{formatMonth(a.snapshot_date)}</div>
          <div className="text-5xl font-bold mt-1">{a.presence_score}</div>
        </div>
        <div
          className={`text-2xl font-bold px-4 py-2 rounded-full ${
            delta > 0
              ? "bg-[var(--signal-green-bg)] text-[var(--signal-green)]"
              : delta < 0
              ? "bg-[var(--signal-red-bg)] text-[var(--signal-red)]"
              : "bg-muted text-text-muted"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {delta}
        </div>
        <div className="text-center">
          <div className="text-xs uppercase text-text-muted font-semibold">{formatMonth(b.snapshot_date)}</div>
          <div className="text-5xl font-bold mt-1">{b.presence_score}</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs uppercase text-text-muted">
              <th className="px-5 py-3">Signal</th>
              <th className="px-5 py-3">Month A</th>
              <th className="px-5 py-3 text-center">Change</th>
              <th className="px-5 py-3">Month B</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sigs.map((sig) => {
              const av = sig.raw(a);
              const bv = sig.raw(b);
              const rag = computeRag(bv, av, sig.invert);
              const diff = bv - av;
              return (
                <tr key={sig.key}>
                  <td className="px-5 py-3 font-semibold">{sig.name}</td>
                  <td className="px-5 py-3 text-text-secondary">{sig.format(a)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {diff === 0 ? (
                        <Minus className="w-4 h-4 text-text-muted" />
                      ) : rag === "green" ? (
                        <ArrowUp className="w-4 h-4 text-[var(--signal-green)]" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-[var(--signal-red)]" />
                      )}
                      <span
                        className={
                          rag === "green"
                            ? "text-[var(--signal-green)] font-semibold"
                            : rag === "red"
                            ? "text-[var(--signal-red)] font-semibold"
                            : "text-text-muted"
                        }
                      >
                        {diff === 0 ? "—" : Math.abs(diff).toFixed(diff % 1 ? 2 : 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold">{sig.format(b)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Picker({ label, value, onChange, snapshots }: { label: string; value: number; onChange: (n: number) => void; snapshots: Snapshot[] }) {
  return (
    <label className="block">
      <div className="text-xs uppercase text-text-muted font-semibold mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm"
      >
        {snapshots.map((s, i) => (
          <option key={s.id} value={i}>
            {formatMonth(s.snapshot_date)} · Report #{s.report_number}
          </option>
        ))}
      </select>
    </label>
  );
}