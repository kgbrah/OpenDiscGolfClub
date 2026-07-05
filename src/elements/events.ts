import type { ClubConfig } from "../config"
import { loadEvents, loadTournaments } from "../lib/data-source"
import { renderEvents, renderTournaments } from "../render/events"
import { OdgcBaseElement } from "./base"

export class OdgcEventsElement extends OdgcBaseElement {
  protected async renderWithConfig(config: ClubConfig): Promise<string> {
    const events = await loadEvents(
      config.events.source,
      config.events.items,
      config.events.showPast,
    )
    return `<div class="odgc-shell">${renderEvents(config.events.title, events, config.events.maxVisible)}</div>`
  }
}

export class OdgcTournamentsElement extends OdgcBaseElement {
  protected async renderWithConfig(config: ClubConfig): Promise<string> {
    const tournaments = await loadTournaments(config.tournaments.source, config.tournaments.items)
    return `
      <div class="odgc-shell">
        ${renderTournaments(
          config.tournaments.title,
          tournaments,
          config.tournaments.maxVisible,
          config.tournaments.externalUrl,
        )}
      </div>
    `
  }
}
