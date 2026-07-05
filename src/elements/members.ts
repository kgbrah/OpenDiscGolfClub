import type { ClubConfig } from "../config"
import { loadLeagueData, loadMembers } from "../lib/data-source"
import { renderLeague } from "../render/league"
import { renderMembers, wireMemberControls } from "../render/members"
import { OdgcBaseElement } from "./base"

export class OdgcMembersElement extends OdgcBaseElement {
  protected async renderWithConfig(config: ClubConfig): Promise<string> {
    const members = await loadMembers(config.members.source, config.members.items)
    return `<div class="odgc-shell">${renderMembers(config.members, members)}</div>`
  }

  protected afterRender(root: ShadowRoot, config: ClubConfig): void {
    wireMemberControls(root, config.members)
  }
}

export class OdgcLeagueElement extends OdgcBaseElement {
  protected async renderWithConfig(config: ClubConfig): Promise<string> {
    const league = await loadLeagueData(config.league.source, config.league.data)
    return `<div class="odgc-shell">${renderLeague(config.league.title, league)}</div>`
  }
}
