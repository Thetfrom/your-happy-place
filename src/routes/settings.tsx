import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · TAMEYO Monitor" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { subscriber, updateSubscriber, setStatus } = useApp();
  const [email, setEmail] = useState(subscriber.email);
  const [saved, setSaved] = useState(false);
  const cancelled = subscriber.status === "cancelled";

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl mb-1">Account Settings</h1>
      <p className="text-text-secondary mb-8">Your plan, monitored targets, and delivery preferences.</p>

      <Section title="Plan">
        <Row label="Current plan" value={<span className="uppercase font-bold">{subscriber.plan}</span>} />
        <Row label="Signup date" value={new Date(subscriber.signup_date).toLocaleDateString("en-GB")} />
        <Row label="Status" value={<span className="capitalize">{subscriber.status}</span>} />
      </Section>

      <Section title="Monitored targets">
        <Row label="Website" value={subscriber.website_url} />
        <Row label="City" value={subscriber.city} />
        <Row label="Keyword 1" value={subscriber.target_keyword_1} />
        <Row label="Keyword 2" value={subscriber.target_keyword_2} />
        <Row label="Keyword 3" value={subscriber.target_keyword_3} />
        <Row label="Run day" value={`Day ${subscriber.run_day} of each month`} />
        <div className="text-xs text-text-muted pt-2">
          To change any monitored target,{" "}
          <a className="text-[var(--brand-orange)] font-semibold" href="mailto:service@tameyogroup.com">contact support</a>.
        </div>
      </Section>

      <Section title="Delivery">
        <label className="block">
          <span className="text-xs uppercase text-text-muted font-semibold">Delivery email</span>
          <input
            disabled={cancelled}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-60"
          />
        </label>
        {cancelled ? (
          <button className="bg-muted text-text-muted px-4 py-2 rounded-md text-sm font-semibold cursor-not-allowed">
            Reactivate to update settings
          </button>
        ) : (
          <button
            onClick={() => { updateSubscriber({ email }); setSaved(true); setTimeout(() => setSaved(false), 1500); }}
            className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-hover)] text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            {saved ? "Saved ✓" : "Save changes"}
          </button>
        )}
      </Section>

      <Section title="Login">
        <p className="text-sm text-text-secondary">You log in via secure email link — no password required.</p>
      </Section>

      <Section title="Demo controls">
        <p className="text-xs text-text-muted">These only exist in the preview build to simulate subscriber states.</p>
        <div className="flex flex-wrap gap-2">
          {(["active", "paused", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-md border ${
                subscriber.status === s ? "bg-[var(--brand-navy)] text-white border-transparent" : "bg-card text-text-secondary border-border hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-xl p-6 mb-5">
      <h2 className="text-lg mb-4">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border last:border-0 pb-2 last:pb-0">
      <span className="text-xs uppercase text-text-muted font-semibold">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}