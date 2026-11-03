import assert from "node:assert/strict";
import test from "node:test";

import { SHOP_BRANDS, SHOP_COLORS, matchChoice, weightOptions } from "../src/admin-app/shop-choices.js";

test("brand, color, and weight are choices, with room for a shelf outlier", () => {
  assert.ok(SHOP_BRANDS.includes("Clash"));
  assert.ok(SHOP_COLORS.includes("White"));
  assert.deepEqual(weightOptions(["140", "175"]).slice(0, 2), ["140", "150"]);
  assert.equal(matchChoice("white", SHOP_COLORS), "White");
  assert.equal(matchChoice("Swirl", SHOP_COLORS), "");
});
