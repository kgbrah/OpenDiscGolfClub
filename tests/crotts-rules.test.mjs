import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Crotts can take a photo or video for a rules question", () => {
  const widget = readFileSync("src/shared/crotts-widget.js", "utf8");
  assert.match(widget, /accept: "image\/\*,video\/\*"/);
  assert.match(widget, /videoFrames/);
  assert.match(widget, /mediaKind/);
  assert.match(widget, /I can also open the page you need/);
  assert.match(widget, /rules question/);
  const route = readFileSync("auth-worker/src/assistant-route.ts", "utf8");
  assert.match(route, /describeRulingImage/);
  assert.match(route, /rulesForQuestion/);
});

test("a cardmate can film a throw and star a highlight", () => {
  const film = readFileSync("src/score-app/throw-film.js", "utf8");
  const card = readFileSync("src/score-app/scorecard-view.js", "utf8");
  const watch = readFileSync("src/score-app/watch-view.js", "utf8");
  assert.match(film, /Round highlight/);
  assert.match(film, /suggestedMoment/);
  assert.match(film, /Save to round/);
  assert.match(card, /ThrowFilm/);
  assert.match(card, /canStar: true/);
  assert.match(film, /aria-expanded/);
  assert.match(film, /stays with this round/);
  assert.match(film, /CLIP_POLL_MS/);
  assert.match(film, /getCapabilities/);
  assert.match(film, /3840/);
  assert.doesNotMatch(film, /ideal: 640/);
  assert.match(watch, /live: props.status !== "final"/);
  assert.doesNotMatch(watch, /highlightsOnly/);
  const sql = readFileSync("auth-worker/migrations/0039_throw_clips.sql", "utf8");
  assert.match(sql, /Do not read this table from handicap/);
});
