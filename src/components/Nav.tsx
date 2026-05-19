import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useApp, PLAN_ACCESS } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import tameyoLogo from "@/assets/tameyo-logo.png";

interface TabDef {
  to: string;
  label: string;
  feature?: keyof ReturnType<typeof access>;
  agencyOnly?: boolean;
}

function access(plan: ReturnType<typeof useApp>["subscriber"]["plan"]) {
  return PLAN_ACCESS[plan];
}

const TABS: TabDef[] = [
  { to: "/", label: "Overview" },
  { to: "/signals", label: "Signals" },
  { to: "/trends", label: "Trends", feature: "trends" },
  { to: "/compare", label: "Compare", feature: "compare" },
  { to: "/reports", label: "Reports" },
  { to: "/actions", label: "Actions", feature: "actions" },
  { to: "/competitors", label: "Competitors", agencyOnly: true },
  { to: "/ai-visibility", label: "AI Visibility", agencyOnly: true },
  { to: "/social", label: "Social", agencyOnly: true },
  { to: "/settings", label: "Settings" },
];

export function Nav() {
  const { subscriber, snapshots } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const acc = access(subscriber.plan);

  const planBadgeClass: Record<string, string> = {
    lite: "bg-muted text-text-secondary",
    pro: "bg-[var(--brand-lavender)] text-[var(--brand-navy)]",
    agency: "bg-[var(--brand-navy)] text-white",
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center gap-8">
        <Link to="/" className="shrink-0 flex items-center gap-2">
          <img
            src={tameyoLogo}
            alt="TAMEYO Group"
            className="h-8 w-auto object-contain"
          />
          <span className="font-normal text-2xl tracking-[-0.06em] text-[var(--brand-orange)]">
            Monitor
          </span>
        </Link>

        <nav className="flex-1 flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            if (tab.agencyOnly && !acc.agency) return null;
            const isLocked = tab.feature && !acc[tab.feature];
            const isAgencyLocked = tab.agencyOnly && !acc.agency;
            const locked = isLocked || isAgencyLocked;
            const isActive = location.pathname === tab.to;

            const className = cn(
              "px-3 py-2 rounded-md text-sm whitespace-nowrap flex items-center gap-1.5 transition-colors",
              isActive
                ? "bg-[var(--brand-lavender)] text-[var(--brand-navy)] font-semibold"
                : "text-text-secondary hover:text-foreground hover:bg-muted"
            );

            if (locked) {
              return (
                <button
                  key={tab.to}
                  onClick={() =>
                    navigate({
                      to: "/upgrade",
                      search: { feature: tab.label.toLowerCase() },
                    })
                  }
                  className={className}
                >
                  {tab.label}
                  <Lock className="w-3 h-3 text-text-muted" />
                </button>
              );
            }
            return (
              <Link key={tab.to} to={tab.to} className={className}>
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold leading-tight">{subscriber.business_name}</div>
            <div className="text-xs text-text-muted">{subscriber.email}</div>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-muted text-xs font-semibold text-text-secondary">
            Month {snapshots.length}
          </div>
          <div className={cn("px-2.5 py-1 rounded-full text-xs font-bold uppercase", planBadgeClass[subscriber.plan])}>
            {subscriber.plan}
          </div>
        </div>
      </div>
    </header>
  );
}
