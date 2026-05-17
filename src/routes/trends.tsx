import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useApp, PLAN_ACCESS } from "@/lib/app-context";
import { formatMonth, tierSignals } from "@/lib/signals";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trends")({
  head: () => ({ meta: [{ title: "Trends · TAMEYO Monitor" }] }),
  component: TrendsPage,
});

function TrendsPage() {
  const { subscriber, snapshots } = useApp();
  const [range, setRange] = useState<"3M" | "6M" | "12M" | "All">("All");
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  if (!PLAN_ACCESS[subscriber.plan].trends) {
    return <Navigate to="/upgrade" search={{ feature: "trends" }} />;
  }

  const limit = range === "3M" ? 3 : range === "6M" ? 6 : range === "12M" ? 12 : snapshots.length;
  const data = snapshots.slice(-limit).map((s) => ({
    month: formatMonth(s.snapshot_date),
    score: s.presence_score,
    benchmark: 58,
  }));

  if (snapshots.length < 2) {
    return (
      <div>
        <h1 className="text-3xl mb-6">Trends</h1>
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <div className="text-5xl font-bold text-[var(--brand-orange)] mb-2">
            {snapshots[0]?.presence_score ?? "—"}
          </div>
          <p className="text-text-secondary">
            Your trend line will appear here after your second report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl mb-1">Trends</h1>
          <p className="text-text-secondary">Your presence score and signals over time.</p>
        </div>
        <div className="flex items-center gap-2">
          {(["3M", "6M", "12M", "All"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-md transition-colors",
                range === r
                  ? "bg-[var(--brand-navy)] text-white"
                  : "bg-card border border-border text-text-secondary hover:bg-muted"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" stroke="#888" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 13 }} />
              {showBenchmark && (
                <Line type="monotone" dataKey="benchmark" stroke="#888" strokeDasharray="5 5" dot={false} name="Industry avg" />
              )}
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--brand-orange)"
                strokeWidth={3}
                dot={{ r: 5, fill: "var(--brand-orange)" }}
                activeDot={{ r: 7 }}
                name="Presence score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={showBenchmark}
            onChange={(e) => setShowBenchmark(e.target.checked)}
            className="accent-[var(--brand-orange)]"
          />
          Show industry average for {subscriber.city}
        </label>
      </div>

      <h2 className="text-xl mt-8 mb-3">Signal trends</h2>
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {tierSignals(subscriber.plan).map((sig) => {
          const isOpen = open === sig.key;
          const sigData = snapshots.slice(-limit).map((s) => ({
            month: formatMonth(s.snapshot_date),
            v: sig.raw(s),
          }));
          return (
            <div key={sig.key}>
              <button
                onClick={() => setOpen(isOpen ? null : sig.key)}
                className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-muted/40 transition-colors"
              >
                <span className="font-semibold">{sig.name}</span>
                <span className="text-sm text-text-muted">
                  {sig.format(snapshots[snapshots.length - 1])}
                  <span className="ml-2">{isOpen ? "−" : "+"}</span>
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sigData}>
                      <XAxis dataKey="month" stroke="#888" fontSize={11} />
                      <YAxis stroke="#888" fontSize={11} reversed={sig.invert} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="v" stroke="var(--brand-orange)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}