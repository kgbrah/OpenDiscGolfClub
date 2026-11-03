const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value) {
  return String(value).padStart(2, "0");
}

export function addCalendarDays(dateStr, days) {
  const match = DATE.exec(String(dateStr || ""));
  if (!match) return "";
  const next = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

export function calendarDaysBetween(from, to) {
  if (!DATE.test(String(from || "")) || !DATE.test(String(to || ""))) return 0;
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.round((end - start) / 86400000);
}

export function nextWeeklyDate(dateStr, today) {
  if (!DATE.test(String(dateStr || "")) || !DATE.test(String(today || ""))) return "";
  let days = 7;
  let next = addCalendarDays(dateStr, days);
  while (next && next <= today) {
    days += 7;
    next = addCalendarDays(dateStr, days);
    if (days > 370) return "";
  }
  return next;
}

export function shiftWallByDays(value, days) {
  const text = String(value || "");
  const match = text.match(/^(\d{4}-\d{2}-\d{2})(.*)$/);
  if (!match || !days) return text;
  return addCalendarDays(match[1], days) + match[2];
}

export function minusWallMinutes(wall, minutes) {
  const match = String(wall || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return "";
  const next = new Date(Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]) - minutes,
  ));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}T${pad(next.getUTCHours())}:${pad(next.getUTCMinutes())}`;
}

function eventDay(event) {
  return String(event && event.date || "").slice(0, 10);
}

export function pickRepeatEvent(events, today) {
  const rows = (Array.isArray(events) ? events : []).filter((event) => {
    if (!event || event.status === "cancelled") return false;
    return DATE.test(eventDay(event));
  });
  const past = rows
    .filter((event) => eventDay(event) <= today)
    .sort((left, right) => eventDay(right).localeCompare(eventDay(left)) || String(right.starts_at || "").localeCompare(String(left.starts_at || "")));
  const future = rows
    .filter((event) => eventDay(event) > today)
    .sort((left, right) => eventDay(left).localeCompare(eventDay(right)));
  const pool = past.length ? past : future;
  return pool.find((event) => event.type === "league_round") || pool[0] || null;
}

export function repeatLabel(event, nextDate) {
  const name = event && event.name ? String(event.name) : "last event";
  if (!DATE.test(String(nextDate || ""))) return `Same as ${name}`;
  const when = new Date(`${nextDate}T12:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `Same as ${name} · ${when}`;
}

function isWeeklyLeague(event) {
  if (!event || event.type !== "league_round" || event.status === "cancelled") return false;
  const name = String(event.name || "").trim();
  if (!name || /\bvs\.?\b/i.test(name) || /^#?\d+\b/.test(name)) return false;
  return DATE.test(eventDay(event));
}

export function nextWeekOffer(events, today) {
  const source = pickRepeatEvent((Array.isArray(events) ? events : []).filter(isWeeklyLeague), today);
  const day = source ? eventDay(source) : "";
  if (!source || !DATE.test(day) || day > String(today || "")) return null;
  const nextDate = nextWeeklyDate(day, today);
  if (!nextDate) return null;
  const taken = (Array.isArray(events) ? events : []).some((event) => {
    if (!event || event.status === "cancelled") return false;
    return eventDay(event) === nextDate && String(event.name || "") === String(source.name || "");
  });
  if (taken) return null;
  return { label: `Put ${source.name} on the calendar`, nextDate, source };
}
