// ─────────────────────────────────────────────────────────────────────────────
// Block Builder UI  –  served at GET /builder
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockDefinition } from "../types.js";

export function builderHtml(blockDefs: BlockDefinition[]): string {
  const defsJson = JSON.stringify(
    blockDefs.map(d => ({ type: d.type, label: d.label, description: d.description, defaultConfig: d.defaultConfig }))
  );

  return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BlockLot CMS – Builder</title>
<style>
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:system-ui,sans-serif;background:#f8fafc;display:flex;height:100vh;overflow:hidden}
#sidebar{width:280px;background:#1e293b;color:#f1f5f9;display:flex;flex-direction:column;flex-shrink:0}
#sidebar-header{padding:1rem 1.25rem;border-bottom:1px solid #334155}
#sidebar-header h1{margin:0;font-size:1rem;font-weight:700;color:#e2e8f0}
#sidebar-header p{margin:.25rem 0 0;font-size:.72rem;color:#94a3b8}
#block-list{flex:1;overflow-y:auto;padding:.75rem}
.block-item{padding:.6rem .75rem;border-radius:8px;cursor:grab;margin-bottom:.4rem;background:#334155;border:1px solid #475569;user-select:none;transition:background .15s}
.block-item:hover,.block-item:active{background:#3b82f6}
.block-item__label{font-size:.8rem;font-weight:600;color:#f1f5f9}
.block-item__desc{font-size:.7rem;color:#94a3b8;margin-top:.15rem;line-height:1.3}
#canvas-area{flex:1;display:flex;flex-direction:column;overflow:hidden}
#toolbar{padding:.6rem 1rem;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap}
#toolbar h2{margin:0;font-size:.9rem;font-weight:700;color:#1e293b;flex:1}
.toolbar-btn{background:#3b82f6;color:#fff;border:none;border-radius:6px;padding:.4rem .9rem;font-size:.8rem;font-weight:600;cursor:pointer;transition:opacity .15s}
.toolbar-btn:hover{opacity:.85}
.toolbar-btn--danger{background:#ef4444}
.toolbar-btn--secondary{background:#475569}
#page-name{border:1px solid #e2e8f0;border-radius:6px;padding:.35rem .65rem;font-size:.85rem;width:200px}
#canvas{flex:1;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:1rem}
#canvas.dragover{outline:3px dashed #3b82f6;outline-offset:-4px}
.canvas-block{position:relative;background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden}
.canvas-block__bar{display:flex;align-items:center;gap:.5rem;padding:.4rem .6rem;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:.75rem;color:#475569}
.canvas-block__label{font-weight:600;flex:1}
.canvas-block__btn{background:none;border:none;cursor:pointer;font-size:.8rem;padding:.2rem .4rem;border-radius:4px;color:#6b7280;transition:background .15s}
.canvas-block__btn:hover{background:#e2e8f0}
.canvas-block__preview{padding:.5rem}
.canvas-block__preview iframe{width:100%;border:none;min-height:120px;border-radius:4px}
#props-panel{width:300px;background:#fff;border-left:1px solid #e2e8f0;display:flex;flex-direction:column;overflow:hidden}
#props-panel h3{margin:0;padding:.75rem 1rem;font-size:.85rem;font-weight:700;color:#1e293b;border-bottom:1px solid #e2e8f0}
#props-content{flex:1;overflow-y:auto;padding:.75rem;display:flex;flex-direction:column;gap:.6rem}
.prop-field{display:flex;flex-direction:column;gap:.25rem}
.prop-field label{font-size:.75rem;font-weight:600;color:#374151}
.prop-field input,.prop-field textarea,.prop-field select{border:1px solid #d1d5db;border-radius:6px;padding:.35rem .55rem;font-size:.8rem;font-family:inherit;outline:none}
.prop-field input:focus,.prop-field textarea:focus{border-color:#3b82f6}
#save-props{margin-top:.5rem;background:#3b82f6;color:#fff;border:none;border-radius:6px;padding:.5rem;font-size:.8rem;font-weight:600;cursor:pointer;transition:opacity .15s}
#save-props:hover{opacity:.85}
#toast{position:fixed;bottom:1.5rem;right:1.5rem;background:#1e293b;color:#f1f5f9;padding:.6rem 1.25rem;border-radius:8px;font-size:.8rem;display:none;z-index:999}
</style>
</head>
<body>
<!-- ── Sidebar: block palette ──────────────────────────────────────────── -->
<aside id="sidebar">
  <div id="sidebar-header">
    <h1>🏠 BlockLot CMS</h1>
    <p>Drag blocks onto the canvas</p>
  </div>
  <div id="block-list"></div>
</aside>

<!-- ── Main canvas ─────────────────────────────────────────────────────── -->
<main id="canvas-area">
  <div id="toolbar">
    <h2>Page Builder</h2>
    <input id="page-name" placeholder="Page name…" value="Home Page">
    <input id="page-slug" placeholder="slug" value="home" style="width:120px;border:1px solid #e2e8f0;border-radius:6px;padding:.35rem .65rem;font-size:.85rem">
    <button class="toolbar-btn toolbar-btn--secondary" id="btn-preview">Preview</button>
    <button class="toolbar-btn" id="btn-save">Save Page</button>
    <button class="toolbar-btn toolbar-btn--danger" id="btn-clear">Clear</button>
  </div>
  <div id="canvas" role="list" aria-label="Page canvas">
    <p id="canvas-empty" style="text-align:center;color:#94a3b8;padding:3rem;font-size:.9rem">
      Drag a block from the left panel to get started.
    </p>
  </div>
</main>

<!-- ── Properties panel ────────────────────────────────────────────────── -->
<aside id="props-panel">
  <h3>Block Properties</h3>
  <div id="props-content">
    <p style="color:#94a3b8;font-size:.8rem;text-align:center;margin:2rem 0">
      Click a block to edit its properties.
    </p>
  </div>
</aside>

<div id="toast"></div>

<script>
(function(){
var DEFS = ${defsJson};
var blocks = [];   // {id, type, label, config}
var selectedId = null;

function uuid(){ return Math.random().toString(36).slice(2,10); }
function toast(msg){
  var t=document.getElementById('toast');
  t.textContent=msg;t.style.display='block';
  setTimeout(function(){t.style.display='none'},2500);
}

// ── Populate palette ──────────────────────────────────────────────────────
var palette = document.getElementById('block-list');
DEFS.forEach(function(def){
  var el=document.createElement('div');
  el.className='block-item';
  el.draggable=true;
  el.dataset.type=def.type;
  el.innerHTML='<div class="block-item__label">'+def.label+'</div><div class="block-item__desc">'+def.description+'</div>';
  el.addEventListener('dragstart',function(e){
    e.dataTransfer.setData('blockType', def.type);
    e.dataTransfer.effectAllowed='copy';
  });
  palette.appendChild(el);
});

// ── Canvas drag & drop ────────────────────────────────────────────────────
var canvas = document.getElementById('canvas');
canvas.addEventListener('dragover',function(e){e.preventDefault();canvas.classList.add('dragover');});
canvas.addEventListener('dragleave',function(){canvas.classList.remove('dragover');});
canvas.addEventListener('drop',function(e){
  e.preventDefault();canvas.classList.remove('dragover');
  var type=e.dataTransfer.getData('blockType');
  if(!type)return;
  var def=DEFS.find(function(d){return d.type===type;});
  if(!def)return;
  var b={id:uuid(),type:type,label:def.label,config:JSON.parse(JSON.stringify(def.defaultConfig))};
  blocks.push(b);
  renderCanvas();
  selectBlock(b.id);
});

// ── Render canvas ─────────────────────────────────────────────────────────
function renderCanvas(){
  var empty=document.getElementById('canvas-empty');
  if(blocks.length===0){if(empty)empty.style.display='';return;}
  if(empty)empty.style.display='none';
  // Remove stale block elements (keep empty placeholder)
  Array.from(canvas.children).forEach(function(c){
    if(c.id!=='canvas-empty')c.remove();
  });
  blocks.forEach(function(b){
    var wrap=document.createElement('div');
    wrap.className='canvas-block'+(selectedId===b.id?' canvas-block--selected':'');
    wrap.dataset.id=b.id;
    wrap.setAttribute('role','listitem');
    wrap.innerHTML=
      '<div class="canvas-block__bar">'+
      '<span class="canvas-block__label">'+b.label+'</span>'+
      '<button class="canvas-block__btn" data-action="up" title="Move up">↑</button>'+
      '<button class="canvas-block__btn" data-action="down" title="Move down">↓</button>'+
      '<button class="canvas-block__btn" data-action="edit" title="Edit">✏️</button>'+
      '<button class="canvas-block__btn" data-action="remove" title="Remove">🗑</button>'+
      '</div>'+
      '<div class="canvas-block__preview"><em style="font-size:.75rem;color:#94a3b8;padding:.5rem .75rem;display:block">'+b.type+' block</em></div>';
    wrap.querySelector('[data-action=up]').addEventListener('click',function(){moveBlock(b.id,-1);});
    wrap.querySelector('[data-action=down]').addEventListener('click',function(){moveBlock(b.id,1);});
    wrap.querySelector('[data-action=edit]').addEventListener('click',function(){selectBlock(b.id);});
    wrap.querySelector('[data-action=remove]').addEventListener('click',function(){removeBlock(b.id);});
    wrap.addEventListener('click',function(){selectBlock(b.id);});
    canvas.appendChild(wrap);
  });
}

function moveBlock(id,dir){
  var i=blocks.findIndex(function(b){return b.id===id;});
  if(i<0)return;
  var j=i+dir;
  if(j<0||j>=blocks.length)return;
  var tmp=blocks[i];blocks[i]=blocks[j];blocks[j]=tmp;
  renderCanvas();
}

function removeBlock(id){
  blocks=blocks.filter(function(b){return b.id!==id;});
  if(selectedId===id)selectedId=null;
  renderCanvas();
  renderProps(null);
}

// ── Properties panel ──────────────────────────────────────────────────────
function selectBlock(id){
  selectedId=id;
  renderCanvas();
  renderProps(id);
}

function renderProps(id){
  var panel=document.getElementById('props-content');
  if(!id){panel.innerHTML='<p style="color:#94a3b8;font-size:.8rem;text-align:center;margin:2rem 0">Click a block to edit its properties.</p>';return;}
  var b=blocks.find(function(x){return x.id===id;});
  if(!b){panel.innerHTML='';return;}
  var fields=Object.entries(b.config).map(function(entry){
    var k=entry[0];var v=entry[1];
    if(v===null||typeof v==='object')return '';
    var type=typeof v==='boolean'?'checkbox':typeof v==='number'?'number':'text';
    if(type==='checkbox'){
      return '<div class="prop-field"><label><input type="checkbox" data-key="'+k+'"'+(v?' checked':'')+' style="margin-right:.35rem">'+k+'</label></div>';
    }
    return '<div class="prop-field"><label>'+k+'</label><input type="'+type+'" data-key="'+k+'" value="'+String(v).replace(/"/g,'&quot;')+'"></div>';
  }).join('');
  panel.innerHTML=fields+'<button id="save-props">Apply Changes</button>';
  document.getElementById('save-props').addEventListener('click',function(){
    var inputs=panel.querySelectorAll('[data-key]');
    inputs.forEach(function(inp){
      var key=inp.getAttribute('data-key');
      var orig=b.config[key];
      if(inp.type==='checkbox')b.config[key]=inp.checked;
      else if(typeof orig==='number')b.config[key]=parseFloat(inp.value)||0;
      else b.config[key]=inp.value;
    });
    renderCanvas();
    toast('Block updated!');
  });
}

// ── Save page ─────────────────────────────────────────────────────────────
document.getElementById('btn-save').addEventListener('click',function(){
  var name=document.getElementById('page-name').value.trim()||'Untitled';
  var slug=document.getElementById('page-slug').value.trim()||'page';
  // First save all blocks, then create template
  var saves=blocks.map(function(b){
    return fetch('/api/blocks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)})
      .then(function(r){return r.json();})
      .then(function(saved){return saved.id;});
  });
  Promise.all(saves).then(function(ids){
    return fetch('/api/templates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,slug:slug,blockIds:ids})});
  }).then(function(r){return r.json();}).then(function(pg){
    toast('Page "'+name+'" saved! ID: '+pg.id);
  }).catch(function(){toast('Save failed – check console.');});
});

// ── Preview page ──────────────────────────────────────────────────────────
document.getElementById('btn-preview').addEventListener('click',function(){
  var slug=document.getElementById('page-slug').value.trim()||'home';
  window.open('/pages/'+slug,'_blank');
});

// ── Clear canvas ──────────────────────────────────────────────────────────
document.getElementById('btn-clear').addEventListener('click',function(){
  if(!confirm('Clear all blocks?'))return;
  blocks=[];selectedId=null;renderCanvas();renderProps(null);
});

renderCanvas();
})();
</script>
</body>
</html>`;
}
