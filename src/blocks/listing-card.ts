// ─────────────────────────────────────────────────────────────────────────────
// Listing Card block  (RESO-compatible property summary card)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition, ResoListing } from "../types.js";

/** Format a number as USD currency. */
function usd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

/** Render a single listing card. Config may carry a ResoListing payload. */
const definition: BlockDefinition = {
  type: "listing-card",
  label: "Listing Card",
  description: "A RESO-standard property summary card with photo, price, beds/baths, and status badge.",
  defaultConfig: {
    listing: null as ResoListing | null,
    linkBase: "/listings",
    primaryColor: "#1a56db",
    accentColor: "#e3342f",
    showAgentInfo: true,
  },
  render(config) {
    const listing = config["listing"] as ResoListing | null;
    const linkBase = String(config["linkBase"] ?? "/listings");
    const color = String(config["primaryColor"] ?? "#1a56db");
    const accent = String(config["accentColor"] ?? "#e3342f");
    const showAgent = config["showAgentInfo"] !== false;

    if (!listing) {
      return `<div class="blk-listing-card blk-listing-card--placeholder" style="--blk-primary:${color};--blk-accent:${accent}">
        <p style="color:#9ca3af;text-align:center;padding:2rem">No listing data provided.</p>
      </div>`;
    }

    const photo = listing.Media?.[0]?.MediaURL ?? "";
    const address = [listing.StreetNumber, listing.StreetName, listing.City, listing.StateOrProvince]
      .filter(Boolean).join(" ");
    const statusClass = `blk-listing-card__badge--${listing.StandardStatus.toLowerCase().replace(/ /g, "-")}`;

    return /* html */`
<article class="blk-listing-card" style="--blk-primary:${color};--blk-accent:${accent}">
  <a href="${linkBase}/${encodeURIComponent(listing.ListingKey)}" class="blk-listing-card__link" aria-label="View listing at ${address}">
    <div class="blk-listing-card__photo-wrap">
      ${photo
        ? `<img class="blk-listing-card__photo" src="${photo}" alt="Property photo for ${address}" loading="lazy">`
        : `<div class="blk-listing-card__photo blk-listing-card__photo--none" aria-hidden="true">📷</div>`}
      <span class="blk-listing-card__badge ${statusClass}">${listing.StandardStatus}</span>
    </div>
    <div class="blk-listing-card__body">
      <p class="blk-listing-card__price">${usd(listing.ListPrice)}</p>
      <p class="blk-listing-card__address">${address}</p>
      <ul class="blk-listing-card__stats">
        ${listing.BedroomsTotal != null ? `<li><strong>${listing.BedroomsTotal}</strong> bd</li>` : ""}
        ${listing.BathroomsTotalInteger != null ? `<li><strong>${listing.BathroomsTotalInteger}</strong> ba</li>` : ""}
        ${listing.LivingArea != null ? `<li><strong>${listing.LivingArea.toLocaleString()}</strong> sqft</li>` : ""}
        ${listing.YearBuilt != null ? `<li>Built <strong>${listing.YearBuilt}</strong></li>` : ""}
      </ul>
      ${showAgent && listing.ListAgentFullName ? `
      <p class="blk-listing-card__agent">
        Listed by ${listing.ListAgentFullName}
        ${listing.ListOfficeName ? `· ${listing.ListOfficeName}` : ""}
      </p>` : ""}
    </div>
  </a>
</article>
<style>
.blk-listing-card{font-family:system-ui,sans-serif;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.08);transition:transform .2s,box-shadow .2s;max-width:360px}
.blk-listing-card:hover{transform:translateY(-3px);box-shadow:0 6px 20px rgba(0,0,0,.12)}
.blk-listing-card__link{text-decoration:none;color:inherit;display:block}
.blk-listing-card__photo-wrap{position:relative}
.blk-listing-card__photo{width:100%;height:220px;object-fit:cover;display:block}
.blk-listing-card__photo--none{height:220px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;font-size:3rem}
.blk-listing-card__badge{position:absolute;top:.6rem;left:.6rem;padding:.25rem .65rem;border-radius:20px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.blk-listing-card__badge--active{background:#d1fae5;color:#065f46}
.blk-listing-card__badge--pending,.blk-listing-card__badge--activeundercontract{background:#fef3c7;color:#92400e}
.blk-listing-card__badge--closed{background:#f3f4f6;color:#374151}
.blk-listing-card__badge--expired,.blk-listing-card__badge--withdrawn{background:#fee2e2;color:#991b1b}
.blk-listing-card__body{padding:1rem}
.blk-listing-card__price{font-size:1.35rem;font-weight:700;margin:0 0 .25rem;color:var(--blk-primary)}
.blk-listing-card__address{font-size:.85rem;color:#4b5563;margin:0 0 .6rem}
.blk-listing-card__stats{list-style:none;margin:0 0 .6rem;padding:0;display:flex;flex-wrap:wrap;gap:.5rem 1rem;font-size:.8rem;color:#374151}
.blk-listing-card__agent{font-size:.7rem;color:#9ca3af;margin:0}
</style>`;
  },
};

export default definition;
