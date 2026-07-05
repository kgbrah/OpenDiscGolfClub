import type { ClubConfig } from "../config"
import { escapeHtml } from "../lib/html"

export function renderSetupSummary(config: ClubConfig): string {
  const rows = [
    integrationRow("Google Sheets events", Boolean(config.events.source)),
    integrationRow("Google Sheets tournaments", Boolean(config.tournaments.source)),
    integrationRow("PayPal or join link", Boolean(config.membership.payment)),
    integrationRow("UDisc course actions", hasCourseValue(config, "udiscUrl")),
    integrationRow(
      "Maps course actions",
      hasCourseValue(config, "mapUrl") || hasCoordinates(config),
    ),
    integrationRow("YouTube course previews", hasCourseValue(config, "youtubeUrl")),
    integrationRow("PDGA member links", config.members.pdgaLinks),
    integrationRow("Member gate", Boolean(config.members.gate)),
  ].join("")

  return `
    <section class="odgc-section">
      <div class="odgc-card">
        <h2 class="odgc-card-title">Optional Integration Status</h2>
        <div class="odgc-table-wrap">
          <table>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </section>
  `
}

function integrationRow(label: string, enabled: boolean): string {
  return `
    <tr>
      <td>${escapeHtml(label)}</td>
      <td><span class="odgc-badge">${enabled ? "Enabled" : "Optional"}</span></td>
    </tr>
  `
}

function hasCourseValue(config: ClubConfig, key: "udiscUrl" | "mapUrl" | "youtubeUrl"): boolean {
  return config.courses.groups.some((group) => group.courses.some((course) => Boolean(course[key])))
}

function hasCoordinates(config: ClubConfig): boolean {
  return config.courses.groups.some((group) =>
    group.courses.some((course) => Boolean(course.coordinates)),
  )
}
