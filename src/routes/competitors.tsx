import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useApp, PLAN_ACCESS } from "@/lib/app-context";

export const Route = createFileRoute("/competitors")({
  head: () => ({ meta: [{ title: "Competitors · TAMEYO Monitor" }] }),
  component: Page,
});

function Page() {
  const { subscriber, snapshots, latest } = useApp();
  if (!PLAN_ACCESS[subscriber.plan].agency) return <Navigate to="/upgrade" search={{ feature: "competitors" }} />;
  if (!latest) return null;
  return (
    <div>
      <h1 className="text-3xl mb-1">Competitors</h1>
      <p className="text-text-secondary mb-6">Maps rank vs your 3 closest rivals for "{subscriber.target_keyword_1}".</p>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-text-muted text-left">
            <tr><th className="px-5 py-3">Site</th><th className="px-5 py-3">Maps rank</th><th className="px-5 py-3">Change vs first month</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="bg-[var(--brand-orange)]/5">
              <td className="px-5 py-3 font-bold">{subscriber.business_name}</td>
              <td className="px-5 py-3">#{latest.maps_rank_kw1}</td>
              <td className="px-5 py-3 text-[var(--signal-green)] font-semibold">{snapshots[0].maps_rank_kw1 - latest.maps_rank_kw1 > 0 ? "↑ " + (snapshots[0].maps_rank_kw1 - latest.maps_rank_kw1) : "—"}</td>
            </tr>
            {[1, 2, 3].map((i) => {
              const url = subscriber[`competitor_${i}_url` as "competitor_1_url"];
              const rank = latest[`competitor_${i}_maps_rank` as "competitor_1_maps_rank"];
              if (!url) return null;
              return (
                <tr key={i}>
                  <td className="px-5 py-3">{url}</td>
                  <td className="px-5 py-3">#{rank}</td>
                  <td className="px-5 py-3 text-text-muted">—</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}