# Omnia icon system

This document defines the product iconography contract. It is normative for
new renderer and native-shell UI, but it is not a claim that every future
entity surface is already shipped.

## 1. Product mark

The selected renderer identity is **L01 Command ring**: an open command ring,
a compact directional notch, and a neutral core point. It is the mark used by
`OmniaLogo` in the title bar, rail, boot surface, and assistant identity. The
legacy **hex-core** aperture remains available as an explicit renderer variant
for compatibility surfaces while the native application-icon assets are still
on the previous release geometry.

The mark must:

- remain recognizable in one color at 16 px;
- avoid glow, orbit, sparkle, robot, neural-node, or rainbow motifs;
- use the brand accent only for the ring/notch, with a neutral core;
- preserve at least 12.5% optical margin inside square application-icon tiles;
- never rely on animation for recognition.

`src-tauri/icons/app-icon.svg` remains the canonical high-resolution native
source for the current release icon. Raster platform assets are release
artifacts generated from that source; they must not be silently regenerated
during unrelated feature work. A future native icon refresh should update the
SVG source and all platform rasters together in a dedicated identity phase.

## 2. Two icon layers

### Utility icons

Use Lucide for common actions and transient UI controls such as add, close,
copy, refresh, search, layout, navigation, share, and settings.

- Default stroke: `1.75`.
- Compact utility size: `14-16 px`.
- Standard utility size: `16-18 px`.
- Navigation utility size: `19-20 px`.
- Interactive hit target is controlled by density tokens and is independent
  of glyph size.

### Product-entity icons

Use `ProductIcon` from `src/components/product-icons.tsx` for durable Omnia
entities. The initial vocabulary is:

| Entity | Meaning |
| --- | --- |
| `agent` | An agent identity or agent-owned output |
| `artifact` | A durable generated output |
| `browser` | A browser environment or browser-owned work |
| `citation` | Evidence with a source locator |
| `environment` | Persistent, isolated, or remote execution environment |
| `memory` | Versioned remembered information |
| `model` | A provider-model resolution or catalog entry |
| `plan` | A structured plan or blueprint |
| `run` | A logical execution run |
| `skill` | A versioned reusable skill package |
| `task` | A user-visible task or work item |
| `terminal` | A shell/terminal execution surface |

Product icons share a 24 px view box, rounded joins/caps, and a default
`1.75` stroke. They identify objects; they do not imply availability or grant
permissions.

## 3. Semantic rules

- Never use `Sparkles`, `WandSparkles`, or a robot as a generic synonym for
  model, assistant, skill, run, prompt, or “smart”.
- Use the Omnia mark only for Omnia itself: assistant identity, product shell,
  boot surface, installer, and application icon.
- Color communicates selection or status, never object type by itself.
- Entity icons are neutral by default. Success, warning, danger, and info
  colors are reserved for verified states.
- Provider marks may use provider brand colors, but provider color never
  becomes the surrounding surface theme.
- Do not place every icon inside a tinted tile. Tiles are reserved for a
  top-level object, a selected navigation target, or a true empty-state mark.
- A large illustration is not a scaled-up utility icon. Build a dedicated
  illustration only when it materially explains a state.

## 4. Accessibility

- Decorative icon SVGs use `aria-hidden="true"` and `focusable="false"`.
- An icon-only button always has an accessible name on the button.
- Status is expressed by icon plus text and never by color alone.
- The product mark's wrapper exposes the `Omnia` label when it acts as an
  identity; repeated decorative marks may be hidden by their parent surface.
- Forced-colors mode must preserve strokes and the product mark silhouette.

## 5. Review gate

Before adding a new icon:

1. Confirm that no existing semantic icon already represents the object.
2. Decide whether it is a utility action or durable product entity.
3. Check the glyph at 16, 20, and 24 px in light, dark, and forced colors.
4. Verify that the object remains identifiable without a colored tile.
5. Add or update deterministic rendering tests when the vocabulary changes.
