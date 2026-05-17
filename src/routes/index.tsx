import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { useApp, PLAN_ACCESS } from "@/lib/app-context";
import { SIGNALS, tierSignals, computeRag, deltaLabel, formatMonth } from "@/lib/signals";
import { SignalCard } from "@/components/SignalCard";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { subscriber, latest, previous, snapshots } = useApp();
  const navigate = useNavigate();

  if (subscriber.status === "cancelled") {
    return <CancelledWall />;
  }

  if (!latest) {
    return (
      <div className="bg-card border border-border rounded-lg p-10 text-center">
        <h1 className="text-2xl mb-2">Welcome, {subscriber.business_name}</h1>
        <p className="text-text-secondary">
          Your first report will arrive on day {subscriber.run_day} of next month.
        </p>
      </div>
    );
  }

  const acc = PLAN_ACCESS[subscriber.plan];
  const planSignals = tierSignals(subscriber.plan);
  const visibleSignals = planSignals.slice(0, acc.signalCount === 3 ? 3 : planSignals.length);

  const scoreDelta = previous ? latest.presence_score - previous.presence_score : 0;
  const isFirst = latest.report_number === 1;
  const isNew = daysSince(latest.snapshot_date) < 48;
  const nextRun = nextRunDate(subscriber.run_day);
  const daysToNext = Math.max(0, Math.ceil((nextRun.getTime() - Date.now()) / 86400000));

  const improvedCount = previous
    ? planSignals.filter((sig) => {
        const c = sig.raw(latest);
        const p = sig.raw(previous);
        return sig.invert ? c < p : c > p;
      }).length
    : 0;

  const bestMaps = Math.min(latest.maps_rank_kw1, latest.maps_rank_kw2, latest.maps_rank_kw3);
  const bestMapsPrev = previous ? Math.min(previous.maps_rank_kw1, previous.maps_rank_kw2, previous.maps_rank_kw3) : undefined;

  return (
    <div className="flex flex-col gap-6">
      {subscriber.status === "paused" && (
        <div className="bg-[var(--signal-amber-bg)] border border-[var(--signal-amber)]/30 text-[var(--signal-amber)] rounded-lg px-5 py-3 text-sm font-semibold">
          Your monitoring is paused. Historical data is preserved.
        </div>
      )}

      {isNew && (
        <div className="bg-card border border-[var(--brand-orange)] rounded-lg flex items-stretch overflow-hidden">
          <div className="w-1.5 bg-[var(--brand-orange)]" />
          <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-orange)]" />
              <div>
                <div className="font-bold text-base">
                  Your {formatMonth(latest.snapshot_date)} report is ready
                </div>
                <div className="text-sm text-text-secondary">
                  {improvedCount} signal{improvedCount === 1 ? "" : "s"} improved this month.
                </div>
              </div>
            </div>
            <Link
              to="/reports"
              className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-hover)] text-white font-semibold text-sm px-4 py-2 rounded-md transition-colors whitespace-nowrap"
            >
              View full report
            </Link>
          </div>
        </div>
      )}

      {/* Presence Score hero */}
      <div className="bg-card border border-border rounded-xl p-8 flex flex-col md:flex-row md:items-center gap-8">
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-2">
            Presence Score
          </div>
          <div className="flex items-baseline gap-4">
            <div className="text-7xl font-bold tracking-[-0.06em]">{latest.presence_score}</div>
            {!isFirst && (
              <div
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  scoreDelta >= 0
                    ? "bg-[var(--signal-green-bg)] text-[var(--signal-green)]"
                    : "bg-[var(--signal-red-bg)] text-[var(--signal-red)]"
                }`}
              >
                {scoreDelta >= 0 ? "+" : ""}
                {scoreDelta} this month
              </div>
            )}
          </div>
          <div className="text-sm text-text-muted mt-3">
            Report #{latest.report_number} · {formatMonth(latest.snapshot_date)}
          </div>
          {isFirst && (
            <div className="text-sm text-text-secondary mt-2">
              Your trend line builds from next month.
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 flex-1">
          <Stat label="Best Maps rank" value={`#${bestMaps}`} prev={bestMapsPrev !== undefined ? `#${bestMapsPrev}` : undefined} rag={computeRag(bestMaps, bestMapsPrev, true)} />
          <Stat label="Star rating" value={latest.google_star_rating.toFixed(1)} prev={previous?.google_star_rating.toFixed(1)} rag={computeRag(latest.google_star_rating, previous?.google_star_rating)} />
          <Stat label="Mobile PageSpeed" value={latest.mobile_pagespeed} prev={previous?.mobile_pagespeed} rag={computeRag(latest.mobile_pagespeed, previous?.mobile_pagespeed)} />
          <Stat label="Domain authority" value={latest.domain_authority} prev={previous?.domain_authority} rag={computeRag(latest.domain_authority, previous?.domain_authority)} />
        </div>
      </div>

      {/* Priority Action */}
      <div className="bg-card border-2 border-[var(--brand-orange)] rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[var(--brand-orange)] mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider font-bold text-[var(--brand-orange)] mb-2">
              This month's priority action
            </div>
            <div className="text-lg font-semibold leading-snug">{latest.priority_action}</div>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] text-xs font-semibold px-3 py-1 rounded-full">
              Signal · {latest.priority_signal}
            </div>
          </div>
        </div>
      </div>

      {/* Signals grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Your signals</h2>
          <Link to="/signals" className="text-sm text-[var(--brand-orange)] font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleSignals.map((sig) => {
            const c = sig.raw(latest);
            const p = previous ? sig.raw(previous) : undefined;
            return (
              <SignalCard
                key={sig.key}
                name={sig.name}
                value={sig.format(latest)}
                previous={previous ? sig.format(previous) : undefined}
                delta={deltaLabel(c, p, sig.invert)}
                rag={computeRag(c, p, sig.invert)}
                sparkline={snapshots.map((s) => sig.raw(s))}
                invertSpark={sig.invert}
              />
            );
          })}
        </div>
        {subscriber.plan === "lite" && (
          <div className="mt-4 bg-card border border-dashed border-border rounded-lg p-5 text-center">
            <div className="text-sm text-text-secondary mb-3">
              {SIGNALS.length - 3} more signals available on Pro and Agency plans.
            </div>
            <button
              onClick={() => navigate({ to: "/upgrade", search: { feature: "signals" } })}
              className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-hover)] text-white font-semibold text-sm px-5 py-2 rounded-md transition-colors"
            >
              Unlock with Pro
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-text-muted py-4">
        Next report in {daysToNext} day{daysToNext === 1 ? "" : "s"} · {nextRun.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
      </div>
    </div>
  );
}

function Stat({ label, value, prev, rag }: { label: string; value: string | number; prev?: string | number; rag: "green" | "amber" | "red" }) {
  const dotClass = rag === "green" ? "bg-[var(--signal-green)]" : rag === "red" ? "bg-[var(--signal-red)]" : "bg-[var(--signal-amber)]";
  return (
    <div className="bg-background rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-wide text-text-muted font-semibold mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-xl font-bold tracking-tight">{value}</div>
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      </div>
      {prev !== undefined && <div className="text-xs text-text-muted">was {prev}</div>}
    </div>
  );
}

function CancelledWall() {
  const { snapshots } = useApp();
  return (
    <div className="bg-card border border-border rounded-xl p-10 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl mb-3">Your monitoring has been cancelled.</h1>
      <p className="text-text-secondary mb-6">
        You have {snapshots.length} months of data on file. Reactivating restores full access to your complete history.
      </p>
      <a
        href="https://www.tameyogroup.com/checkout"
        className="inline-block bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-hover)] text-white font-semibold px-6 py-3 rounded-md transition-colors"
      >
        Reactivate Monitor
      </a>
      <div className="mt-4">
        <Link to="/reports" className="text-sm text-text-secondary underline">
          View your archived reports
        </Link>
      </div>
    </div>
  );
}

function daysSince(date: string): number {
  return (Date.now() - new Date(date).getTime()) / 86400000;
}

function nextRunDate(runDay: number): Date {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), runDay);
  if (candidate <= now) candidate.setMonth(candidate.getMonth() + 1);
  return candidate;
}

function Index() {
  return <PlaceholderIndex />;
}
