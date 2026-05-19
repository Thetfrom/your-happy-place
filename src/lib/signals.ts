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
  info: string;
}

const num = (v: number | null | undefined, fallback = 0) => (v == null ? fallback : v);

export const SIGNALS: SignalDef[] = [
  { key: "maps_kw1", name: "Maps Rank · KW1", tier: "lite", invert: true, format: (s) => `#${s.maps_rank_kw1}`, raw: (s) => num(s.maps_rank_kw1), info: "Your position in Google Maps results for your main keyword. Rank 1-3 means you appear in the top map pack — the most valuable local SEO position." },
  { key: "star", name: "Google Star Rating", tier: "lite", format: (s) => s.google_star_rating.toFixed(1), raw: (s) => num(s.google_star_rating), info: "Your average Google star rating. Ratings above 4.5 significantly increase click-through from search results." },
  { key: "mobile_ps", name: "Mobile PageSpeed", tier: "lite", format: (s) => s.mobile_pagespeed, raw: (s) => num(s.mobile_pagespeed), info: "Google's 0-100 speed score for your site on mobile. Below 50 is poor and hurts rankings. Above 75 is good." },
  { key: "maps_kw2", name: "Maps Rank · KW2", tier: "pro", invert: true, format: (s) => `#${s.maps_rank_kw2}`, raw: (s) => num(s.maps_rank_kw2), info: "Your Maps position for your second target keyword. Tracking multiple keywords shows where you are visible vs where you have gaps." },
  { key: "maps_kw3", name: "Maps Rank · KW3", tier: "pro", invert: true, format: (s) => `#${s.maps_rank_kw3}`, raw: (s) => num(s.maps_rank_kw3), info: "Your Maps position for your third target keyword." },
  { key: "gbp", name: "GBP Completeness", tier: "pro", format: (s) => `${s.gbp_completeness_pct}%`, raw: (s) => num(s.gbp_completeness_pct), info: "How complete your Google Business Profile is out of 12 key fields. Incomplete profiles rank lower in Maps results." },
  { key: "reviews", name: "Google Review Count", tier: "pro", format: (s) => s.google_review_count, raw: (s) => num(s.google_review_count), info: "Total number of Google reviews. Volume and recency both affect Maps ranking." },
  { key: "desktop_ps", name: "Desktop PageSpeed", tier: "pro", format: (s) => s.desktop_pagespeed, raw: (s) => num(s.desktop_pagespeed), info: "Google's speed score for desktop visitors. Desktop scores are typically higher than mobile." },
  { key: "da", name: "Domain Authority", tier: "pro", format: (s) => s.domain_authority, raw: (s) => num(s.domain_authority), info: "Moz Domain Authority (0-100) — measures how authoritative your website is based on the links pointing to it. Higher = harder to outrank." },
  { key: "onpage", name: "On-page SEO Score", tier: "pro", format: (s) => s.onpage_seo_score, raw: (s) => num(s.onpage_seo_score), info: "A composite score of your website's on-page SEO health — title tags, meta descriptions, headings, internal links, and more." },
  { key: "backlinks_new", name: "New Backlinks", tier: "agency", format: (s) => `+${s.backlinks_new}`, raw: (s) => num(s.backlinks_new), info: "New websites that linked to yours this month. New backlinks from reputable sites improve Domain Authority." },
  { key: "backlinks_lost", name: "Lost Backlinks", tier: "agency", invert: true, format: (s) => s.backlinks_lost, raw: (s) => num(s.backlinks_lost), info: "Websites that removed their link to yours this month. Lost backlinks can decrease Domain Authority if not replaced." },
  { key: "ig_eng", name: "Instagram Engagement", tier: "agency", format: (s) => `${s.instagram_engagement_rate}%`, raw: (s) => num(s.instagram_engagement_rate), info: "Your Instagram engagement rate — the percentage of your followers who interact with your posts. Industry average is 1-3%." },
  { key: "fb_score", name: "Facebook Page Score", tier: "agency", format: (s) => s.facebook_page_score, raw: (s) => num(s.facebook_page_score), info: "A composite score of your Facebook Business Page health — completeness, activity, and response rate." },
  { key: "ai_google", name: "AI · Google Overviews", tier: "agency", format: (s) => s.ai_visibility_google, raw: (s) => (s.ai_visibility_google === "Present" ? 1 : 0), info: "Whether your business appears in Google AI Overviews (the AI-generated summaries at the top of search results)." },
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

export function deltaLabel(curr: number, prev: number | undefined, _invert?: boolean, suffix = ""): string | undefined {
  if (prev === undefined) return undefined;
  const diff = curr - prev;
  if (diff === 0) return "no change";
  const abs = Math.abs(diff);
  const formatted = abs < 1 ? abs.toFixed(2) : Math.round(abs).toString();
  return `${diff > 0 ? "+" : "-"}${formatted}${suffix}`;
}

export function formatMonth(date: string): string {
  const d = new Date(date);
  return d.toLocaleString("en-GB", { month: "short", year: "numeric" });
}
