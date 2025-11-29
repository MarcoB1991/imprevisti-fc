import { store } from './store.js';

const $ = (s,root=document)=>root.querySelector(s);

export function bindConfig(state){
  const modeSel = $('#cfgMode');
  const filter  = $('#cfgFilter');

  // Tema
  $('#themeToggle').addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur==='alt' ? 'dark' : 'alt';
    applyTheme(next);
  });

  // CRUD
  $('#cfgAdd').addEventListener('click', ()=>{
    const mode = modeSel.value;
    const id = `${mode}-${Date.now().toString(36)}`;
    state.data[mode].unshift({id,title:'Nuovo imprevisto',text:'Descrizione…',difficulty:'media',weight:1,tags:[]});
    store.saveData(state.data); renderTable();
  });
  $('#cfgSave').addEventListener('click', ()=>{ store.saveData(state.data); alert('Catalogo salvato.'); });
  $('#cfgReset').addEventListener('click', ()=>{
    if(confirm('Ripristinare catalogo predefinito?')){ state.resetData(); renderTable(); }
  });
  $('#cfgExport').addEventListener('click', ()=>exportCatalog(state.data));
  $('#cfgImport').addEventListener('click', ()=>importCatalog(obj=>{ state.data=obj; store.saveData(state.data); renderTable(); }));

  modeSel.addEventListener('input', renderTable);
  filter.addEventListener('input', renderTable);

  // init
  applyTheme(store.loadTheme() || 'dark');
  renderTable();

  function renderTable(){
    const body = $('#cfgBody');
    const mode = modeSel.value;
    const q = filter.value.trim().toLowerCase();
    const rows = state.data[mode]
      .filter(x => !q || x.title.toLowerCase().includes(q) || (x.tags||[]).some(t=>t.toLowerCase().includes(q)))
      .map((it,i)=>row(it,i,mode)).join('');
    body.innerHTML = rows;

    body.querySelectorAll('button[data-action="del"]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const tr = e.currentTarget.closest('tr'); const i = +tr.dataset.i;
        state.data[mode].splice(i,1); store.saveData(state.data); renderTable();
      });
    });
    body.querySelectorAll('input,select').forEach(el=>{
      el.addEventListener('input', e=>{
        const tr = e.currentTarget.closest('tr'); const i = +tr.dataset.i; const k = e.currentTarget.dataset.k; let v = e.currentTarget.value;
        if(k==='weight') v = Math.max(1, parseInt(v||'1',10));
        if(k==='tags')   v = v.split(',').map(s=>s.trim()).filter(Boolean);
        state.data[mode][i][k] = v; store.saveData(state.data);
      });
    });
  }
}

function row(item, index, mode){
  return `<tr data-i="${index}">
    <td><input type="text" value="${item.id||''}" data-k="id" /></td>
    <td><input type="text" value="${item.title||''}" data-k="title" /></td>
    <td><input type="text" value="${item.text||''}" data-k="text" /></td>
    <td>
      <select data-k="difficulty">${['bassa','media','alta'].map(d=>`<option ${item.difficulty===d?'selected':''}>${d}</option>`).join('')}</select>
    </td>
    <td><input type="number" min="1" value="${item.weight??1}" data-k="weight" /></td>
    <td><input type="text" value="${(item.tags||[]).join(', ')}" data-k="tags" /></td>
    <td><button class="danger small" data-action="del">Elimina</button></td>
  </tr>`;
}

function exportCatalog(obj){
  const data = JSON.stringify(obj, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download='imprevisti-catalogo.json'; a.click(); URL.revokeObjectURL(url);
}
function importCatalog(cb){
  const i=document.createElement('input'); i.type='file'; i.accept='application/json';
  i.onchange=()=>{ const f=i.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{
    try{ const obj=JSON.parse(r.result); if(obj && obj.pre && obj.mercato) cb(obj); else alert('Struttura non valida'); }
    catch{ alert('JSON non valido'); }
  }; r.readAsText(f); };
  i.click();
}

function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); store.saveTheme(t); document.getElementById('themeToggle').setAttribute('aria-pressed', String(t==='alt')); }
