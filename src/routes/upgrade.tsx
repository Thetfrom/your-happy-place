import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useApp, PLAN_PRICES } from "@/lib/app-context";
import { Check, Sparkles } from "lucide-react";
import { z } from "zod";

const search = z.object({ feature: z.string().optional().default("trends") });

export const Route = createFileRoute("/upgrade")({
  head: () => ({ meta: [{ title: "Upgrade · TAMEYO Monitor" }] }),
  validateSearch: (s) => search.parse(s),
  component: UpgradePage,
});

const PRO = [
  "All 8 Pro signals (Maps × 3, GBP, reviews, PageSpeed × 2, DA, on-page SEO)",
  "Trend charts going back to your first report",
  "Month-over-month compare view",
  "Priority action history & tracker",
];
const AGENCY = [
  "Everything in Pro, plus:",
  "Competitor tracker — up to 3 rivals",
  "AI Visibility (Google AI Overviews + ChatGPT)",
  "Instagram & Facebook signals with shadowban detection",
  "Backlink change tracking",
];

function UpgradePage() {
  const { subscriber } = useApp();
  const { feature } = Route.useSearch();
  if (subscriber.plan === "agency") return <Navigate to="/" />;
  const target: "pro" | "agency" = subscriber.plan === "lite" ? "pro" : "agency";
  const features = target === "pro" ? PRO : AGENCY;
  const url = target === "pro"
    ? "https://www.tameyogroup.com/checkout?checkoutId=pro-plan-id"
    : "https://www.tameyogroup.com/checkout?checkoutId=agency-plan-id";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border-2 border-[var(--brand-orange)] rounded-2xl p-10">
        <div className="inline-flex items-center gap-2 bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] text-xs font-bold uppercase px-3 py-1 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Upgrade
        </div>
        <h1 className="text-3xl md:text-4xl mb-3 capitalize">
          Unlock {feature} — upgrade to {target}
        </h1>
        <p className="text-text-secondary mb-6">
          You're on <span className="font-semibold uppercase">{subscriber.plan}</span>. Step up to <span className="font-semibold uppercase">{target}</span> to get:
        </p>
        <ul className="flex flex-col gap-2 mb-8">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[var(--signal-green)] mt-0.5 shrink-0" />
              <span className="text-sm">{f}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-5xl font-bold tracking-[-0.04em]">${PLAN_PRICES[target]}</span>
          <span className="text-text-muted">/ month</span>
        </div>
        <a href={url} className="block w-full text-center bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-hover)] text-white font-bold py-3 rounded-md transition-colors capitalize">
          Upgrade to {target}
        </a>
        <Link to="/" className="block text-center mt-4 text-sm text-text-secondary hover:text-foreground underline">← Go back</Link>
      </div>
    </div>
  );
}