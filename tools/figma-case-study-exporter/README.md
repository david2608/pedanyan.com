# Case Study Package Exporter

A local Figma development plugin that exports one selected case-study frame as a single ZIP.

## ZIP contents

- `design.json`: selected node tree, text, geometry, auto layout, paints, effects, component metadata, referenced styles, variables, and asset mappings.
- `assets/images/`: original bytes for every image fill, deduplicated by Figma image hash.
- `assets/exports/`: layers that already have Figma export settings.
- `assets/vectors/`: optional SVG exports for vector roots.
- `screenshots/`: a reference PNG of the selected frame.

## Install in Figma

1. Run `npm install` and `npm run build` in this folder. The included ZIP already contains the built files.
2. Open the Figma desktop app.
3. Open **Plugins → Development → Import plugin from manifest…**
4. Select this folder's `manifest.json`.

## Use

1. Select exactly one top-level frame, section, component, instance, or group.
2. Run **Plugins → Development → Case Study Package Exporter**.
3. Choose export options.
4. Click **Export JSON + assets**.
5. Save the generated ZIP and attach it to your implementation task.

## Notes

- Image fills are exported automatically. No manual image export is required.
- Enable SVG export only when needed. Large case studies can contain thousands of vector layers.
- CSS snapshots are optional because they can slow down very large exports.
- Fonts are described in JSON but font files are not included.
- Videos and externally linked content are described when Figma exposes their node properties, but only image-fill bytes and requested exports are packaged.
