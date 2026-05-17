export type Plan = "lite" | "pro" | "agency";
export type Status = "active" | "paused" | "cancelled";

export interface Subscriber {
  subscriber_id: string;
  email: string;
  business_name: string;
  plan: Plan;
  status: Status;
  website_url: string;
  city: string;
  target_keyword_1: string;
  target_keyword_2: string;
  target_keyword_3: string;
  run_day: number;
  signup_date: string;
  competitor_1_url?: string | null;
  competitor_2_url?: string | null;
  competitor_3_url?: string | null;
  instagram_handle?: string | null;
  facebook_page_url?: string | null;
}

export interface Snapshot {
  id: string;
  snapshot_date: string;
  report_number: number;
  maps_rank_kw1: number;
  maps_rank_kw2: number;
  maps_rank_kw3: number;
  gbp_completeness_pct: number;
  mobile_pagespeed: number;
  desktop_pagespeed: number;
  cwv_lcp_status: "pass" | "fail";
  cwv_inp_status: "pass" | "fail";
  cwv_cls_status: "pass" | "fail";
  google_review_count: number;
  google_star_rating: number;
  google_new_reviews: number;
  domain_authority: number;
  backlinks_total: number;
  backlinks_new: number;
  backlinks_lost: number;
  organic_rank_kw1: number;
  onpage_seo_score: number;
  instagram_engagement_rate: number;
  instagram_shadowban_status: "None" | "Hashtag ban" | "Profile ban";
  facebook_page_score: number;
  ai_visibility_google: "Present" | "Not found";
  ai_visibility_chatgpt: "Present" | "Not found";
  competitor_1_maps_rank: number;
  competitor_2_maps_rank: number;
  competitor_3_maps_rank: number;
  priority_action: string;
  priority_signal: string;
  presence_score: number;
}

export const subscriber: Subscriber = {
  subscriber_id: "SUB-0001",
  email: "demo@tameyogroup.com",
  business_name: "Northlight Dental",
  plan: "pro",
  status: "active",
  website_url: "northlightdental.com",
  city: "Brighton",
  target_keyword_1: "dentist brighton",
  target_keyword_2: "invisalign brighton",
  target_keyword_3: "emergency dentist brighton",
  run_day: 17,
  signup_date: "2025-09-17",
  competitor_1_url: "smilecoast.com",
  competitor_2_url: "marinedental.co.uk",
  competitor_3_url: null,
  instagram_handle: "@northlightdental",
  facebook_page_url: "facebook.com/northlightdental",
};

const months = [
  "2025-10-17",
  "2025-11-17",
  "2025-12-17",
  "2026-01-17",
  "2026-02-17",
  "2026-03-17",
  "2026-04-17",
  "2026-05-17",
];

function score(s: Partial<Snapshot>): number {
  // simple presence score 0-100
  const a = 100 - (s.maps_rank_kw1 ?? 20) * 2;
  const b = (s.mobile_pagespeed ?? 50);
  const c = (s.google_star_rating ?? 4) * 18;
  const d = (s.domain_authority ?? 20);
  return Math.max(0, Math.min(100, Math.round((a + b + c + d) / 4)));
}

export const snapshots: Snapshot[] = months.map((date, i) => {
  const trend = i / (months.length - 1); // 0 -> 1
  const snap: Snapshot = {
    id: `snap-${i + 1}`,
    snapshot_date: date,
    report_number: i + 1,
    maps_rank_kw1: Math.round(14 - trend * 9),
    maps_rank_kw2: Math.round(18 - trend * 10),
    maps_rank_kw3: Math.round(22 - trend * 8),
    gbp_completeness_pct: Math.round(72 + trend * 26),
    mobile_pagespeed: Math.round(52 + trend * 36),
    desktop_pagespeed: Math.round(78 + trend * 18),
    cwv_lcp_status: trend > 0.4 ? "pass" : "fail",
    cwv_inp_status: trend > 0.2 ? "pass" : "fail",
    cwv_cls_status: "pass",
    google_review_count: Math.round(118 + i * 9),
    google_star_rating: Math.min(5, +(4.2 + trend * 0.6).toFixed(1)),
    google_new_reviews: 4 + Math.floor(Math.random() * 8),
    domain_authority: Math.round(22 + trend * 14),
    backlinks_total: Math.round(480 + i * 28),
    backlinks_new: 12 + Math.floor(Math.random() * 18),
    backlinks_lost: 3 + Math.floor(Math.random() * 6),
    organic_rank_kw1: Math.round(28 - trend * 18),
    onpage_seo_score: Math.round(58 + trend * 32),
    instagram_engagement_rate: +(1.8 + trend * 1.6).toFixed(2),
    instagram_shadowban_status: "None",
    facebook_page_score: Math.round(60 + trend * 28),
    ai_visibility_google: trend > 0.5 ? "Present" : "Not found",
    ai_visibility_chatgpt: trend > 0.7 ? "Present" : "Not found",
    competitor_1_maps_rank: Math.round(8 - trend * 2),
    competitor_2_maps_rank: Math.round(12 - trend * 3),
    competitor_3_maps_rank: Math.round(16 - trend * 4),
    priority_action: [
      "Add 6 high-resolution interior photos to your Google Business Profile.",
      "Compress hero image — mobile LCP is 3.8s, target under 2.5s.",
      "Respond to the 4 unanswered Google reviews from last month.",
      "Publish a service page targeting 'invisalign brighton' — missing entirely.",
      "Add FAQ schema to your top 3 service pages.",
      "Reclaim 2 lost backlinks from local directories.",
      "Fix Core Web Vitals INP — currently failing on mobile.",
      "Request reviews from the 9 patients you saw last week.",
    ][i],
    priority_signal: [
      "GBP Completeness",
      "Mobile PageSpeed",
      "Google Reviews",
      "Organic Rank",
      "On-page SEO",
      "Backlinks",
      "Core Web Vitals",
      "Google Reviews",
    ][i],
    presence_score: 0,
  };
  snap.presence_score = score(snap);
  return snap;
});

export interface ActionState {
  snapshot_id: string;
  is_done: boolean;
}

export const initialActionStates: ActionState[] = snapshots.map((s, i) => ({
  snapshot_id: s.id,
  is_done: i < snapshots.length - 2,
}));
