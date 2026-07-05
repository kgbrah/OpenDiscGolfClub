# OpenDiscGolfClub

Drop-in web components for disc golf club websites. Use the full club suite or only the widgets you need: courses, events, tournaments, membership, contacts, members, and league records.

OpenDiscGolfClub works without third-party services. Optional integrations only activate when you add them to your config.

## Quick Start

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/kgbrah/OpenDiscGolfClub@main/dist/index.mjs"></script>

<open-disc-golf-club config-url="/club.config.json"></open-disc-golf-club>
```

Or install from npm after the package is published:

```bash
npm install open-disc-golf-club
```

```ts
import "open-disc-golf-club"
```

## Guided Setup

```bash
npx open-disc-golf-club setup
```

The wizard creates `open-disc-golf-club.config.json`, asks which optional integrations you want, and prints the exact embed snippet for your existing site.

## Use Individual Widgets

```html
<odgc-courses config-url="/club.config.json"></odgc-courses>
<odgc-events config-url="/club.config.json"></odgc-events>
<odgc-tournaments config-url="/club.config.json"></odgc-tournaments>
<odgc-membership config-url="/club.config.json"></odgc-membership>
<odgc-members config-url="/club.config.json"></odgc-members>
<odgc-league config-url="/club.config.json"></odgc-league>
```

## Optional Integrations

| Integration | Required? | What it enables |
| --- | --- | --- |
| Google Sheets published CSV | No | Load events, tournaments, members, or simple lists without redeploying |
| PayPal | No | Membership checkout button |
| UDisc links | No | Course action buttons |
| Google Maps directions | No | Course direction buttons from map URLs or coordinates |
| YouTube links | No | Course preview buttons |
| PDGA player links | No | Member profile links |
| Client-side password gate | No | Lightweight member-directory privacy for low-risk club pages |

See `docs/integrations/` for guided setup for each option.

## Config Shape

Start with `examples/basic/club.config.json`. Every section can use inline data first, then switch to a source later:

```json
{
  "club": {
    "name": "River City Disc Golf Club",
    "tagline": "Weekly leagues, local courses, and community events",
    "location": "River City, NC"
  },
  "events": {
    "title": "Upcoming Events",
    "items": [
      {
        "title": "Saturday Singles",
        "date": "2026-08-08",
        "description": "Check in at 9:00 AM. All skill levels welcome."
      }
    ]
  }
}
```

To use Google Sheets, publish the sheet as CSV and add:

```json
{
  "events": {
    "source": {
      "kind": "googleSheetsCsv",
      "url": "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
    }
  }
}
```

## Styling

Each component uses Shadow DOM and CSS custom properties, so it will not leak styles into the host site. Override tokens on the element:

```css
open-disc-golf-club {
  --odgc-primary: #ff6b35;
  --odgc-secondary: #2d5016;
  --odgc-radius: 16px;
}
```

The full token contract is in `DESIGN.md`.

## Local Development

```bash
bun install
bun run build
bun run test
bun run dev
```
