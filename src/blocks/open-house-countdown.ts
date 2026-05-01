// ─────────────────────────────────────────────────────────────────────────────
// Open House Countdown block
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition } from "../types.js";

const definition: BlockDefinition = {
  type: "open-house-countdown",
  label: "Open House Countdown",
  description: "Live countdown timer to the next open house event, with date, time, and address.",
  defaultConfig: {
    eventDate: "",           // ISO date-time string e.g. "2025-08-15T14:00:00"
    address: "123 Main St, Anytown, ST",
    agentName: "",
    agentPhone: "",
    primaryColor: "#1a56db",
    title: "Open House",
    rsvpUrl: "",
  },
  render(config) {
    const eventDate = String(config["eventDate"] ?? "");
    const address = String(config["address"] ?? "");
    const agentName = String(config["agentName"] ?? "");
    const agentPhone = String(config["agentPhone"] ?? "");
    const color = String(config["primaryColor"] ?? "#1a56db");
    const title = String(config["title"] ?? "Open House");
    const rsvpUrl = String(config["rsvpUrl"] ?? "");
    const id = `blk-oh-${Math.random().toString(36).slice(2, 8)}`;

    const displayDate = eventDate
      ? new Date(eventDate).toLocaleString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
          hour: "numeric", minute: "2-digit",
        })
      : "Date TBD";

    return /* html */`
<div class="blk-openhouse" id="${id}" style="--blk-primary:${color}">
  <p class="blk-openhouse__label">${title}</p>
  <p class="blk-openhouse__date">${displayDate}</p>
  <p class="blk-openhouse__address">${address}</p>
  ${eventDate ? `
  <div class="blk-openhouse__timer" id="${id}-timer" aria-live="polite">
    <div class="blk-openhouse__unit"><span class="blk-openhouse__num" id="${id}-d">--</span><span class="blk-openhouse__unit-lbl">Days</span></div>
    <div class="blk-openhouse__sep">:</div>
    <div class="blk-openhouse__unit"><span class="blk-openhouse__num" id="${id}-h">--</span><span class="blk-openhouse__unit-lbl">Hrs</span></div>
    <div class="blk-openhouse__sep">:</div>
    <div class="blk-openhouse__unit"><span class="blk-openhouse__num" id="${id}-m">--</span><span class="blk-openhouse__unit-lbl">Min</span></div>
    <div class="blk-openhouse__sep">:</div>
    <div class="blk-openhouse__unit"><span class="blk-openhouse__num" id="${id}-s">--</span><span class="blk-openhouse__unit-lbl">Sec</span></div>
  </div>` : ""}
  ${agentName || agentPhone ? `
  <div class="blk-openhouse__agent">
    ${agentName ? `<span>${agentName}</span>` : ""}
    ${agentPhone ? `<a href="tel:${agentPhone.replace(/\D/g,"")}">${agentPhone}</a>` : ""}
  </div>` : ""}
  ${rsvpUrl ? `<a class="blk-openhouse__rsvp" href="${rsvpUrl}">RSVP / Get Directions</a>` : ""}
</div>
<style>
.blk-openhouse{font-family:system-ui,sans-serif;max-width:400px;margin:0 auto;padding:1.5rem;background:var(--blk-primary);color:#fff;border-radius:14px;text-align:center}
.blk-openhouse__label{text-transform:uppercase;letter-spacing:.12em;font-size:.7rem;font-weight:700;opacity:.75;margin:0 0 .4rem}
.blk-openhouse__date{font-size:.95rem;font-weight:700;margin:0 0 .25rem}
.blk-openhouse__address{font-size:.8rem;opacity:.8;margin:0 0 1rem}
.blk-openhouse__timer{display:flex;justify-content:center;align-items:center;gap:.4rem;margin-bottom:1rem}
.blk-openhouse__unit{display:flex;flex-direction:column;align-items:center}
.blk-openhouse__num{font-size:2rem;font-weight:800;line-height:1}
.blk-openhouse__unit-lbl{font-size:.6rem;text-transform:uppercase;letter-spacing:.1em;opacity:.7}
.blk-openhouse__sep{font-size:1.5rem;font-weight:800;opacity:.5;margin-bottom:.8rem}
.blk-openhouse__agent{font-size:.8rem;opacity:.85;display:flex;justify-content:center;gap:.75rem;flex-wrap:wrap;margin-bottom:.75rem}
.blk-openhouse__agent a{color:#fff}
.blk-openhouse__rsvp{display:inline-block;background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.5);color:#fff;text-decoration:none;padding:.45rem 1.25rem;border-radius:6px;font-size:.85rem;font-weight:600;transition:background .15s}
.blk-openhouse__rsvp:hover{background:rgba(255,255,255,.3)}
</style>
${eventDate ? `
<script>
(function(){
  var target=new Date('${eventDate}').getTime();
  function pad(n){return n<10?'0'+n:String(n);}
  function tick(){
    var diff=target-Date.now();
    if(diff<=0){document.getElementById('${id}-timer').textContent='🎉 Open House is Live!';return;}
    var d=Math.floor(diff/864e5);
    var h=Math.floor((diff%864e5)/36e5);
    var m=Math.floor((diff%36e5)/6e4);
    var s=Math.floor((diff%6e4)/1e3);
    document.getElementById('${id}-d').textContent=String(d);
    document.getElementById('${id}-h').textContent=pad(h);
    document.getElementById('${id}-m').textContent=pad(m);
    document.getElementById('${id}-s').textContent=pad(s);
    setTimeout(tick,1000);
  }
  tick();
})();
</script>` : ""}`;
  },
};

export default definition;
