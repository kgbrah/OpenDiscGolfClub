import type { ClubConfig } from "../config"
import { escapeHtml } from "../lib/html"

export function renderSectionHeader(title: string, description?: string): string {
  const descriptionHtml = description
    ? `<p class="odgc-description">${escapeHtml(description)}</p>`
    : ""

  return `
    <div class="odgc-section-header">
      <h2 class="odgc-title">${escapeHtml(title)}</h2>
      ${descriptionHtml}
    </div>
  `
}

export function renderHero(config: ClubConfig): string {
  const tagline = config.club.tagline
    ? `<p class="odgc-subtitle">${escapeHtml(config.club.tagline)}</p>`
    : ""
  const location = config.club.location
    ? `<span class="odgc-badge">${escapeHtml(config.club.location)}</span>`
    : ""

  return `
    <section class="odgc-section" aria-label="${escapeHtml(config.club.name)}">
      <div class="odgc-section-header">
        ${location}
        <h1 class="odgc-title odgc-suite-title">${escapeHtml(config.club.name)}</h1>
        ${tagline}
      </div>
      ${renderStats(config)}
    </section>
  `
}

export function renderStats(config: ClubConfig): string {
  if (config.stats.length === 0) {
    return ""
  }

  const cards = config.stats
    .map(
      (stat) => `
        <div class="odgc-card">
          <div class="odgc-title">${escapeHtml(stat.value)}</div>
          <div class="odgc-muted">${escapeHtml(stat.label)}</div>
        </div>
      `,
    )
    .join("")

  return `<div class="odgc-grid">${cards}</div>`
}

export function renderEmpty(message: string): string {
  return `<div class="odgc-card"><p class="odgc-muted">${escapeHtml(message)}</p></div>`
}

export function renderLoadError(message: string): string {
  return `
    <div class="odgc-card odgc-error" role="alert">
      <h3 class="odgc-card-title">Unable to load this section</h3>
      <p class="odgc-muted">${escapeHtml(message)}</p>
    </div>
  `
}
