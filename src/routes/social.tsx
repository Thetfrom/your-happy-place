import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useApp, PLAN_ACCESS } from "@/lib/app-context";
import { computeRag, deltaLabel } from "@/lib/signals";
import { SignalCard } from "@/components/SignalCard";

export const Route = createFileRoute("/social")({
  head: () => ({ meta: [{ title: "Social · TAMEYO Monitor" }] }),
  component: Page,
});

function Page() {
  const { subscriber, latest, previous } = useApp();
  if (!PLAN_ACCESS[subscriber.plan].agency) return <Navigate to="/upgrade" search={{ feature: "social" }} />;
  if (!latest) return null;
  const shadowClass =
    latest.instagram_shadowban_status === "None"
      ? "bg-[var(--signal-green-bg)] text-[var(--signal-green)]"
      : latest.instagram_shadowban_status === "Hashtag ban"
      ? "bg-[var(--signal-amber-bg)] text-[var(--signal-amber)]"
      : "bg-[var(--signal-red-bg)] text-[var(--signal-red)]";
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl mb-1">Social signals</h1>
        <p className="text-text-secondary">Instagram and Facebook health.</p>
      </header>
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl">Instagram</h2>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${shadowClass}`}>
            Shadowban: {latest.instagram_shadowban_status}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SignalCard
            name="Engagement rate"
            value={`${latest.instagram_engagement_rate}%`}
            previous={previous ? `${previous.instagram_engagement_rate}%` : undefined}
            delta={deltaLabel(latest.instagram_engagement_rate, previous?.instagram_engagement_rate, false, "%")}
            rag={computeRag(latest.instagram_engagement_rate, previous?.instagram_engagement_rate)}
          />
        </div>
      </section>
      <section>
        <h2 className="text-xl mb-3">Facebook</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SignalCard
            name="Page health score"
            value={latest.facebook_page_score}
            previous={previous?.facebook_page_score}
            delta={deltaLabel(latest.facebook_page_score, previous?.facebook_page_score)}
            rag={computeRag(latest.facebook_page_score, previous?.facebook_page_score)}
          />
        </div>
      </section>
    </div>
  );
}