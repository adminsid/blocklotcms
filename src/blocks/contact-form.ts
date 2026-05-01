// ─────────────────────────────────────────────────────────────────────────────
// Contact Form block
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition } from "../types.js";

const definition: BlockDefinition = {
  type: "contact-form",
  label: "Contact Form",
  description: "Lead-capture contact form compliant with real estate advertising regulations. Submits via Fetch to a configurable endpoint.",
  defaultConfig: {
    title: "Contact an Agent",
    subtitle: "We'll respond within one business day.",
    submitEndpoint: "/api/contact",
    primaryColor: "#1a56db",
    agentName: "",
    agentPhoto: "",
    agentPhone: "",
    agentEmail: "",
    listingKey: "",
    showScheduleShowing: true,
    equalHousingDisclaimer: true,
    successMessage: "Thank you! An agent will reach out shortly.",
  },
  render(config) {
    const title = String(config["title"] ?? "Contact an Agent");
    const subtitle = String(config["subtitle"] ?? "");
    const endpoint = String(config["submitEndpoint"] ?? "/api/contact");
    const color = String(config["primaryColor"] ?? "#1a56db");
    const agentName = String(config["agentName"] ?? "");
    const agentPhoto = String(config["agentPhoto"] ?? "");
    const agentPhone = String(config["agentPhone"] ?? "");
    const agentEmail = String(config["agentEmail"] ?? "");
    const listingKey = String(config["listingKey"] ?? "");
    const showSchedule = config["showScheduleShowing"] !== false;
    const showEHO = config["equalHousingDisclaimer"] !== false;
    const successMsg = String(config["successMessage"] ?? "Thank you!");
    // Escape for safe embedding inside a JS single-quoted string literal.
    // Order: backslashes first, then other special characters.
    const safeSuccessMsg = successMsg
      .replace(/\\/g, "\\\\")   // \ → \\
      .replace(/'/g, "\\'")     // ' → \'
      .replace(/\r/g, "\\r")    // CR
      .replace(/\n/g, "\\n")    // LF
      .replace(/\u2028/g, "\\u2028")  // line separator
      .replace(/\u2029/g, "\\u2029"); // paragraph separator
    const formId = `blk-contact-${Math.random().toString(36).slice(2, 8)}`;

    return /* html */`
<section class="blk-contact" style="--blk-primary:${color}" id="${formId}-wrap">
  ${agentName || agentPhoto ? `
  <div class="blk-contact__agent">
    ${agentPhoto ? `<img class="blk-contact__agent-photo" src="${agentPhoto}" alt="${agentName}" loading="lazy">` : ""}
    <div class="blk-contact__agent-info">
      ${agentName ? `<p class="blk-contact__agent-name">${agentName}</p>` : ""}
      ${agentPhone ? `<a class="blk-contact__agent-tel" href="tel:${agentPhone.replace(/\D/g,"")}">${agentPhone}</a>` : ""}
      ${agentEmail ? `<a class="blk-contact__agent-email" href="mailto:${agentEmail}">${agentEmail}</a>` : ""}
    </div>
  </div>` : ""}
  <h3 class="blk-contact__title">${title}</h3>
  ${subtitle ? `<p class="blk-contact__subtitle">${subtitle}</p>` : ""}
  <form class="blk-contact__form" id="${formId}" novalidate>
    ${listingKey ? `<input type="hidden" name="listingKey" value="${listingKey}">` : ""}
    <div class="blk-contact__row">
      <label>First Name <span aria-hidden="true">*</span>
        <input type="text" name="firstName" required autocomplete="given-name" placeholder="Jane">
      </label>
      <label>Last Name <span aria-hidden="true">*</span>
        <input type="text" name="lastName" required autocomplete="family-name" placeholder="Smith">
      </label>
    </div>
    <label>Email <span aria-hidden="true">*</span>
      <input type="email" name="email" required autocomplete="email" placeholder="jane@example.com">
    </label>
    <label>Phone
      <input type="tel" name="phone" autocomplete="tel" placeholder="(555) 000-0000">
    </label>
    ${showSchedule ? `
    <label>Preferred Showing Date
      <input type="date" name="showingDate">
    </label>` : ""}
    <label>Message
      <textarea name="message" rows="3" placeholder="I'm interested in this property…"></textarea>
    </label>
    <label class="blk-contact__consent">
      <input type="checkbox" name="consent" required>
      I agree to be contacted by an agent. I understand I can opt out at any time.
    </label>
    <button class="blk-contact__btn" type="submit">Send Message</button>
    <p class="blk-contact__status" id="${formId}-status" aria-live="polite"></p>
    ${showEHO ? `<p class="blk-contact__eho">
      <span aria-label="Equal Housing Opportunity">⊜</span>
      Equal Housing Opportunity. We are pledged to the letter and spirit of U.S. policy for the achievement of equal housing opportunity throughout the nation. We encourage and support an affirmative advertising and marketing program in which there are no barriers to obtaining housing because of race, color, religion, sex, handicap, familial status, or national origin.
    </p>` : ""}
  </form>
</section>
<style>
.blk-contact{font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:1.5rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px}
.blk-contact__agent{display:flex;align-items:center;gap:.75rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #f3f4f6}
.blk-contact__agent-photo{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid var(--blk-primary)}
.blk-contact__agent-info{display:flex;flex-direction:column;gap:.1rem}
.blk-contact__agent-name{font-weight:700;font-size:.95rem;margin:0;color:#111}
.blk-contact__agent-tel,.blk-contact__agent-email{font-size:.8rem;color:var(--blk-primary);text-decoration:none}
.blk-contact__title{font-size:1.15rem;font-weight:700;margin:0 0 .25rem;color:#111}
.blk-contact__subtitle{font-size:.85rem;color:#6b7280;margin:0 0 1rem}
.blk-contact__form{display:flex;flex-direction:column;gap:.65rem}
.blk-contact__row{display:grid;grid-template-columns:1fr 1fr;gap:.65rem}
.blk-contact__form label{display:flex;flex-direction:column;font-size:.8rem;font-weight:600;color:#374151;gap:.25rem}
.blk-contact__form input,.blk-contact__form textarea{border:1px solid #d1d5db;border-radius:6px;padding:.4rem .6rem;font-size:.9rem;font-family:inherit;outline:none;resize:vertical;transition:border-color .15s}
.blk-contact__form input:focus,.blk-contact__form textarea:focus{border-color:var(--blk-primary)}
.blk-contact__consent{flex-direction:row !important;align-items:flex-start;gap:.5rem;font-weight:400 !important;color:#6b7280}
.blk-contact__btn{background:var(--blk-primary);color:#fff;border:none;border-radius:8px;padding:.65rem;font-size:.95rem;font-weight:700;cursor:pointer;transition:opacity .15s}
.blk-contact__btn:hover{opacity:.88}
.blk-contact__btn:disabled{opacity:.5;cursor:default}
.blk-contact__status{font-size:.85rem;text-align:center;margin:0;min-height:1.2em}
.blk-contact__eho{font-size:.65rem;color:#9ca3af;margin:.5rem 0 0;line-height:1.5}
@media(max-width:380px){.blk-contact__row{grid-template-columns:1fr}}
</style>
<script>
(function(){
  var form=document.getElementById('${formId}');
  if(!form)return;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=form.querySelector('button[type=submit]');
    var status=document.getElementById('${formId}-status');
    btn.disabled=true;
    status.style.color='#6b7280';
    status.textContent='Sending…';
    var data=Object.fromEntries(new FormData(form));
    fetch('${endpoint}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json()})
      .then(function(){
        status.style.color='#065f46';
        status.textContent='${safeSuccessMsg}';
        form.reset();
      })
      .catch(function(){
        status.style.color='#991b1b';
        status.textContent='Something went wrong. Please try again.';
      })
      .finally(function(){btn.disabled=false;});
  });
})();
</script>`;
  },
};

export default definition;
