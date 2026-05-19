import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { SIGNALS, tierSignals, computeRag, deltaLabel } from "@/lib/signals";
import { SignalCard } from "@/components/SignalCard";

export const Route = createFileRoute("/signals")({
  head: () => ({ meta: [{ title: "Signals · TAMEYO Monitor" }] }),
  component: SignalsPage,
});

function SignalsPage() {
  const { subscriber, latest, previous, snapshots } = useApp();
  const navigate = useNavigate();

  if (!latest) {
    return (
      <div className="bg-card border border-border rounded-xl p-10 text-center">
        <h1 className="text-2xl mb-2">No signals yet</h1>
        <p className="text-text-secondary">Your first report will populate this view.</p>
      </div>
    );
  }

  const isLite = subscriber.plan === "lite";
  const visible = tierSignals(subscriber.plan);
  const lockedForLite = isLite ? SIGNALS.filter((s) => s.tier !== "lite").slice(0, 5) : [];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl mb-1">Signals</h1>
        <p className="text-text-secondary">All monitored metrics for {subscriber.business_name}.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((sig) => {
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
              infoText={sig.info}
            />
          );
        })}
        {lockedForLite.map((sig) => (
          <SignalCard
            key={sig.key}
            name={sig.name}
            value="—"
            rag="amber"
            locked
            onUnlock={() => navigate({ to: "/upgrade", search: { feature: "signals" } })}
          />
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-lg mb-3">Core Web Vitals</h2>
        <div className="flex flex-wrap gap-2">
          <CWVChip label="LCP" status={latest.cwv_lcp_status} />
          <CWVChip label="INP" status={latest.cwv_inp_status} />
          <CWVChip label="CLS" status={latest.cwv_cls_status} />
        </div>
      </section>
    </div>
  );
}

function CWVChip({ label, status }: { label: string; status: "pass" | "fail" }) {
  const className =
    status === "pass"
      ? "bg-[var(--signal-green-bg)] text-[var(--signal-green)]"
      : "bg-[var(--signal-red-bg)] text-[var(--signal-red)]";
  return (
    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${className}`}>
      {label} · {status === "pass" ? "Pass" : "Fail"}
    </div>
  );
}