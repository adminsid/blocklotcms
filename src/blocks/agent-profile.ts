// ─────────────────────────────────────────────────────────────────────────────
// Agent Profile block
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition } from "../types.js";

const definition: BlockDefinition = {
  type: "agent-profile",
  label: "Agent Profile",
  description: "Agent bio card with photo, credentials, social links, and contact CTA.",
  defaultConfig: {
    agentName: "Alex Rivera",
    agentTitle: "Licensed Real Estate Agent",
    agentPhoto: "",
    agentPhone: "",
    agentEmail: "",
    licenseNumber: "",
    bio: "Helping families find their perfect home for over 10 years.",
    specialties: ["Buyer Representation", "Seller Representation", "First-Time Buyers"],
    languages: ["English", "Spanish"],
    linkedIn: "",
    instagram: "",
    primaryColor: "#1a56db",
    companyName: "",
    companyLogo: "",
    equalHousingDisclaimer: true,
  },
  render(config) {
    const name = String(config["agentName"] ?? "");
    const title = String(config["agentTitle"] ?? "Licensed Real Estate Agent");
    const photo = String(config["agentPhoto"] ?? "");
    const phone = String(config["agentPhone"] ?? "");
    const email = String(config["agentEmail"] ?? "");
    const license = String(config["licenseNumber"] ?? "");
    const bio = String(config["bio"] ?? "");
    const specialties: string[] = Array.isArray(config["specialties"]) ? config["specialties"] as string[] : [];
    const languages: string[] = Array.isArray(config["languages"]) ? config["languages"] as string[] : [];
    const li = String(config["linkedIn"] ?? "");
    const ig = String(config["instagram"] ?? "");
    const color = String(config["primaryColor"] ?? "#1a56db");
    const company = String(config["companyName"] ?? "");
    const companyLogo = String(config["companyLogo"] ?? "");
    const showEHO = config["equalHousingDisclaimer"] !== false;

    return /* html */`
<article class="blk-agent" style="--blk-primary:${color}">
  <div class="blk-agent__top">
    ${photo
      ? `<img class="blk-agent__photo" src="${photo}" alt="Photo of ${name}" loading="lazy">`
      : `<div class="blk-agent__photo blk-agent__photo--fallback" aria-hidden="true">👤</div>`}
    <div class="blk-agent__meta">
      <h3 class="blk-agent__name">${name}</h3>
      <p class="blk-agent__title">${title}</p>
      ${company ? `<p class="blk-agent__company">${companyLogo ? `<img src="${companyLogo}" alt="${company}" height="20" style="vertical-align:middle;margin-right:.3rem">` : ""}${company}</p>` : ""}
      ${license ? `<p class="blk-agent__license">License #${license}</p>` : ""}
      <div class="blk-agent__cta">
        ${phone ? `<a class="blk-agent__btn" href="tel:${phone.replace(/\D/g,"")}">${phone}</a>` : ""}
        ${email ? `<a class="blk-agent__btn blk-agent__btn--outline" href="mailto:${email}">Email</a>` : ""}
      </div>
    </div>
  </div>
  ${bio ? `<p class="blk-agent__bio">${bio}</p>` : ""}
  ${specialties.length ? `
  <div class="blk-agent__section">
    <h4 class="blk-agent__section-title">Specialties</h4>
    <ul class="blk-agent__tags">${specialties.map(s => `<li>${s}</li>`).join("")}</ul>
  </div>` : ""}
  ${languages.length ? `
  <div class="blk-agent__section">
    <h4 class="blk-agent__section-title">Languages</h4>
    <p class="blk-agent__text">${languages.join(" · ")}</p>
  </div>` : ""}
  ${li || ig ? `
  <div class="blk-agent__social">
    ${li ? `<a href="${li}" target="_blank" rel="noopener noreferrer" aria-label="${name} on LinkedIn" class="blk-agent__social-link">in</a>` : ""}
    ${ig ? `<a href="${ig}" target="_blank" rel="noopener noreferrer" aria-label="${name} on Instagram" class="blk-agent__social-link">&#x1F4F7;</a>` : ""}
  </div>` : ""}
  ${showEHO ? `<p class="blk-agent__eho">⊜ Equal Housing Opportunity</p>` : ""}
</article>
<style>
.blk-agent{font-family:system-ui,sans-serif;max-width:420px;padding:1.25rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px}
.blk-agent__top{display:flex;gap:1rem;margin-bottom:1rem}
.blk-agent__photo{width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid var(--blk-primary);flex-shrink:0}
.blk-agent__photo--fallback{width:90px;height:90px;border-radius:50%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:2.5rem;flex-shrink:0}
.blk-agent__meta{display:flex;flex-direction:column;gap:.2rem;min-width:0}
.blk-agent__name{font-size:1.1rem;font-weight:700;margin:0;color:#111}
.blk-agent__title{font-size:.8rem;color:#6b7280;margin:0}
.blk-agent__company{font-size:.8rem;color:#374151;margin:0}
.blk-agent__license{font-size:.7rem;color:#9ca3af;margin:0}
.blk-agent__cta{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.4rem}
.blk-agent__btn{display:inline-block;background:var(--blk-primary);color:#fff;text-decoration:none;border-radius:6px;padding:.3rem .75rem;font-size:.8rem;font-weight:600}
.blk-agent__btn--outline{background:transparent;border:1.5px solid var(--blk-primary);color:var(--blk-primary)}
.blk-agent__bio{font-size:.88rem;color:#374151;margin:0 0 .75rem;line-height:1.55}
.blk-agent__section{margin-bottom:.65rem}
.blk-agent__section-title{font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin:0 0 .3rem;font-weight:700}
.blk-agent__tags{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.3rem}
.blk-agent__tags li{background:#eff6ff;color:var(--blk-primary);padding:.2rem .55rem;border-radius:20px;font-size:.75rem}
.blk-agent__text{font-size:.85rem;color:#374151;margin:0}
.blk-agent__social{display:flex;gap:.5rem;margin:.75rem 0 0}
.blk-agent__social-link{display:inline-block;background:var(--blk-primary);color:#fff;text-decoration:none;border-radius:6px;width:32px;height:32px;line-height:32px;text-align:center;font-size:.85rem;font-weight:700}
.blk-agent__eho{font-size:.65rem;color:#9ca3af;margin:.75rem 0 0}
</style>`;
  },
};

export default definition;
