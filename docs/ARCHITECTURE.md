# Architecture

## Pages (hash routes)
- `#/play`:
  - Loads built-in levels from `src/levels.js`
  - Loads user-imported levels from localStorage
  - Handles click mapping from DOM coordinates -> image pixels -> hitbox check
  - Updates progression (XP, Level) in localStorage
- `#/builder`:
  - Upload original/edited images
  - Draw a rectangle on either image (stored in original image pixels)
  - Export JSON (embedded or file-path)
  - Save to localStorage for quick playtesting

## Coordinate mapping
- Images are displayed with a contain fit in responsive cards.
- The code computes the fitted rectangle (x,y,w,h,scale) for the image inside the card.
- Pointer coordinates are mapped back to image pixels:
  - `(clientX - cardLeft - fit.x) / fit.scale`

Hitboxes stored in image pixels remain correct regardless of display size.

## Persistence
- `std_progress_v1`: `level`, `xp`, `solvedLevelIds`, `sfx`
- `std_user_levels_v1`: array of user level objects
