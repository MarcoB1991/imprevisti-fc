const STORAGE_LIST = 'imprevisti-fc26-lista';
const STORAGE_DATA = 'imprevisti-fc26-data';
const THEME_KEY = 'imprevisti-theme';

export const store = {
  loadList(){ try{ return JSON.parse(localStorage.getItem(STORAGE_LIST)) || []; } catch{ return []; } },
  saveList(list){ localStorage.setItem(STORAGE_LIST, JSON.stringify(list)); },
  loadData(defaults){ try{ const d = JSON.parse(localStorage.getItem(STORAGE_DATA)); if(d && d.pre && d.mercato) return d; }catch{} return structuredClone(defaults); },
  saveData(data){ localStorage.setItem(STORAGE_DATA, JSON.stringify(data)); },
  loadTheme(){ return localStorage.getItem(THEME_KEY); },
  saveTheme(t){ localStorage.setItem(THEME_KEY,t); }
};
