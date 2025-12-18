# Level JSON format

A level is a plain JSON object.

## Example
```json
{
  "id": "demo_001",
  "name": "Demo: Color Swap",
  "difficulty": 1,
  "original": {
    "type": "data",
    "dataUrl": "data:image/svg+xml,...",
    "naturalWidth": 900,
    "naturalHeight": 600
  },
  "edited": {
    "type": "data",
    "dataUrl": "data:image/svg+xml,...",
    "naturalWidth": 900,
    "naturalHeight": 600
  },
  "hitboxes": [
    { "x": 560, "y": 240, "w": 240, "h": 240, "label": "Circle area" }
  ],
  "rewards": { "xp": 35 }
}
```

## Fields
- `id` (string, required): unique level identifier.
- `name` (string): display name.
- `difficulty` (number 1-5): difficulty indicator.
- `original` (object, required): image reference.
- `edited` (object, required): image reference.
- `hitboxes` (array, required): list of rectangles in original image pixel coordinates.
- `rewards.xp` (number): XP awarded on first solve. Re-solving gives 25% XP by default.

### Image reference object
Two supported modes:
- Embedded:
  - `type: "data"`
  - `dataUrl: "data:image/..."`
- File-based:
  - `type: "file"`
  - `path: "assets/levels/<id>/original.jpg"` etc.

Optional:
- `naturalWidth`, `naturalHeight` are stored for convenience; the runtime uses the loaded image size.

### Hitbox rectangles
Each hitbox:
- `x`, `y`, `w`, `h` are in pixel coordinates relative to the natural size of the original image.

## Extending
You can add:
- Multiple hitboxes for multi-difference levels (game currently treats any one hitbox as a win).
- Optional `thumbnail` fields for a nicer level list UI.
