---
name: lumos-statamic
description: Set up Lumos for Astro (lumosframework.com, not Lumos for Webflow) in a Statamic 6 site with Antlers templates, in stages — tokens and themes first, then a chosen set of components ported to Antlers partials, then a CMS mode (code-only, or content blocks clients can fill but not style). Use when starting a Statamic project on Lumos, adding Lumos components to one, porting an Astro component to Antlers, or building a client-safe page builder on Lumos.
---

# Lumos for Statamic

Lumos for Astro is plain CSS (custom properties, cascade layers) plus Astro
components. This skill moves it into Statamic: the CSS verbatim, the
components as Antlers partials, and a CMS the client can fill without
making design decisions.

**Never take Lumos from memory or from an earlier project.** Class names,
tokens, utilities, props and component markup change between versions. Every
run starts from upstream HEAD, and everything Lumos-specific is read from
there. This skill only holds what stays true across versions: how Astro maps
to Antlers, where Statamic trips you up, and how the CMS is shaped.

## 0. Get upstream and find where the project stands

```bash
git clone --depth 1 https://github.com/lumosframework/lumos-for-astro <scratchpad>/lumos
git -C <scratchpad>/lumos rev-parse --short HEAD
```

Read upstream's `LUMOS.md` (how to build with Lumos: component rules, style
checklist) and `CLAUDE.md` before anything else. They override anything this
skill says about Lumos conventions.

Then read the project's `CLAUDE.md`. If it has a `## Lumos` block (see
`references/project-claude-md.md`), it records the commit, the stages done,
the ported components and the CMS mode — continue from there and only add
what is missing. If the recorded commit is older than HEAD, say so and offer
an upgrade (upstream's `lumos-upgrade-version` skill, paths translated)
before porting anything new: components from two versions don't mix.

Ask what is still open, in one go (AskUserQuestion):

1. **Stage** — foundation only, + components, + CMS.
2. **Components** — offer the list from upstream `src/components/**` (grouped
   by folder). Show what each pulls in (see stage 2).
3. **CMS mode** — A: code-only, or B: content blocks. See stage 3.
4. **Language** — German or English, for everything the client and visitors
   see: field labels, instructions, block names, option labels, navigation
   and global set titles, form messages, button and ARIA text written into
   partials, and the site locale (`config/statamic/sites.php`: `locale`,
   `lang`). Code, class names, handles and comments stay English. The
   control panel's own UI language is a per-user preference; tell the user
   to set it for the client's account.

## Stage 1 — Foundation

Tokens, fluid type and spacing, themes, text styles. After this the site can
be hand-coded with Lumos classes.

1. Copy `src/styles/base.css`, `patterns.css`, `utilities.css` **verbatim**
   to `resources/css/lumos/`. Tokens are edited there afterwards, never
   overridden elsewhere — the verbatim start is what makes a three-way
   upgrade possible later.
2. Build `resources/css/site.css` from upstream `src/styles/global.css`: the
   `@layer` order statement, the three imports with `layer(…)`, then one
   `@import "./components/x.css" layer(components);` per component.
3. Fonts: upstream uses Astro's font API (see `astro.config.mjs`), which sets
   a `--font-*` variable that `base.css` reads. Replace it with self-hosted
   `@font-face` in `site.css` (woff2 in `resources/fonts/`, no Google Fonts
   CDN — GDPR) and set that same variable on `:root`.
4. Layout: port `src/layouts/BaseLayout.astro` to
   `resources/views/layout.antlers.html`, with `BaseHead` and `SkipLink` as
   partials (stage 2 rules). The page theme goes on `<html>` as a class.
5. **Keep the layer order inline in `<head>`**:
   `<style>@layer base, patterns, components, utilities;</style>` (use the
   order upstream's `global.css` declares). Vite's minifier drops the order
   statement from the built CSS; without it `components` lands after
   `utilities` and utilities stop winning. Only shows in `npm run build`.
6. `vite.config.js`: inputs `resources/css/site.css` and
   `resources/js/site.js`; add `server.watch.ignored` for
   `**/storage/framework/views/**` and `**/storage/statamic/**`, or Antlers'
   cache writes trigger reload loops.
7. Icons: `src/assets/icons/*.svg` → `resources/svg/`.
8. Install the `lumos-extend-system` skill into the project's
   `.claude/skills/` (copy it from this skill's `bundled/` directory). It
   covers adding a text style, spacing step, theme or breakpoint later —
   rare, mechanical work that shouldn't sit in `CLAUDE.md`.
9. Write the project's `CLAUDE.md` from `references/project-claude-md.md`,
   including the three lines that point at that skill.

Check: `npm run build`, open a page, confirm a `theme-*` class and a
`text-style-*` class render with upstream's values, and that a utility beats
a component rule.

## Stage 2 — Components

Port only what was chosen, plus what it depends on:

- Follow the component's `import` lines (e.g. `Card` pulls in `Eyebrow`,
  `Heading`, `Paragraph`, `Button`, `ButtonWrapper`, `Img`, `Overlay`) and
  repeat for each.
- Always port `Section` and `ContentWrapper` — every page and every block
  uses them. `BaseHead` and `SkipLink` came with stage 1.

For each component: `references/antlers-porting.md` has the mapping and
every pitfall. Keep the Lumos name, markup and class list so upstream's docs
(https://lumosframework.com/docs) still apply. Mark every necessary deviation
with a `Statamic port:` comment.

Check each in the browser at every width it wraps at (the breakpoints
upstream's `Grid` declares), and against the Astro original where in doubt:
`npm install && npm run dev` in the upstream clone.

## Stage 3 — CMS

The client edits content, never design. The only design choice they get is a
section background, light or dark. Spacing, alignment, variants, heading
sizes, button styles: all decided in templates.

- **A — code-only.** Pages are hand-built templates from partials. The CMS
  holds fields, collections and globals — no builder. Pick when every page is
  designed individually.
- **B — content blocks.** A replicator of semantic blocks (Hero, Text & image,
  Team, FAQ…), each with content fields only plus `background`. Pick when the
  client needs to create pages themselves.

Both are in `references/cms-modes.md`. Mix freely: a hand-built home page
next to block-built subpages is normal.

Not offered: a builder exposing Lumos' section settings (theme, padding,
variants) to editors — too many design decisions for clients. If the user
asks for one, build it, but name the cost.

## Finish

Update the `## Lumos` block in the project's `CLAUDE.md`: commit, stages,
components, CMS mode, blocks. Copy upstream's `.claude/skills/lumos-*` into
the project's `.claude/skills/` only if the user wants them — they speak
Astro paths; the table in the project `CLAUDE.md` translates.
