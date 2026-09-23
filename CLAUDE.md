# baptisten.schöneberg

Statamic 6 (Antlers), styled with **Lumos for Astro**
(https://lumosframework.com/docs), ported to Antlers. Not Lumos for Webflow:
ignore any Webflow Lumos skill. No Tailwind.

## Lumos

- Upstream: `lumosframework/lumos-for-astro` @ `1a8e177` (0.0.3, 2026-09-23)
- Stages: foundation + components + CMS
- CMS mode: A and B mixed — the home page is hand-built, every other page is
  built from blocks
- Client-facing language: German (CP labels, instructions, visible text; code
  and handles stay English)
- Ported: every upstream component except `NavLink` and `FormattedDate`
  (`NavLink` is inlined into `nav`, since the links come from a Statamic
  navigation). `Section`, `ContentWrapper`, `BaseHead` and `SkipLink` came
  with the foundation.
- Blocks: hero — Kopfbereich, the auftakt of a page
  cta — Handlungsaufruf, a heading with buttons
  text — Fließtext, rich text with an optional heading
  text_image — Text & Bild, two columns, image on the right
  cards — Karten, a grid of cards
  accordion — Fragen & Antworten
  tabs — Reiter
  gallery — Galerie, a slider of images
  logos — Logo-Laufband, a marquee
  form — Formular, a Statamic form
- Tokens in `resources/css/lumos/base.css` carry the site's own design, ported
  from Figma (`lumos-import-figma`): DM Sans for body and sans headings,
  Cormorant Garamond for `display`/`h1`–`h3`, cream `--light-200` as the page,
  white `--light-100` as the second surface, navy `--dark-900`, orange
  `--brand-500`. Radii are 0 throughout.
- Extensions live in `resources/css/site.css` under `@layer base`:
  `--secondary-*` (the Cormorant family, weights and trim), `--accent-dark`
  (a darkened orange for accent *text* on light, which clears AA where
  `--brand-500` does not) and `--text-tiny` / `.text-style-tiny` (the 11–12px
  uppercase label the eyebrows and the archive note use).
- Each theme defines `--accent`, the eyebrow colour: darkened orange on light,
  orange on dark, white on brand.
- The wordmark is the site name set in DM Sans, not an SVG — `resources/svg/logo.svg`
  is unused and still Lumos'.
- Sections alternate the two light surfaces: cream by default, white with the
  `background-2` utility on the section.

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
| component `<script>`           | `resources/js/components/x.ts`                  |
| `src/assets/icons/*.svg`       | `resources/svg/*.svg`                           |

The cascade order is `base, patterns, components, utilities`. The inline
`<style>@layer …;</style>` in `base-head` must stay: the minifier drops the
order statement from the built CSS, and without it the component files —
imported after the utilities — would beat the utilities.

Component scripts are upstream's TypeScript, renamed `.ts`; Vite transpiles
them. `resources/js/site.ts` imports one per component.

## Writing partials

- Read params **only** as `view:name`. A bare `{{ variant }}` or `{{ theme }}`
  silently picks up an entry field of the same name.
- `src` is reserved by the partial tag. Renamed params: `icon` → `name`,
  `img` → `image`, `video` → `file`.
- Booleans arrive as strings. Pass `reverse="true"` or `:reverse="field"` —
  a literal `:reverse="true"` arrives as `null`. Read with
  `{{ if view:x | to_bool }}`.
- `render` isn't ported (`:render="false"` arrives as `null`). Use `:when` /
  `:unless` on the partial tag.
- Local variables start with `_`. An assignment without it leaks into the page
  context and can shadow a field further down.
- No tag pairs inside tag params — build the string into a variable first.
  Tags can't run inside expressions either.
- Loop a grid or replicator with `scope`: `{{ cards scope="card" }}`. Loop
  meta variables (`first`, `index`, `count`) stay unscoped.
- Looping an **assets** field gives the asset's fields, not the asset. Build
  `['id' => id, 'url' => url, 'width' => width, …]` and hand that to `img`;
  it takes `view:image:id` for Glide. A single-file assets field can be
  passed straight through.
- Icons: `{{ svg src="…" sanitize="false" }}` — the sanitizer strips
  attributes Lumos icons rely on.
- Output nothing when a required param is missing or the slots are empty.
- A param output unescaped (`attrs`) is for template authors only, never
  wired to an editor field.
- Deviations from upstream carry a `Statamic port:` comment.

## CMS

The client edits content, never design. The only choice they get is
`background`, light or dark. Spacing, alignment, heading sizes, variants and
button styles are fixed in templates.

- Blocks live in `resources/blueprints/collections/pages/pages.yaml`, one set
  each, grouped Einstieg / Inhalt / Medien / Kontakt. Every set imports
  `resources/fieldsets/background.yaml`, and any set with buttons imports
  `buttons.yaml` (at most two; the first renders primary, the second
  secondary — style follows position).
- `resources/views/default.antlers.html` wraps each block in one `section` and
  decides theme, padding and gap. Set templates in `resources/views/sets/`
  hold the contents only, built from component partials.
- The home page uses the `home` blueprint (`hide: true`, so it isn't offered
  for new pages) and the hand-built `resources/views/pages/home.antlers.html`.
  Add a page type the same way: a blueprint, a hidden `template` default, a
  template under `pages/`.
- Every field carries instructions and, where the design has a limit, a
  `character_limit`. Bard is held to bold, italic, link and lists.
- Nav and footer come from the `main` and `footer` navigations. SEO fallbacks
  come from the `seo` global; every page has its own SEO tab.
- `alt` is required in the asset blueprint. Images crop around the focal
  point (`fit="crop_focal"`), never with a crop setting.
- Clients can only be kept out of blueprints on Statamic **Pro**. On Solo
  there is one super admin.

### Adding a block

Add the set to `pages.yaml` (content fields plus `import: background`), write
`resources/views/sets/{handle}.antlers.html` from component partials, and add
a line to the block list above. Fill it with the longest content the limits
allow, then with only the required fields; try both backgrounds; look at every
breakpoint.

## Building pages

- Compose from partials. Write raw markup only for what none of them cover.
- Most sections need no new component: a `section`, a `content-wrapper` inside
  it, then `eyebrow`, `heading`, `paragraph` and `button-wrapper`. Prefer
  `content-wrapper` to a plain `div`: it ties text and flex alignment to one
  `--_alignment` variable everything inside reads.
- Anything needing custom CSS or script becomes its own component partial,
  with `resources/css/components/x.css` imported in `site.css` under
  `layer(components)` and, if it needs one, `resources/js/components/x.ts`
  imported in `site.ts`.
- Build a custom component's insides from partials too — a `heading` rather
  than an `h2` with a class.
- Wrap the contents by default, not the section, leaving the section's params
  free to differ per page. Name it `content-` then the type then the variant
  (`content-blog-hero`). Wrap the whole section only when the styles act on
  the section itself — a background image, a pinned full-height scroll — and
  name it `section-` the same way.
- Text identical on every page stays in the partial; text that differs per
  instance is a param.

## New style checklist

- [ ] Isn't already available as a variant. New CSS is the last resort.
- [ ] Utilities override **one** instance of a variant. The moment several
      have to hold together to make a look, that look is a variant.
- [ ] Doesn't repeat the same utility or param value on every instance — that
      means the default is wrong. Fix it at the source: a token in
      `resources/css/lumos/base.css`, or the param's default in the partial.
- [ ] Ships in its own component's CSS file. A page carries no CSS.
- [ ] Root class ends in `_wrap` (`.blog-gallery_wrap`), every child prefixed
      with the family name (`.blog-gallery_layout`). A variant is a bare class
      beside the root. A primitive with no children is its own name
      (`.heading`, `.section`) — nothing in `patterns.css` has an underscore.
- [ ] Names children for their role, never their mechanism: `_layout`, not
      `_grid`.
- [ ] Carries a pattern class beside the custom one where one fits
      (`text-style-h3`, `theme-invert`), leaving the custom class to hold only
      what it overrides.
- [ ] Styles emphasis inside a heading from the parent
      (`.heading-accent strong`), not by classing the `strong` — rich text
      can't carry a class.
- [ ] Uses no `px`. Lengths are `rem`, a max width on text is `ch`, and
      anything tracking the font size is `em`.
- [ ] Keeps each media query nested in the rule it changes, one query shared
      across the component, at the breakpoints `grid` declares (30rem, 48rem,
      64rem) — read from there, not from memory.
- [ ] Doesn't lean on a nested partial's own media queries: leave `grid`'s
      column params unset and be responsive from your own class.

## Development

```
npm run dev      # Vite, with hot reload
npm run build    # production assets
php please stache:clear
```
