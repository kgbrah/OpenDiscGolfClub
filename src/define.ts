import { OpenDiscGolfClubElement } from "./elements/club"
import { OdgcCoursesElement } from "./elements/courses"
import { OdgcEventsElement, OdgcTournamentsElement } from "./elements/events"
import { OdgcLeagueElement, OdgcMembersElement } from "./elements/members"
import { OdgcContactElement, OdgcMembershipElement } from "./elements/membership"

const ELEMENTS = [
  ["open-disc-golf-club", OpenDiscGolfClubElement],
  ["odgc-courses", OdgcCoursesElement],
  ["odgc-events", OdgcEventsElement],
  ["odgc-tournaments", OdgcTournamentsElement],
  ["odgc-membership", OdgcMembershipElement],
  ["odgc-contact", OdgcContactElement],
  ["odgc-members", OdgcMembersElement],
  ["odgc-league", OdgcLeagueElement],
] as const

export function defineOpenDiscGolfClubElements(): void {
  if (typeof customElements === "undefined") {
    return
  }

  for (const [name, element] of ELEMENTS) {
    if (!customElements.get(name)) {
      customElements.define(name, element)
    }
  }
}
