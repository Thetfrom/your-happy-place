import type { Snapshot } from "./mock-data";
import type { RAG } from "@/components/SignalCard";

export interface SignalDef {
  key: string;
  name: string;
  tier: "lite" | "pro" | "agency";
  format: (s: Snapshot) => string | number;
  raw: (s: Snapshot) => number;
  invert?: boolean; // lower is better
  history?: (snaps: Snapshot[]) => number[];
}

const num = (v: number | null | undefined, fallback = 0) => (v == null ? fallback : v);

export const SIGNALS: SignalDef[] = [
  { key: "maps_kw1", name: "Maps Rank · KW1", tier: "lite", invert: true, format: (s) => `#${s.maps_rank_kw1}`, raw: (s) => num(s.maps_rank_kw1) },
  { key: "star", name: "Google Star Rating", tier: "lite", format: (s) => s.google_star_rating.toFixed(1), raw: (s) => num(s.google_star_rating) },
  { key: "mobile_ps", name: "Mobile PageSpeed", tier: "lite", format: (s) => s.mobile_pagespeed, raw: (s) => num(s.mobile_pagespeed) },
  { key: "maps_kw2", name: "Maps Rank · KW2", tier: "pro", invert: true, format: (s) => `#${s.maps_rank_kw2}`, raw: (s) => num(s.maps_rank_kw2) },
  { key: "maps_kw3", name: "Maps Rank · KW3", tier: "pro", invert: true, format: (s) => `#${s.maps_rank_kw3}`, raw: (s) => num(s.maps_rank_kw3) },
  { key: "gbp", name: "GBP Completeness", tier: "pro", format: (s) => `${s.gbp_completeness_pct}%`, raw: (s) => num(s.gbp_completeness_pct) },
  { key: "reviews", name: "Google Review Count", tier: "pro", format: (s) => s.google_review_count, raw: (s) => num(s.google_review_count) },
  { key: "desktop_ps", name: "Desktop PageSpeed", tier: "pro", format: (s) => s.desktop_pagespeed, raw: (s) => num(s.desktop_pagespeed) },
  { key: "da", name: "Domain Authority", tier: "pro", format: (s) => s.domain_authority, raw: (s) => num(s.domain_authority) },
  { key: "onpage", name: "On-page SEO Score", tier: "pro", format: (s) => s.onpage_seo_score, raw: (s) => num(s.onpage_seo_score) },
  { key: "backlinks_new", name: "New Backlinks", tier: "agency", format: (s) => `+${s.backlinks_new}`, raw: (s) => num(s.backlinks_new) },
  { key: "backlinks_lost", name: "Lost Backlinks", tier: "agency", invert: true, format: (s) => s.backlinks_lost, raw: (s) => num(s.backlinks_lost) },
  { key: "ig_eng", name: "Instagram Engagement", tier: "agency", format: (s) => `${s.instagram_engagement_rate}%`, raw: (s) => num(s.instagram_engagement_rate) },
  { key: "fb_score", name: "Facebook Page Score", tier: "agency", format: (s) => s.facebook_page_score, raw: (s) => num(s.facebook_page_score) },
  { key: "ai_google", name: "AI · Google Overviews", tier: "agency", format: (s) => s.ai_visibility_google, raw: (s) => (s.ai_visibility_google === "Present" ? 1 : 0) },
];

export function tierSignals(plan: "lite" | "pro" | "agency"): SignalDef[] {
  if (plan === "lite") return SIGNALS.filter((s) => s.tier === "lite");
  if (plan === "pro") return SIGNALS.filter((s) => s.tier !== "agency");
  return SIGNALS;
}

export function computeRag(curr: number, prev: number | undefined, invert?: boolean): RAG {
  if (prev === undefined) return "amber";
  if (curr === prev) return "amber";
  const improved = invert ? curr < prev : curr > prev;
  return improved ? "green" : "red";
}

export function deltaLabel(curr: number, prev: number | undefined, invert?: boolean, suffix = ""): string | undefined {
  if (prev === undefined) return undefined;
  const diff = curr - prev;
  if (diff === 0) return "no change";
  const sign = diff > 0 ? "+" : "";
  const formatted = Math.abs(diff) < 1 ? diff.toFixed(2) : Math.round(diff).toString();
  return `${sign}${diff > 0 ? "" : "-"}${formatted.replace("-", "")}${suffix}`.replace("+-", "-");
}

export function formatMonth(date: string): string {
  const d = new Date(date);
  return d.toLocaleString("en-GB", { month: "short", year: "numeric" });
}
