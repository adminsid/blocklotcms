// ─────────────────────────────────────────────────────────────────────────────
// Mortgage Calculator block
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition } from "../types.js";

const definition: BlockDefinition = {
  type: "mortgage-calculator",
  label: "Mortgage Calculator",
  description: "Interactive monthly payment estimator with principal, interest, taxes, and insurance (PITI).",
  defaultConfig: {
    title: "Mortgage Calculator",
    defaultPrice: 400000,
    defaultDown: 20,
    defaultRate: 7.0,
    defaultTerm: 30,
    primaryColor: "#1a56db",
    showTaxInsurance: true,
    disclaimer: "This calculator is for educational purposes only and does not constitute a loan offer.",
  },
  render(config) {
    const title = String(config["title"] ?? "Mortgage Calculator");
    const defaultPrice = Number(config["defaultPrice"] ?? 400000);
    const defaultDown = Number(config["defaultDown"] ?? 20);
    const defaultRate = Number(config["defaultRate"] ?? 7.0);
    const defaultTerm = Number(config["defaultTerm"] ?? 30);
    const color = String(config["primaryColor"] ?? "#1a56db");
    const showTaxIns = config["showTaxInsurance"] !== false;
    const disclaimer = String(config["disclaimer"] ?? "");

    return /* html */`
<section class="blk-mortgage-calc" style="--blk-primary:${color}">
  <h2 class="blk-mortgage-calc__title">${title}</h2>
  <div class="blk-mortgage-calc__form">
    <label>Home Price ($)
      <input id="blk-mc-price" type="number" min="0" step="1000" value="${defaultPrice}" aria-label="Home price">
    </label>
    <label>Down Payment (%)
      <input id="blk-mc-down" type="number" min="0" max="100" step="0.5" value="${defaultDown}" aria-label="Down payment percent">
    </label>
    <label>Interest Rate (% APR)
      <input id="blk-mc-rate" type="number" min="0.1" max="30" step="0.05" value="${defaultRate}" aria-label="Interest rate">
    </label>
    <label>Loan Term (years)
      <select id="blk-mc-term" aria-label="Loan term">
        ${[10, 15, 20, 25, 30].map(y => `<option value="${y}"${y === defaultTerm ? " selected" : ""}>${y}</option>`).join("")}
      </select>
    </label>
    ${showTaxIns ? `
    <label>Annual Property Tax ($)
      <input id="blk-mc-tax" type="number" min="0" step="100" value="5000" aria-label="Annual property tax">
    </label>
    <label>Annual Homeowners Insurance ($)
      <input id="blk-mc-ins" type="number" min="0" step="50" value="1200" aria-label="Annual insurance">
    </label>` : ""}
  </div>
  <div class="blk-mortgage-calc__result" aria-live="polite">
    <p class="blk-mortgage-calc__monthly-label">Estimated Monthly Payment</p>
    <p class="blk-mortgage-calc__monthly-amount" id="blk-mc-result">—</p>
    <ul class="blk-mortgage-calc__breakdown" id="blk-mc-breakdown"></ul>
  </div>
  ${disclaimer ? `<p class="blk-mortgage-calc__disclaimer">${disclaimer}</p>` : ""}
</section>
<style>
.blk-mortgage-calc{font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:1.5rem;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.blk-mortgage-calc__title{font-size:1.25rem;font-weight:700;margin:0 0 1rem;color:#111}
.blk-mortgage-calc__form{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
.blk-mortgage-calc__form label{display:flex;flex-direction:column;font-size:.8rem;font-weight:600;color:#374151;gap:.25rem}
.blk-mortgage-calc__form input,.blk-mortgage-calc__form select{border:1px solid #d1d5db;border-radius:6px;padding:.375rem .6rem;font-size:.9rem;outline:none;transition:border-color .15s}
.blk-mortgage-calc__form input:focus,.blk-mortgage-calc__form select:focus{border-color:var(--blk-primary)}
.blk-mortgage-calc__result{margin-top:1.25rem;text-align:center;background:var(--blk-primary);color:#fff;border-radius:8px;padding:1rem}
.blk-mortgage-calc__monthly-label{margin:0;font-size:.8rem;opacity:.85}
.blk-mortgage-calc__monthly-amount{margin:.25rem 0 0;font-size:2rem;font-weight:700}
.blk-mortgage-calc__breakdown{list-style:none;margin:.5rem 0 0;padding:0;font-size:.8rem;opacity:.9;display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem}
.blk-mortgage-calc__disclaimer{font-size:.7rem;color:#9ca3af;margin-top:.75rem;text-align:center}
@media(max-width:440px){.blk-mortgage-calc__form{grid-template-columns:1fr}}
</style>
<script>
(function(){
  function calc(){
    var price=+document.getElementById('blk-mc-price').value||0;
    var down=+document.getElementById('blk-mc-down').value||0;
    var rate=+document.getElementById('blk-mc-rate').value||0;
    var term=+document.getElementById('blk-mc-term').value||30;
    var taxEl=document.getElementById('blk-mc-tax');
    var insEl=document.getElementById('blk-mc-ins');
    var tax=taxEl?+taxEl.value||0:0;
    var ins=insEl?+insEl.value||0:0;
    var principal=price*(1-down/100);
    var monthlyRate=rate/100/12;
    var n=term*12;
    var pi=monthlyRate>0?principal*monthlyRate*Math.pow(1+monthlyRate,n)/(Math.pow(1+monthlyRate,n)-1):principal/n;
    var monthly=pi+(tax/12)+(ins/12);
    document.getElementById('blk-mc-result').textContent='$'+monthly.toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g,',');
    var br=document.getElementById('blk-mc-breakdown');
    br.innerHTML='<li>P&I: $'+pi.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,',')+'/mo</li>'
      +(tax?'<li>Tax: $'+(tax/12).toFixed(0)+'/mo</li>':'')
      +(ins?'<li>Ins: $'+(ins/12).toFixed(0)+'/mo</li>':'');
  }
  document.querySelectorAll('#blk-mc-price,#blk-mc-down,#blk-mc-rate,#blk-mc-term,#blk-mc-tax,#blk-mc-ins').forEach(function(el){
    if(el)el.addEventListener('input',calc);
  });
  calc();
})();
</script>`;
  },
};

export default definition;
