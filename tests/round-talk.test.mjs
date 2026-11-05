import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { mergeRoundMessages } from "../src/shared/round-messages-model.js";
import { messagePathFromLocation } from "../src/score-app/round-talk.js";

test("a watcher message lands on the card thread", () => {
  const merged = mergeRoundMessages([], [
    { id: 1, side: "watch", authorName: "Sam", toName: "Kevin", body: "Parked it" },
    { id: 1, side: "watch", authorName: "Sam", toName: "Kevin", body: "Parked it" },
  ]);
  assert.equal(merged.length, 1);
  assert.equal(messagePathFromLocation({ search: "?event=12" }), "/events/12/live/messages");
  assert.equal(messagePathFromLocation({ search: "?round=abcd" }), "/rounds/ABCD/live/messages");
  const watch = readFileSync("src/score-app/watch-view.js", "utf8");
  const card = readFileSync("src/score-app/scorecard-view.js", "utf8");
  assert.match(watch, /viewer: "watch"/);
  assert.match(card, /viewer: "card"/);
});
