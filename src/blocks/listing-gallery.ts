// ─────────────────────────────────────────────────────────────────────────────
// Listing Photo Gallery block
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition, ResoMedia } from "../types.js";

const definition: BlockDefinition = {
  type: "listing-gallery",
  label: "Listing Photo Gallery",
  description: "Responsive lightbox photo gallery for MLS listing images (RESO Media resource).",
  defaultConfig: {
    media: [] as ResoMedia[],
    maxThumbs: 12,
    primaryColor: "#1a56db",
    listingAddress: "",
  },
  render(config) {
    const media = (config["media"] as ResoMedia[] | undefined) ?? [];
    const max = Number(config["maxThumbs"] ?? 12);
    const color = String(config["primaryColor"] ?? "#1a56db");
    const address = String(config["listingAddress"] ?? "");
    const id = `blk-gallery-${Math.random().toString(36).slice(2, 8)}`;

    const photos = media
      .sort((a, b) => (a.Order ?? 99) - (b.Order ?? 99))
      .slice(0, max);

    if (photos.length === 0) {
      return `<div class="blk-gallery blk-gallery--empty" style="--blk-primary:${color}">
        <p style="color:#9ca3af;text-align:center;padding:2rem 1rem">No photos available for this listing.</p>
      </div>`;
    }

    const [hero, ...thumbs] = photos;

    return /* html */`
<div class="blk-gallery" id="${id}" style="--blk-primary:${color}">
  <div class="blk-gallery__hero">
    <img class="blk-gallery__hero-img"
         id="${id}-hero"
         src="${hero!.MediaURL}"
         alt="${address ? `Main photo of ${address}` : "Main listing photo"}"
         loading="eager">
    <div class="blk-gallery__counter" id="${id}-counter">1 / ${photos.length}</div>
    <button class="blk-gallery__nav blk-gallery__nav--prev" data-gallery="${id}" data-dir="-1" aria-label="Previous photo">&#8249;</button>
    <button class="blk-gallery__nav blk-gallery__nav--next" data-gallery="${id}" data-dir="1" aria-label="Next photo">&#8250;</button>
  </div>
  ${thumbs.length > 0 ? `
  <div class="blk-gallery__thumbs">
    ${photos.map((m, i) => `
    <button class="blk-gallery__thumb${i === 0 ? " blk-gallery__thumb--active" : ""}"
            data-gallery="${id}" data-idx="${i}" aria-label="Photo ${i + 1}">
      <img src="${m.MediaURL}" alt="Thumbnail ${i + 1}" loading="lazy">
    </button>`).join("")}
  </div>` : ""}
</div>
<style>
.blk-gallery{font-family:system-ui,sans-serif;max-width:900px;margin:0 auto}
.blk-gallery__hero{position:relative;background:#000;border-radius:12px;overflow:hidden;aspect-ratio:16/9}
.blk-gallery__hero-img{width:100%;height:100%;object-fit:cover;display:block;transition:opacity .2s}
.blk-gallery__counter{position:absolute;bottom:.75rem;right:.75rem;background:rgba(0,0,0,.6);color:#fff;font-size:.75rem;padding:.2rem .55rem;border-radius:20px}
.blk-gallery__nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.45);border:none;color:#fff;font-size:2rem;padding:.1rem .6rem;cursor:pointer;border-radius:6px;line-height:1;transition:background .15s}
.blk-gallery__nav:hover{background:var(--blk-primary)}
.blk-gallery__nav--prev{left:.5rem}
.blk-gallery__nav--next{right:.5rem}
.blk-gallery__thumbs{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.6rem}
.blk-gallery__thumb{border:2px solid transparent;border-radius:6px;overflow:hidden;padding:0;cursor:pointer;background:none;width:72px;height:52px;flex-shrink:0;transition:border-color .15s}
.blk-gallery__thumb img{width:100%;height:100%;object-fit:cover;display:block}
.blk-gallery__thumb--active{border-color:var(--blk-primary)}
</style>
<script>
(function(){
  var galleries={};
  document.querySelectorAll('[data-gallery]').forEach(function(el){
    var gid=el.getAttribute('data-gallery');
    if(!galleries[gid]){
      var imgs=Array.from(document.querySelectorAll('#'+gid+' .blk-gallery__thumb img')).map(function(i){return i.src});
      if(!imgs.length){
        var hero=document.querySelector('#'+gid+'-hero');
        if(hero)imgs=[hero.src];
      }
      galleries[gid]={imgs:imgs,cur:0};
    }
  });
  function goTo(gid,idx){
    var g=galleries[gid];if(!g)return;
    g.cur=(idx+g.imgs.length)%g.imgs.length;
    var heroEl=document.getElementById(gid+'-hero');
    if(heroEl)heroEl.src=g.imgs[g.cur];
    var ctr=document.getElementById(gid+'-counter');
    if(ctr)ctr.textContent=(g.cur+1)+' / '+g.imgs.length;
    document.querySelectorAll('[data-gallery="'+gid+'"].blk-gallery__thumb').forEach(function(t,i){
      t.classList.toggle('blk-gallery__thumb--active',i===g.cur);
    });
  }
  document.addEventListener('click',function(e){
    var nav=e.target.closest('[data-gallery][data-dir]');
    if(nav){var gid=nav.getAttribute('data-gallery');goTo(gid,galleries[gid].cur+(+nav.getAttribute('data-dir')));return;}
    var thumb=e.target.closest('[data-gallery][data-idx]');
    if(thumb){goTo(thumb.getAttribute('data-gallery'),+thumb.getAttribute('data-idx'));}
  });
})();
</script>`;
  },
};

export default definition;
