# Omnia UI typography audit

Status: current static gate passes after the September 19, 2026 migration pass

Last verified: September 19, 2026 (renderer source tree)

This audit records the typography boundary for the renderer. It is intentionally
separate from visual approval: a passing static gate proves that feature CSS no
longer introduces literal sub-10px text, but it does not replace render checks
at native minimum size, touch density, high contrast, localization expansion, or
increased text scale.

## Baseline

The pre-migration feature styles contained 115 literal `font-size` declarations
below 10px:

| Stylesheet | Declarations below 10px | Lowest value |
| --- | ---: | ---: |
| `src/styles/chat.css` | 39 | 8px |
| `src/styles/overlays.css` | 13 | 8px |
| `src/styles/screens.css` | 55 | 6.8px |
| `src/styles/shell.css` | 8 | 8px |
| **Total** | **115** | **6.8px** |

The smallest values were used for meaningful labels, source metadata, settings
descriptions, provider state, and Library provenance—not only decorative marks.
That made the documented caption scale and the runtime UI disagree, and made
200% text scaling/localization expansion especially fragile.

## Current result

The September 19 migration pass removed the remaining literal 8px/9px text
declarations from the feature styles: 37 declarations in `chat.css` and 52
declarations across the other feature stylesheets. The current static scan now
reports:

| Check | Result |
| --- | --- |
| Stylesheets scanned | 34 |
| Literal `font-size` declarations below 10px | **0** |
| Lowest literal text size | 10px (the gate boundary) |
| Semantic micro token | 11px (`var(--font-micro)`) |
| Semantic caption token | 12px (`var(--font-caption)`) |

This is a source-level result. It does not prove that every 10px label is
comfortable at the native minimum window, in forced colors, at 200% text scale,
or after localization expansion.

## Implemented policy

Feature styles now use the executable semantic typography tokens for compact
text that previously fell below the threshold:

- `var(--font-small)` for compact metadata, state labels, timestamps, and
  dense control copy. The generated token currently resolves to the 11px micro
  role.
- `var(--font-caption)` for explanatory/help text, descriptions, notices,
  empty-state copy, and other text that needs a little more reading room. The
  generated token currently resolves to 12px.
- Provider search input uses the body role rather than a metadata size because
  it is an editable field, not a caption.

Chat reading surfaces also use the body and reading roles for user messages,
assistant Markdown, and the composer. Assistant content is constrained to a
readable measure and receives explicit heading/list hierarchy; these rules are
still subject to visual and localization review.

The migration deliberately uses semantic roles instead of replacing every
value with a single hard-coded size. This preserves hierarchy while ensuring
that a future type-scale or accessibility zoom change has one token surface to
update.

## Automated gate

`scripts/check-typography.mjs` scans every stylesheet in `src/styles` and fails
when it finds a literal `font-size` below 10px. It reports the file, line, and
offending value so a new feature cannot silently reintroduce unreadable text.
It also reads `docs/ui/design-tokens.json` and fails when the semantic
`font.size.micro` token is missing, malformed, or below the same 10px floor.
This protects the current `var(--font-small)` alias without pretending to
resolve arbitrary CSS variables at runtime.

Run it directly with:

```text
npm run check:typography
```

It is also part of the renderer `npm run check` sequence, before typecheck,
tests, and the production build.

The gate intentionally scans CSS literals plus the source micro token. The
token generator/parity check and the visual/accessibility matrix remain required
companion gates for generated output, line-height, text scaling, contrast, and
real rendered layout.

## Verification boundary

The migration was checked with:

- `npm run check:typography` — pass; 34 stylesheets scanned, zero literal
  declarations below 10px.
- `npm run tokens:check` — pass; generated CSS/TypeScript outputs match
  `docs/ui/design-tokens.json`.
- `npm run typecheck:app` — the last typography checkpoint passed; a fresh
  rerun on the concurrent September 19 tree is currently blocked by an
  unrelated readonly `messages` fixture in
  `src/features/workspace/command-palette.phase2.test.tsx`.
- Production CSS remains imported through the generated token layer before
  feature styles.

The full test suite may still report failures from concurrent, unrelated UI
work (for example modal focus restoration or duplicate accessible description
queries). Those failures must be resolved by their owning changes before a
release; they are not masked by this gate.

## Follow-up work

1. Add visual regression coverage at 100% and 200% text scaling for Chat,
   Library, Settings, Provider, and Inspector surfaces.
2. Migrate remaining literal 10px values to named roles where the selector is
   informative text rather than an icon-adjacent compact label.
3. Keep `font-size` and line-height changes in the same semantic role so dense
   metadata does not become cramped after localization or zoom changes.
