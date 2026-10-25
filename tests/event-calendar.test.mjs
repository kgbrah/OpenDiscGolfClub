import assert from "node:assert/strict";
import test from "node:test";

import { calendarEventFromClub, calendarEventFromPdga, eventCalendarIcs } from "../src/shared/event-calendar.js";

test("a PDGA event becomes an all-day calendar span", () => {
  const item = calendarEventFromPdga({
    name: "Raleigh Open",
    date: "Sat, Oct 3-4, 2026",
    course: "Kentwood",
    place: "Raleigh, NC",
    url: "https://www.discgolfscene.com/tournaments/Raleigh_Open",
  });
  assert.equal(item.allDay, true);
  assert.equal(item.start, "20261003");
  assert.equal(item.end, "20261005");
  const ics = eventCalendarIcs(item, new Date("2026-10-01T12:00:00Z"));
  assert.match(ics, /DTSTART;VALUE=DATE:20261003/);
  assert.match(ics, /DTEND;VALUE=DATE:20261005/);
  assert.match(ics, /SUMMARY:Raleigh Open/);
  assert.match(ics, /LOCATION:Kentwood\\, Raleigh\\, NC/);
  assert.match(ics, /Register: https:\/\/www.discgolfscene.com\/tournaments\/Raleigh_Open/);
});

test("a club event with a start time is a timed calendar entry", () => {
  const timed = calendarEventFromClub({
    id: 12,
    name: "Week 3",
    date: "2026-10-28",
    starts_at: "2026-10-28T22:00:00.000Z",
    course_name: "West Meadowbrook",
  });
  assert.equal(timed.allDay, false);
  assert.match(eventCalendarIcs(timed), /DTSTART:20261028T220000Z/);
  const day = calendarEventFromClub({ id: 4, name: "Flex", date: "2026-10-28" });
  assert.equal(day.allDay, true);
  assert.equal(day.start, "20261028");
  assert.equal(day.end, "20261029");
});
