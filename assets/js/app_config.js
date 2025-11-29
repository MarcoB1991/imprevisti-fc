import { DEFAULT_DATA } from './data.js';
import { store } from './store.js';

const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>[...r.querySelectorAll(s)];

const state = {
  mode: 'pre',
  data: store.loadData(DEFAULT_DATA)
};

function syncUI(){
  $$('.tab[role="tab"]').forEach(b=>b.setAttribute('aria-selected','false'));
  $(`.tab[role="tab"][data-mode="${state.mode}"]`)?.setAttribute('aria-selected','true');
  $('#cfgMode').value = state.mode;
}

function rowTemplate(it,i){
  return `<tr data-i="${i}">
    <td><input type="text" value="${it.id||''}" data-k="id" /></td>
    <td><input type="text" value="${it.title||''}" data-k="title" /></td>
    <td><input type="text" value="${it.text||''}" data-k="text" /></td>
    <td>
      <select data-k="difficulty">
        ${['bassa','media','alta'].map(d=>`<option ${it.difficulty===d?'selected':''}>${d}</option>`).join('')}
      </select>
    </td>
    <td><input type="number" min="1" value="${it.weight??1}" data-k="weight" /></td>
    <td><button class="danger small" data-action="del">Elimina</button></td>
  </tr>`;
}

function renderTable(){
  const q = ($('#cfgFilter')?.value || '').trim().toLowerCase();
  const rows = state.data[state.mode].filter(x =>
    q==='' || x.title.toLowerCase().includes(q)
  );
  const body = $('#cfgBody');
  body.innerHTML = rows.map((it,i)=>rowTemplate(it,i)).join('');

  body.querySelectorAll('input,select,button').forEach(el=>{
    if(el.dataset.action==='del'){
      el.addEventListener('click', (e)=>{
        const tr = e.currentTarget.closest('tr');
        const idx = +tr.dataset.i;
        const full = state.data[state.mode];
        const current = full.filter(x => q==='' || x.title.toLowerCase().includes(q));
        const item = current[idx];
        const realIndex = full.findIndex(x=>x.id===item.id);
        state.data[state.mode].splice(realIndex,1);
        store.saveData(state.data);
        renderTable();
      });
    } else {
      el.addEventListener('input', (e)=>{
        const tr = e.currentTarget.closest('tr');
        const idx = +tr.dataset.i;
        const k = e.currentTarget.dataset.k;
        let v = e.currentTarget.value;
        const full = state.data[state.mode];
        const current = full.filter(x => q==='' || x.title.toLowerCase().includes(q));
        const item = current[idx];
        const realIndex = full.findIndex(x=>x.id===item.id);
        if(k==='weight') v = Math.max(1, parseInt(v||'1',10));
        state.data[state.mode][realIndex][k] = v;
        store.saveData(state.data);
      });
    }
  });
}

function addItem(){
  const id = `${state.mode}-${Date.now().toString(36)}`;
  // niente proprietà tags
  state.data[state.mode].unshift({id, title:'Nuovo imprevisto', text:'Descrizione…', difficulty:'media', weight:1});
  store.saveData(state.data);
  renderTable();
}

function bind(){
    // --- Menu hamburger (config.html) ---
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.querySelector('.nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navMenu.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Tab switching
  $$('.tab[role="tab"]').forEach(btn=>btn.addEventListener('click', ()=>{
    state.mode = btn.dataset.mode;
    syncUI(); renderTable();
  }));
  // Select switching
  $('#cfgMode')?.addEventListener('change', (e)=>{
    state.mode = e.target.value;
    syncUI(); renderTable();
  });

  // Actions
  $('#cfgAdd')?.addEventListener('click', addItem);
  $('#cfgSave')?.addEventListener('click', ()=>{ store.saveData(state.data); alert('Catalogo salvato.'); });
  $('#cfgReset')?.addEventListener('click', ()=>{
    if(confirm('Ripristinare il catalogo predefinito?')){
      state.data = structuredClone(DEFAULT_DATA);
      store.saveData(state.data);
      renderTable();
    }
  });
  $('#cfgExport')?.addEventListener('click', ()=>{
    const data = JSON.stringify(state.data, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'imprevisti-catalogo.json'; a.click(); URL.revokeObjectURL(url);
  });
  $('#cfgImport')?.addEventListener('click', ()=>{
    const i = document.createElement('input'); i.type='file'; i.accept='application/json';
    i.onchange=()=>{ const f=i.files?.[0]; if(!f) return; const r=new FileReader();
      r.onload=()=>{ try{ const obj=JSON.parse(r.result);
        if(obj && obj.pre && obj.mercato){ state.data=obj; store.saveData(state.data); renderTable(); }
        else alert('Struttura non valida');
      } catch{ alert('JSON non valido'); } };
      r.readAsText(f);
    };
    i.click();
  });

  // Tema
  $('#themeToggle')?.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur==='dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    store.saveTheme(next);
    $('#themeToggle').setAttribute('aria-pressed', String(next==='dark'));
  });
  const t = store.loadTheme() || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', t);
  $('#themeToggle')?.setAttribute('aria-pressed', String(t==='dark'));

  // start
  syncUI();
  renderTable();
}
bind();
