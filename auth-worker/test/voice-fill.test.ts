import { describe, expect, it } from "vitest";
import { eventFieldsFromModel, extractJsonObject, shopFieldsFromModel } from "../src/voice-fill.js";

describe("voice fill", () => {
  it("fills only the shop blanks that were said", () => {
    const raw = extractJsonObject(`Sure.\n{"name":"Destroyer","brand":"Innova","productType":"distance_driver","price":18,"stock":"6","color":"red","weight":175,"category":"disc","description":null}`);
    expect(shopFieldsFromModel(raw)).toEqual({
      brand: "Innova",
      category: "disc",
      color: "red",
      name: "Destroyer",
      price: "18",
      productType: "distance_driver",
      stock: "6",
      weight: "175",
    });
  });

  it("drops an invented shop price over 500 dollars", () => {
    expect(shopFieldsFromModel({ name: "Bag", price: 1800 })).toEqual({ name: "Bag" });
  });

  it("maps a spoken event onto stroke play with handicap and a wall-clock start", () => {
    expect(eventFieldsFromModel({
      courseName: "The Farm",
      format: "singles-stroke",
      handicap: true,
      name: "Saturday singles",
      startsAt: "2026-11-07T09:00",
      type: "tournament",
    })).toMatchObject({
      courseName: "The Farm",
      format: "singles-stroke",
      handicap: true,
      name: "Saturday singles",
      startsAt: "2026-11-07T09:00",
      type: "tournament",
    });
  });

  it("does not turn a matchplay round into handicap stroke", () => {
    const fields = eventFieldsFromModel({ format: "doubles-matchplay", handicap: true, name: "Doubles" });
    expect(fields.format).toBe("doubles-matchplay");
    expect(fields.handicap).toBeUndefined();
  });
});
