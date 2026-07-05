import type { ClubConfig } from "../config"
import { escapeAttribute, escapeHtml } from "../lib/html"
import { renderEmpty, renderSectionHeader } from "./common"

export function renderContact(section: ClubConfig["contact"]): string {
  const body =
    section.items.length === 0
      ? renderEmpty("Add contact methods in your config.")
      : `<div class="odgc-grid">${section.items.map(renderContactItem).join("")}</div>`

  return `
    <section class="odgc-section">
      ${renderSectionHeader(section.title)}
      ${body}
    </section>
  `
}

function renderContactItem(item: ClubConfig["contact"]["items"][number]): string {
  const value = item.url
    ? `<a href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.value)}</a>`
    : escapeHtml(item.value)

  return `
    <article class="odgc-card">
      <span class="odgc-badge">${escapeHtml(item.label)}</span>
      <h3 class="odgc-card-title">${value}</h3>
    </article>
  `
}
