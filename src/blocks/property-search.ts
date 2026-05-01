// ─────────────────────────────────────────────────────────────────────────────
// Property Search Bar block
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition } from "../types.js";

const definition: BlockDefinition = {
  type: "property-search",
  label: "Property Search Bar",
  description: "A quick-search form that sends the user to a configurable search results URL.",
  defaultConfig: {
    title: "Find Your Dream Home",
    subtitle: "Search homes for sale and for rent across the MLS",
    searchResultsUrl: "/listings/search",
    primaryColor: "#1a56db",
    propertyTypes: ["Residential", "Condo", "Townhouse", "Land", "Commercial"],
    placeholder: "City, ZIP, Neighborhood, or Address",
    backgroundImage: "",
  },
  render(config) {
    const title = String(config["title"] ?? "Find Your Dream Home");
    const subtitle = String(config["subtitle"] ?? "");
    const searchUrl = String(config["searchResultsUrl"] ?? "/listings/search");
    const color = String(config["primaryColor"] ?? "#1a56db");
    const types: string[] = Array.isArray(config["propertyTypes"])
      ? (config["propertyTypes"] as string[])
      : ["Residential", "Condo", "Townhouse", "Land"];
    const placeholder = String(config["placeholder"] ?? "City, ZIP, or Address");
    const bgImage = String(config["backgroundImage"] ?? "");

    const bgStyle = bgImage
      ? `background:linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url('${bgImage}') center/cover no-repeat`
      : `background:linear-gradient(135deg,${color}ee,${color}aa)`;

    return /* html */`
<section class="blk-search" style="--blk-primary:${color};${bgStyle}">
  <div class="blk-search__inner">
    ${title ? `<h2 class="blk-search__title">${title}</h2>` : ""}
    ${subtitle ? `<p class="blk-search__subtitle">${subtitle}</p>` : ""}
    <form class="blk-search__form" action="${searchUrl}" method="GET" role="search">
      <input class="blk-search__input" type="search" name="q"
             placeholder="${placeholder}"
             aria-label="Property search query">
      <select class="blk-search__type" name="type" aria-label="Property type">
        <option value="">All Types</option>
        ${types.map(t => `<option value="${encodeURIComponent(t)}">${t}</option>`).join("")}
      </select>
      <select class="blk-search__status" name="status" aria-label="Listing status">
        <option value="Active">For Sale</option>
        <option value="Rent">For Rent</option>
        <option value="">Any Status</option>
      </select>
      <button class="blk-search__btn" type="submit">Search</button>
    </form>
  </div>
</section>
<style>
.blk-search{font-family:system-ui,sans-serif;padding:3rem 1rem;text-align:center}
.blk-search__inner{max-width:760px;margin:0 auto}
.blk-search__title{color:#fff;font-size:1.9rem;font-weight:800;margin:0 0 .4rem;text-shadow:0 1px 3px rgba(0,0,0,.3)}
.blk-search__subtitle{color:rgba(255,255,255,.88);font-size:.95rem;margin:0 0 1.25rem}
.blk-search__form{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center}
.blk-search__input{flex:1 1 300px;min-width:0;border:none;border-radius:8px;padding:.7rem 1rem;font-size:.95rem;outline:none}
.blk-search__type,.blk-search__status{border:none;border-radius:8px;padding:.7rem .8rem;font-size:.9rem;background:#fff;cursor:pointer;outline:none}
.blk-search__btn{background:var(--blk-primary);color:#fff;border:none;border-radius:8px;padding:.7rem 1.5rem;font-size:.95rem;font-weight:700;cursor:pointer;transition:opacity .15s}
.blk-search__btn:hover{opacity:.88}
@media(max-width:540px){.blk-search__type,.blk-search__status{flex:1 1 calc(50% - .25rem)}}
</style>`;
  },
};

export default definition;
