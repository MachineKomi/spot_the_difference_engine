import { uid, pretty, downloadText, clamp, fitRect } from "./utils.js";
import { toast, playSfx } from "./ui.js";

function readFileAsDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadImageFromDataUrl(dataUrl){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function renderBuilder(root, { getUserLevels, setUserLevels }){
  root.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "grid two";
  root.appendChild(wrap);

  const left = document.createElement("div");
  left.className = "card pad vstack";
  wrap.appendChild(left);

  const right = document.createElement("div");
  right.className = "card pad vstack";
  wrap.appendChild(right);

  left.innerHTML = `
    <div class="big">Level Builder</div>
    <div class="kicker">Upload your original and edited images, then draw a rectangle over the changed area.</div>
    <hr class="sep"/>

    <div class="field">
      <label>Level name</label>
      <input id="lvl-name" type="text" placeholder="e.g. 'Cat: missing whisker'"/>
    </div>

    <div class="grid two">
      <div class="field">
        <label>Difficulty (1-5)</label>
        <input id="lvl-diff" type="number" min="1" max="5" value="1"/>
      </div>
      <div class="field">
        <label>XP reward</label>
        <input id="lvl-xp" type="number" min="1" max="500" value="35"/>
      </div>
    </div>

    <div class="grid two">
      <div class="field">
        <label>Original image</label>
        <input id="file-orig" type="file" accept="image/*"/>
      </div>
      <div class="field">
        <label>Edited image</label>
        <input id="file-edited" type="file" accept="image/*"/>
      </div>
    </div>

    <div class="hstack">
      <button class="btn primary" id="btn-start">Start drawing</button>
      <button class="btn" id="btn-clear">Clear hitbox</button>
    </div>

    <div class="smallnote">
      How it works:
      <ul>
        <li>Hitbox coords are stored in original image pixels (x,y,w,h).</li>
        <li>Players can click either image; clicks are mapped back to those pixel coords.</li>
        <li>Keep the rectangle slightly generous for younger players.</li>
      </ul>
    </div>

    <hr class="sep"/>

    <div class="hstack">
      <button class="btn good" id="btn-export-data">Export JSON (embedded images)</button>
      <button class="btn" id="btn-export-file">Export JSON (file paths)</button>
    </div>
    <div class="smallnote">
      File paths mode assumes you will copy images into <b>assets/levels/&lt;id&gt;/</b> and reference:
      <div class="codebox">assets/levels/&lt;id&gt;/original.jpg
assets/levels/&lt;id&gt;/edited.jpg</div>
    </div>

    <hr class="sep"/>
    <div class="hstack">
      <button class="btn" id="btn-save-local">Save to local levels</button>
      <button class="btn danger" id="btn-clear-local">Clear local levels</button>
    </div>
    <div class="smallnote">Local levels are stored in your browser only (localStorage).</div>
  `;

  const canvasWrap = document.createElement("div");
  canvasWrap.className = "stage vstack";
  right.appendChild(canvasWrap);

  canvasWrap.innerHTML = `
    <div class="hstack" style="justify-content:space-between;">
      <div class="pill"><span class="badge">Draw hitbox</span><span class="muted">Click-drag to draw</span></div>
      <div class="muted" style="font-size:12px;">Hold Shift for square</div>
    </div>
    <div class="imggrid" id="imggrid"></div>
    <div class="hint">Tip: start with a rectangle 10-25% larger than the exact change for younger players.</div>
    <hr class="sep"/>
    <div class="vstack">
      <div style="font-weight:900;">Level JSON preview</div>
      <pre class="codebox" id="json-preview">{}</pre>
    </div>
  `;

  const imgGrid = canvasWrap.querySelector("#imggrid");
  const preview = canvasWrap.querySelector("#json-preview");

  const nameEl = left.querySelector("#lvl-name");
  const diffEl = left.querySelector("#lvl-diff");
  const xpEl = left.querySelector("#lvl-xp");
  const fOrig = left.querySelector("#file-orig");
  const fEdited = left.querySelector("#file-edited");

  const btnStart = left.querySelector("#btn-start");
  const btnClear = left.querySelector("#btn-clear");
  const btnExportData = left.querySelector("#btn-export-data");
  const btnExportFile = left.querySelector("#btn-export-file");
  const btnSaveLocal = left.querySelector("#btn-save-local");
  const btnClearLocal = left.querySelector("#btn-clear-local");

  let origDataUrl = null;
  let editedDataUrl = null;
  let origImg = null;

  let hit = null; // {x,y,w,h} in original pixels

  const makeDrawCard = (label) => {
    const card = document.createElement("div");
    card.className = "imgcard";
    card.innerHTML = `<div class="imglabel">${label}</div>`;
    const c = document.createElement("canvas");
    c.style.position = "absolute";
    c.style.inset = "0";
    c.style.width = "100%";
    c.style.height = "100%";
    c.style.pointerEvents = "auto";
    card.appendChild(c);
    return { card, canvas: c };
  };

  const c1 = makeDrawCard("Original");
  const c2 = makeDrawCard("Edited");
  imgGrid.appendChild(c1.card);
  imgGrid.appendChild(c2.card);

  function setCardImage(card, dataUrl){
    const existing = card.querySelector("img");
    if(existing) existing.remove();
    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = "";
    img.draggable = false;
    card.insertBefore(img, card.querySelector("canvas"));
  }

  async function onFilesChanged(){
    const fo = fOrig.files?.[0];
    const fe = fEdited.files?.[0];
    if(!fo || !fe){
      updatePreview();
      return;
    }
    try{
      [origDataUrl, editedDataUrl] = await Promise.all([readFileAsDataUrl(fo), readFileAsDataUrl(fe)]);
      origImg = await loadImageFromDataUrl(origDataUrl);
      setCardImage(c1.card, origDataUrl);
      setCardImage(c2.card, editedDataUrl);
      resizeCanvasToCard(c1.canvas, c1.card);
      resizeCanvasToCard(c2.canvas, c2.card);
      hit = null;
      drawOverlay();
      updatePreview();
      toast("Images loaded. Draw your hitbox.", "good");
    }catch{
      toast("Could not load images", "bad");
    }
  }

  fOrig.addEventListener("change", onFilesChanged);
  fEdited.addEventListener("change", onFilesChanged);

  function resizeCanvasToCard(canvas, card){
    const r = card.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(r.width * dpr);
    canvas.height = Math.floor(r.height * dpr);
  }

  window.addEventListener("resize", () => {
    resizeCanvasToCard(c1.canvas, c1.card);
    resizeCanvasToCard(c2.canvas, c2.card);
    drawOverlay();
  });

  let drawing = false;
  let start = null;

  function cardClientToImage(card, clientX, clientY){
    if(!origImg) return null;
    const r = card.getBoundingClientRect();
    const cw = r.width;
    const ch = r.height;
    const fit = fitRect(cw, ch, origImg.naturalWidth, origImg.naturalHeight);

    const x = (clientX - r.left - fit.x) / fit.scale;
    const y = (clientY - r.top - fit.y) / fit.scale;

    const inside = x >= 0 && y >= 0 && x <= origImg.naturalWidth && y <= origImg.naturalHeight;
    return { x, y, inside, fit, rect: r };
  }

  function normalizedRectFromPoints(a,b){
    let x1 = Math.min(a.x, b.x);
    let y1 = Math.min(a.y, b.y);
    let x2 = Math.max(a.x, b.x);
    let y2 = Math.max(a.y, b.y);
    return { x: x1, y: y1, w: x2-x1, h: y2-y1 };
  }

  function roundRect(ctx, x, y, w, h, r){
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
    ctx.closePath();
  }

  function drawOverlay(){
    for(const {canvas, card} of [c1,c2]){
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0,0,canvas.width,canvas.height);
      if(!origImg) continue;

      if(hit){
        const r = card.getBoundingClientRect();
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const fit = fitRect(r.width, r.height, origImg.naturalWidth, origImg.naturalHeight);

        const x = (fit.x + hit.x * fit.scale) * dpr;
        const y = (fit.y + hit.y * fit.scale) * dpr;
        const w = (hit.w * fit.scale) * dpr;
        const h = (hit.h * fit.scale) * dpr;

        ctx.save();
        ctx.strokeStyle = "rgba(255,209,102,0.95)";
        ctx.lineWidth = 4 * dpr;
        ctx.shadowColor = "rgba(255,209,102,0.35)";
        ctx.shadowBlur = 12 * dpr;
        roundRect(ctx, x, y, w, h, 10*dpr);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function updatePreview(){
    const level = currentLevelObject({ embedImages: true, filePaths: false });
    preview.textContent = pretty(level);
  }

  function currentLevelObject({ embedImages, filePaths }){
    const id = uid("level");
    const nm = (nameEl.value || "").trim() || "Untitled level";
    const diff = clamp(parseInt(diffEl.value || "1", 10) || 1, 1, 5);
    const xp = clamp(parseInt(xpEl.value || "35", 10) || 35, 1, 500);

    const hasHit = hit && hit.w > 1 && hit.h > 1;

    const original = embedImages ? {
      type: "data",
      dataUrl: origDataUrl || "",
      naturalWidth: origImg?.naturalWidth || null,
      naturalHeight: origImg?.naturalHeight || null
    } : (filePaths ? {
      type: "file",
      path: `assets/levels/${id}/original.jpg`,
      naturalWidth: origImg?.naturalWidth || null,
      naturalHeight: origImg?.naturalHeight || null
    } : { type:"data", dataUrl: "", naturalWidth:null, naturalHeight:null });

    const edited = embedImages ? {
      type: "data",
      dataUrl: editedDataUrl || "",
      naturalWidth: origImg?.naturalWidth || null,
      naturalHeight: origImg?.naturalHeight || null
    } : (filePaths ? {
      type: "file",
      path: `assets/levels/${id}/edited.jpg`,
      naturalWidth: origImg?.naturalWidth || null,
      naturalHeight: origImg?.naturalHeight || null
    } : { type:"data", dataUrl: "", naturalWidth:null, naturalHeight:null });

    return {
      id,
      name: nm,
      difficulty: diff,
      original,
      edited,
      hitboxes: hasHit ? [{ x: Math.round(hit.x), y: Math.round(hit.y), w: Math.round(hit.w), h: Math.round(hit.h), label: "Difference" }] : [],
      rewards: { xp }
    };
  }

  function attachDrawingHandlers(card, canvas){
    canvas.addEventListener("pointerdown", (e) => {
      if(!origImg || !origDataUrl || !editedDataUrl){
        toast("Upload both images first", "warn");
        return;
      }
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      const p = cardClientToImage(card, e.clientX, e.clientY);
      if(!p || !p.inside) return;
      start = { x: p.x, y: p.y };
      hit = null;
      drawOverlay();
      playSfx("tap", true);
    });

    canvas.addEventListener("pointermove", (e) => {
      if(!drawing || !start || !origImg) return;
      const p = cardClientToImage(card, e.clientX, e.clientY);
      if(!p) return;
      const a = { x: start.x, y: start.y };
      const b = { x: clamp(p.x, 0, origImg.naturalWidth), y: clamp(p.y, 0, origImg.naturalHeight) };
      let r = normalizedRectFromPoints(a,b);
      if(e.shiftKey){
        const s = Math.max(r.w, r.h);
        r.w = s; r.h = s;
        r.x = (b.x < a.x) ? a.x - s : a.x;
        r.y = (b.y < a.y) ? a.y - s : a.y;
      }
      hit = r;
      drawOverlay();
      updatePreview();
    });

    canvas.addEventListener("pointerup", () => {
      if(!drawing) return;
      drawing = false;
      start = null;
      if(hit && hit.w > 6 && hit.h > 6){
        toast("Hitbox set", "good");
      }else{
        hit = null;
        toast("Hitbox too small, try again", "warn");
      }
      drawOverlay();
      updatePreview();
    });
  }

  attachDrawingHandlers(c1.card, c1.canvas);
  attachDrawingHandlers(c2.card, c2.canvas);

  btnStart.addEventListener("click", () => {
    if(!origDataUrl || !editedDataUrl){
      toast("Upload both images first", "warn");
      return;
    }
    toast("Draw a rectangle on either image", "info");
  });

  btnClear.addEventListener("click", () => {
    hit = null;
    drawOverlay();
    updatePreview();
    toast("Cleared hitbox", "info");
  });

  btnExportData.addEventListener("click", () => {
    if(!origDataUrl || !editedDataUrl){
      toast("Upload both images first", "warn");
      return;
    }
    if(!hit){
      toast("Draw a hitbox first", "warn");
      return;
    }
    const lvl = currentLevelObject({ embedImages: true, filePaths: false });
    downloadText(`${lvl.id}.json`, pretty(lvl));
    toast("Exported embedded JSON", "good");
  });

  btnExportFile.addEventListener("click", () => {
    if(!origDataUrl || !editedDataUrl){
      toast("Upload both images first", "warn");
      return;
    }
    if(!hit){
      toast("Draw a hitbox first", "warn");
      return;
    }
    const lvl = currentLevelObject({ embedImages: false, filePaths: true });
    downloadText(`${lvl.id}.json`, pretty(lvl));
    toast("Exported file-path JSON", "good");
  });

  btnSaveLocal.addEventListener("click", () => {
    if(!origDataUrl || !editedDataUrl){
      toast("Upload both images first", "warn");
      return;
    }
    if(!hit){
      toast("Draw a hitbox first", "warn");
      return;
    }
    const lvl = currentLevelObject({ embedImages: true, filePaths: false });
    const levels = getUserLevels();
    setUserLevels([...levels, lvl]);
    toast("Saved to local levels (playable in Play screen)", "good");
  });

  btnClearLocal.addEventListener("click", () => {
    if(confirm("Delete locally saved levels (browser only)?")){
      setUserLevels([]);
      toast("Cleared local levels", "info");
    }
  });

  updatePreview();
}
