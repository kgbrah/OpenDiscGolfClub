import assert from "node:assert/strict";
import test from "node:test";

import { applyEventVoice, applyShopVoice, matchCourseId } from "../src/admin-app/voice-fill.js";

test("voice fill writes shop blanks and leaves the rest", () => {
  const next = applyShopVoice({ brand: "MVP", name: "", price: "", stock: "1" }, { name: "Glitch", price: "14" });
  assert.equal(next.name, "Glitch");
  assert.equal(next.price, "14");
  assert.equal(next.brand, "MVP");
  assert.equal(next.stock, "1");
});

test("voice fill matches a spoken course and keeps handicap on stroke play", () => {
  const courses = [{ id: "4", label: "The Farm - Greenville" }];
  const next = applyEventVoice(
    { courseId: "", format: "", handicap: false, name: "" },
    { courseName: "the farm", format: "singles-stroke", handicap: true, name: "Saturday singles" },
    courses,
  );
  assert.equal(next.courseId, "4");
  assert.equal(next.handicap, true);
  assert.equal(matchCourseId(courses, "mystery"), "");
});
