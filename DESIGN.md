# OpenDiscGolfClub Design System

## 1. Atmosphere & Identity

OpenDiscGolfClub feels like a practical club bulletin board upgraded for modern sites: clear, friendly, and easy to scan before a round. The signature is an outdoor scorecard surface: white or deep green panels, fairway green structure, orange action points, compact stats, and card layouts that can live inside another club's existing website without taking over the whole page.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
| --- | --- | --- | --- | --- |
| Surface/primary | --odgc-surface | #f8faf7 | #111812 | Component background |
| Surface/secondary | --odgc-panel | #ffffff | #172117 | Cards, sections |
| Surface/elevated | --odgc-elevated | #ffffff | #1f2c20 | Popovers and highlighted cards |
| Text/primary | --odgc-text | #192319 | #f4f7f0 | Headlines and body |
| Text/secondary | --odgc-muted | #5d6b5f | #b8c4b6 | Supporting text |
| Text/tertiary | --odgc-subtle | #879184 | #84917f | Disabled and hints |
| Border/default | --odgc-border | #dde5d8 | #31402d | Cards and dividers |
| Accent/primary | --odgc-primary | #ff6b35 | #ff8a5c | CTAs, links, active tabs |
| Accent/secondary | --odgc-secondary | #2d5016 | #79a65d | Badges and stats |
| Accent/info | --odgc-info | #004e89 | #58a6d6 | Informational links |
| Status/success | --odgc-success | #2f7d32 | #5fbf64 | Confirmations |
| Status/warning | --odgc-warning | #d99b00 | #f0bd34 | TBD and alerts |
| Status/error | --odgc-error | #b3261e | #ff8a80 | Load failures |

### Rules

- Surface color must stay neutral enough to embed in an existing site.
- Orange is reserved for primary actions, active states, and focus.
- Third-party services get text labels, not brand-colored noise unless they are the primary action.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
| --- | --- | --- | --- | --- | --- |
| Display | 40px | 800 | 1.1 | 0 | Full suite title |
| H1 | 32px | 800 | 1.15 | 0 | Section headers |
| H2 | 24px | 700 | 1.25 | 0 | Group titles |
| H3 | 18px | 700 | 1.35 | 0 | Card titles |
| Body/lg | 17px | 400 | 1.6 | 0 | Intro copy |
| Body | 16px | 400 | 1.55 | 0 | Default copy |
| Body/sm | 14px | 400 | 1.45 | 0 | Metadata |
| Caption | 12px | 700 | 1.35 | 0.04em | Labels and badges |

### Font Stack

- Primary: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace

### Rules

- The package must not force remote fonts on host sites.
- Headings use weight and spacing, not decorative display fonts.

## 4. Spacing & Layout

### Base Unit

All spacing derives from 4px.

| Token | Value | Usage |
| --- | --- | --- |
| --odgc-space-1 | 4px | Tight icon-to-label gaps |
| --odgc-space-2 | 8px | Compact inline gaps |
| --odgc-space-3 | 12px | Inputs and badges |
| --odgc-space-4 | 16px | Card internal rhythm |
| --odgc-space-5 | 20px | Compact section padding |
| --odgc-space-6 | 24px | Default card padding |
| --odgc-space-8 | 32px | Grid gaps |
| --odgc-space-10 | 40px | Section rhythm |
| --odgc-space-12 | 48px | Major section breaks |

### Grid

- Max content width: 1120px
- Cards: responsive grid using minmax(220px, 1fr) or minmax(280px, 1fr)
- Breakpoints: 640px, 768px, 1024px

### Rules

- Components must work in narrow embeds as well as full-width pages.
- No viewport-scaled font sizes. Use fixed scale plus wrapping.

## 5. Components

### Section

- **Structure**: section wrapper, optional eyebrow, heading, description, body grid or table.
- **Variants**: standard, compact, full-suite.
- **Spacing**: --odgc-space-6 to --odgc-space-10.
- **States**: loading, empty, error.
- **Accessibility**: heading hierarchy stays inside the host page context.
- **Motion**: opacity and translate entrance only when the host has not requested reduced motion.

### Card

- **Structure**: header, body, footer actions.
- **Variants**: course, event, stat, contact, member, membership.
- **Spacing**: --odgc-space-4 or --odgc-space-6.
- **States**: default, hover, focus-within, disabled for missing integrations.
- **Accessibility**: links are real anchors, buttons are real buttons.
- **Motion**: hover lift uses transform only.

### Button Link

- **Structure**: anchor or button with label and optional small metadata.
- **Variants**: primary, secondary, quiet.
- **Spacing**: --odgc-space-3 inline padding, --odgc-space-4 block padding.
- **States**: default, hover, active, focus, disabled.
- **Accessibility**: visible focus ring with --odgc-primary.
- **Motion**: 150ms transform and color.

### Data Table

- **Structure**: scroll container, table, caption, thead, tbody.
- **Variants**: leaderboard, season results.
- **Spacing**: compact row padding with --odgc-space-3.
- **States**: default, hover row, empty.
- **Accessibility**: table captions and sortable controls use buttons.
- **Motion**: none.

### Setup Callout

- **Structure**: title, one-line status, ordered action list or code snippet.
- **Variants**: Google Sheets, PayPal, UDisc/Maps/YouTube, PDGA, password gate.
- **Spacing**: --odgc-space-4.
- **States**: incomplete, ready.
- **Accessibility**: code remains selectable text.
- **Motion**: none.

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
| --- | --- | --- | --- |
| Micro | 120ms | ease-out | Button press |
| Standard | 200ms | ease-in-out | Card hover and filter updates |
| Emphasis | 360ms | cubic-bezier(0.16, 1, 0.3, 1) | Section entrance |

### Rules

- Only transform and opacity may animate.
- Every action has hover, active, and focus states.
- Reduced motion disables entrance and hover lift.

## 7. Depth & Surface

### Strategy

Mixed: subtle borders by default, restrained shadows only for card hover and elevated callouts.

| Level | Value | Usage |
| --- | --- | --- |
| Subtle | 0 1px 2px rgba(25, 35, 25, 0.05) | Resting cards |
| Default | 0 10px 28px rgba(25, 35, 25, 0.12) | Hovered cards |
| Prominent | 0 20px 60px rgba(25, 35, 25, 0.22) | Popovers if added |

### Rules

- Embeds should feel contained but not boxed inside another card.
- Shadow is interaction feedback, not decoration.

