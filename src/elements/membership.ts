import type { ClubConfig } from "../config"
import { renderContact } from "../render/contact"
import { renderMembership } from "../render/membership"
import { OdgcBaseElement } from "./base"

export class OdgcMembershipElement extends OdgcBaseElement {
  protected async renderWithConfig(config: ClubConfig): Promise<string> {
    return `<div class="odgc-shell">${renderMembership(config.membership)}</div>`
  }
}

export class OdgcContactElement extends OdgcBaseElement {
  protected async renderWithConfig(config: ClubConfig): Promise<string> {
    return `<div class="odgc-shell">${renderContact(config.contact)}</div>`
  }
}
