# Porting a Lumos component to an Antlers partial

Tested on Statamic 6. Each rule below is here because breaking it failed
silently: wrong output, no error.

## Where things go

| Upstream (Astro)                        | Statamic                                          |
| --------------------------------------- | ------------------------------------------------- |
| `src/styles/{base,patterns,utilities}.css` | `resources/css/lumos/…` (verbatim)             |
| `src/styles/global.css`                 | `resources/css/site.css`                          |
| `src/layouts/BaseLayout.astro`          | `resources/views/layout.antlers.html`             |
| `src/components/*/X.astro`              | `resources/views/components/x.antlers.html`       |
| component `<style is:global>`           | `resources/css/components/x.css`, imported in `site.css` with `layer(components)`; the file has no `@layer` wrapper |
| component `<script>`                    | `resources/js/components/x.js`, imported in `resources/js/site.js` |
| `src/assets/icons/*.svg`                | `resources/svg/*.svg`                             |

Names go kebab-case: `ContentWrapper.astro` → `content-wrapper.antlers.html`,
called `{{ partial:components/content-wrapper }}`. Upstream's folders
(`Typography/`, `Wrapper/`…) are dropped.

## Astro → Antlers

| Astro                                   | Antlers                                           |
| --------------------------------------- | ------------------------------------------------- |
| `interface Props` + JSDoc               | YAML front matter, each param with its default (`null` if unset) and a `#` comment with the JSDoc wording |
| `Astro.props.x`                         | `{{ view:x }}` — **always** `view:` |
| `maxWidth`                              | `max_width` (snake_case) |
| `<slot />` / `Astro.slots.has()`        | `{{ slot }}` / `{{ if slot \| trim }}` |
| `<slot name="x" />`                     | `{{ slot:x }}`, filled by `{{ slot:x }}…{{ /slot:x }}` in the call |
| `render={false}`                        | not ported — use Statamic's `:when` / `:unless` on the partial tag |
| `class:list={[…]}`                      | a string built into a `_classes` variable first |
| `set:html={x}`                          | `{{ x }}` (Antlers doesn't escape by default — see `attrs` below) |
| `...rest`                               | not ported — add a named param when one is needed |
| `Astro.url.pathname`                    | `{{ current_uri }}` |
| `<Image>` / `astro:assets`              | Glide (see `img`) |
| `Intl.DateTimeFormat`                   | `{{ date \| iso_format('…') }}` (Carbon, site locale) |
| server-side computation (e.g. counting children) | move to the component's JS, or to Antlers if simple |

Front matter param order: content that changes per instance, `variant`,
variant-only params (say which variant), occasional settings, `class` last.

```antlers
---
# The heading level, for the page outline.
tag: h2
# Type style, chosen apart from `tag`… Unset, it matches `tag`.
variant: null
class: null
---
{{ if slot | trim }}{{ _variant = view:variant ?? view:tag }}
<{{ view:tag }} class="heading text-style-{{ _variant }}{{ if view:class }} {{ view:class }}{{ /if }}">{{ slot | trim }}</{{ view:tag }}>
{{ /if }}
```

## Pitfalls

**Params**
- Read params only as `view:name`. A partial inherits the whole page context:
  a bare `{{ variant }}` or `{{ theme }}` silently picks up an entry field of
  the same name.
- `src` is reserved by the partial tag (it picks the template). Rename that
  param (`icon` → `name`, `video` → `file`).
- Booleans arrive as strings. Pass `reverse="true"` or
  `:reverse="some_field"`; a literal `:reverse="true"` arrives as `null`.
  Read with `{{ if view:reverse | to_bool }}` so `"false"` is false.
- `:render="false"` also arrives as `null` — which is why `render` isn't ported.

**Variables**
- Local variables start with `_` (`{{ _classes = … }}`). An assignment leaks
  into the page context and can shadow a field further down: `{{ items = … }}`
  in one partial broke the next block's `items` loop.
- No tag pairs inside tag params. Build the string into a variable first.
- In ternaries, parenthesise concatenation: `x ? (' ' + y) : ''`.
- Tags can't run inside expressions (`x = (glide …)` fails). Call them in markup.
- A dynamic partial is `{{ partial src="sets/{type}" }}`.

**Loops and data**
- Associative arrays (a field's `options`) loop with
  `{{ foreach :array="options" }}{{ key }}{{ value }}{{ /foreach }}`; a plain
  `{{ options }}` pair treats them as one object.
- Loop a grid/replicator with `scope`:
  `{{ cards scope="card" }}{{ card:heading }}{{ /cards }}`. Without it an
  empty field on a row falls back to the parent's field of the same name.

**Output**
- Output nothing when a required param is missing or the slots are empty.
- A param output unescaped (e.g. `attrs` for `data-*` hooks) is for template
  authors only, never wired to an editor field.
- Icons: `{{ svg src="…" sanitize="false" }}` — the sanitizer strips
  `vector-effect` and similar attributes Lumos icons rely on.

**Images (`img`)**
- Take `image`: an asset goes through Glide with a srcset whose widths match
  upstream's `Img`; a plain path or URL is output as-is.
- Glide crops only when both `width` and `height` are set.

**Scripts**
- Vite bundles each `x.js` once, like Astro. Query all instances
  (`document.querySelectorAll`) and don't assume the component exists on the
  page.

**Forms**
- `form` takes a Statamic form `handle` and loops its blueprint fields into
  the field partials (text → `input` by `input_type`, textarea, select,
  radio/checkboxes → `fieldset` of `choice`, toggle → toggle `choice`).
- Post in the background to the form's own action with
  `Accept: application/json`. Statamic answers JSON; 422 means validation
  errors.

**Layout**
- The `@layer` order statement must be inline in `<head>` (see stage 1).
- Error pages: pass `noindex` into `base-head` when `response_code >= 400`.

## Reference implementation

`~/Sites/lumos4statamic` (branch `lumosfromfigma_baptisten`) has every Lumos
0.0.3 component ported. Use it for **how** a construct translates, never for
class names, tokens or props — those come from upstream HEAD.
