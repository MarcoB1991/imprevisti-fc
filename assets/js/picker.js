import { hashString, mulberry32, pickWeighted } from './rng.js';

export function filterPool(data, mode, text){
  const q = (text||'').trim().toLowerCase();
  return data[mode].filter(x => q==='' || x.title.toLowerCase().includes(q) || x.tags?.some(t=>t.toLowerCase().includes(q)));
}

export function drawOne(pool, mode, seed, allowDup, currentList){
  if(pool.length===0) return null;
  const rng = seed ? mulberry32(hashString(seed + '|' + mode)) : Math.random;
  let candidate = pickWeighted(pool, typeof rng==='function'? rng : Math.random);
  if(!allowDup){
    let guard = 0;
    while(currentList.some(it=>it.id===candidate.id) && guard<50){
      candidate = pickWeighted(pool, typeof rng==='function'? rng : Math.random);
      guard++;
    }
  }
  return candidate;
}
