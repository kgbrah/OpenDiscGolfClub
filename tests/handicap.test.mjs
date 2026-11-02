import assert from "node:assert/strict";
import test from "node:test";

import {
  decorateStandings,
  handicapFromToPars,
  handicapKey,
  handicapsFromRounds,
  myLayoutHandicaps,
} from "../src/shared/handicap.js";

const NOW = new Date("2026-11-02T12:00:00Z");

test("handicap key is stable and hides guests", () => {
  assert.equal(handicapKey("m_jane"), "f80beab03abc5111");
  assert.equal(handicapKey(" m_jane "), handicapKey("m_jane"));
  assert.equal(handicapKey("g_walkon"), "");
  assert.equal(handicapKey("op_open"), "");
  assert.equal(handicapKey(""), "");
});

test("thin records count less than a full average", () => {
  assert.deepEqual(handicapFromToPars([8]), { start: -4, rounds: 1, provisional: true, average: 8 });
  assert.deepEqual(handicapFromToPars([4, 8]), { start: -5, rounds: 2, provisional: true, average: 6 });
  assert.deepEqual(handicapFromToPars([-2, -2, -2]), { start: 2, rounds: 3, provisional: false, average: -2 });
  assert.equal(handicapFromToPars([]), null);
});

test("layout handicaps keep the newest five rounds in the past year", () => {
  const rounds = [
    { member_id: "m_hot", name: "Hot", to_par: 10, played_at: "2026-01-01" },
    { member_id: "m_hot", name: "Hot", to_par: -1, played_at: "2026-10-01" },
    { member_id: "m_hot", name: "Hot", to_par: -1, played_at: "2026-09-01" },
    { member_id: "m_hot", name: "Hot", to_par: -1, played_at: "2026-08-01" },
    { member_id: "m_hot", name: "Hot", to_par: -1, played_at: "2026-07-01" },
    { member_id: "m_hot", name: "Hot", to_par: -1, played_at: "2026-06-01" },
    { member_id: "m_hot", name: "Hot", to_par: 40, played_at: "2024-01-01" },
    { member_id: "g_guest", name: "Guest", to_par: -9, played_at: "2026-10-01" },
  ];
  const players = handicapsFromRounds(rounds, NOW);
  assert.equal(players.length, 1);
  assert.equal(players[0].name, "Hot");
  assert.equal(players[0].rounds, 5);
  assert.equal(players[0].provisional, false);
  assert.equal(players[0].start, 1);
  assert.equal(players[0].key, handicapKey("m_hot"));
  assert.equal(JSON.stringify(players).includes("member_id"), false);
});

test("my layout handicaps group finished stroke cards and skip match play", () => {
  const rows = myLayoutHandicaps([
    { layout_id: 4, course_name: "West Meadowbrook Park", layout_name: "Main", to_par: 4, place: 2, finalized_at: "2026-10-01", stroke: true },
    { layout_id: 4, course_name: "West Meadowbrook Park", layout_name: "Main", to_par: 8, place: 3, finalized_at: "2026-09-01", stroke: true },
    { layout_id: 4, course_name: "West Meadowbrook Park", layout_name: "Main", to_par: -20, place: 1, finalized_at: "2026-08-01", stroke: false },
    { layout_id: 9, course_name: "Covenant Church", layout_name: "Short", to_par: -3, place: null, finalized_at: "2026-10-02" },
  ], NOW);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].course, "West Meadowbrook Park");
  assert.equal(rows[0].layout, "Main");
  assert.equal(rows[0].start, -5);
  assert.equal(rows[0].provisional, true);
});

test("leaderboard ranks net and leaves players without a start last", () => {
  const byKey = {
    aaa: { start: -4, rounds: 4, provisional: false },
    bbb: { start: 2, rounds: 1, provisional: true },
  };
  const ranked = decorateStandings([
    { name: "Gross", toPar: -8, thru: 18, handicapKeys: ["missing"] },
    { name: "Hot", toPar: 1, thru: 18, handicapKeys: ["aaa"] },
    { name: "Cold", toPar: -1, thru: 18, handicapKeys: ["bbb"] },
    { name: "Guest", toPar: -10, thru: 18, handicapKeys: [""] },
  ], byKey);
  assert.deepEqual(ranked.map((row) => [row.name, row.net, row.handicapStart]), [
    ["Hot", -3, -4],
    ["Cold", 1, 2],
    ["Guest", null, null],
    ["Gross", null, null],
  ]);
  assert.deepEqual(decorateStandings([{ name: "A", toPar: 1 }], null).map((row) => row.name), ["A"]);
});
