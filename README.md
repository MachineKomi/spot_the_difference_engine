# Spot the Difference (Browser Game + Level Builder)

A lightweight, dependency-free spot-the-difference engine for the browser with:
- Kid-friendly UI/UX
- Persistent XP + Level progression (localStorage)
- In-browser Level Builder (upload 2 images, draw a rectangular hitbox, export JSON)
- Satisfying effects (confetti + WebAudio SFX)

## Run locally

Because the game uses ES modules, serve it via a local HTTP server:

```bash
python -m http.server 8000
```

Open:
- Play: http://localhost:8000/#/play
- Builder: http://localhost:8000/#/builder

## Create a level

1. Open Builder (#/builder)
2. Upload:
   - Original image
   - Edited image (small but noticeable change)
3. Click-drag on either image to draw the hitbox rectangle over the changed area.
4. Export JSON:
   - "Export JSON (embedded images)" for a self-contained JSON (good for quick tests)
   - "Export JSON (file paths)" for repo-friendly levels (recommended)

### File-path levels (recommended)
After exporting file-path JSON:
1. Copy your images into:
   - `assets/levels/<level-id>/original.jpg`
   - `assets/levels/<level-id>/edited.jpg`
2. Paste the exported JSON object into `src/levels.js` inside `BUILTIN_LEVELS`.

## Level format
See `docs/LEVEL_FORMAT.md`.

## Architecture notes
See `docs/ARCHITECTURE.md`.

## License
MIT (see `LICENSE`).
