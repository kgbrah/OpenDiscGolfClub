import { describe, expect, it } from "vitest";

import { parseProductLabel } from "../src/product-vision.js";

describe("parseProductLabel", () => {
  it("keeps a readable stamp and drops junk", () => {
    const label = parseProductLabel('```json\n{"name":"Buzzz","brand":"Discraft","productType":"midrange","color":"pink","weight":"177g","price":"$18.50"}\n```');
    expect(label).toEqual({
      name: "Buzzz",
      brand: "Discraft",
      productType: "midrange",
      color: "pink",
      weight: "177",
      price: "18.50",
    });
  });

  it("rejects a sentence, a bad type, and a price that is not a price", () => {
    const label = parseProductLabel('{"name":"this is a long description of the whole disc and it should not become the product name","productType":"driver","weight":"12","price":"free"}');
    expect(label.name).toBe("");
    expect(label.productType).toBe("distance_driver");
    expect(label.weight).toBe("");
    expect(label.price).toBe("");
  });
});
