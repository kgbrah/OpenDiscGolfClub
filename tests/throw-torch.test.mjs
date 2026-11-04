import assert from "node:assert/strict";
import test from "node:test";

import { setTrackTorch, torchConstraints, trackSupportsTorch } from "../src/score-app/throw-film.js";

test("the rear camera can take a torch constraint without dropping the picture size", () => {
  const track = {
    constraints: { width: { ideal: 1920 }, height: { ideal: 1080 } },
    getConstraints() { return this.constraints; },
    async applyConstraints(next) {
      this.constraints = next;
    },
  };
  const next = torchConstraints(track, true);
  assert.equal(next.advanced[0].torch, true);
  assert.equal(next.width.ideal, 1920);
  return setTrackTorch(track, true).then((ok) => {
    assert.equal(ok, true);
    assert.equal(track.constraints.advanced[0].torch, true);
    assert.equal(track.constraints.width.ideal, 1920);
  });
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
