import { a as DataSourceSchema, c as LeagueDataSchema, d as PaymentSchema, f as TournamentItemSchema, h as parseClubConfig, i as CourseSchema, l as MemberGateSchema, m as defaultClubConfig, n as CoordinatesSchema, o as EventItemSchema, p as TournamentsSectionSchema, r as CourseGroupSchema, s as EventsSectionSchema, t as ClubConfigSchema, u as MemberSchema } from "./config-DpxhpmDc.mjs";
import ky from "ky";
import { z } from "zod";

//#region src/lib/csv.ts
function parseCsv(csv) {
	const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
	const headerLine = lines.at(0);
	if (!headerLine) return [];
	const headers = parseCsvLine(headerLine).map((header) => header.trim().toLowerCase());
	const rows = [];
	for (const line of lines.slice(1)) {
		const values = parseCsvLine(line);
		const row = {};
		headers.forEach((header, index) => {
			row[header] = values.at(index)?.trim() ?? "";
		});
		rows.push(row);
	}
	return rows;
}
function parseCsvLine(line) {
	const values = [];
	let current = "";
	let insideQuote = false;
	for (let index = 0; index < line.length; index += 1) {
		const character = line[index];
		const nextCharacter = line[index + 1];
		if (character === "\"" && insideQuote && nextCharacter === "\"") {
			current += "\"";
			index += 1;
		} else if (character === "\"") insideQuote = !insideQuote;
		else if (character === "," && !insideQuote) {
			values.push(current.trim());
			current = "";
		} else if (character) current += character;
	}
	values.push(current.trim());
	return values;
}

//#endregion
//#region src/lib/date.ts
const MONTH_LABELS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
const MONTH_INDEX = {
	jan: 0,
	january: 0,
	feb: 1,
	february: 1,
	mar: 2,
	march: 2,
	apr: 3,
	april: 3,
	may: 4,
	jun: 5,
	june: 5,
	jul: 6,
	july: 6,
	aug: 7,
	august: 7,
	sep: 8,
	sept: 8,
	september: 8,
	oct: 9,
	october: 9,
	nov: 10,
	november: 10,
	dec: 11,
	december: 11
};
function formatDisplayDate(input) {
	const parsed = parseClubDate(input);
	if (!parsed) return tbdDate();
	const today = /* @__PURE__ */ new Date();
	today.setHours(0, 0, 0, 0);
	const month = MONTH_LABELS[parsed.getMonth()] ?? "";
	return {
		day: String(parsed.getDate()),
		month,
		year: String(parsed.getFullYear()),
		isPast: parsed < today,
		isTbd: false,
		sortTime: parsed.getTime()
	};
}
function compareDateStrings(left, right) {
	return formatDisplayDate(left).sortTime - formatDisplayDate(right).sortTime;
}
function tbdDate() {
	return {
		day: "TBD",
		month: "",
		year: "",
		isPast: false,
		isTbd: true,
		sortTime: Number.MAX_SAFE_INTEGER
	};
}
function parseClubDate(input) {
	const trimmed = input.trim();
	if (trimmed.length === 0 || trimmed.toUpperCase() === "TBD") return null;
	return parseYearMonthDay(trimmed) ?? parseMonthDayYear(trimmed) ?? parseShortSlashDate(trimmed) ?? parseNativeDate(trimmed);
}
function parseYearMonthDay(input) {
	const match = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	return validDate(year, month - 1, day);
}
function parseMonthDayYear(input) {
	const match = input.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})?/);
	if (!match) return null;
	const month = MONTH_INDEX[match[1]?.toLowerCase() ?? ""];
	if (month === void 0) return null;
	const day = Number(match[2]);
	return validDate(match[3] ? Number(match[3]) : (/* @__PURE__ */ new Date()).getFullYear(), month, day);
}
function parseShortSlashDate(input) {
	const match = input.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
	if (!match) return null;
	const month = Number(match[1]);
	const day = Number(match[2]);
	const rawYear = match[3];
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	const year = rawYear ? expandYear(Number(rawYear)) : currentYear;
	const candidate = validDate(year, month - 1, day);
	if (!candidate || rawYear) return candidate;
	const sixtyDaysAgo = /* @__PURE__ */ new Date();
	sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
	return candidate < sixtyDaysAgo ? validDate(year + 1, month - 1, day) : candidate;
}
function parseNativeDate(input) {
	const parsed = new Date(input);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function validDate(year, month, day) {
	const date = new Date(year, month, day);
	if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day || Number.isNaN(date.getTime())) return null;
	return date;
}
function expandYear(year) {
	if (year >= 100) return year;
	return year < 50 ? 2e3 + year : 1900 + year;
}

//#endregion
//#region src/lib/errors.ts
var DataSourceLoadError = class extends Error {
	name = "DataSourceLoadError";
	constructor(source, options) {
		super(`Unable to load data source: ${source}`, options);
		this.source = source;
	}
};
var UnexpectedVariantError = class extends Error {
	name = "UnexpectedVariantError";
	constructor(value) {
		super(`Unexpected variant: ${JSON.stringify(value)}`);
		this.value = value;
	}
};
function assertNever(value) {
	throw new UnexpectedVariantError(value);
}

//#endregion
//#region src/lib/data-source.ts
async function loadEvents(source, inlineItems, showPast) {
	const remoteItems = source ? await loadSource(source, z.array(EventItemSchema), rowsToEvents) : [];
	return [...inlineItems, ...remoteItems].filter((item) => showPast || !formatDisplayDate(item.date).isPast).sort((left, right) => compareDateStrings(left.date, right.date));
}
async function loadTournaments(source, inlineItems) {
	const remoteItems = source ? await loadSource(source, z.array(TournamentItemSchema), rowsToTournaments) : [];
	return [...inlineItems, ...remoteItems].sort((left, right) => compareDateStrings(left.date, right.date));
}
async function loadMembers(source, inlineItems) {
	const remoteItems = source ? await loadSource(source, z.array(MemberSchema), rowsToMembers) : [];
	return [...inlineItems, ...remoteItems].sort((left, right) => {
		const leftName = `${left.lastName} ${left.firstName}`.toLowerCase();
		const rightName = `${right.lastName} ${right.firstName}`.toLowerCase();
		return leftName.localeCompare(rightName);
	});
}
async function loadLeagueData(source, inlineData) {
	if (!source) return inlineData;
	return loadJson(source, LeagueDataSchema);
}
async function loadSource(source, jsonSchema, csvMapper) {
	switch (source.kind) {
		case "jsonUrl": return loadJson(source, jsonSchema);
		case "googleSheetsCsv": return csvMapper(parseCsv(await loadText(source.url)));
		default: return assertNever(source);
	}
}
async function loadJson(source, schema) {
	try {
		const payload = await ky.get(source.url).json();
		return schema.parse(payload);
	} catch (error) {
		if (error instanceof Error) throw new DataSourceLoadError(source.url, { cause: error });
		throw new DataSourceLoadError(source.url);
	}
}
async function loadText(url) {
	try {
		return await ky.get(url).text();
	} catch (error) {
		if (error instanceof Error) throw new DataSourceLoadError(url, { cause: error });
		throw new DataSourceLoadError(url);
	}
}
function rowsToEvents(rows) {
	const items = [];
	for (const row of rows) {
		if (isInactive(row)) continue;
		const title = row["title"]?.trim() ?? "";
		const date = row["date"]?.trim() ?? "";
		if (title.length === 0 || date.length === 0) continue;
		const description = row["description"]?.trim();
		const url = row["url"]?.trim();
		items.push(EventItemSchema.parse({
			title,
			date,
			...description ? { description } : {},
			...url ? { url } : {}
		}));
	}
	return items;
}
function rowsToTournaments(rows) {
	const items = [];
	for (const row of rows) {
		if (isInactive(row)) continue;
		const name = row["name"]?.trim() ?? row["title"]?.trim() ?? "";
		const date = row["date"]?.trim() ?? "";
		if (name.length === 0 || date.length === 0) continue;
		const location = row["location"]?.trim();
		const tier = row["tier"]?.trim();
		const url = row["url"]?.trim();
		items.push(TournamentItemSchema.parse({
			name,
			date,
			...location ? { location } : {},
			...tier ? { tier } : {},
			...url ? { url } : {}
		}));
	}
	return items;
}
function rowsToMembers(rows) {
	const items = [];
	for (const row of rows) {
		if (isInactive(row)) continue;
		const firstName = row["firstname"]?.trim() ?? row["first name"]?.trim() ?? "";
		const lastName = row["lastname"]?.trim() ?? row["last name"]?.trim() ?? "";
		if (firstName.length === 0 || lastName.length === 0) continue;
		const pdga = row["pdga"]?.trim();
		const special = row["special"]?.trim();
		const yearJoined = optionalNumber(row["yearjoined"] ?? row["year joined"]);
		items.push(MemberSchema.parse({
			firstName,
			lastName,
			...yearJoined ? { yearJoined } : {},
			...pdga ? { pdga } : {},
			...special ? { special } : {}
		}));
	}
	return items;
}
function isInactive(row) {
	return (row["active"] ?? "").trim().toUpperCase() === "FALSE";
}
function optionalNumber(value) {
	const parsed = value ? Number(value) : NaN;
	return Number.isFinite(parsed) ? parsed : void 0;
}

//#endregion
//#region src/lib/html.ts
function escapeHtml(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function escapeAttribute(value) {
	return escapeHtml(value);
}
function optionalText(value) {
	return value ? escapeHtml(value) : "";
}

//#endregion
//#region src/render/common.ts
function renderSectionHeader(title, description) {
	const descriptionHtml = description ? `<p class="odgc-description">${escapeHtml(description)}</p>` : "";
	return `
    <div class="odgc-section-header">
      <h2 class="odgc-title">${escapeHtml(title)}</h2>
      ${descriptionHtml}
    </div>
  `;
}
function renderHero(config) {
	const tagline = config.club.tagline ? `<p class="odgc-subtitle">${escapeHtml(config.club.tagline)}</p>` : "";
	const location = config.club.location ? `<span class="odgc-badge">${escapeHtml(config.club.location)}</span>` : "";
	return `
    <section class="odgc-section" aria-label="${escapeHtml(config.club.name)}">
      <div class="odgc-section-header">
        ${location}
        <h1 class="odgc-title odgc-suite-title">${escapeHtml(config.club.name)}</h1>
        ${tagline}
      </div>
      ${renderStats(config)}
    </section>
  `;
}
function renderStats(config) {
	if (config.stats.length === 0) return "";
	return `<div class="odgc-grid">${config.stats.map((stat) => `
        <div class="odgc-card">
          <div class="odgc-title">${escapeHtml(stat.value)}</div>
          <div class="odgc-muted">${escapeHtml(stat.label)}</div>
        </div>
      `).join("")}</div>`;
}
function renderEmpty(message) {
	return `<div class="odgc-card"><p class="odgc-muted">${escapeHtml(message)}</p></div>`;
}
function renderLoadError(message) {
	return `
    <div class="odgc-card odgc-error" role="alert">
      <h3 class="odgc-card-title">Unable to load this section</h3>
      <p class="odgc-muted">${escapeHtml(message)}</p>
    </div>
  `;
}

//#endregion
//#region src/render/contact.ts
function renderContact(section) {
	const body = section.items.length === 0 ? renderEmpty("Add contact methods in your config.") : `<div class="odgc-grid">${section.items.map(renderContactItem).join("")}</div>`;
	return `
    <section class="odgc-section">
      ${renderSectionHeader(section.title)}
      ${body}
    </section>
  `;
}
function renderContactItem(item) {
	const value = item.url ? `<a href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.value)}</a>` : escapeHtml(item.value);
	return `
    <article class="odgc-card">
      <span class="odgc-badge">${escapeHtml(item.label)}</span>
      <h3 class="odgc-card-title">${value}</h3>
    </article>
  `;
}

//#endregion
//#region src/lib/course-actions.ts
const COURSE_ACTION_KIND = {
	UDISC: "udisc",
	MAP: "map",
	VIDEO: "video"
};
function buildCourseActions(course) {
	const actions = [];
	if (course.udiscUrl) actions.push({
		kind: COURSE_ACTION_KIND.UDISC,
		label: "UDisc",
		url: course.udiscUrl
	});
	const mapUrl = course.mapUrl ?? directionsUrl(course);
	if (mapUrl) actions.push({
		kind: COURSE_ACTION_KIND.MAP,
		label: "Directions",
		url: mapUrl
	});
	if (course.youtubeUrl) actions.push({
		kind: COURSE_ACTION_KIND.VIDEO,
		label: "Course Preview",
		url: course.youtubeUrl
	});
	return actions;
}
function actionClassName(kind) {
	switch (kind) {
		case COURSE_ACTION_KIND.UDISC: return "is-udisc";
		case COURSE_ACTION_KIND.MAP: return "is-map";
		case COURSE_ACTION_KIND.VIDEO: return "is-video";
		default: return assertNever(kind);
	}
}
function directionsUrl(course) {
	if (!course.coordinates) return null;
	const destination = `${course.coordinates.lat},${course.coordinates.lng}`;
	return `https://www.google.com/maps/dir/?${new URLSearchParams({
		api: "1",
		destination
	}).toString()}`;
}

//#endregion
//#region src/render/courses.ts
function renderCourses(section) {
	const groups = section.groups;
	if (groups.length === 0) return sectionShell(section.title, renderEmpty("No courses have been added yet."));
	const body = groups.map(renderCourseGroup).join("");
	return sectionShell(section.title, body);
}
function sectionShell(title, body) {
	return `
    <section class="odgc-section">
      ${renderSectionHeader(title)}
      ${body}
    </section>
  `;
}
function renderCourseGroup(group) {
	const description = group.description ? `<p class="odgc-description">${escapeHtml(group.description)}</p>` : "";
	const cards = group.courses.map(renderCourseCard).join("");
	return `
    <div class="odgc-section">
      <div class="odgc-section-header">
        <h3 class="odgc-card-title">${escapeHtml(group.title)}</h3>
        ${description}
      </div>
      <div class="odgc-grid">${cards}</div>
    </div>
  `;
}
function renderCourseCard(course) {
	const image = course.imageUrl ? `<img src="${escapeAttribute(course.imageUrl)}" alt="${escapeAttribute(course.name)}" loading="lazy" />` : "";
	const imageHtml = image ? `<div class="odgc-course-image">${image}</div>` : "";
	const meta = renderCourseMeta(course);
	const difficulty = course.difficulty ? `<span class="odgc-badge">${escapeHtml(course.difficulty)}</span>` : "";
	const description = course.description ? `<p class="odgc-description">${escapeHtml(course.description)}</p>` : "";
	const actions = buildCourseActions(course).map((action) => `
        <a class="odgc-button is-secondary ${actionClassName(action.kind)}"
          href="${escapeAttribute(action.url)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(action.label)}
        </a>
      `).join("");
	return `
    <article class="odgc-card">
      ${imageHtml}
      <div class="odgc-meta">${difficulty}<span>${escapeHtml(course.location)}</span></div>
      <h4 class="odgc-card-title">${escapeHtml(course.name)}</h4>
      ${meta}
      ${description}
      ${actions ? `<div class="odgc-actions">${actions}</div>` : ""}
    </article>
  `;
}
function renderCourseMeta(course) {
	const values = [
		course.holes ? `${course.holes} holes` : "",
		optionalText(course.rating ? `${course.rating} rating` : void 0),
		optionalText(course.time)
	].filter((value) => value.length > 0);
	if (values.length === 0) return "";
	return `<div class="odgc-meta">${values.map((value) => `<span>${value}</span>`).join("")}</div>`;
}

//#endregion
//#region src/render/events.ts
function renderEvents(title, items, maxVisible) {
	const body = items.length === 0 ? renderEmpty("No upcoming events are listed yet.") : renderEventCards(items.slice(0, maxVisible));
	const count = renderCount(items.length, maxVisible, "events");
	return `
    <section class="odgc-section">
      ${renderSectionHeader(title)}
      ${body}
      ${count}
    </section>
  `;
}
function renderTournaments(title, items, maxVisible, externalUrl) {
	const body = items.length === 0 ? renderEmpty("No area tournaments are listed yet.") : renderTournamentCards(items.slice(0, maxVisible));
	const viewAll = externalUrl ? `<a class="odgc-button is-secondary" href="${escapeAttribute(externalUrl)}" target="_blank" rel="noopener noreferrer">View All</a>` : "";
	return `
    <section class="odgc-section">
      ${renderSectionHeader(title)}
      ${body}
      <div class="odgc-actions">${renderCount(items.length, maxVisible, "tournaments")}${viewAll}</div>
    </section>
  `;
}
function renderEventCards(items) {
	return `<div class="odgc-grid">${items.map(renderEventCard).join("")}</div>`;
}
function renderTournamentCards(items) {
	return `<div class="odgc-grid">${items.map(renderTournamentCard).join("")}</div>`;
}
function renderEventCard(item) {
	const date = formatDisplayDate(item.date);
	const dateLabel = date.isTbd ? "TBD" : `${date.month} ${date.day}, ${date.year}`;
	const tagOpen = item.url ? `<a class="odgc-card" href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer">` : `<article class="odgc-card">`;
	const tagClose = item.url ? "</a>" : "</article>";
	return `
    ${tagOpen}
      <span class="odgc-badge">${escapeHtml(dateLabel)}</span>
      <h3 class="odgc-card-title">${escapeHtml(item.title)}</h3>
      ${item.description ? `<p class="odgc-description">${escapeHtml(item.description)}</p>` : ""}
    ${tagClose}
  `;
}
function renderTournamentCard(item) {
	const date = formatDisplayDate(item.date);
	const dateLabel = date.isTbd ? "TBD" : `${date.month} ${date.day}, ${date.year}`;
	const tagOpen = item.url ? `<a class="odgc-card" href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer">` : `<article class="odgc-card">`;
	const tagClose = item.url ? "</a>" : "</article>";
	const meta = [item.location, item.tier].filter(isFilledString);
	const metaHtml = meta.length > 0 ? `<div class="odgc-meta">${meta.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</div>` : "";
	return `
    ${tagOpen}
      <span class="odgc-badge">${escapeHtml(dateLabel)}</span>
      <h3 class="odgc-card-title">${escapeHtml(item.name)}</h3>
      ${metaHtml}
    ${tagClose}
  `;
}
function isFilledString(value) {
	return Boolean(value && value.length > 0);
}
function renderCount(total, visible, label) {
	if (total <= visible) return "";
	return `<p class="odgc-muted">Showing ${visible} of ${total} ${escapeHtml(label)}.</p>`;
}

//#endregion
//#region src/render/league.ts
function renderLeague(title, data) {
	if (data.leaderboard.length === 0 && data.champions.length === 0) return `
      <section class="odgc-section">
        ${renderSectionHeader(title)}
        ${renderEmpty("No league records have been added yet.")}
      </section>
    `;
	return `
    <section class="odgc-section">
      ${renderSectionHeader(title)}
      ${renderChampions(data)}
      ${renderLeaderboard(data)}
      ${renderSeasonResults(data)}
    </section>
  `;
}
function renderChampions(data) {
	if (data.champions.length === 0) return "";
	return `<div class="odgc-grid">${data.champions.map((champion) => `
        <article class="odgc-card">
          <span class="odgc-badge">${escapeHtml(champion.season)}</span>
          <h3 class="odgc-card-title">${escapeHtml(champion.name)}</h3>
          <p class="odgc-muted">${champion.points.toLocaleString()} points</p>
        </article>
      `).join("")}</div>`;
}
function renderLeaderboard(data) {
	if (data.leaderboard.length === 0) return "";
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
        <tbody>${[...data.leaderboard].sort((left, right) => right.totalPoints - left.totalPoints).map((player, index) => `
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
      `).join("")}</tbody>
      </table>
    </div>
  `;
}
function renderSeasonResults(data) {
	const latestSeason = data.seasonOrder.at(-1);
	if (!latestSeason) return "";
	const rows = data.leaderboard.flatMap((player) => player.seasonResults.filter((result) => result.season === latestSeason).map((result) => ({
		player: player.name,
		result
	}))).sort((left, right) => left.result.placement - right.result.placement).map((entry) => `
        <tr>
          <td>${entry.result.placement}</td>
          <td>${escapeHtml(entry.player)}</td>
          <td>${Math.round(entry.result.totalPoints).toLocaleString()}</td>
          <td>${entry.result.bestPoints ? Math.round(entry.result.bestPoints).toLocaleString() : ""}</td>
          <td>${entry.result.weeksAttended ?? ""}</td>
          <td>${entry.result.avgScore ? entry.result.avgScore.toFixed(1) : ""}</td>
        </tr>
      `).join("");
	if (rows.length === 0) return "";
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
  `;
}
function ordinal(value) {
	const remainder = value % 100;
	if (remainder >= 11 && remainder <= 13) return `${value}th`;
	switch (value % 10) {
		case 1: return `${value}st`;
		case 2: return `${value}nd`;
		case 3: return `${value}rd`;
		default: return `${value}th`;
	}
}

//#endregion
//#region src/lib/member-gate.ts
function memberGateMatches(gate, passwordInput, codePhraseInput) {
	const passwordMatches = passwordInput === gate.password;
	const phraseMatches = gate.codePhrase ? codePhraseInput.trim().toLowerCase() === gate.codePhrase.trim().toLowerCase() : true;
	return passwordMatches && phraseMatches;
}

//#endregion
//#region src/render/members.ts
function renderMembers(section, members) {
	const directory = members.length === 0 ? renderEmpty("No members have been added yet.") : `
        ${renderMemberControls(section)}
        <div class="odgc-grid" data-member-grid>
          ${members.map((member) => renderMemberCard(section, member)).join("")}
        </div>
        <p class="odgc-muted" data-member-count></p>
      `;
	const content = section.gate ? `${renderGate(section)}<div class="odgc-members-private odgc-hidden">${directory}</div>` : directory;
	return `
    <section class="odgc-section">
      ${renderSectionHeader(section.title)}
      ${content}
    </section>
  `;
}
function wireMemberControls(root, section) {
	wireGate(root, section);
	wireFilters(root, section);
}
function renderGate(section) {
	return `
    <form class="odgc-card" data-member-gate>
      <h3 class="odgc-card-title">Members Only</h3>
      ${section.gate?.hint ? `<p class="odgc-muted">${escapeHtml(section.gate.hint)}</p>` : `<p class="odgc-muted">Enter the member password to view this directory.</p>`}
      <input class="odgc-input" data-member-password type="password" autocomplete="current-password" placeholder="Password" />
      ${section.gate?.codePhrase ? `<input class="odgc-input" data-member-code type="text" autocomplete="off" placeholder="Code phrase" />` : ""}
      <button class="odgc-button" type="submit">Access Directory</button>
      <p class="odgc-muted odgc-hidden" data-member-error role="alert">Those credentials did not match.</p>
    </form>
  `;
}
function renderMemberControls(section) {
	return `
    <div class="odgc-controls">
      <input class="odgc-input" data-member-search type="search" placeholder="Search members by name or PDGA number" />
      <div class="odgc-actions">
        <button class="odgc-button" type="button" data-member-filter="all">All</button>
        ${section.foundingYear ? `<button class="odgc-button is-secondary" type="button" data-member-filter="founding">Founding</button>` : ""}
        ${section.pdgaLinks ? `<button class="odgc-button is-secondary" type="button" data-member-filter="pdga">PDGA</button>` : ""}
      </div>
    </div>
  `;
}
function renderMemberCard(section, member) {
	const name = `${member.firstName} ${member.lastName}`;
	const initials = `${member.firstName.at(0) ?? ""}${member.lastName.at(0) ?? ""}`.toUpperCase();
	const joined = member.yearJoined ? `<p class="odgc-muted">Member since ${member.yearJoined}</p>` : "";
	const pdga = section.pdgaLinks && member.pdga ? renderPdga(member.pdga) : "";
	const special = member.special ? `<span class="odgc-badge">${escapeHtml(member.special)}</span>` : "";
	const founding = section.foundingYear && member.yearJoined === section.foundingYear ? "true" : "false";
	const hasPdga = member.pdga ? "true" : "false";
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
  `;
}
function renderPdga(pdga) {
	return `
    <a class="odgc-button is-secondary" href="https://www.pdga.com/player/${escapeAttribute(pdga)}"
      target="_blank" rel="noopener noreferrer">PDGA #${escapeHtml(pdga)}</a>
  `;
}
function wireGate(root, section) {
	const gate = section.gate;
	if (!gate) return;
	const form = root.querySelector("[data-member-gate]");
	const privateContent = root.querySelector(".odgc-members-private");
	const error = root.querySelector("[data-member-error]");
	if (!form || !privateContent || !error) return;
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		if (memberGateMatches(gate, root.querySelector("[data-member-password]")?.value ?? "", root.querySelector("[data-member-code]")?.value ?? "")) {
			form.classList.add("odgc-hidden");
			privateContent.classList.remove("odgc-hidden");
			error.classList.add("odgc-hidden");
			wireFilters(root, section);
		} else error.classList.remove("odgc-hidden");
	});
}
function wireFilters(root, section) {
	const search = root.querySelector("[data-member-search]");
	const filters = Array.from(root.querySelectorAll("[data-member-filter]"));
	const cards = Array.from(root.querySelectorAll("[data-member-card]"));
	const count = root.querySelector("[data-member-count]");
	let activeFilter = "all";
	const update = () => {
		const term = search?.value.trim().toLowerCase() ?? "";
		let visible = 0;
		for (const card of cards) {
			const name = card.dataset["memberName"] ?? "";
			const pdga = card.dataset["memberPdga"] ?? "";
			const matchesSearch = term.length === 0 || name.includes(term) || pdga.includes(term);
			const matchesFilter = filterMatches(card, activeFilter, section);
			const shouldShow = matchesSearch && matchesFilter;
			card.classList.toggle("odgc-hidden", !shouldShow);
			if (shouldShow) visible += 1;
		}
		if (count) count.textContent = `Showing ${visible} of ${cards.length} members`;
	};
	search?.addEventListener("input", update);
	for (const filter of filters) filter.addEventListener("click", () => {
		activeFilter = filter.dataset["memberFilter"] ?? "all";
		filters.forEach((button) => {
			button.classList.toggle("is-secondary", button !== filter);
		});
		update();
	});
	update();
}
function filterMatches(card, filter, section) {
	if (filter === "pdga") return card.dataset["memberHasPdga"] === "true";
	if (filter === "founding" && section.foundingYear) return card.dataset["memberFounding"] === "true";
	return true;
}

//#endregion
//#region src/render/membership.ts
function renderMembership(section) {
	const benefits = section.benefits.length > 0 ? `<ul>${section.benefits.map((benefit) => `<li>${escapeHtml(benefit)}</li>`).join("")}</ul>` : renderEmpty("Add membership benefits in your config.");
	const payment = section.payment ? renderPayment(section.payment) : renderPaymentMissing();
	const description = section.description ? `<p class="odgc-description">${escapeHtml(section.description)}</p>` : "";
	const price = section.priceLabel ? `<span class="odgc-badge">${escapeHtml(section.priceLabel)}</span>` : "";
	return `
    <section class="odgc-section">
      ${renderSectionHeader(section.title)}
      <div class="odgc-card">
        ${price}
        ${description}
        ${benefits}
        ${payment}
      </div>
    </section>
  `;
}
function renderPayment(payment) {
	switch (payment.provider) {
		case "external": return `<a class="odgc-button" href="${escapeAttribute(payment.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(payment.label)}</a>`;
		case "paypal": {
			const url = paypalUrl(payment);
			return url ? `<a class="odgc-button" href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">Join with PayPal</a>` : renderPaymentMissing();
		}
		default: return assertNever(payment);
	}
}
function renderPaymentMissing() {
	return `<p class="odgc-muted">Payment is not configured. Add PayPal or an external join link when you are ready.</p>`;
}
function paypalUrl(payment) {
	if (payment.checkoutUrl) return payment.checkoutUrl;
	if (!payment.businessEmail || !payment.amount) return null;
	return `https://www.paypal.com/cgi-bin/webscr?${new URLSearchParams({
		cmd: "_xclick",
		business: payment.businessEmail,
		currency_code: "USD",
		amount: String(payment.amount),
		item_name: payment.itemName ?? "Club Membership"
	}).toString()}`;
}

//#endregion
//#region src/render/setup.ts
function renderSetupSummary(config) {
	return `
    <section class="odgc-section">
      <div class="odgc-card">
        <h2 class="odgc-card-title">Optional Integration Status</h2>
        <div class="odgc-table-wrap">
          <table>
            <tbody>${[
		integrationRow("Google Sheets events", Boolean(config.events.source)),
		integrationRow("Google Sheets tournaments", Boolean(config.tournaments.source)),
		integrationRow("PayPal or join link", Boolean(config.membership.payment)),
		integrationRow("UDisc course actions", hasCourseValue(config, "udiscUrl")),
		integrationRow("Maps course actions", hasCourseValue(config, "mapUrl") || hasCoordinates(config)),
		integrationRow("YouTube course previews", hasCourseValue(config, "youtubeUrl")),
		integrationRow("PDGA member links", config.members.pdgaLinks),
		integrationRow("Member gate", Boolean(config.members.gate))
	].join("")}</tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}
function integrationRow(label, enabled) {
	return `
    <tr>
      <td>${escapeHtml(label)}</td>
      <td><span class="odgc-badge">${enabled ? "Enabled" : "Optional"}</span></td>
    </tr>
  `;
}
function hasCourseValue(config, key) {
	return config.courses.groups.some((group) => group.courses.some((course) => Boolean(course[key])));
}
function hasCoordinates(config) {
	return config.courses.groups.some((group) => group.courses.some((course) => Boolean(course.coordinates)));
}

//#endregion
//#region src/render/styles.ts
const baseStyles = `
<style>
  :host {
    --odgc-surface: #f8faf7;
    --odgc-panel: #ffffff;
    --odgc-elevated: #ffffff;
    --odgc-text: #192319;
    --odgc-muted: #5d6b5f;
    --odgc-subtle: #879184;
    --odgc-border: #dde5d8;
    --odgc-primary: #ff6b35;
    --odgc-secondary: #2d5016;
    --odgc-info: #004e89;
    --odgc-success: #2f7d32;
    --odgc-warning: #d99b00;
    --odgc-error: #b3261e;
    --odgc-radius: 16px;
    --odgc-radius-sm: 10px;
    --odgc-space-1: 4px;
    --odgc-space-2: 8px;
    --odgc-space-3: 12px;
    --odgc-space-4: 16px;
    --odgc-space-5: 20px;
    --odgc-space-6: 24px;
    --odgc-space-8: 32px;
    --odgc-space-10: 40px;
    --odgc-space-12: 48px;
    --odgc-shadow-subtle: 0 1px 2px rgba(25, 35, 25, 0.05);
    --odgc-shadow-default: 0 10px 28px rgba(25, 35, 25, 0.12);
    color: var(--odgc-text);
    display: block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  .odgc-shell {
    background: var(--odgc-surface);
    border: 1px solid var(--odgc-border);
    border-radius: var(--odgc-radius);
    padding: var(--odgc-space-8);
  }

  .odgc-stack {
    display: grid;
    gap: var(--odgc-space-10);
  }

  .odgc-section {
    display: grid;
    gap: var(--odgc-space-5);
  }

  .odgc-section-header {
    display: grid;
    gap: var(--odgc-space-2);
  }

  .odgc-title {
    color: var(--odgc-text);
    font-size: 32px;
    font-weight: 800;
    line-height: 1.15;
    margin: 0;
  }

  .odgc-suite-title {
    font-size: 40px;
  }

  .odgc-subtitle,
  .odgc-description,
  .odgc-muted {
    color: var(--odgc-muted);
    font-size: 16px;
    line-height: 1.55;
    margin: 0;
  }

  .odgc-grid {
    display: grid;
    gap: var(--odgc-space-4);
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .odgc-card {
    background: var(--odgc-panel);
    border: 1px solid var(--odgc-border);
    border-radius: var(--odgc-radius);
    box-shadow: var(--odgc-shadow-subtle);
    color: var(--odgc-text);
    display: grid;
    gap: var(--odgc-space-3);
    padding: var(--odgc-space-5);
    transition: box-shadow 200ms ease-in-out, transform 200ms ease-in-out;
  }

  .odgc-card:hover {
    box-shadow: var(--odgc-shadow-default);
    transform: translateY(-2px);
  }

  .odgc-card-title {
    color: var(--odgc-text);
    font-size: 18px;
    font-weight: 700;
    line-height: 1.35;
    margin: 0;
  }

  .odgc-meta {
    color: var(--odgc-muted);
    display: flex;
    flex-wrap: wrap;
    font-size: 14px;
    gap: var(--odgc-space-2);
  }

  .odgc-badge {
    align-items: center;
    background: color-mix(in srgb, var(--odgc-secondary) 12%, transparent);
    border-radius: 999px;
    color: var(--odgc-secondary);
    display: inline-flex;
    font-size: 12px;
    font-weight: 700;
    gap: var(--odgc-space-1);
    line-height: 1.35;
    padding: var(--odgc-space-1) var(--odgc-space-3);
    text-transform: uppercase;
  }

  .odgc-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--odgc-space-2);
    margin-top: var(--odgc-space-2);
  }

  .odgc-button,
  button.odgc-button {
    align-items: center;
    background: var(--odgc-primary);
    border: 1px solid transparent;
    border-radius: var(--odgc-radius-sm);
    color: var(--odgc-panel);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    justify-content: center;
    min-height: 40px;
    padding: var(--odgc-space-2) var(--odgc-space-4);
    text-decoration: none;
    transition: background 120ms ease-out, transform 120ms ease-out;
  }

  .odgc-button:hover {
    filter: brightness(0.96);
    transform: translateY(-1px);
  }

  .odgc-button:active {
    transform: translateY(0);
  }

  .odgc-button:focus-visible,
  .odgc-input:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--odgc-primary) 35%, transparent);
    outline-offset: 2px;
  }

  .odgc-button.is-secondary {
    background: var(--odgc-panel);
    border-color: var(--odgc-border);
    color: var(--odgc-text);
  }

  .odgc-input {
    background: var(--odgc-panel);
    border: 1px solid var(--odgc-border);
    border-radius: var(--odgc-radius-sm);
    color: var(--odgc-text);
    font: inherit;
    min-height: 44px;
    padding: var(--odgc-space-3) var(--odgc-space-4);
    width: 100%;
  }

  .odgc-controls {
    display: grid;
    gap: var(--odgc-space-3);
    grid-template-columns: minmax(0, 1fr);
  }

  .odgc-table-wrap {
    border: 1px solid var(--odgc-border);
    border-radius: var(--odgc-radius);
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    min-width: 640px;
    width: 100%;
  }

  th,
  td {
    border-bottom: 1px solid var(--odgc-border);
    padding: var(--odgc-space-3);
    text-align: left;
    vertical-align: top;
  }

  th {
    color: var(--odgc-muted);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .odgc-error {
    border-color: var(--odgc-error);
    color: var(--odgc-error);
  }

  .odgc-hidden {
    display: none;
  }

  @media (max-width: 640px) {
    .odgc-shell {
      padding: var(--odgc-space-5);
    }

    .odgc-suite-title {
      font-size: 32px;
    }

    table {
      min-width: 100%;
      table-layout: fixed;
    }

    th,
    td {
      font-size: 10px;
      padding: var(--odgc-space-2) var(--odgc-space-1);
      word-break: break-word;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition: none;
    }
  }
</style>
`;

//#endregion
//#region src/elements/base.ts
var OdgcBaseElement = class extends HTMLElement {
	root;
	configOverride = null;
	constructor() {
		super();
		this.root = this.attachShadow({ mode: "open" });
	}
	set config(value) {
		this.configOverride = parseClubConfig(value);
		if (this.isConnected) this.update();
	}
	async connectedCallback() {
		await this.update();
	}
	afterRender(_root, _config) {}
	async update() {
		this.root.innerHTML = `${baseStyles}<div class="odgc-shell"><p class="odgc-muted">Loading...</p></div>`;
		try {
			const config = await this.loadConfig();
			const html = await this.renderWithConfig(config);
			this.root.innerHTML = `${baseStyles}${html}`;
			this.afterRender(this.root, config);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown rendering failure";
			this.root.innerHTML = `${baseStyles}<div class="odgc-shell">${renderLoadError(message)}</div>`;
		}
	}
	async loadConfig() {
		if (this.configOverride) return this.configOverride;
		const configUrl = this.getAttribute("config-url");
		if (configUrl) return parseClubConfig(await ky.get(configUrl).json());
		return this.readInlineConfig() ?? defaultClubConfig;
	}
	readInlineConfig() {
		const text = this.querySelector("script[type=\"application/json\"]")?.textContent;
		if (!text || text.trim().length === 0) return null;
		return parseClubConfig(JSON.parse(text));
	}
};

//#endregion
//#region src/elements/club.ts
var OpenDiscGolfClubElement = class extends OdgcBaseElement {
	async renderWithConfig(config) {
		const [events, tournaments, members, league] = await Promise.all([
			loadEvents(config.events.source, config.events.items, config.events.showPast),
			loadTournaments(config.tournaments.source, config.tournaments.items),
			loadMembers(config.members.source, config.members.items),
			loadLeagueData(config.league.source, config.league.data)
		]);
		return `
      <div class="odgc-shell">
        <div class="odgc-stack">
          ${renderHero(config)}
          ${renderCourses(config.courses)}
          ${renderEvents(config.events.title, events, config.events.maxVisible)}
          ${renderTournaments(config.tournaments.title, tournaments, config.tournaments.maxVisible, config.tournaments.externalUrl)}
          ${renderMembership(config.membership)}
          ${renderContact(config.contact)}
          ${renderMembers(config.members, members)}
          ${renderLeague(config.league.title, league)}
          ${renderSetupSummary(config)}
        </div>
      </div>
    `;
	}
	afterRender(root, config) {
		wireMemberControls(root, config.members);
	}
};

//#endregion
//#region src/elements/courses.ts
var OdgcCoursesElement = class extends OdgcBaseElement {
	async renderWithConfig(config) {
		return `<div class="odgc-shell">${renderCourses(config.courses)}</div>`;
	}
};

//#endregion
//#region src/elements/events.ts
var OdgcEventsElement = class extends OdgcBaseElement {
	async renderWithConfig(config) {
		const events = await loadEvents(config.events.source, config.events.items, config.events.showPast);
		return `<div class="odgc-shell">${renderEvents(config.events.title, events, config.events.maxVisible)}</div>`;
	}
};
var OdgcTournamentsElement = class extends OdgcBaseElement {
	async renderWithConfig(config) {
		const tournaments = await loadTournaments(config.tournaments.source, config.tournaments.items);
		return `
      <div class="odgc-shell">
        ${renderTournaments(config.tournaments.title, tournaments, config.tournaments.maxVisible, config.tournaments.externalUrl)}
      </div>
    `;
	}
};

//#endregion
//#region src/elements/members.ts
var OdgcMembersElement = class extends OdgcBaseElement {
	async renderWithConfig(config) {
		const members = await loadMembers(config.members.source, config.members.items);
		return `<div class="odgc-shell">${renderMembers(config.members, members)}</div>`;
	}
	afterRender(root, config) {
		wireMemberControls(root, config.members);
	}
};
var OdgcLeagueElement = class extends OdgcBaseElement {
	async renderWithConfig(config) {
		const league = await loadLeagueData(config.league.source, config.league.data);
		return `<div class="odgc-shell">${renderLeague(config.league.title, league)}</div>`;
	}
};

//#endregion
//#region src/elements/membership.ts
var OdgcMembershipElement = class extends OdgcBaseElement {
	async renderWithConfig(config) {
		return `<div class="odgc-shell">${renderMembership(config.membership)}</div>`;
	}
};
var OdgcContactElement = class extends OdgcBaseElement {
	async renderWithConfig(config) {
		return `<div class="odgc-shell">${renderContact(config.contact)}</div>`;
	}
};

//#endregion
//#region src/define.ts
const ELEMENTS = [
	["open-disc-golf-club", OpenDiscGolfClubElement],
	["odgc-courses", OdgcCoursesElement],
	["odgc-events", OdgcEventsElement],
	["odgc-tournaments", OdgcTournamentsElement],
	["odgc-membership", OdgcMembershipElement],
	["odgc-contact", OdgcContactElement],
	["odgc-members", OdgcMembersElement],
	["odgc-league", OdgcLeagueElement]
];
function defineOpenDiscGolfClubElements() {
	if (typeof customElements === "undefined") return;
	for (const [name, element] of ELEMENTS) if (!customElements.get(name)) customElements.define(name, element);
}

//#endregion
//#region src/index.ts
defineOpenDiscGolfClubElements();

//#endregion
export { ClubConfigSchema, CoordinatesSchema, CourseGroupSchema, CourseSchema, DataSourceSchema, EventItemSchema, EventsSectionSchema, LeagueDataSchema, MemberGateSchema, MemberSchema, PaymentSchema, TournamentItemSchema, TournamentsSectionSchema, buildCourseActions, defaultClubConfig, defineOpenDiscGolfClubElements, parseClubConfig };
//# sourceMappingURL=index.mjs.map