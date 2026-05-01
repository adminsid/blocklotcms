// ─────────────────────────────────────────────────────────────────────────────
// Neighborhood Stats block
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition } from "../types.js";

export interface NeighborhoodStat {
  label: string;
  value: string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
}

const definition: BlockDefinition = {
  type: "neighborhood-stats",
  label: "Neighborhood Stats",
  description: "Market statistics widget: median price, days on market, price per sqft, etc.",
  defaultConfig: {
    neighborhoodName: "Downtown",
    primaryColor: "#1a56db",
    stats: [
      { label: "Median List Price", value: "$485,000", icon: "🏡", trend: "up" },
      { label: "Avg Days on Market", value: "18", icon: "📅", trend: "down" },
      { label: "Price / Sq Ft", value: "$245", icon: "📐", trend: "up" },
      { label: "Active Listings", value: "42", icon: "📋", trend: "neutral" },
    ] as NeighborhoodStat[],
    sourceNote: "Data sourced from local MLS. Updated monthly.",
  },
  render(config) {
    const name = String(config["neighborhoodName"] ?? "");
    const color = String(config["primaryColor"] ?? "#1a56db");
    const stats: NeighborhoodStat[] = Array.isArray(config["stats"])
      ? (config["stats"] as NeighborhoodStat[])
      : [];
    const source = String(config["sourceNote"] ?? "");

    const trendIcon: Record<string, string> = { up: "↑", down: "↓", neutral: "→" };
    const trendColor: Record<string, string> = { up: "#059669", down: "#dc2626", neutral: "#6b7280" };

    return /* html */`
<div class="blk-nbstats" style="--blk-primary:${color}">
  ${name ? `<h3 class="blk-nbstats__title">${name} Market Stats</h3>` : ""}
  <div class="blk-nbstats__grid">
    ${stats.map(s => `
    <div class="blk-nbstats__card">
      ${s.icon ? `<span class="blk-nbstats__icon" aria-hidden="true">${s.icon}</span>` : ""}
      <span class="blk-nbstats__val">${s.value}
        ${s.trend ? `<span class="blk-nbstats__trend" style="color:${trendColor[s.trend] ?? "#6b7280"}">${trendIcon[s.trend] ?? ""}</span>` : ""}
      </span>
      <span class="blk-nbstats__lbl">${s.label}</span>
    </div>`).join("")}
  </div>
  ${source ? `<p class="blk-nbstats__source">${source}</p>` : ""}
</div>
<style>
.blk-nbstats{font-family:system-ui,sans-serif;max-width:640px;margin:0 auto}
.blk-nbstats__title{font-size:1.1rem;font-weight:700;margin:0 0 .75rem;color:#111}
.blk-nbstats__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.75rem}
.blk-nbstats__card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:.9rem .75rem;display:flex;flex-direction:column;align-items:center;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.blk-nbstats__icon{font-size:1.5rem;margin-bottom:.3rem}
.blk-nbstats__val{font-size:1.25rem;font-weight:700;color:var(--blk-primary);line-height:1.2}
.blk-nbstats__trend{font-size:.9rem;font-weight:700;margin-left:.15rem}
.blk-nbstats__lbl{font-size:.72rem;color:#6b7280;margin-top:.2rem}
.blk-nbstats__source{font-size:.65rem;color:#9ca3af;margin:.75rem 0 0;text-align:center}
</style>`;
  },
};

export default definition;
