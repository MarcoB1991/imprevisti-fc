import { store } from './store.js';
import { filterPool, drawOne } from './picker.js';

const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];

export function bindHome(state){
  // Tabs
  $$('.tab[role="tab"]').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.tab[role="tab"]').forEach(b=>b.setAttribute('aria-selected','false'));
    btn.setAttribute('aria-selected','true');
    state.mode = btn.dataset.mode;
    // non estraiamo; aggiorniamo solo tags se serve in futuro
  }));

  // Theme toggle (tema “alt”)
  $('#themeToggle').addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur==='alt' ? 'dark' : 'alt';
    applyTheme(next);
  });

  // Controls
  $('#draw').addEventListener('click', ()=>draw(state));
  $('#save').addEventListener('click', ()=>{ if(state.last){ const list = store.loadList(); list.unshift({...state.last, mode:state.mode}); store.saveList(list); renderList(); } });
  $('#reset').addEventListener('click', ()=>{ store.saveList([]); renderList(); });
  $('#export').addEventListener('click', exportList);
  $('#import').addEventListener('click', ()=>importList(renderList));
  $('#howto').addEventListener('click', (e)=>{ e.preventDefault(); alert('Apri index.html con Live Server oppure direttamente. Dati su localStorage.'); });

  // Init: nessuna estrazione automatica
  applyTheme(store.loadTheme() || 'dark');
  renderList();
  renderEmpty();
}

function draw(state){
  const pool = filterPool(state.data, state.mode, $('#filter-text').value);
  const allow = $('#allow-duplicates').value==='si';
  const seed  = $('#seed').value;
  const list  = store.loadList();
  state.last  = drawOne(pool, state.mode, seed, allow, list);
  renderResult(state.last, state.mode);
}

function renderEmpty(){
  const el = $('#result');
  el.innerHTML = `
    <img class="current-card__logo" src="assets/img/logo.svg" alt="Logo">
    <div class="current-card__content">
      <div class="muted">Nessun imprevisto ancora. Clicca “Estrai Imprevisto”.</div>
    </div>`;
}

function renderResult(item, mode){
  const el = $('#result');
  if(!item){ renderEmpty(); return; }
  el.innerHTML = `
    <img class="current-card__logo" src="assets/img/logo.svg" alt="Logo">
    <div class="current-card__content">
      <div class="current-card__meta">
        <span class="pill">${mode==='pre' ? 'Pre-partita' : 'Mercato'}</span>
        <span class="pill">Diff: ${item.difficulty||'n/d'}</span>
        ${(item.tags||[]).map(t=>`<span class="pill">#${t}</span>`).join('')}
      </div>
      <div class="current-card__title">${item.title}</div>
      <div class="muted">${item.text}</div>
    </div>`;
}

function renderList(){
  const box = $('#list'); const list = store.loadList();
  if(list.length===0){ box.innerHTML = '<div class="muted">La lista è vuota.</div>'; return; }
  box.innerHTML = list.map((it,i)=>`
    <div class="item">
      <span class="pill">${it.mode==='pre' ? 'Pre' : 'Mercato'}</span>
      <div>
        <div style="font-weight:700">${it.title}</div>
        <div class="muted" style="font-size:13px">${it.text}</div>
      </div>
      <button data-i="${i}" class="danger small">Rimuovi</button>
    </div>`).join('');
  box.querySelectorAll('button.danger').forEach(btn=>btn.addEventListener('click', e=>{
    const i = +e.currentTarget.getAttribute('data-i');
    const list = store.loadList(); list.splice(i,1); store.saveList(list); renderList();
  }));
}

function exportList(){
  const data = JSON.stringify(store.loadList(), null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'imprevisti-lista.json'; a.click(); URL.revokeObjectURL(url);
}
function importList(cb){
  const i=document.createElement('input'); i.type='file'; i.accept='application/json';
  i.onchange=()=>{ const f=i.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{
    try{ const arr=JSON.parse(r.result); if(Array.isArray(arr)){ store.saveList(arr); cb?.(); } }catch{ alert('JSON non valido'); }
  }; r.readAsText(f); }; i.click();
}

function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); store.saveTheme(t); $('#themeToggle').setAttribute('aria-pressed', String(t==='alt')); }
