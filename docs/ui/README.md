# Omnia Desktop UI/UX specification

This folder defines the target **Chat Complete** desktop experience for **Omnia**, a Windows 11 AI workspace. It is a normative design contract, not an inventory of capabilities shipped in the current Phase 1 Provider Preview. The current preview deliberately proves the native chat/provider foundation while reserving stable extension points for the fuller chat product and, later, IDE, browser, computer-use, and coding-agent capabilities.

## Documents

- `product-ui-spec.md` — information architecture, screens, flows, interaction behavior, responsive rules, accessibility, and quality bar.
- `component-contracts.md` — implementation-facing component states and data contracts.
- `icon-system.md` — product mark, utility/product icon layers, semantic rules, and review gate.
- `design-tokens.json` — executable semantic design token source of truth for light, dark, system, density, and responsive values.
- `phase-1-acceptance.md` — the historical filename for the Chat Complete UI acceptance backlog; unchecked items are requirements, not Phase 1 Provider Preview claims.
- `../research/OFFICIAL_UI_REFERENCE_REFRESH.md` — informative official-source refresh for Codex/Claude Code hierarchy, multi-agent attention surfaces, run/tool compression, composer behavior, side questions, prompt suggestions, role icons, and visual regression gates. It is design input, not a shipped-capability claim or a license to copy vendor visuals.

## Product experience thesis

Omnia should feel like a native, quiet, highly capable Windows workspace rather than a website inside a window. The UI reveals complexity progressively:

1. A new user can connect one provider and send a message in under two minutes.
2. At the Chat Complete boundary, a power user can control provider routing, sampling parameters, context, tools, memory, and reusable skills without leaving the conversation.
3. Every model action exposes just enough state to remain understandable and recoverable.
4. Projects and read-only folder grants are native objects in the current preview; memory and skills become first-class native objects only when their later lifecycle phases ship.
5. The shell remains stable when IDE, browser, terminal, agent, and computer-use surfaces arrive in later phases.

## Scope boundary

The target chat product includes chat, projects, workspace folders, attachments, model/provider selection, BYOK onboarding, artifacts, search, branches, memory, skills, advanced generation parameters, usage visibility, export/import, and settings. The current Phase 1 Provider Preview implements only the subset recorded in [`../IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md): native provider text streaming, initial durable conversations/runs, project metadata, and read-only workspace grants, plus clearly labeled preview or planned UI for later workflows. In particular, workspace content is not indexed or injected, and memory/skills do not have native lifecycle or runtime injection. IDE, browser automation, terminal execution, coding-agent execution, and computer-use are future capabilities and are not simulated as working features.

## Executable token workflow

Runtime foundations and TypeScript media-query constants are generated from
`design-tokens.json`:

```powershell
npm run tokens:generate
npm run tokens:check
```

The generated outputs are:

- `src/styles/tokens.generated.css` — semantic CSS custom properties.
- `src/design-system/tokens.generated.ts` — numeric breakpoint and density constants.

Do not edit generated files directly. `npm run check` runs the parity gate and
fails when either output drifts from the source token document. `tokens.css`
contains only product-specific derived/compatibility values that have not yet
been promoted into the executable schema.
