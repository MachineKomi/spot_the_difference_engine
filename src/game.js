import { rectContains, fitRect } from "./utils.js";
import { toast, confettiBurst, playSfx } from "./ui.js";
import { loadProgress, grantXp, markSolved, progressSummary, setSfx } from "./state.js";

function imgEl(src){
  const img = document.createElement("img");
  img.alt = "";
  img.src = src;
  img.draggable = false;
  img.loading = "eager";
  return img;
}

async function loadImage(levelImage){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = levelImage.type === "data" ? levelImage.dataUrl : levelImage.path;
  });
}

export function renderPlay(root, { levels, getUserLevels, setUserLevels }){
  root.innerHTML = "";
  const progress = loadProgress();
  const sum = progressSummary(progress);

  const header = document.createElement("div");
  header.className = "card pad vstack";
  header.innerHTML = `
    <div class="hstack" style="justify-content:space-between; gap:12px;">
      <div class="vstack" style="gap:4px;">
        <div class="big">Play</div>
        <div class="kicker">Tap the difference in either picture. Generous hitboxes keep it fun.</div>
      </div>
      <div class="hstack">
        <div class="pill"><span class="badge">Level ${progress.level}</span><span class="muted">XP ${progress.xp}/${sum.need}</span></div>
        <button class="btn small" id="btn-sfx" title="Toggle sound effects">${progress.sfx ? "SFX: On" : "SFX: Off"}</button>
        <button class="btn small" id="btn-reset" title="Reset progress">Reset</button>
      </div>
    </div>
    <div class="progressbar" aria-label="XP progress"><div id="xpbar"></div></div>
  `;
  root.appendChild(header);

  const xpbar = header.querySelector("#xpbar");
  xpbar.style.width = `${sum.pct}%`;

  header.querySelector("#btn-reset").addEventListener("click", () => {
    if(confirm("Reset your level and solved progress?")){
      localStorage.removeItem("std_progress_v1");
      location.reload();
    }
  });

  header.querySelector("#btn-sfx").addEventListener("click", (e) => {
    const p = loadProgress();
    setSfx(p, !p.sfx);
    e.currentTarget.textContent = p.sfx ? "SFX: On" : "SFX: Off";
    toast(p.sfx ? "Sound effects on" : "Sound effects off", "info");
  });

  const panel = document.createElement("div");
  panel.className = "grid two";
  root.appendChild(panel);

  const left = document.createElement("div");
  left.className = "card pad vstack";
  panel.appendChild(left);

  const right = document.createElement("div");
  right.className = "card pad vstack";
  panel.appendChild(right);

  const allLevels = [...levels, ...(getUserLevels?.() || [])];

  const list = document.createElement("div");
  list.className = "vstack";
  left.appendChild(list);

  const solvedSet = new Set(loadProgress().solvedLevelIds || []);

  const listHeader = document.createElement("div");
  listHeader.className = "hstack";
  listHeader.style.justifyContent = "space-between";
  listHeader.innerHTML = `
    <div class="hstack" style="gap:10px; align-items:baseline;">
      <div style="font-weight:900;">Levels</div>
      <div class="muted" style="font-size:12px;">${allLevels.length} available</div>
    </div>
    <button class="btn small" id="btn-import">Import JSON</button>
  `;
  list.appendChild(listHeader);

  const inputImport = document.createElement("input");
  inputImport.type = "file";
  inputImport.accept = "application/json";
  inputImport.style.display = "none";
  left.appendChild(inputImport);

  listHeader.querySelector("#btn-import").addEventListener("click", ()=> inputImport.click());
  inputImport.addEventListener("change", async () => {
    const f = inputImport.files?.[0];
    if(!f) return;
    try{
      const txt = await f.text();
      const obj = JSON.parse(txt);
      const arr = Array.isArray(obj) ? obj : [obj];
      const current = getUserLevels();
      setUserLevels([...current, ...arr]);
      toast("Imported level JSON", "good");
      renderPlay(root, { levels, getUserLevels, setUserLevels });
    }catch{
      toast("Could not import JSON", "bad");
    }finally{
      inputImport.value = "";
    }
  });

  const levelList = document.createElement("div");
  levelList.className = "vstack";
  list.appendChild(levelList);

  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = "Tip: If a level uses file paths, ensure the images exist in /assets and paths are correct.";
  list.appendChild(hint);

  let selected = null;

  function levelRow(lvl){
    const row = document.createElement("button");
    row.className = "btn";
    row.style.justifyContent = "space-between";
    row.style.width = "100%";
    row.style.borderRadius = "16px";
    row.style.padding = "12px 14px";
    row.style.background = "rgba(255,255,255,0.06)";
    row.style.borderColor = "rgba(255,255,255,0.14)";
    row.style.textAlign = "left";
    row.innerHTML = `
      <div class="vstack" style="gap:2px;">
        <div style="font-weight:900; display:flex; gap:10px; align-items:center;">
          <span>${lvl.name || lvl.id}</span>
          ${solvedSet.has(lvl.id) ? `<span class="badge" style="background: rgba(56,211,159,0.22); border-color: rgba(56,211,159,0.35);">Solved</span>` : ``}
        </div>
        <div class="muted" style="font-size:12px;">Difficulty ${lvl.difficulty ?? 1} - Reward ${lvl.rewards?.xp ?? 25} XP</div>
      </div>
      <div class="badge">Play</div>
    `;
    row.addEventListener("click", () => {
      selected = lvl;
      renderLevel(selected);
      playSfx("tap", loadProgress().sfx);
    });
    return row;
  }

  for(const lvl of allLevels){
    levelList.appendChild(levelRow(lvl));
  }

  right.innerHTML = `
    <div class="vstack">
      <div class="big">Choose a level</div>
      <div class="kicker">Your job: tap where the pictures are different. You can click either image.</div>
      <hr class="sep"/>
      <div class="smallnote">Want to create your own? Use Builder in the top navigation.</div>
    </div>
  `;

  async function renderLevel(level){
    right.innerHTML = "";
    if(!level) return;

    const prog = loadProgress();
    const solved = new Set(prog.solvedLevelIds || []);

    const top = document.createElement("div");
    top.className = "vstack";
    top.innerHTML = `
      <div class="hstack" style="justify-content:space-between; align-items:flex-start;">
        <div class="vstack" style="gap:4px;">
          <div class="big">${level.name || level.id}</div>
          <div class="kicker">Click the difference. If you miss, try again.</div>
        </div>
        <div class="hstack">
          <button class="btn small" id="btn-hint">Hint</button>
          <button class="btn small" id="btn-skip">Next</button>
        </div>
      </div>
    `;
    right.appendChild(top);

    const stage = document.createElement("div");
    stage.className = "stage vstack";
    right.appendChild(stage);

    const imgGrid = document.createElement("div");
    imgGrid.className = "imggrid";
    stage.appendChild(imgGrid);

    const leftCard = document.createElement("div");
    leftCard.className = "imgcard";
    leftCard.innerHTML = `<div class="imglabel">Original</div>`;
    const rightCard = document.createElement("div");
    rightCard.className = "imgcard";
    rightCard.innerHTML = `<div class="imglabel">Edited</div>`;

    imgGrid.appendChild(leftCard);
    imgGrid.appendChild(rightCard);

    const status = document.createElement("div");
    status.className = "hstack";
    status.style.justifyContent = "space-between";
    status.innerHTML = `
      <div class="pill"><span class="badge">${solved.has(level.id) ? "Solved" : "Unsolved"}</span><span class="muted">Hitboxes: ${(level.hitboxes||[]).length}</span></div>
      <div class="muted" style="font-size:12px;">Click inside the hidden rectangle(s) to win.</div>
    `;
    stage.appendChild(status);

    let origImg, editedImg;
    try{
      [origImg, editedImg] = await Promise.all([loadImage(level.original), loadImage(level.edited)]);
    }catch{
      toast("Could not load images for this level", "bad");
      right.appendChild(document.createElement("hr")).className = "sep";
      const help = document.createElement("div");
      help.className = "smallnote";
      help.textContent = "If using file-based images, confirm paths exist (e.g. assets/levels/<id>/original.jpg).";
      right.appendChild(help);
      return;
    }

    const orig = imgEl(origImg.src);
    const edited = imgEl(editedImg.src);
    leftCard.appendChild(orig);
    rightCard.appendChild(edited);

    const marker1 = document.createElement("div");
    marker1.className = "marker";
    marker1.style.display = "none";
    leftCard.appendChild(marker1);

    const marker2 = document.createElement("div");
    marker2.className = "marker";
    marker2.style.display = "none";
    rightCard.appendChild(marker2);

    let solvedThisRun = false;
    let hintOn = false;

    const hitboxes = (level.hitboxes || []).map(h => ({
      x: Number(h.x)||0, y: Number(h.y)||0, w: Number(h.w)||0, h: Number(h.h)||0, label: h.label || ""
    }));

    function showMarkerForHitbox(hit){
      const show = (card, marker) => {
        const rect = card.getBoundingClientRect();
        const cw = rect.width;
        const ch = rect.height;
        const nw = origImg.naturalWidth || level.original.naturalWidth || 1;
        const nh = origImg.naturalHeight || level.original.naturalHeight || 1;

        const fit = fitRect(cw, ch, nw, nh);
        const mx = fit.x + (hit.x * fit.scale);
        const my = fit.y + (hit.y * fit.scale);
        const mw = hit.w * fit.scale;
        const mh = hit.h * fit.scale;

        marker.style.left = mx + "px";
        marker.style.top = my + "px";
        marker.style.width = mw + "px";
        marker.style.height = mh + "px";
        marker.style.display = "block";
      };
      show(leftCard, marker1);
      show(rightCard, marker2);
    }

    function hideMarkers(){
      marker1.style.display = "none";
      marker2.style.display = "none";
    }

    function clientToImageCoords(card, clientX, clientY){
      const r = card.getBoundingClientRect();
      const cw = r.width;
      const ch = r.height;

      const nw = origImg.naturalWidth || level.original.naturalWidth || 1;
      const nh = origImg.naturalHeight || level.original.naturalHeight || 1;

      const fit = fitRect(cw, ch, nw, nh);

      const x = (clientX - r.left - fit.x) / fit.scale;
      const y = (clientY - r.top - fit.y) / fit.scale;

      return { x, y, inside: x >= 0 && y >= 0 && x <= nw && y <= nh };
    }

    function checkHit(clientX, clientY, card){
      const p = clientToImageCoords(card, clientX, clientY);
      if(!p.inside) return null;
      for(const hit of hitboxes){
        if(rectContains(hit, p.x, p.y)) return hit;
      }
      return null;
    }

    function win(hit){
      if(solvedThisRun) return;
      solvedThisRun = true;

      const p = loadProgress();
      const alreadySolved = (p.solvedLevelIds || []).includes(level.id);

      markSolved(p, level.id);
      const gained = alreadySolved ? Math.floor((level.rewards?.xp ?? 25) * 0.25) : (level.rewards?.xp ?? 25);

      const res = grantXp(p, gained);
      const sum2 = progressSummary(res.progress);

      xpbar.style.width = `${sum2.pct}%`;
      header.querySelector(".badge").textContent = `Level ${res.progress.level}`;
      header.querySelector(".muted").textContent = `XP ${res.progress.xp}/${sum2.need}`;

      showMarkerForHitbox(hit);
      toast(alreadySolved ? `Solved again! +${gained} XP` : `Correct! +${gained} XP`, "good");
      playSfx("correct", p.sfx);
      confettiBurst(150);

      if(res.leveledUp){
        toast(`Level up! You are now level ${res.progress.level}`, "good");
        playSfx("levelup", p.sfx);
        confettiBurst(220);
      }

      setTimeout(()=> {
        top.querySelector("#btn-skip").classList.add("primary");
        top.querySelector("#btn-skip").textContent = "Next level";
      }, 260);
    }

    function miss(){
      if(solvedThisRun) return;
      toast("Not quite. Try again!", "warn");
      playSfx("wrong", loadProgress().sfx);
    }

    const onClick = (card) => (e) => {
      if(solvedThisRun) return;
      const hit = checkHit(e.clientX, e.clientY, card);
      if(hit) win(hit); else miss();
    };

    leftCard.addEventListener("click", onClick(leftCard));
    rightCard.addEventListener("click", onClick(rightCard));

    top.querySelector("#btn-hint").addEventListener("click", () => {
      hintOn = !hintOn;
      if(!hintOn){
        hideMarkers();
        toast("Hint off", "info");
        return;
      }
      if(hitboxes[0]){
        showMarkerForHitbox(hitboxes[0]);
        toast("Hint: look near the highlighted area", "info");
      }
    });

    top.querySelector("#btn-skip").addEventListener("click", () => {
      const p = loadProgress();
      const solvedIds = new Set(p.solvedLevelIds || []);
      const idx = allLevels.findIndex(l => l.id === level.id);
      let next = allLevels.slice(idx+1).find(l => !solvedIds.has(l.id));
      if(!next) next = allLevels[(idx+1) % allLevels.length];
      if(next){
        selected = next;
        renderLevel(selected);
        playSfx("tap", p.sfx);
      }
    });
  }
}
