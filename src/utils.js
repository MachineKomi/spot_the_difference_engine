export function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

export function uid(prefix="lvl"){
  const r = Math.random().toString(16).slice(2);
  const t = Date.now().toString(16);
  return `${prefix}_${t}_${r}`;
}

export function safeJsonParse(str, fallback){
  try { return JSON.parse(str); } catch { return fallback; }
}

export function downloadText(filename, text, type="application/json"){
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 250);
}

export function pretty(obj){
  return JSON.stringify(obj, null, 2);
}

export function lerp(a,b,t){ return a + (b-a)*t; }

export function rectContains(rect, x, y){
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function fitRect(containerW, containerH, contentW, contentH){
  // contain fit
  const scale = Math.min(containerW / contentW, containerH / contentH);
  const w = contentW * scale;
  const h = contentH * scale;
  const x = (containerW - w) / 2;
  const y = (containerH - h) / 2;
  return { x, y, w, h, scale };
}

export function nowMs(){ return performance?.now ? performance.now() : Date.now(); }
