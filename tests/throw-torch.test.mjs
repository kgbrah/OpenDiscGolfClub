import assert from "node:assert/strict";
import test from "node:test";

import { setTrackTorch, torchConstraints, trackSupportsTorch } from "../src/score-app/throw-film.js";

test("the light is switched without restarting the picture size", async () => {
  let applied = null;
  const track = {
    readyState: "live",
    async applyConstraints(next) { applied = next; },
  };
  assert.deepEqual(torchConstraints(true), { advanced: [{ torch: true }] });
  assert.equal(await setTrackTorch(track, true), true);
  assert.deepEqual(applied, { advanced: [{ torch: true }] });
  assert.equal(applied.width, undefined);
});

test("the front camera is not offered a light", () => {
  assert.equal(trackSupportsTorch({
    getCapabilities: () => ({}),
    getSettings: () => ({ facingMode: "user" }),
  }), false);
  assert.equal(trackSupportsTorch({
    getCapabilities: () => ({ torch: true }),
    getSettings: () => ({ facingMode: "environment" }),
  }), true);
});
