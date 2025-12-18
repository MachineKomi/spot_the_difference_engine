import { BUILTIN_LEVELS } from "./levels.js";
import { renderPlay } from "./game.js";
import { renderBuilder } from "./builder.js";
import { setSubtitle, setActiveNav, resizeFx } from "./ui.js";
import { safeJsonParse } from "./utils.js";

const USER_LEVELS_KEY = "std_user_levels_v1";

function getUserLevels(){
  return safeJsonParse(localStorage.getItem(USER_LEVELS_KEY), []);
}

function setUserLevels(levels){
  localStorage.setItem(USER_LEVELS_KEY, JSON.stringify(levels));
}

function renderAbout(root){
  root.innerHTML = "";
  const card = document.createElement("div");
  card.className = "card pad vstack";
  card.innerHTML = `
    <div class="big">About</div>
    <div class="kicker">
      This repo is a lightweight spot-the-difference engine designed to be easy to extend.
      It supports custom levels defined as JSON with rectangular hitboxes in image pixel coordinates.
    </div>
    <hr class="sep"/>
    <div class="vstack">
      <div style="font-weight:900;">Quick links</div>
      <div class="smallnote">
        <ul>
          <li><b>Builder</b>: upload images, draw hitbox, export level JSON.</li>
          <li><b>Play</b>: import JSON or use built-in levels, earn XP, level up.</li>
        </ul>
      </div>
    </div>
    <hr class="sep"/>
    <div class="smallnote">
      Notes:
      <ul>
        <li>Progress is saved in localStorage.</li>
        <li>No tracking, no network calls.</li>
        <li>Works best when served via a local web server.</li>
      </ul>
    </div>
  `;
  root.appendChild(card);
}

function route(){
  const hash = location.hash || "#/play";
  const root = document.getElementById("route");
  if(!root) return;

  resizeFx();

  if(hash.startsWith("#/builder")){
    setSubtitle("Builder");
    setActiveNav("#/builder");
    renderBuilder(root, { getUserLevels, setUserLevels });
    return;
  }

  if(hash.startsWith("#/about")){
    setSubtitle("About");
    setActiveNav("#/about");
    renderAbout(root);
    return;
  }

  setSubtitle("Play");
  setActiveNav("#/play");
  renderPlay(root, { levels: BUILTIN_LEVELS, getUserLevels, setUserLevels });
}

window.addEventListener("hashchange", route);
window.addEventListener("load", route);
