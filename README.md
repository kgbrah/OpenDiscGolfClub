# OpenDiscGolfClub

OpenDiscGolfClub is a drop-in toolkit for disc golf club websites. It packages the reusable parts of a modern club site as framework-free Web Components, so a club can add courses, events, tournaments, memberships, contacts, member directories, and league records to an existing website without rebuilding the site around a new app framework.

It is designed for simple adoption first:

- Use a single full-site club component or pick only the widgets you need.
- Start with static JSON config checked into your site.
- Turn on third-party services only when a club chooses to use them.
- Embed from the public GitHub build, npm, or a bundled app.
- Style with CSS custom properties without leaking styles into the host site.

## Features

### Drop-In Web Components

Use the full suite:

```html
<open-disc-golf-club config-url="/club.config.json"></open-disc-golf-club>
```

Or use individual widgets:

```html
<odgc-courses config-url="/club.config.json"></odgc-courses>
<odgc-events config-url="/club.config.json"></odgc-events>
<odgc-tournaments config-url="/club.config.json"></odgc-tournaments>
<odgc-membership config-url="/club.config.json"></odgc-membership>
<odgc-contact config-url="/club.config.json"></odgc-contact>
<odgc-members config-url="/club.config.json"></odgc-members>
<odgc-league config-url="/club.config.json"></odgc-league>
```

### Club Content Sections

- Club name, tagline, location, and stat cards.
- Course groups with holes, rating, round time, difficulty, descriptions, and optional actions.
- Upcoming events with inline JSON or Google Sheets CSV data.
- Area tournaments with inline JSON or Google Sheets CSV data.
- Membership benefits with optional payment or join link.
- Contact cards for email, social links, and local information.
- Member directory with search, filters, optional PDGA links, and optional lightweight gate.
- League records with champions, all-time leaderboard, and latest season results.
- Optional integration status summary so maintainers can see what is enabled.

### Optional Integrations

OpenDiscGolfClub works without any third-party service. Integrations are activated only by config fields.

| Integration | Required? | What it enables |
| --- | --- | --- |
| Google Sheets published CSV | No | Events, tournaments, members, or records managed by volunteers |
| PayPal | No | Membership checkout button |
| External join URL | No | Link to any hosted membership form or checkout |
| UDisc course URLs | No | Course action buttons |
| Google Maps directions | No | Course directions from map URLs or coordinates |
| YouTube URLs | No | Course preview buttons |
| PDGA numbers | No | Member profile links |
| Client-side member gate | No | Low-risk privacy for member directory pages |

Guides live in `docs/integrations/`.

## Quick Start

Use the current GitHub build directly from an existing HTML page:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/kgbrah/OpenDiscGolfClub@main/dist/index.mjs"></script>

<open-disc-golf-club config-url="/club.config.json"></open-disc-golf-club>
```

Create `/club.config.json` beside your site:

```json
{
  "club": {
    "name": "River City Disc Golf Club",
    "tagline": "Weekly leagues, local courses, and community events",
    "location": "River City, NC"
  },
  "stats": [
    { "label": "Years Active", "value": "21" },
    { "label": "Local Courses", "value": "5" }
  ],
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

See `examples/basic/club.config.json` for a full example with every section.

## Guided Setup

Local working directory:

```bash
/home/kg/OpenDiscGolfClub
```

Run the setup wizard from a clone of this repo:

```bash
cd /home/kg/OpenDiscGolfClub
bun install
bun run build
bun dist/cli.mjs setup
```

The wizard writes `open-disc-golf-club.config.json`, asks which optional integrations to enable, and prints the embed snippet for your existing club site.

After the package is published to npm, clubs can run:

```bash
npx open-disc-golf-club setup
```

## Use From npm

Install:

```bash
npm install open-disc-golf-club
```

Import once in your app entrypoint:

```ts
import "open-disc-golf-club"
```

Then use the same custom elements in your markup:

```html
<odgc-events config-url="/club.config.json"></odgc-events>
```

## Data Sources

Every section can start with inline JSON. Sections that volunteers update often can switch to a published CSV source.

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

Google Sheets setup and column names are documented in `docs/integrations/google-sheets.md`.

## Styling

Components use Shadow DOM for isolation and CSS custom properties for theming. Override tokens on the element or a parent container:

```css
open-disc-golf-club {
  --odgc-primary: #ff6b35;
  --odgc-secondary: #2d5016;
  --odgc-radius: 16px;
}
```

The full design token contract is in `DESIGN.md`.

## Local Development

```bash
cd /home/kg/OpenDiscGolfClub
bun install
bun run lint
bun run typecheck
bun run test
bun run build
bun run dev
```

The demo runs at:

```text
http://localhost:4174/
```

Browser QA:

```bash
bun run qa:demo
```

## Publish to npm

Local working directory:

```bash
/home/kg/OpenDiscGolfClub
```

Before publishing, make sure you are logged in. You can also check whether the package name is already claimed:

```bash
npm login
npm view open-disc-golf-club
```

If `npm view` returns a 404, the name is not currently published.

Build and publish:

```bash
cd /home/kg/OpenDiscGolfClub
bun install
bun run lint
bun run typecheck
bun run test
bun run build
npm publish --access public
```

The package is currently configured as `open-disc-golf-club` at version `0.1.0`.

## Repository

- Public repo: `https://github.com/kgbrah/OpenDiscGolfClub`
- Package name: `open-disc-golf-club`
- License: MIT
