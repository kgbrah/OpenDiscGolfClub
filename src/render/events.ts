import type { EventItem, TournamentItem } from "../config"
import { formatDisplayDate } from "../lib/date"
import { escapeAttribute, escapeHtml } from "../lib/html"
import { renderEmpty, renderSectionHeader } from "./common"

export function renderEvents(
  title: string,
  items: readonly EventItem[],
  maxVisible: number,
): string {
  const body =
    items.length === 0
      ? renderEmpty("No upcoming events are listed yet.")
      : renderEventCards(items.slice(0, maxVisible))
  const count = renderCount(items.length, maxVisible, "events")

  return `
    <section class="odgc-section">
      ${renderSectionHeader(title)}
      ${body}
      ${count}
    </section>
  `
}

export function renderTournaments(
  title: string,
  items: readonly TournamentItem[],
  maxVisible: number,
  externalUrl?: string,
): string {
  const body =
    items.length === 0
      ? renderEmpty("No area tournaments are listed yet.")
      : renderTournamentCards(items.slice(0, maxVisible))
  const viewAll = externalUrl
    ? `<a class="odgc-button is-secondary" href="${escapeAttribute(externalUrl)}" target="_blank" rel="noopener noreferrer">View All</a>`
    : ""

  return `
    <section class="odgc-section">
      ${renderSectionHeader(title)}
      ${body}
      <div class="odgc-actions">${renderCount(items.length, maxVisible, "tournaments")}${viewAll}</div>
    </section>
  `
}

function renderEventCards(items: readonly EventItem[]): string {
  const cards = items.map(renderEventCard).join("")
  return `<div class="odgc-grid">${cards}</div>`
}

function renderTournamentCards(items: readonly TournamentItem[]): string {
  const cards = items.map(renderTournamentCard).join("")
  return `<div class="odgc-grid">${cards}</div>`
}

function renderEventCard(item: EventItem): string {
  const date = formatDisplayDate(item.date)
  const dateLabel = date.isTbd ? "TBD" : `${date.month} ${date.day}, ${date.year}`
  const tagOpen = item.url
    ? `<a class="odgc-card" href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer">`
    : `<article class="odgc-card">`
  const tagClose = item.url ? "</a>" : "</article>"

  return `
    ${tagOpen}
      <span class="odgc-badge">${escapeHtml(dateLabel)}</span>
      <h3 class="odgc-card-title">${escapeHtml(item.title)}</h3>
      ${item.description ? `<p class="odgc-description">${escapeHtml(item.description)}</p>` : ""}
    ${tagClose}
  `
}

function renderTournamentCard(item: TournamentItem): string {
  const date = formatDisplayDate(item.date)
  const dateLabel = date.isTbd ? "TBD" : `${date.month} ${date.day}, ${date.year}`
  const tagOpen = item.url
    ? `<a class="odgc-card" href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer">`
    : `<article class="odgc-card">`
  const tagClose = item.url ? "</a>" : "</article>"
  const meta = [item.location, item.tier].filter(isFilledString)
  const metaHtml =
    meta.length > 0
      ? `<div class="odgc-meta">${meta.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</div>`
      : ""

  return `
    ${tagOpen}
      <span class="odgc-badge">${escapeHtml(dateLabel)}</span>
      <h3 class="odgc-card-title">${escapeHtml(item.name)}</h3>
      ${metaHtml}
    ${tagClose}
  `
}

function isFilledString(value: string | undefined): value is string {
  return Boolean(value && value.length > 0)
}

function renderCount(total: number, visible: number, label: string): string {
  if (total <= visible) {
    return ""
  }

  return `<p class="odgc-muted">Showing ${visible} of ${total} ${escapeHtml(label)}.</p>`
}
