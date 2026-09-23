# CMS modes

One rule for both: **the client edits content, never design.** A field that
changes how something looks, not what it says, doesn't go in the CMS. The one
exception is a section's background, light or dark.

Spacing, alignment, heading sizes, variants, button styles and image
position are fixed in templates. Where a design needs two layouts, make them
two blocks named for their content ("Quote", "Text & image"), not a variant
select.

## Rules for every field

- **Instructions** on every field. Labels, instructions, option labels and
  block names are in the language chosen in step 0. Handles stay English
  (`background`, not `hintergrund`).
- **`character_limit`** on headings, eyebrows and button labels, sized to
  what the design holds without breaking.
- **Bard stays small**: `buttons: [bold, italic, anchor, unorderedlist,
  orderedlist]`, plus `h2`/`h3` only when the design styles them inside rich
  text. No alignment, colours, tables or inline images.
- **Buttons**: label + `link` field, at most two. Style follows position: the
  first is primary, the second secondary.
- **Images**: `assets` with `max_files: 1`. Make `alt` required in the asset
  container's blueprint. Crop around the focal point
  (`fit="crop_focal"` in Glide), not with a crop setting.
- **Required** where the template needs the field. Templates still output
  nothing when it's empty.
- **Clients can't change blueprints only on Statamic Pro.** Solo has one user,
  a super admin. On Pro, give the client a role without access to
  blueprints, fieldsets, navigation structure or globals they shouldn't touch.
- Nav and footer come from Statamic navigations (`main`, `footer`). SEO
  fallbacks come from an `seo` global set, and every page gets an SEO tab
  (`meta_description`, `og_image`, `noindex`).

## Mode A — code-only

Pages are built in templates from partials. The CMS holds the content.

- **One blueprint per page type** (home, about, contact…), with only the
  fields that page shows and a hidden `template` field that defaults to its
  template, e.g. `pages/home`.
- **Repeated content gets its own collection**, not a list field: team
  members, events, services. The template loops the collection and the
  client adds entries.
- **Site-wide text goes in globals** (address, opening hours, footer tagline).
- Templates compose `section` → `content-wrapper` → typography partials and
  pass fields in as params: `{{ partial:components/heading tag="h1" }}{{ title }}{{ /partial:components/heading }}`.

## Mode B — content blocks

The client builds pages from a replicator of semantic blocks. Each block has
content fields plus `background`.

### Blueprint

`resources/blueprints/collections/pages/page.yaml`: `title`, a `blocks`
replicator, SEO tab. Sets are grouped (Intro, Content, Media, Contact) with an
icon and a one-line instruction saying what the block shows.

`resources/fieldsets/background.yaml`, imported into **every** set:

```yaml
title: Background
fields:
  -
    handle: background
    field:
      type: button_group
      display: Background
      options:
        light: Light
        dark: Dark
      default: light
```

Every set needs every field its template reads. A missing field falls back to
the page context. If the page blueprint ever gets a field of the same name,
import with `prefix: section_`.

### Rendering

`resources/views/default.antlers.html` wraps every block in one `section`.
The section's settings come from here, not from the editor:

```antlers
{{ _padding_top = ['hero' => 'large'] }}
{{ blocks }}
    {{ partial:components/section :theme="background == 'dark' ? 'dark' : 'inherit'" :padding_top="_padding_top[type] ?? 'medium'" }}
        {{ partial src="sets/{type}" }}
    {{ /partial:components/section }}
{{ /blocks }}
```

Read upstream `base.css` for the theme names that exist and pick which
Lumos theme `dark` maps to, e.g. `dark` or `brand`. Blocks that aren't
sections, such as a modal, skip the wrapper with an `{{ if type == … }}`.

### Set templates

`resources/views/sets/{handle}.antlers.html`. These are Lumos's *content
components*: they hold the contents, never the section.

- They are built only from component partials. Heading tags and variants,
  paragraph sizes and button styles are all fixed here.
- This is the one place fields are read bare (`{{ heading }}`). Pass them into
  partials as params.
- Loop inner lists with `scope`: `{{ cards scope="card" }}`.
- Shared markup such as the button row goes in `sets/_buttons.antlers.html`.

### Adding a block

Add the set to the blueprint and write `sets/{handle}.antlers.html`. Add a
Lumos variant or a custom component only when the existing ones can't do it.
Then add one entry per block to the project's `CLAUDE.md`.

### Check

Fill each block with the longest content the limits allow, then with only
the required fields. Try both backgrounds. Look at every breakpoint.
