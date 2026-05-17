import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { formatMonth } from "@/lib/signals";
import { ArrowDown, ArrowUp, Download, Lock } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · TAMEYO Monitor" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { subscriber, snapshots } = useApp();
  const rev = [...snapshots].reverse();
  const cancelled = subscriber.status === "cancelled";

  if (snapshots.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-10 text-center">
        <h1 className="text-2xl mb-2">Reports</h1>
        <p className="text-text-secondary">Your first report will appear here after your first monitoring run.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl mb-1">Reports</h1>
      <p className="text-text-secondary mb-6">Every monthly snapshot, archived for your records.</p>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {rev.map((s, i) => {
          const prev = rev[i + 1];
          const delta = prev ? s.presence_score - prev.presence_score : 0;
          const isNewest = i === 0;
          return (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
              <div className="w-24 shrink-0">
                <div className="text-sm font-bold">Report #{s.report_number}</div>
                <div className="text-xs text-text-muted">{formatMonth(s.snapshot_date)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold tracking-tight">{s.presence_score}</div>
                  {prev && (
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        delta >= 0
                          ? "bg-[var(--signal-green-bg)] text-[var(--signal-green)]"
                          : "bg-[var(--signal-red-bg)] text-[var(--signal-red)]"
                      }`}
                    >
                      {delta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {delta >= 0 ? "+" : ""}
                      {delta}
                    </div>
                  )}
                  {isNewest && (
                    <span className="bg-[var(--brand-orange)] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-muted mt-1 truncate">Priority: {s.priority_action}</div>
              </div>
              {cancelled ? (
                <button disabled className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-muted text-text-muted">
                  <Lock className="w-3 h-3" /> Reactivate to download
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md border border-border text-text-secondary disabled:opacity-60 disabled:cursor-not-allowed"
                  title="PDF generating..."
                >
                  <Download className="w-3 h-3" /> PDF generating...
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}