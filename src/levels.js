// Built-in levels ship with the game.
// Add new ones by pasting exported JSON objects from the Builder.

export const BUILTIN_LEVELS = [
  {
    "id": "demo_001",
    "name": "Demo: Color Swap",
    "difficulty": 1,
    "original": {
      "type": "data",
      "dataUrl": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22900%22%20height%3D%22600%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20x2%3D%221%22%20y1%3D%220%22%20y2%3D%221%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%22%20stop-color%3D%22%237c5cff%22%20stop-opacity%3D%220.55%22/%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2300d4ff%22%20stop-opacity%3D%220.35%22/%3E%0A%20%20%20%20%3C/linearGradient%3E%0A%20%20%3C/defs%3E%0A%20%20%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23101a2f%22/%3E%0A%20%20%3Crect%20x%3D%2240%22%20y%3D%2240%22%20width%3D%22820%22%20height%3D%22520%22%20rx%3D%2228%22%20fill%3D%22url%28%23g%29%22%20opacity%3D%220.7%22/%3E%0A%20%20%3Cg%20font-family%3D%22system-ui%2CSegoe%20UI%2CArial%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.92%29%22%3E%0A%20%20%20%20%3Ctext%20x%3D%2280%22%20y%3D%22140%22%20font-size%3D%2248%22%20font-weight%3D%22800%22%3EDemo%20Level%3C/text%3E%0A%20%20%20%20%3Ctext%20x%3D%2280%22%20y%3D%22190%22%20font-size%3D%2222%22%20opacity%3D%220.8%22%3EFind%20the%20small%20change%21%3C/text%3E%0A%20%20%3C/g%3E%0A%20%20%3Cg%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22680%22%20cy%3D%22360%22%20r%3D%2278%22%20fill%3D%22%2338d39f%22/%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22680%22%20cy%3D%22360%22%20r%3D%2242%22%20fill%3D%22rgba%280%2C0%2C0%2C0.22%29%22/%3E%0A%20%20%3C/g%3E%0A%20%20%3Cg%3E%0A%20%20%20%20%3Crect%20x%3D%22110%22%20y%3D%22280%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2226%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.12%29%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.20%29%22%20stroke-width%3D%224%22/%3E%0A%20%20%20%20%3Cpath%20d%3D%22M160%20420%20L210%20330%20L260%20420%20Z%22%20fill%3D%22%23ffd166%22/%3E%0A%20%20%3C/g%3E%0A%3C/svg%3E",
      "naturalWidth": 900,
      "naturalHeight": 600
    },
    "edited": {
      "type": "data",
      "dataUrl": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22900%22%20height%3D%22600%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20x2%3D%221%22%20y1%3D%220%22%20y2%3D%221%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%22%20stop-color%3D%22%237c5cff%22%20stop-opacity%3D%220.55%22/%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2300d4ff%22%20stop-opacity%3D%220.35%22/%3E%0A%20%20%20%20%3C/linearGradient%3E%0A%20%20%3C/defs%3E%0A%20%20%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23101a2f%22/%3E%0A%20%20%3Crect%20x%3D%2240%22%20y%3D%2240%22%20width%3D%22820%22%20height%3D%22520%22%20rx%3D%2228%22%20fill%3D%22url%28%23g%29%22%20opacity%3D%220.7%22/%3E%0A%20%20%3Cg%20font-family%3D%22system-ui%2CSegoe%20UI%2CArial%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.92%29%22%3E%0A%20%20%20%20%3Ctext%20x%3D%2280%22%20y%3D%22140%22%20font-size%3D%2248%22%20font-weight%3D%22800%22%3EDemo%20Level%3C/text%3E%0A%20%20%20%20%3Ctext%20x%3D%2280%22%20y%3D%22190%22%20font-size%3D%2222%22%20opacity%3D%220.8%22%3EFind%20the%20small%20change%21%3C/text%3E%0A%20%20%3C/g%3E%0A%20%20%3Cg%3E%0A%20%20%20%20%3C%21--%20Change%3A%20circle%20becomes%20pink%20--%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22680%22%20cy%3D%22360%22%20r%3D%2278%22%20fill%3D%22%23FA007A%22/%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22680%22%20cy%3D%22360%22%20r%3D%2242%22%20fill%3D%22rgba%280%2C0%2C0%2C0.22%29%22/%3E%0A%20%20%3C/g%3E%0A%20%20%3Cg%3E%0A%20%20%20%20%3Crect%20x%3D%22110%22%20y%3D%22280%22%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2226%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.12%29%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.20%29%22%20stroke-width%3D%224%22/%3E%0A%20%20%20%20%3Cpath%20d%3D%22M160%20420%20L210%20330%20L260%20420%20Z%22%20fill%3D%22%23ffd166%22/%3E%0A%20%20%3C/g%3E%0A%3C/svg%3E",
      "naturalWidth": 900,
      "naturalHeight": 600
    },
    "hitboxes": [
      {
        "x": 560,
        "y": 240,
        "w": 240,
        "h": 240,
        "label": "Circle area"
      }
    ],
    "rewards": {
      "xp": 35
    }
  }
];

export function allBuiltinLevelIds(){ return BUILTIN_LEVELS.map(l => l.id); }
