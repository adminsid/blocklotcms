// ─────────────────────────────────────────────────────────────────────────────
// Listing Flyer block  — print-ready single-property marketing sheet
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition, ResoListing } from "../types.js";

function usd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const definition: BlockDefinition = {
  type: "listing-flyer",
  label: "Listing Flyer",
  description: "Print-ready single-property marketing flyer with branding, photos, key facts, and agent contact info.",
  defaultConfig: {
    listing: null as ResoListing | null,
    primaryColor: "#1a56db",
    accentColor: "#f59e0b",
    companyName: "Your Realty",
    companyLogo: "",
    agentName: "",
    agentPhone: "",
    agentEmail: "",
    agentPhoto: "",
    tagline: "Beautifully Maintained – Move-In Ready",
    equalHousingDisclaimer: true,
    maxPhotos: 4,
  },
  render(config) {
    const listing = config["listing"] as ResoListing | null;
    const color = String(config["primaryColor"] ?? "#1a56db");
    const accent = String(config["accentColor"] ?? "#f59e0b");
    const company = String(config["companyName"] ?? "Your Realty");
    const logo = String(config["companyLogo"] ?? "");
    const agentName = String(config["agentName"] ?? "");
    const agentPhone = String(config["agentPhone"] ?? "");
    const agentEmail = String(config["agentEmail"] ?? "");
    const agentPhoto = String(config["agentPhoto"] ?? "");
    const tagline = String(config["tagline"] ?? "");
    const showEHO = config["equalHousingDisclaimer"] !== false;
    const maxPhotos = Number(config["maxPhotos"] ?? 4);

    const address = listing
      ? [listing.StreetNumber, listing.StreetName, listing.City, listing.StateOrProvince, listing.PostalCode]
          .filter(Boolean).join(" ")
      : "123 Main Street, Anytown, ST 00000";

    const price = listing ? usd(listing.ListPrice) : "$000,000";
    const photos = (listing?.Media ?? [])
      .sort((a, b) => (a.Order ?? 99) - (b.Order ?? 99))
      .slice(0, maxPhotos)
      .map(m => m.MediaURL);

    const stats: Array<{ label: string; value: string }> = [];
    if (listing?.BedroomsTotal != null) stats.push({ label: "Beds", value: String(listing.BedroomsTotal) });
    if (listing?.BathroomsTotalInteger != null) stats.push({ label: "Baths", value: String(listing.BathroomsTotalInteger) });
    if (listing?.LivingArea != null) stats.push({ label: "Sq Ft", value: listing.LivingArea.toLocaleString() });
    if (listing?.LotSizeAcres != null) stats.push({ label: "Lot (ac)", value: listing.LotSizeAcres.toFixed(2) });
    if (listing?.YearBuilt != null) stats.push({ label: "Built", value: String(listing.YearBuilt) });
    if (listing?.GarageSpaces != null) stats.push({ label: "Garage", value: String(listing.GarageSpaces) });

    return /* html */`
<div class="blk-flyer" style="--blk-primary:${color};--blk-accent:${accent}">
  <!-- Header -->
  <header class="blk-flyer__header">
    <div class="blk-flyer__brand">
      ${logo ? `<img class="blk-flyer__logo" src="${logo}" alt="${company} logo">` : `<span class="blk-flyer__company-name">${company}</span>`}
    </div>
    <div class="blk-flyer__price-wrap">
      <span class="blk-flyer__status">${listing?.StandardStatus ?? "Active"}</span>
      <span class="blk-flyer__price">${price}</span>
    </div>
  </header>

  <!-- Hero photo -->
  ${photos[0] ? `<img class="blk-flyer__hero-photo" src="${photos[0]}" alt="Main photo">` : `<div class="blk-flyer__hero-photo blk-flyer__hero-photo--placeholder">📷 No Photo</div>`}

  <!-- Address & tagline -->
  <div class="blk-flyer__address-block">
    <h1 class="blk-flyer__address">${address}</h1>
    ${tagline ? `<p class="blk-flyer__tagline">${tagline}</p>` : ""}
  </div>

  <!-- Stats bar -->
  ${stats.length > 0 ? `
  <ul class="blk-flyer__stats">
    ${stats.map(s => `<li><span class="blk-flyer__stat-val">${s.value}</span><span class="blk-flyer__stat-lbl">${s.label}</span></li>`).join("")}
  </ul>` : ""}

  <!-- Additional photos grid -->
  ${photos.length > 1 ? `
  <div class="blk-flyer__photo-grid blk-flyer__photo-grid--${Math.min(photos.length - 1, 3)}">
    ${photos.slice(1).map((src, i) => `<img src="${src}" alt="Photo ${i + 2}" loading="lazy">`).join("")}
  </div>` : ""}

  <!-- Remarks -->
  ${listing?.PublicRemarks ? `<p class="blk-flyer__remarks">${listing.PublicRemarks}</p>` : ""}

  <!-- Agent footer -->
  <footer class="blk-flyer__footer">
    <div class="blk-flyer__agent">
      ${agentPhoto ? `<img class="blk-flyer__agent-photo" src="${agentPhoto}" alt="${agentName}">` : ""}
      <div>
        ${agentName ? `<p class="blk-flyer__agent-name">${agentName}</p>` : ""}
        ${agentPhone ? `<p class="blk-flyer__agent-contact">${agentPhone}</p>` : ""}
        ${agentEmail ? `<p class="blk-flyer__agent-contact">${agentEmail}</p>` : ""}
      </div>
    </div>
    <div class="blk-flyer__footer-brand">
      ${logo ? `<img class="blk-flyer__footer-logo" src="${logo}" alt="${company}">` : `<span>${company}</span>`}
      ${showEHO ? `<span class="blk-flyer__eho" title="Equal Housing Opportunity">⊜ Equal Housing Opportunity</span>` : ""}
    </div>
  </footer>
</div>
<style>
.blk-flyer{font-family:Georgia,serif;max-width:720px;margin:0 auto;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.12);overflow:hidden;print-color-adjust:exact}
.blk-flyer__header{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.25rem;background:var(--blk-primary);color:#fff}
.blk-flyer__logo{height:36px;object-fit:contain}
.blk-flyer__company-name{font-size:1.1rem;font-weight:700}
.blk-flyer__price-wrap{text-align:right}
.blk-flyer__status{display:block;font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;opacity:.8}
.blk-flyer__price{font-size:1.5rem;font-weight:700}
.blk-flyer__hero-photo{width:100%;height:340px;object-fit:cover;display:block}
.blk-flyer__hero-photo--placeholder{height:340px;display:flex;align-items:center;justify-content:center;background:#f3f4f6;font-size:2rem;color:#9ca3af}
.blk-flyer__address-block{padding:1rem 1.25rem .5rem;border-bottom:3px solid var(--blk-accent)}
.blk-flyer__address{font-size:1.25rem;margin:0 0 .2rem;color:#111;font-family:system-ui,sans-serif;font-weight:700}
.blk-flyer__tagline{font-style:italic;color:#6b7280;margin:0;font-size:.9rem}
.blk-flyer__stats{list-style:none;margin:0;padding:.75rem 1.25rem;display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;background:#f9fafb;border-bottom:1px solid #e5e7eb}
.blk-flyer__stats li{display:flex;flex-direction:column;align-items:center}
.blk-flyer__stat-val{font-size:1.1rem;font-weight:700;color:var(--blk-primary);font-family:system-ui,sans-serif}
.blk-flyer__stat-lbl{font-size:.65rem;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af}
.blk-flyer__photo-grid{display:grid;gap:2px;padding:2px}
.blk-flyer__photo-grid--1{grid-template-columns:1fr}
.blk-flyer__photo-grid--2{grid-template-columns:1fr 1fr}
.blk-flyer__photo-grid--3{grid-template-columns:1fr 1fr 1fr}
.blk-flyer__photo-grid img{width:100%;height:160px;object-fit:cover;display:block}
.blk-flyer__remarks{padding:1rem 1.25rem;font-size:.85rem;color:#374151;line-height:1.6;margin:0;border-bottom:1px solid #e5e7eb}
.blk-flyer__footer{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.25rem;background:var(--blk-primary);color:#fff}
.blk-flyer__agent{display:flex;align-items:center;gap:.6rem}
.blk-flyer__agent-photo{width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.4)}
.blk-flyer__agent-name{font-weight:700;margin:0;font-size:.9rem}
.blk-flyer__agent-contact{margin:0;font-size:.75rem;opacity:.85}
.blk-flyer__footer-brand{display:flex;flex-direction:column;align-items:flex-end;gap:.25rem}
.blk-flyer__footer-logo{height:28px;object-fit:contain;filter:brightness(10)}
.blk-flyer__eho{font-size:.65rem;opacity:.7}
@media print{.blk-flyer{box-shadow:none;max-width:100%}}
</style>`;
  },
};

export default definition;
