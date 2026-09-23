---
name: lumos-extend-system
description: Extend this project's Lumos design system — add a text style, a spacing step, a colour theme or a breakpoint. Use when a design needs a type size, spacing value, theme or breakpoint the tokens don't have yet, or when asked to add a text style, theme or scale step. Not for building pages or components: that is in CLAUDE.md.
---

# Extending the design system

Each of these jobs touches more places than it looks, and a missed one fails
silently: a style that exists as a token but not as a class, a theme whose
buttons are invisible, a spacing step with no utility.

## Before anything: is it needed?

New tokens are the last resort, same as new CSS.

- A type size that is close to an existing one: use the existing one.
- A spacing value between two steps: use the nearer step. The scale is
  deliberately coarse.
- A section that needs different colours once: an existing theme plus
  `theme-invert`, or a utility.

Extend only when the value is needed repeatedly and no existing one is close.

## Where the change goes

| Change | File |
| --- | --- |
| **Changing a value** — a colour, a font, `--space-6-max`, `--h1-min` | `resources/css/lumos/base.css`, in place |
| **Adding something new** — a text style, a theme, a token, a utility | `resources/css/site.css`, inside `@layer base { … }` (utilities: `@layer utilities { … }`) |

The three files in `resources/css/lumos/` started as verbatim copies of
upstream, which is what makes an upgrade a three-way merge. Changed values
conflict on exactly the lines the upgrade touches — that is a conflict worth
having, and it is quick to resolve. Additions kept out of those files mean the
upgrade has nothing to conflict with at all.

Record every extension in the project's `CLAUDE.md`, under `## Lumos`. After
an upgrade, that list is what you re-check.

---

## 1. A new text style

Read `lumos/base.css` sections 1 (`Design tokens`) and 4 (`Text styles`)
first; copy the shape of the nearest existing style rather than writing it
from memory.

**Tokens.** A style needs the full set — copy every `--h3-*` declaration, keep
the `clamp()` line verbatim and only swap the name:

```css
@layer base {
  :root {
    --quote: clamp(…same formula, names swapped…);
    --quote-min: 24;                                   /* px at 320 */
    --quote-max: 32;                                   /* px from 1440 */
    --quote-line-height: var(--line-height-large);
    --quote-letter-spacing: var(--letter-spacing-normal);
    --quote-text-transform: none;
    --quote-text-wrap: pretty;
    --quote-margin-top: var(--space-6);
    --quote-margin-bottom: var(--space-5);
    --quote-font-family: var(--secondary-family);
    --quote-font-weight: var(--secondary-medium);
    --quote-trim-top: var(--secondary-trim-top);
    --quote-trim-bottom: var(--secondary-trim-bottom);
  }
}
```

**Class.** `.text-style-quote`, with the same twelve lines an existing style
has, including the four `--_trim-*` / `--_margin-*` assignments — they drive
leading trim and the space between stacked text.

**Then the partials.** `heading`, `paragraph` and `rich-text` interpolate
`text-style-{variant}`, so no template code changes. What does change:

- the `variant` comment in each partial's front matter, listing the new value
- the choice list in `.vscode/lumos.code-snippets` (`l-heading`,
  `l-paragraph`, `l-rich-text`)
- the blueprint field options, if editors choose the style anywhere

**Check.** Render it at 320px and at 1440px, once alone and once directly
below and above another text block, so the margins and the trim are visible.

---

## 2. A new spacing step

The scale is `--space-1` … `--space-8`, plus `--site-margin`,
`--site-gutter` and `--section-space-small|medium|large`. Before adding a
ninth step, check whether the min/max of an existing one is simply wrong — that
is the more common answer, and it fixes every use at once.

**Token.** `--space-9` with its `clamp()`, `--space-9-min`, `--space-9-max`.

**Utilities.** Only the ones actually used, in `@layer utilities`. The
families that carry the scale are `padding-*`, `padding-block-*`,
`padding-inline-*`, `padding-top|bottom|left|right-*`, `margin-top|bottom-*`,
`margin-block-*`, `gap-*` and `gap-row-*`. Add on demand; a full set of
twelve for one new step is dead weight.

**Then.** The `gap` param on `section` documents the scale in its comment —
extend that list.

**Check.** One utility of each family you added, on a real page.

---

## 3. A new theme

The most error-prone of the four. A theme is not one block but an entry in
three places in `lumos/base.css`, and the new one needs all three.

1. **Its own block** with the full variable set. Copy `.theme-brand` as the
   template — backgrounds 1–3, skeleton, text 1–2, border, heading accent,
   selection, `--button-*`, `--button-2-*`, `--link-*`, each with its hover
   variant, plus `color-scheme`.
2. **The invert groups.** A light theme joins the selector list that starts
   `:root, .theme-light, …` with `.theme-<name> .theme-invert`; a dark theme
   joins `.theme-dark, .theme-light .theme-invert`. This is what makes
   `theme-invert` work inside the new theme, and it is the part that gets
   forgotten.
3. `:root, [class*="theme-"]` already applies `background-color` and `color`,
   so a class named `theme-*` needs nothing there.

Written as an addition:

```css
@layer base {
  .theme-sand {
    color-scheme: light;
    --background: var(--sand-300);
    /* … the full set, copied from an existing light theme … */
  }
  /* theme-invert inside a light theme renders dark */
  .theme-sand .theme-invert {
    /* … the dark theme's variables … */
  }
}
```

**Then.**

- the `theme` comment in the `section` partial's front matter
- the `theme` options in `resources/fieldsets/section.yaml` and any
  page-level theme field
- the choice list in `.vscode/lumos.code-snippets` (`l-section`, `l-block`)

**Check, in the new theme:** a primary and a secondary button including
hover, a text link, a bordered element, a card, form fields, and a
`theme-invert` element inside it. Then the same with the browser in dark mode.

---

## 4. A new breakpoint

Usually the wrong answer. The three are `30rem`, `48rem` and `64rem`,
declared by `grid` and reused everywhere; type and spacing are fluid and need
no breakpoint at all. A fourth one every component would have to honour is a
real cost.

- **One component wraps somewhere else?** Use a one-off `@media` in that
  component's own file, and say why in a comment. No token needed.
- **Genuinely a fourth site-wide step?** It goes into `grid`: a new
  `--_cols-*` variable in the chain (each step falls back to the one below),
  a media query in `grid.css`, a param in the `grid` partial with its comment,
  and the `_style` line that writes it. Then every component that relies on
  the three has to be reviewed.

Prefer the first. Note the exception in the component's CSS so the next reader
knows it was deliberate.

---

## Finishing

1. `npm run build`, then look at the pages — a build catches layer and syntax
   problems the dev server hides.
2. Check at 320px, at 1440px and at each breakpoint.
3. Add the extension to `## Lumos` in `CLAUDE.md`: what was added, where it
   lives, which partials and blueprints list it.

## After a Lumos upgrade

A merge tool cannot see that an upstream rename broke an extension: the merge
succeeds and the value silently stops resolving. So after every upgrade, walk
the recorded list and confirm each extension still refers to tokens that
exist — `grep` the names it builds on in `lumos/base.css` — then build and
look at the pages.
