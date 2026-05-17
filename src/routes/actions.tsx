import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useApp, PLAN_ACCESS } from "@/lib/app-context";
import { formatMonth } from "@/lib/signals";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/actions")({
  head: () => ({ meta: [{ title: "Actions · TAMEYO Monitor" }] }),
  component: ActionsPage,
});

function ActionsPage() {
  const { subscriber, snapshots, actionStates, toggleAction } = useApp();
  if (!PLAN_ACCESS[subscriber.plan].actions) {
    return <Navigate to="/upgrade" search={{ feature: "actions" }} />;
  }
  const rev = [...snapshots].reverse();
  return (
    <div>
      <h1 className="text-3xl mb-1">Action History</h1>
      <p className="text-text-secondary mb-6">Every monthly priority action — track what you've completed.</p>
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {rev.map((s, i) => {
          const done = actionStates.find((a) => a.snapshot_id === s.id)?.is_done ?? false;
          const isCurrent = i === 0;
          return (
            <div key={s.id} className="flex items-start gap-4 px-5 py-4">
              <button
                onClick={() => toggleAction(s.id)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                  done
                    ? "bg-[var(--signal-green)] border-[var(--signal-green)] text-white"
                    : "border-border bg-card hover:border-[var(--brand-orange)]"
                )}
              >
                {done && <Check className="w-4 h-4" />}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {isCurrent && (
                    <span className="bg-[var(--brand-orange)] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                      Current priority
                    </span>
                  )}
                  <span className="text-xs text-text-muted">
                    {formatMonth(s.snapshot_date)} · {s.priority_signal}
                  </span>
                </div>
                <div className={cn("text-sm mt-1", done && "line-through text-text-muted")}>
                  {s.priority_action}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}