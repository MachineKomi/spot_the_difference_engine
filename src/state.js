import { safeJsonParse, clamp } from "./utils.js";

const KEY = "std_progress_v1";

const DEFAULT = {
  xp: 0,
  level: 1,
  solvedLevelIds: [],
  sfx: true,
  lastPlayedLevelId: null
};

export function loadProgress(){
  const raw = localStorage.getItem(KEY);
  const data = safeJsonParse(raw, null);
  if(!data) return structuredClone(DEFAULT);
  data.xp = Number.isFinite(data.xp) ? Math.max(0, data.xp) : 0;
  data.level = Number.isFinite(data.level) ? Math.max(1, data.level) : 1;
  data.solvedLevelIds = Array.isArray(data.solvedLevelIds) ? data.solvedLevelIds : [];
  data.sfx = typeof data.sfx === "boolean" ? data.sfx : true;
  data.lastPlayedLevelId = typeof data.lastPlayedLevelId === "string" ? data.lastPlayedLevelId : null;
  return data;
}

export function saveProgress(p){
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function xpForNextLevel(level){
  return Math.floor(50 + (level-1) * 20 + Math.pow(level-1, 1.35) * 10);
}

export function grantXp(progress, amount){
  const p = progress;
  let leveledUp = false;
  p.xp += Math.max(0, Math.floor(amount));
  while(p.xp >= xpForNextLevel(p.level)){
    p.xp -= xpForNextLevel(p.level);
    p.level += 1;
    leveledUp = true;
  }
  saveProgress(p);
  return { progress: p, leveledUp };
}

export function markSolved(progress, levelId){
  if(!progress.solvedLevelIds.includes(levelId)){
    progress.solvedLevelIds.push(levelId);
  }
  progress.lastPlayedLevelId = levelId;
  saveProgress(progress);
}

export function setSfx(progress, enabled){
  progress.sfx = !!enabled;
  saveProgress(progress);
}

export function resetProgress(){
  localStorage.removeItem(KEY);
}

export function progressSummary(progress){
  const need = xpForNextLevel(progress.level);
  const pct = clamp((progress.xp / need) * 100, 0, 100);
  return { need, pct };
}
