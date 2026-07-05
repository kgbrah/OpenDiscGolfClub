import type { z } from "zod"
import type { Member, MembersSectionSchema } from "../config"
import { escapeAttribute, escapeHtml } from "../lib/html"
import { memberGateMatches } from "../lib/member-gate"
import { renderEmpty, renderSectionHeader } from "./common"

type MembersSection = z.infer<typeof MembersSectionSchema>

export function renderMembers(section: MembersSection, members: readonly Member[]): string {
  const directory =
    members.length === 0
      ? renderEmpty("No members have been added yet.")
      : `
        ${renderMemberControls(section)}
        <div class="odgc-grid" data-member-grid>
          ${members.map((member) => renderMemberCard(section, member)).join("")}
        </div>
        <p class="odgc-muted" data-member-count></p>
      `

  const content = section.gate
    ? `${renderGate(section)}<div class="odgc-members-private odgc-hidden">${directory}</div>`
    : directory

  return `
    <section class="odgc-section">
      ${renderSectionHeader(section.title)}
      ${content}
    </section>
  `
}

export function wireMemberControls(root: ParentNode, section: MembersSection): void {
  wireGate(root, section)
  wireFilters(root, section)
}

function renderGate(section: MembersSection): string {
  const hint = section.gate?.hint
    ? `<p class="odgc-muted">${escapeHtml(section.gate.hint)}</p>`
    : `<p class="odgc-muted">Enter the member password to view this directory.</p>`
  const codeInput = section.gate?.codePhrase
    ? `<input class="odgc-input" data-member-code type="text" autocomplete="off" placeholder="Code phrase" />`
    : ""

  return `
    <form class="odgc-card" data-member-gate>
      <h3 class="odgc-card-title">Members Only</h3>
      ${hint}
      <input class="odgc-input" data-member-password type="password" autocomplete="current-password" placeholder="Password" />
      ${codeInput}
      <button class="odgc-button" type="submit">Access Directory</button>
      <p class="odgc-muted odgc-hidden" data-member-error role="alert">Those credentials did not match.</p>
    </form>
  `
}

function renderMemberControls(section: MembersSection): string {
  const founding = section.foundingYear
    ? `<button class="odgc-button is-secondary" type="button" data-member-filter="founding">Founding</button>`
    : ""
  const pdga = section.pdgaLinks
    ? `<button class="odgc-button is-secondary" type="button" data-member-filter="pdga">PDGA</button>`
    : ""

  return `
    <div class="odgc-controls">
      <input class="odgc-input" data-member-search type="search" placeholder="Search members by name or PDGA number" />
      <div class="odgc-actions">
        <button class="odgc-button" type="button" data-member-filter="all">All</button>
        ${founding}
        ${pdga}
      </div>
    </div>
  `
}

function renderMemberCard(section: MembersSection, member: Member): string {
  const name = `${member.firstName} ${member.lastName}`
  const initials = `${member.firstName.at(0) ?? ""}${member.lastName.at(0) ?? ""}`.toUpperCase()
  const joined = member.yearJoined
    ? `<p class="odgc-muted">Member since ${member.yearJoined}</p>`
    : ""
  const pdga = section.pdgaLinks && member.pdga ? renderPdga(member.pdga) : ""
  const special = member.special
    ? `<span class="odgc-badge">${escapeHtml(member.special)}</span>`
    : ""
  const founding =
    section.foundingYear && member.yearJoined === section.foundingYear ? "true" : "false"
  const hasPdga = member.pdga ? "true" : "false"

  return `
    <article class="odgc-card"
      data-member-card
      data-member-name="${escapeAttribute(name.toLowerCase())}"
      data-member-pdga="${escapeAttribute(member.pdga ?? "")}"
      data-member-has-pdga="${hasPdga}"
      data-member-founding="${founding}">
      <span class="odgc-badge">${escapeHtml(initials)}</span>
      <h3 class="odgc-card-title">${escapeHtml(name)}</h3>
      ${joined}
      ${pdga}
      ${special}
    </article>
  `
}

function renderPdga(pdga: string): string {
  return `
    <a class="odgc-button is-secondary" href="https://www.pdga.com/player/${escapeAttribute(pdga)}"
      target="_blank" rel="noopener noreferrer">PDGA #${escapeHtml(pdga)}</a>
  `
}

function wireGate(root: ParentNode, section: MembersSection): void {
  const gate = section.gate
  if (!gate) {
    return
  }

  const form = root.querySelector<HTMLFormElement>("[data-member-gate]")
  const privateContent = root.querySelector<HTMLElement>(".odgc-members-private")
  const error = root.querySelector<HTMLElement>("[data-member-error]")
  if (!form || !privateContent || !error) {
    return
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const password = root.querySelector<HTMLInputElement>("[data-member-password]")?.value ?? ""
    const code = root.querySelector<HTMLInputElement>("[data-member-code]")?.value ?? ""
    if (memberGateMatches(gate, password, code)) {
      form.classList.add("odgc-hidden")
      privateContent.classList.remove("odgc-hidden")
      error.classList.add("odgc-hidden")
      wireFilters(root, section)
    } else {
      error.classList.remove("odgc-hidden")
    }
  })
}

function wireFilters(root: ParentNode, section: MembersSection): void {
  const search = root.querySelector<HTMLInputElement>("[data-member-search]")
  const filters = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-member-filter]"))
  const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-member-card]"))
  const count = root.querySelector<HTMLElement>("[data-member-count]")
  let activeFilter = "all"

  const update = () => {
    const term = search?.value.trim().toLowerCase() ?? ""
    let visible = 0

    for (const card of cards) {
      const name = card.dataset["memberName"] ?? ""
      const pdga = card.dataset["memberPdga"] ?? ""
      const matchesSearch = term.length === 0 || name.includes(term) || pdga.includes(term)
      const matchesFilter = filterMatches(card, activeFilter, section)
      const shouldShow = matchesSearch && matchesFilter
      card.classList.toggle("odgc-hidden", !shouldShow)
      if (shouldShow) {
        visible += 1
      }
    }

    if (count) {
      count.textContent = `Showing ${visible} of ${cards.length} members`
    }
  }

  search?.addEventListener("input", update)
  for (const filter of filters) {
    filter.addEventListener("click", () => {
      activeFilter = filter.dataset["memberFilter"] ?? "all"
      filters.forEach((button) => {
        button.classList.toggle("is-secondary", button !== filter)
      })
      update()
    })
  }
  update()
}

function filterMatches(card: HTMLElement, filter: string, section: MembersSection): boolean {
  if (filter === "pdga") {
    return card.dataset["memberHasPdga"] === "true"
  }
  if (filter === "founding" && section.foundingYear) {
    return card.dataset["memberFounding"] === "true"
  }
  return true
}
