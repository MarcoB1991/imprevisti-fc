import { store } from './store.js';
import { filterPool, drawOne } from './picker.js';

const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];

export function bindUI(state){
  // Tabs
  $$('.tab[role="tab"]').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.tab[role="tab"]').forEach(b=>b.setAttribute('aria-selected','false'));
    btn.setAttribute('aria-selected','true');
    state.mode = btn.dataset.mode;
    renderConfig(state); renderTags(state);
    // NIENTE draw automatico: la card resta vuota finché non clicchi
  }));

  // Theme
  $('#themeToggle').addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur==='dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  // Controls
  $('#draw').addEventListener('click', ()=>draw(state));
  $('#save').addEventListener('click', ()=>{
    if(state.last){
      const list = store.loadList();
      list.unshift({...state.last, mode:state.mode});
      store.saveList(list); renderList(state);
    }
  });
  $('#reset').addEventListener('click', ()=>{ store.saveList([]); renderList(state); });
  $('#export').addEventListener('click', ()=>exportList());
  $('#import').addEventListener('click', ()=>importList(()=>renderList(state)));
  $('#howto').addEventListener('click', (e)=>{ e.preventDefault(); alert('Apri index.html in un browser o usa VS Code → Live Server. Catalogo e lista su localStorage.'); });

  // Config table
  $('#cfgAdd').addEventListener('click', ()=>{
    const id = `${state.mode}-${Date.now().toString(36)}`;
    state.data[state.mode].unshift({id,title:'Nuovo imprevisto',text:'Descrizione…',difficulty:'media',weight:1,tags:[]});
    store.saveData(state.data); renderConfig(state); renderTags(state);
  });
  $('#cfgSave').addEventListener('click', ()=>{ store.saveData(state.data); alert('Catalogo salvato.'); });
  $('#cfgReset').addEventListener('click', ()=>{
    if(confirm('Ripristinare catalogo predefinito?')){ state.resetData(); renderConfig(state); renderTags(state); /* niente draw */ }
  });
  $('#cfgExport').addEventListener('click', ()=>exportCatalog(state.data));
  $('#cfgImport').addEventListener('click', ()=>importCatalog(obj=>{
    state.data=obj; store.saveData(state.data); renderConfig(state); renderTags(state); /* niente draw */
  }));

  // Initial renders (nessuna estrazione di default)
  applyTheme(store.loadTheme() || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  renderList(state); renderConfig(state); renderTags(state);
  renderResult(null, state.mode); // mostra stato vuoto nella card corrente
}

function draw(state){
  const pool = filterPool(state.data, state.mode, $('#filter-text').value);
  const allow = $('#allow-duplicates').value==='si';
  const seed = $('#seed').value;
  const list = store.loadList();
  state.last = drawOne(pool, state.mode, seed, allow, list);
  renderResult(state.last, state.mode);
}

function renderResult(item, mode){
  const el = $('#current'); // <-- ora scriviamo nella card di destra
  if(!item){
    el.innerHTML = '<div class="muted">Nessun imprevisto ancora. Premi “Estrai Imprevisto”.</div>';
    return;
  }
  el.innerHTML = `
    <div class="stack">
      <span class="pill">${mode==='pre' ? 'Pre-partita' : 'Mercato'}</span>
      <span class="pill">Diff: ${item.difficulty||'n/d'}</span>
      ${(item.tags||[]).map(t=>`<span class="pill">#${t}</span>`).join('')}
    </div>
    <h3 style="margin:4px 0 2px">${item.title}</h3>
    <div class="muted">${item.text}</div>`;
}

function renderList(){
  const box = $('#list'); const list = store.loadList();
  if(list.length===0){ box.innerHTML = '<div class="muted">La lista è vuota.</div>'; return; }
  box.innerHTML = list.map((it,i)=>`
    <div class="item">
      <span class="pill">${it.mode==='pre' ? 'Pre' : 'Mercato'}</span>
      <div>
        <div style="font-weight:600">${it.title}</div>
        <div class="muted" style="font-size:13px">${it.text}</div>
      </div>
      <button data-i="${i}" class="danger small">Rimuovi</button>
    </div>`).join('');
  box.querySelectorAll('button.danger').forEach(btn=>btn.addEventListener('click', e=>{
    const i = +e.currentTarget.getAttribute('data-i');
    const list = store.loadList(); list.splice(i,1); store.saveList(list); renderList();
  }));
}

function renderTags(state){
  const tags = new Set(); ['pre','mercato'].forEach(m => state.data[m].forEach(x => (x.tags||[]).forEach(t=>tags.add(t))));
  $('#catalogModeLabel').textContent = (state.mode==='pre' ? 'Pre-partita' : 'Mercato');
  $('#catalog-tags').innerHTML = [...tags].sort().map(t=>`<span class="pill">#${t}</span>`).join('');
}

function renderConfig(state){
  const body = $('#cfgBody');
  body.innerHTML = state.data[state.mode].map((it,i)=>`
    <tr data-i="${i}">
      <td><input type="text" value="${it.id||''}" data-k="id" /></td>
      <td><input type="text" value="${it.title||''}" data-k="title" /></td>
      <td><input type="text" value="${it.text||''}" data-k="text" /></td>
      <td>
        <select data-k="difficulty">${['bassa','media','alta'].map(d=>`<option ${it.difficulty===d?'selected':''}>${d}</option>`).join('')}</select>
      </td>
      <td><input type="number" min="1" value="${it.weight??1}" data-k="weight" /></td>
      <td><input type="text" value="${(it.tags||[]).join(', ')}" data-k="tags" /></td>
      <td><button class="danger small" data-action="del">Elimina</button></td>
    </tr>`).join('');

  body.querySelectorAll('input,select,button').forEach(el=>{
    if(el.dataset.action==='del'){
      el.addEventListener('click', (e)=>{
        const tr = e.currentTarget.closest('tr'); const i = +tr.dataset.i;
        state.data[state.mode].splice(i,1); store.saveData(state.data); renderConfig(state); renderTags(state);
      });
    } else {
      el.addEventListener('input', (e)=>{
        const tr = e.currentTarget.closest('tr'); const i = +tr.dataset.i; const k = e.currentTarget.dataset.k; let v = e.currentTarget.value;
        if(k==='weight') v = Math.max(1, parseInt(v||'1',10));
        if(k==='tags') v = v.split(',').map(s=>s.trim()).filter(Boolean);
        state.data[state.mode][i][k] = v; store.saveData(state.data); renderTags(state);
      });
    }
  });
}

function exportList(){
  const data = JSON.stringify(store.loadList(), null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'imprevisti-lista.json'; a.click(); URL.revokeObjectURL(url);
}
function importList(cb){
  const input = document.createElement('input'); input.type='file'; input.accept='application/json';
  input.onchange=()=>{ const f=input.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{
    try{ const arr=JSON.parse(r.result); if(Array.isArray(arr)){ store.saveList(arr); cb?.(); } }catch{ alert('JSON non valido'); }
  }; r.readAsText(f); };
  input.click();
}
function exportCatalog(obj){ const data = JSON.stringify(obj, null, 2); const blob = new Blob([data], {type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='imprevisti-catalogo.json'; a.click(); URL.revokeObjectURL(url); }
function importCatalog(cb){ const i=document.createElement('input'); i.type='file'; i.accept='application/json'; i.onchange=()=>{ const f=i.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const obj=JSON.parse(r.result); if(obj && obj.pre && obj.mercato) cb(obj); else alert('Struttura non valida'); } catch{ alert('JSON non valido'); } }; r.readAsText(f); }; i.click(); }

function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); store.saveTheme(t); $('#themeToggle').setAttribute('aria-pressed', String(t==='dark')); }
