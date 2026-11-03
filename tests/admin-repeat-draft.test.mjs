import assert from "node:assert/strict";
import test from "node:test";

import {
  calendarDaysBetween,
  minusWallMinutes,
  nextWeeklyDate,
  pickRepeatEvent,
  repeatLabel,
  shiftWallByDays,
} from "../src/admin-app/repeat-draft.js";

test("next weekly date keeps the weekday and lands after today", () => {
  assert.equal(nextWeeklyDate("2026-10-24", "2026-11-02"), "2026-11-07");
  assert.equal(nextWeeklyDate("2026-11-07", "2026-11-02"), "2026-11-14");
  assert.equal(calendarDaysBetween("2026-10-24", "2026-11-07"), 14);
});

test("wall clocks shift by whole days and check-in can sit 15 minutes earlier", () => {
  assert.equal(shiftWallByDays("2026-10-24T09:00", 14), "2026-11-07T09:00");
  assert.equal(minusWallMinutes("2026-11-07T09:00", 15), "2026-11-07T08:45");
  assert.equal(minusWallMinutes("2026-11-07T00:10", 15), "2026-11-06T23:55");
});

test("repeat prefers the latest past league night", () => {
  const events = [
    { date: "2026-11-14", name: "Future tournament", status: "scheduled", type: "tournament" },
    { date: "2026-10-31", name: "Saturday league", status: "final", type: "league_round" },
    { date: "2026-10-24", name: "Older league", status: "final", type: "league_round" },
    { date: "2026-11-01", name: "Cancelled", status: "cancelled", type: "league_round" },
  ];
  const picked = pickRepeatEvent(events, "2026-11-02");
  assert.equal(picked.name, "Saturday league");
  assert.match(repeatLabel(picked, "2026-11-07"), /Same as Saturday league/);
});
