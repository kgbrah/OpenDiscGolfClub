import type { LeagueData } from "../config"
import { escapeHtml } from "../lib/html"
import { renderEmpty, renderSectionHeader } from "./common"

export function renderLeague(title: string, data: LeagueData): string {
  if (data.leaderboard.length === 0 && data.champions.length === 0) {
    return `
      <section class="odgc-section">
        ${renderSectionHeader(title)}
        ${renderEmpty("No league records have been added yet.")}
      </section>
    `
  }

  return `
    <section class="odgc-section">
      ${renderSectionHeader(title)}
      ${renderChampions(data)}
      ${renderLeaderboard(data)}
      ${renderSeasonResults(data)}
    </section>
  `
}

function renderChampions(data: LeagueData): string {
  if (data.champions.length === 0) {
    return ""
  }

  const cards = data.champions
    .map(
      (champion) => `
        <article class="odgc-card">
          <span class="odgc-badge">${escapeHtml(champion.season)}</span>
          <h3 class="odgc-card-title">${escapeHtml(champion.name)}</h3>
          <p class="odgc-muted">${champion.points.toLocaleString()} points</p>
        </article>
      `,
    )
    .join("")

  return `<div class="odgc-grid">${cards}</div>`
}

function renderLeaderboard(data: LeagueData): string {
  if (data.leaderboard.length === 0) {
    return ""
  }

  const rows = [...data.leaderboard]
    .sort((left, right) => right.totalPoints - left.totalPoints)
    .map(
      (player, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(player.name)}</td>
          <td>${player.seasons}</td>
          <td>${Math.round(player.totalPoints).toLocaleString()}</td>
          <td>${ordinal(player.bestFinish)}</td>
          <td>${player.wins}</td>
          <td>${player.top3}</td>
          <td>${player.weeks}</td>
        </tr>
      `,
    )
    .join("")

  return `
    <div class="odgc-table-wrap">
      <table>
        <caption class="odgc-muted">All-time leaderboard</caption>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Seasons</th>
            <th>Total Pts</th>
            <th>Best</th>
            <th>Wins</th>
            <th>Top 3</th>
            <th>Weeks</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `
}

function renderSeasonResults(data: LeagueData): string {
  const latestSeason = data.seasonOrder.at(-1)
  if (!latestSeason) {
    return ""
  }

  const rows = data.leaderboard
    .flatMap((player) =>
      player.seasonResults
        .filter((result) => result.season === latestSeason)
        .map((result) => ({ player: player.name, result })),
    )
    .sort((left, right) => left.result.placement - right.result.placement)
    .map(
      (entry) => `
        <tr>
          <td>${entry.result.placement}</td>
          <td>${escapeHtml(entry.player)}</td>
          <td>${Math.round(entry.result.totalPoints).toLocaleString()}</td>
          <td>${entry.result.bestPoints ? Math.round(entry.result.bestPoints).toLocaleString() : ""}</td>
          <td>${entry.result.weeksAttended ?? ""}</td>
          <td>${entry.result.avgScore ? entry.result.avgScore.toFixed(1) : ""}</td>
        </tr>
      `,
    )
    .join("")

  if (rows.length === 0) {
    return ""
  }

  return `
    <div class="odgc-table-wrap">
      <table>
        <caption class="odgc-muted">${escapeHtml(latestSeason)} results</caption>
        <thead>
          <tr>
            <th>Place</th>
            <th>Player</th>
            <th>Total Pts</th>
            <th>Best Pts</th>
            <th>Weeks</th>
            <th>Avg</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `
}

function ordinal(value: number): string {
  const remainder = value % 100
  if (remainder >= 11 && remainder <= 13) {
    return `${value}th`
  }

  switch (value % 10) {
    case 1:
      return `${value}st`
    case 2:
      return `${value}nd`
    case 3:
      return `${value}rd`
    default:
      return `${value}th`
  }
}
