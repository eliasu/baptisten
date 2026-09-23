# Project CLAUDE.md template

Write this into the new project's `CLAUDE.md` in stage 1 and keep it current.
Fill `<…>` from upstream. Copy the component and style rules from upstream's
`LUMOS.md` at the same commit, translated to Antlers terms (component →
partial, prop → param, `<style is:global>` → `resources/css/components/x.css`).
Don't copy them from this file or from an older project.

````markdown
# <Project>

Statamic 6 (Antlers), styled with **Lumos for Astro**
(https://lumosframework.com/docs), ported to Antlers. Not Lumos for Webflow:
ignore any Webflow Lumos skill. No Tailwind.

## Lumos

- Upstream: `lumosframework/lumos-for-astro` @ `<short hash>` (<version>, <date>)
- Stages: <foundation | + components | + CMS>
- CMS mode: <A code-only | B content blocks>
- Client-facing language: <German | English> (CP labels, instructions,
  visible text; code and handles stay English)
- Ported: <component list>
- Blocks: <handle — what it shows, one per line>
- Extensions: <text styles, themes, spacing steps added beyond upstream, and
  where they live — this is the list to re-check after an upgrade>

Adding a text style, spacing step, theme or breakpoint: use the
`lumos-extend-system` skill in `.claude/skills/`. Changed values go in
`resources/css/lumos/base.css`; additions go in `resources/css/site.css`
inside `@layer base { … }`, so the upstream files stay verbatim.

The three files in `resources/css/lumos/` started as verbatim copies. Tokens
are edited there. To upgrade, run a three-way merge against the commit above,
then update the hash. The `lumos-statamic` skill does this.

| Lumos (Astro)                  | Here                                            |
| ------------------------------ | ----------------------------------------------- |
| `src/styles/base.css` …        | `resources/css/lumos/…`                         |
| `src/styles/global.css`        | `resources/css/site.css`                        |
| `src/layouts/BaseLayout.astro` | `resources/views/layout.antlers.html`           |
| `src/components/*/X.astro`     | `resources/views/components/x.antlers.html`     |
| component `<style is:global>`  | `resources/css/components/x.css`                |
| component `<script>`           | `resources/js/components/x.js`                  |
| `src/assets/icons/*.svg`       | `resources/svg/*.svg`                           |

The cascade order is `<from global.css>`. The inline `<style>@layer …;</style>`
in `<head>` must stay, because the minifier drops the order statement.

## Writing partials

<Condensed pitfalls from the skill's antlers-porting.md: view:, booleans,
_locals, scope, src reserved, no tag pairs in params.>

## CMS

The client edits content, never design. The only choice they get is
`background` light/dark. <Mode-specific notes.>

## Building pages / custom components / style checklist

<From upstream LUMOS.md, translated.>
````
