# Visual thesis — The balance field

## Direction and rationale

**Generative geometry, expressed as a financial balance field.** The product turns a hard-to-explain number into a legible path, so its visual language is made from transaction blocks, registration marks, ruled paper, and a single horizontal settlement line. Small squares represent orders; cut-out circles represent refunds; fine amber slivers represent fees; an offset violet block represents timing differences. As evidence is matched, these shapes resolve into one dark bank-deposit bar. The geometry therefore teaches the reconciliation model instead of decorating it.

This is a calm workbench, not a fintech dashboard. There is no generic gradient hero, no glossy card stack, and no decorative stock photography. Borders, alignment, and tabular numbers do most of the visual work.

## Palette

The light theme resembles warm accountant's paper under a neutral lamp; the dark theme resembles an after-hours ledger screen. All foreground/background combinations are targeted at WCAG AA (4.5:1 for body text).

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#F4F0E7` | `#151713` | Page ground |
| `--surface` | `#FFFDF7` | `#20231E` | Working surfaces |
| `--ink` | `#19231D` | `#F3F0E7` | Primary copy |
| `--muted` | `#59635C` | `#B8C0B7` | Secondary copy |
| `--line` | `#B9B9AC` | `#51584F` | Rules and controls |
| `--teal` | `#087568` | `#54D3C2` | Orders, primary actions |
| `--teal-ink` | `#FFFFFF` | `#072C28` | On accent |
| `--amber` | `#B45B07` | `#FFB85C` | Fees and review |
| `--violet` | `#6750A4` | `#C6B5FF` | Timing differences |
| `--success` | `#237A3B` | `#78D48D` | Explained state |
| `--danger` | `#B52E35` | `#FF9CA0` | Errors and unexplained variance |

Color is always paired with words, patterns, or symbols. The user theme defaults to their OS setting and can be explicitly changed.

## Type

- **Interface and prose:** `Inter`, locally hosted variable WOFF2, regular through bold. Its open forms remain clear in dense mapping controls.
- **Figures and evidence:** `IBM Plex Mono`, locally hosted WOFF2. Tabular figures, CSV headers, rule formulas, and identifiers look deliberately machine-verifiable.
- Scale: 14, 16, 18, 24, 36, 56 px with body at 16 px minimum; reading measure is 68 characters.

## Spacing and shape

- 4 px base; core rhythm 8 / 12 / 16 / 24 / 32 / 48 / 64 px.
- Working column max-width 1180 px; prose max-width 68ch.
- Corners are clipped rather than pill-shaped: 2–8 px radii, with one chamfered hero panel. This echoes cut paper and avoids a default framework look.
- Touch targets are at least 44 px. Dense tables switch to stacked evidence rows on narrow screens rather than shrinking type.

## Interaction grammar

The main journey is one continuous numbered rail: **Add files → Map columns → Reconcile → Hand off**. The current step is a filled geometric marker; completed steps become outlined checks. Uploaded files arrive as labeled evidence strips. Mapping previews update in place. Reconciliation results form a vertical waterfall where each adjustment visibly bridges the source total to the expected deposit.

Primary actions use teal fill; quiet actions are ruled text buttons; destructive actions require confirmation and name the affected reconciliation. Every async action reports to a polite live region. The phone layout drops the decorative coordinate labels, stacks figures above labels, and keeps actions in document flow.

## Motion

- 180 ms for control feedback and disclosures; 260 ms for evidence rows entering from their source edge.
- The waterfall reveals top-to-bottom once after calculation, expressing arithmetic sequence. No ambient or looping movement.
- Only opacity and transforms animate. Under `prefers-reduced-motion: reduce`, transitions and scroll behavior become instant and the geometry remains fully legible.
- Offline/update notices appear without motion and never obstruct task controls.

## Asset plan and provenance

1. `public/art/balance-field.webp` and AVIF/PNG companions: an original generated abstract still life showing transaction tiles resolving toward a settlement bar. It clarifies the mental model in the opening state. It contains no people, logos, text, or implied integrations.
2. App icons and interface symbols are original hand-authored SVG geometry using the palette; SVG is preferred for precision and size.

### Image prompt sheet

**Subject:** an abstract top-down financial reconciliation workbench; many precisely cut paper squares and narrow bars flow from three evidence columns into one perfectly aligned horizontal settlement bar; one circular cutout for a refund and a thin amber fee strip; subtle coordinate grid and registration marks.

**World/materials:** tactile archival paper, matte ink, translucent vellum, precision-cut card; editorial still life, generative geometry, restrained Swiss composition with an imperfect human paper texture.

**Light/lens:** soft overcast studio light from upper left, gentle contact shadows, top-down orthographic lens, crisp edges, ample warm-paper negative space.

**Palette words:** warm ivory, carbon green-black, ledger teal, burnt amber, muted violet.

**Negative list:** no text, no numbers, no watermark, no logos, no brands, no people, no hands, no coins, no credit cards, no laptop, no photorealistic banking UI, no gradients, no neon, no 3D chrome, no clutter.

**Generator:** Azure OpenAI image generation via factory `gen-image.sh`, deployment `factory-image`. Generated 2026-08-28. The output is original to this product and is disclosed in the footer. Candidate source and its exact prompt are retained in `assets/src/`.
