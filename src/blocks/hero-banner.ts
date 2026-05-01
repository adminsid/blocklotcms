// ─────────────────────────────────────────────────────────────────────────────
// Hero Banner block — full-width headline with CTA for landing pages
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition } from "../types.js";

const definition: BlockDefinition = {
  type: "hero-banner",
  label: "Hero Banner",
  description: "Full-width hero section with headline, subtext, and call-to-action button. Ideal for home pages.",
  defaultConfig: {
    headline: "Your Next Home Starts Here",
    subtext: "Browse thousands of listings from trusted local agents.",
    ctaLabel: "Start Searching",
    ctaUrl: "/listings/search",
    backgroundImage: "",
    backgroundColor: "#1a56db",
    textColor: "#ffffff",
    overlayOpacity: 0.45,
    minHeight: 480,
  },
  render(config) {
    const headline = String(config["headline"] ?? "Your Next Home Starts Here");
    const subtext = String(config["subtext"] ?? "");
    const ctaLabel = String(config["ctaLabel"] ?? "Search Homes");
    const ctaUrl = String(config["ctaUrl"] ?? "/listings/search");
    const bgImage = String(config["backgroundImage"] ?? "");
    const bgColor = String(config["backgroundColor"] ?? "#1a56db");
    const textColor = String(config["textColor"] ?? "#ffffff");
    const opacity = Number(config["overlayOpacity"] ?? 0.45);
    const minH = Number(config["minHeight"] ?? 480);

    const bgStyle = bgImage
      ? `background:linear-gradient(rgba(0,0,0,${opacity}),rgba(0,0,0,${opacity})),url('${bgImage}') center/cover no-repeat fixed`
      : `background:${bgColor}`;

    return /* html */`
<section class="blk-hero" style="${bgStyle};color:${textColor};min-height:${minH}px">
  <div class="blk-hero__content">
    <h1 class="blk-hero__headline">${headline}</h1>
    ${subtext ? `<p class="blk-hero__subtext">${subtext}</p>` : ""}
    ${ctaLabel && ctaUrl ? `<a class="blk-hero__cta" href="${ctaUrl}">${ctaLabel}</a>` : ""}
  </div>
</section>
<style>
.blk-hero{display:flex;align-items:center;justify-content:center;text-align:center;padding:3rem 1.5rem}
.blk-hero__content{max-width:640px}
.blk-hero__headline{font-family:system-ui,sans-serif;font-size:clamp(1.75rem,5vw,3rem);font-weight:800;margin:0 0 .75rem;line-height:1.15;text-shadow:0 2px 6px rgba(0,0,0,.25)}
.blk-hero__subtext{font-family:system-ui,sans-serif;font-size:clamp(.9rem,2.5vw,1.2rem);margin:0 0 1.5rem;opacity:.9}
.blk-hero__cta{display:inline-block;background:#fff;color:#1a1a1a;text-decoration:none;padding:.8rem 2rem;border-radius:8px;font-family:system-ui,sans-serif;font-size:1rem;font-weight:700;transition:opacity .15s;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.blk-hero__cta:hover{opacity:.88}
</style>`;
  },
};

export default definition;
