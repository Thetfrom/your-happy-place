import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useApp, PLAN_ACCESS } from "@/lib/app-context";
import { formatMonth } from "@/lib/signals";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/ai-visibility")({
  head: () => ({ meta: [{ title: "AI Visibility · TAMEYO Monitor" }] }),
  component: Page,
});

function Page() {
  const { subscriber, snapshots, latest } = useApp();
  if (!PLAN_ACCESS[subscriber.plan].agency) return <Navigate to="/upgrade" search={{ feature: "AI visibility" }} />;
  if (!latest) return null;
  return (
    <div>
      <h1 className="text-3xl mb-1">AI Visibility</h1>
      <p className="text-text-secondary mb-6">Where your business shows up in AI-generated answers.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {([["ChatGPT", latest.ai_visibility_chatgpt], ["Google AI Overviews", latest.ai_visibility_google]] as const).map(([title, status]) => {
          const ok = status === "Present";
          return (
            <div key={title} className="bg-card border border-border rounded-xl p-6">
              <div className="text-xs uppercase text-text-muted font-semibold">{title}</div>
              <div className={`flex items-center gap-3 mt-2 text-2xl font-bold ${ok ? "text-[var(--signal-green)]" : "text-[var(--signal-red)]"}`}>
                {ok ? <Check className="w-7 h-7" /> : <X className="w-7 h-7" />} {status}
              </div>
              <div className="text-xs text-text-muted mt-2">Last checked {formatMonth(latest.snapshot_date)}</div>
            </div>
          );
        })}
      </div>
      <h2 className="text-xl mb-3">History</h2>
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {(["ai_visibility_chatgpt", "ai_visibility_google"] as const).map((field) => (
          <div key={field}>
            <div className="text-sm font-semibold mb-2 capitalize">{field.replace("ai_visibility_", "").replace("_", " ")}</div>
            <div className="flex items-end gap-2 flex-wrap">
              {snapshots.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div className={`w-4 h-4 rounded-full ${s[field] === "Present" ? "bg-[var(--signal-green)]" : "bg-[var(--signal-red)]"}`} />
                  <div className="text-[10px] text-text-muted">{formatMonth(s.snapshot_date).split(" ")[0]}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}