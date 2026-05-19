import { ArrowDown, ArrowRight, ArrowUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type RAG = "green" | "amber" | "red";

interface Props {
  name: string;
  value: string | number;
  previous?: string | number;
  delta?: string;
  rag: RAG;
  locked?: boolean;
  onUnlock?: () => void;
  sparkline?: number[];
  invertSpark?: boolean;
  infoText?: string;
}

const ragStyles: Record<RAG, string> = {
  green: "bg-[var(--signal-green-bg)] text-[var(--signal-green)]",
  amber: "bg-[var(--signal-amber-bg)] text-[var(--signal-amber)]",
  red: "bg-[var(--signal-red-bg)] text-[var(--signal-red)]",
};

const ragDot: Record<RAG, string> = {
  green: "bg-[var(--signal-green)]",
  amber: "bg-[var(--signal-amber)]",
  red: "bg-[var(--signal-red)]",
};

export function SignalCard({ name, value, previous, delta, rag, locked, onUnlock, sparkline, invertSpark, infoText }: Props) {
  if (locked) {
    return (
      <div className="bg-card border border-border rounded-lg p-5 relative overflow-hidden">
        <div className="text-xs uppercase tracking-wide text-text-muted mb-2">{name}</div>
        <div className="text-3xl font-bold blur-[6px] select-none">●●●</div>
        <button
          onClick={onUnlock}
          className="mt-4 w-full bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-hover)] text-white font-semibold text-sm py-2 rounded-md transition-colors"
        >
          Unlock with Pro
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2 hover:border-[var(--brand-orange)]/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <div className="text-xs uppercase tracking-wide text-text-muted font-semibold">{name}</div>
          {infoText && (
            <span className="relative group inline-flex">
              <Info className="w-3.5 h-3.5 text-text-muted cursor-pointer" />
              <span className="pointer-events-none absolute left-0 top-5 z-50 max-w-[220px] w-[220px] text-xs bg-[var(--brand-navy)] text-white rounded-md p-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shadow-lg">
                {infoText}
              </span>
            </span>
          )}
        </div>
        <span className={cn("w-2.5 h-2.5 rounded-full mt-1", ragDot[rag])} />
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold tracking-[-0.04em]">{value}</div>
        {previous !== undefined && (
          <div className="text-sm text-text-muted">from {previous}</div>
        )}
      </div>
      {delta && (
        <div className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full w-fit", ragStyles[rag])}>
          {rag === "green" ? <ArrowUp className="w-3 h-3" /> : rag === "red" ? <ArrowDown className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
          {delta}
        </div>
      )}
      {sparkline && sparkline.length > 1 && (
        <Sparkline values={sparkline} invert={invertSpark} />
      )}
    </div>
  );
}

function Sparkline({ values, invert }: { values: number[]; invert?: boolean }) {
  const w = 200;
  const h = 36;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const norm = (v - min) / range;
      const y = invert ? norm * h : (1 - norm) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9 mt-1">
      <polyline
        fill="none"
        stroke="var(--brand-orange)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
