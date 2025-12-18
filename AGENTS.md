# Agent notes (Codex / GPT workflows)

This repo is designed for quick iteration with AI agents.

## Key files
- `src/main.js` - hash router and page rendering
- `src/game.js` - play loop: click mapping, hitbox checking, rewards, effects
- `src/builder.js` - in-browser level creation: image upload, draw hitbox, export JSON
- `src/state.js` - progression persistence (XP, Level, solved list)
- `src/levels.js` - built-in levels list (paste exported objects here)
- `src/ui.js` - toast, confetti canvas, WebAudio SFX

## Common tasks for agents
- Add multi-hitbox support with "find N differences" win condition
- Add timer + star rating (faster = better)
- Add accessibility improvements (keyboard hints, focus management)
- Add touch-friendly zoom/pan for detailed images
- Add asset pipeline (optional) for thumbnails and level packs

## Conventions
- No framework. Keep changes small and readable.
- All game logic should remain client-side.
- Prefer pure functions and data-driven level JSON.
- Use localStorage keys with a `_vN` suffix for easy migrations.
