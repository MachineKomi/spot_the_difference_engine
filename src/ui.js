import { nowMs, clamp } from "./utils.js";

let toastWrap = null;

export function ensureToasts(){
  if(toastWrap) return toastWrap;
  toastWrap = document.createElement("div");
  toastWrap.className = "toastwrap";
  document.body.appendChild(toastWrap);
  return toastWrap;
}

export function toast(message, kind="info", ms=1800){
  ensureToasts();
  const el = document.createElement("div");
  el.className = "toast";
  const dot = document.createElement("div");
  dot.style.width = "10px";
  dot.style.height = "10px";
  dot.style.borderRadius = "999px";
  dot.style.background = kind === "good" ? "rgba(56,211,159,0.9)" :
                        kind === "bad" ? "rgba(255,77,109,0.9)" :
                        kind === "warn" ? "rgba(255,209,102,0.9)" :
                        "rgba(124,92,255,0.9)";
  el.appendChild(dot);
  const txt = document.createElement("div");
  txt.textContent = message;
  el.appendChild(txt);
  toastWrap.appendChild(el);
  setTimeout(()=>{ el.style.opacity = "0"; el.style.transition = "opacity 250ms ease"; }, ms);
  setTimeout(()=>{ el.remove(); }, ms + 320);
}

export function setSubtitle(text){
  const el = document.getElementById("subtitle");
  if(el) el.textContent = text;
}

export function setActiveNav(route){
  const ids = ["nav-play","nav-builder","nav-about"];
  for(const id of ids){
    const a = document.getElementById(id);
    if(!a) continue;
    a.classList.toggle("active", a.getAttribute("href") === route);
  }
}

// WebAudio sfx, no assets
let audioCtx = null;

export function playSfx(name="tap", enabled=true){
  if(!enabled) return;
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const t0 = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const settings = sfxPreset(name);
  osc.type = settings.type;
  osc.frequency.setValueAtTime(settings.f0, t0);
  if(settings.f1 != null){
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, settings.f1), t0 + settings.dur);
  }
  gain.gain.setValueAtTime(settings.g0, t0);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, settings.g1), t0 + settings.dur);

  osc.start(t0);
  osc.stop(t0 + settings.dur);
}

function sfxPreset(name){
  switch(name){
    case "correct": return { type:"triangle", f0: 740, f1: 1100, g0: 0.10, g1: 0.0001, dur: 0.14 };
    case "wrong":   return { type:"sawtooth", f0: 260, f1: 120, g0: 0.08, g1: 0.0001, dur: 0.22 };
    case "levelup": return { type:"square", f0: 520, f1: 1040, g0: 0.10, g1: 0.0001, dur: 0.28 };
    default:        return { type:"sine", f0: 520, f1: 600, g0: 0.06, g1: 0.0001, dur: 0.10 };
  }
}

// Confetti FX canvas
const fx = () => document.getElementById("fx");

let particles = [];
let animId = null;

export function confettiBurst(count=120){
  const canvas = fx();
  if(!canvas) return;
  resizeFx();

  const w = canvas.width;
  const h = canvas.height;

  const cx = w * 0.5;
  const cy = h * 0.22;

  const t = nowMs();
  for(let i=0;i<count;i++){
    const a = Math.random() * Math.PI * 2;
    const s = 2 + Math.random() * 6;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(a) * (2 + Math.random() * 7),
      vy: Math.sin(a) * (2 + Math.random() * 7) - 3,
      g: 0.10 + Math.random() * 0.16,
      size: s,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      maxLife: 1200 + Math.random() * 1200,
      hue: Math.floor(Math.random()*360),
      born: t
    });
  }
  startAnim();
}

export function resizeFx(){
  const canvas = fx();
  if(!canvas) return;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
}

function startAnim(){
  if(animId) return;
  const canvas = fx();
  const ctx = canvas.getContext("2d");
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  const tick = () => {
    animId = requestAnimationFrame(tick);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const t = nowMs();
    particles = particles.filter(p => (t - p.born) < p.maxLife);

    for(const p of particles){
      const dt = 16.7;
      p.vy += p.g * (dt/16.7);
      p.x += p.vx * (dt/16.7) * dpr;
      p.y += p.vy * (dt/16.7) * dpr;
      p.rot += p.vr * (dt/16.7);

      const age = t - p.born;
      const alpha = clamp(1 - age / p.maxLife, 0, 1);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha})`;
      ctx.fillRect(-p.size*dpr, -p.size*dpr, p.size*2*dpr, p.size*1.4*dpr);
      ctx.restore();
    }

    if(particles.length === 0){
      cancelAnimationFrame(animId);
      animId = null;
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  };
  tick();
}

window.addEventListener("resize", ()=> resizeFx());
