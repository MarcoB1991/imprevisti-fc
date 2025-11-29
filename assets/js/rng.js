export function hashString(str){
  let h = 2166136261; for(let i=0;i<str.length;i++) h = (h ^ str.charCodeAt(i)) * 16777619 >>> 0; return h >>> 0;
}
export function mulberry32(a){
  return function(){ let t = a += 0x6D2B79F5; t = Math.imul(t ^ t>>>15, t | 1); t ^= t + Math.imul(t ^ t>>>7, t | 61); return ((t ^ t>>>14) >>> 0) / 4294967296; };
}
export function pickWeighted(items, rng=Math.random){
  const total = items.reduce((s,x)=>s+(x.weight||1),0); let r = rng()*total;
  for(const it of items){ r -= (it.weight||1); if(r<=0) return it; }
  return items[items.length-1];
}
