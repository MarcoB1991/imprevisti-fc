import { DEFAULT_DATA } from './data.js';
import { store } from './store.js';
import { hashString, mulberry32, pickWeighted } from './rng.js';

// --- Liste per i nuovi estrattori ---
const ROLES = [
  "POR Portiere","TD Terzino destro","TS Terzino sinistro",
  "DC Difensore centrale","CC Centrocampista centrale o Mezz'ala sinistra",
  "CC Centrocampista centrale o Mezz'ala destra","MED Mediano","TQ Trequartista","ED Esterno destro",
  "ES Esterno sinistro","AD Ala Destra","AS Ala Sinistra","ATT Attaccante"
];

const NATIONS = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla",
  "Antigua e Barbuda","Argentina","Armenia","Aruba","Australia","Austria",
  "Azerbaigian","Bahamas","Bahrein","Bangladesh","Barbados","Bielorussia",
  "Belgio","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia ed Erzegovina",
  "Botswana","Brasile","Isole Vergini Britanniche","Bulgaria","Burkina Faso","Burundi",
  "Capo Verde","Cambogia","Camerun","Canada","Isole Cayman","Repubblica Centrafricana",
  "Ciad","Cile","Cina","Cina Taipei","Colombia","Comore","Congo",
  "Repubblica Democratica del Congo","Isole Cook","Costa Rica","Costa d’Avorio",
  "Croazia","Cuba","Curaçao","Cipro","Cechia",
  "Danimarca","Gibuti","Dominica","Repubblica Dominicana","Ecuador",
  "Egitto","El Salvador","Inghilterra","Guinea Equatoriale","Eritrea",
  "Estonia","Eswatini","Etiopia","Isole Faroe","Figi","Finlandia","Francia",
  "Gabon","Gambia","Georgia","Germania","Ghana","Gibilterra","Grecia",
  "Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras",
  "Hong Kong","Ungheria","Islanda","India","Indonesia","Iran","Iraq","Irlanda",
  "Israele","Italia","Giamaica","Giappone","Giordania","Kazakistan","Kenya",
  "Corea del Nord","Corea del Sud","Kuwait","Kirghizistan","Laos","Lettonia",
  "Libano","Lesotho","Liberia","Libia","Liechtenstein","Lituania","Lussemburgo",
  "Macao","Madagascar","Malawi","Malaysia","Maldive","Mali","Malta",
  "Mauritania","Mauritius","Messico","Moldavia","Mongolia","Montenegro",
  "Marocco","Mozambico","Myanmar","Namibia","Nepal","Paesi Bassi",
  "Nuova Caledonia","Nuova Zelanda","Nicaragua","Niger","Nigeria","Macedonia del Nord",
  "Irlanda del Nord","Norvegia","Oman","Pakistan","Palestina","Panamá",
  "Papua Nuova Guinea","Paraguay","Perù","Filippine","Polonia","Portogallo",
  "Porto Rico","Qatar","Romania","Russia","Ruanda","Saint Kitts e Nevis",
  "Saint Lucia","Saint Vincent e Grenadine","Samoa","San Marino",
  "São Tomé e Príncipe","Arabia Saudita","Scozia","Senegal","Serbia","Seychelles",
  "Sierra Leone","Singapore","Sint Maarten","Slovacchia","Slovenia","Isole Salomone",
  "Somalia","Sudafrica","Sudan del Sud","Spagna","Sri Lanka","Sudan",
  "Suriname","Svezia","Svizzera","Siria","Tahiti","Tagikistan",
  "Tanzania","Thailandia","Timor Est","Togo","Tonga","Trinidad e Tobago",
  "Tunisia","Turchia","Turkmenistan","Isole Turks e Caicos","Uganda",
  "Ucraina","Emirati Arabi Uniti","Stati Uniti","Uruguay","Isole Vergini Americane",
  "Uzbekistan","Vanuatu","Venezuela","Vietnam","Galles","Yemen","Zambia","Zimbabwe"
];

// utility semplice
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ------- helpers DOM
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>[...r.querySelectorAll(s)];

// ------- stato
const MODE_KEY = 'imprevisti-mode';
const state = {
  mode: localStorage.getItem(MODE_KEY) || 'pre',
  data: store.loadData(DEFAULT_DATA),
  last: null
};

// ------- utilità (senza TAGS)
function filterPool(text){
  const q = (text||'').trim().toLowerCase();
  return state.data[state.mode].filter(x =>
    q==='' || x.title.toLowerCase().includes(q)
  );
}
function drawOne(pool, seed, allowDup, currentList){
  if(pool.length===0) return null;
  const rng = seed ? mulberry32(hashString(seed + '|' + state.mode)) : Math.random;
  let cand = pickWeighted(pool, typeof rng==='function'? rng : Math.random);
  if(!allowDup){
    let guard = 0;
    while(currentList.some(it=>it.id===cand.id) && guard<50){
      cand = pickWeighted(pool, typeof rng==='function'? rng : Math.random);
      guard++;
    }
  }
  return cand;
}

// ------- render (senza TAGS)
function renderTabs(){
  const isPre = state.mode === 'pre';
  $('#tab-pre')?.setAttribute('aria-selected', String(isPre));
  $('#tab-mercato')?.setAttribute('aria-selected', String(!isPre));
}
function renderCurrent(){
  const el = $('#current');
  const it = state.last;
  if(!it){
    el.innerHTML = `<div class="muted" style="min-height:120px;display:flex;align-items:center">
      Nessun imprevisto ancora. Premi “Estrai Imprevisto”.
    </div>`;
    return;
  }
  el.innerHTML = `
    <div class="stack">
      <span class="pill">${state.mode==='pre' ? 'Pre-partita' : 'Mercato'}</span>
      <span class="pill">Diff: ${it.difficulty||'n/d'}</span>
    </div>
    <h3 style="margin:6px 0 4px">${it.title}</h3>
    <div class="muted">${it.text}</div>
  `;
}
function renderList(){
  const box = $('#list');
  const list = store.loadList();
  if(list.length===0){ box.innerHTML = '<div class="muted">La lista è vuota.</div>'; return; }
  box.innerHTML = list.map((it,i)=>`
    <div class="item">
      <span class="pill">${it.mode==='pre' ? 'Pre' : 'Mercato'}</span>
      <div>
        <div style="font-weight:600">${it.title}</div>
        <div class="muted" style="font-size:13px">${it.text}</div>
      </div>
      <button data-i="${i}" class="danger small">Rimuovi</button>
    </div>
  `).join('');
  box.querySelectorAll('button.danger').forEach(btn=>btn.addEventListener('click', e=>{
    const i = +e.currentTarget.getAttribute('data-i');
    const list = store.loadList(); list.splice(i,1); store.saveList(list); renderList();
  }));
}

// ------- azioni UI
function selectMode(newMode){
  state.mode = newMode;
  localStorage.setItem(MODE_KEY, state.mode);
  renderTabs();
  renderCurrent();
}
function draw(){
  const pool = filterPool($('#filter-text')?.value);
  const allowDup = ($('#allow-duplicates')?.value || 'si') === 'si';
  const seed = $('#seed')?.value || '';
  const list = store.loadList();
  state.last = drawOne(pool, seed, allowDup, list);
  renderCurrent();
}

// ------- bind
function bind(){
    // --- Menu hamburger (index.html) ---
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.querySelector('.nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Chiudi il menu dopo aver cliccato un link / tab
    navMenu.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Tabs (se presenti in index con questi id)
  $('#tab-pre')?.addEventListener('click', ()=>selectMode('pre'));
  $('#tab-mercato')?.addEventListener('click', ()=>selectMode('mercato'));

  // Theme
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

  // Controls
  $('#draw')?.addEventListener('click', draw);
  $('#save')?.addEventListener('click', ()=>{
    if(state.last){
      const list = store.loadList(); list.unshift({...state.last, mode:state.mode});
      store.saveList(list); renderList();
    }
  });
  $('#reset')?.addEventListener('click', ()=>{ store.saveList([]); renderList(); });
  $('#export')?.addEventListener('click', ()=>{
    const data = JSON.stringify(store.loadList(), null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href=url; a.download='imprevisti-lista.json'; a.click(); URL.revokeObjectURL(url);
  });
  $('#import')?.addEventListener('click', ()=>{
    const i = document.createElement('input'); i.type='file'; i.accept='application/json';
    i.onchange=()=>{ const f=i.files?.[0]; if(!f) return; const r=new FileReader();
      r.onload=()=>{ try{ const arr=JSON.parse(r.result); if(Array.isArray(arr)){ store.saveList(arr); renderList(); } }
                     catch{ alert('JSON non valido'); } };
      r.readAsText(f);
    };
    i.click();
  });

  // --- Estrazione ruolo giocatore ---
  const btnRole = document.getElementById('draw-role');
  const roleBox = document.getElementById('role-result');
  if (btnRole && roleBox) {
    btnRole.addEventListener('click', () => {
      const value = pick(ROLES);
      roleBox.innerHTML = `
        <div class="stack"><span class="pill">Ruolo</span></div>
        <h3 style="margin:4px 0 2px">${value}</h3>
        <div class="muted">Estrazione casuale dalla lista ruoli.</div>
      `;
    });
  }

  // --- Estrazione nazione ---
  const btnNation = document.getElementById('draw-nation');
  const nationBox = document.getElementById('nation-result');
  if (btnNation && nationBox) {
    btnNation.addEventListener('click', () => {
      const value = pick(NATIONS);
      nationBox.innerHTML = `
        <div class="stack"><span class="pill">Nazione</span></div>
        <h3 style="margin:4px 0 2px">${value}</h3>
        <div class="muted">Estrazione casuale dalla lista Nazioni.</div>
      `;
    });
  }

  $('#howto')?.addEventListener('click', (e)=>{ e.preventDefault(); alert('Apri index.html o usa Live Server.'); });

  // prime render
  renderTabs();
  renderCurrent();  // placeholder iniziale, nessuna estrazione
  renderList();
}
bind();

// Registrazione del Service Worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .catch((err) => console.error('SW registration failed', err));
  });
}
