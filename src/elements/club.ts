import type { ClubConfig } from "../config"
import { loadEvents, loadLeagueData, loadMembers, loadTournaments } from "../lib/data-source"
import { renderHero } from "../render/common"
import { renderContact } from "../render/contact"
import { renderCourses } from "../render/courses"
import { renderEvents, renderTournaments } from "../render/events"
import { renderLeague } from "../render/league"
import { renderMembers, wireMemberControls } from "../render/members"
import { renderMembership } from "../render/membership"
import { renderSetupSummary } from "../render/setup"
import { OdgcBaseElement } from "./base"

export class OpenDiscGolfClubElement extends OdgcBaseElement {
  protected async renderWithConfig(config: ClubConfig): Promise<string> {
    const [events, tournaments, members, league] = await Promise.all([
      loadEvents(config.events.source, config.events.items, config.events.showPast),
      loadTournaments(config.tournaments.source, config.tournaments.items),
      loadMembers(config.members.source, config.members.items),
      loadLeagueData(config.league.source, config.league.data),
    ])

    return `
      <div class="odgc-shell">
        <div class="odgc-stack">
          ${renderHero(config)}
          ${renderCourses(config.courses)}
          ${renderEvents(config.events.title, events, config.events.maxVisible)}
          ${renderTournaments(
            config.tournaments.title,
            tournaments,
            config.tournaments.maxVisible,
            config.tournaments.externalUrl,
          )}
          ${renderMembership(config.membership)}
          ${renderContact(config.contact)}
          ${renderMembers(config.members, members)}
          ${renderLeague(config.league.title, league)}
          ${renderSetupSummary(config)}
        </div>
      </div>
    `
  }

  protected afterRender(root: ShadowRoot, config: ClubConfig): void {
    wireMemberControls(root, config.members)
  }
}
