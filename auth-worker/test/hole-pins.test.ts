import { describe, expect, it } from "vitest";
import { fillMissingHolePins, holesFromPositionLabels, markerHasPin } from "../src/hole-pins.js";

describe("hole pins", () => {
  it("fills a blank hole from Hole N labels and keeps a layout pin", () => {
    const donors = holesFromPositionLabels([
      { label: "Hole 1 tee", lat: 35.6048891, lng: -77.5758821, kind: "tee" },
      { label: "Hole 1 basket", lat: 35.6063939, lng: -77.5757044, kind: "target" },
      { label: "Blue", lat: 1, lng: 2, kind: "tee" },
    ]);
    expect(donors).toHaveLength(1);
    expect(markerHasPin(donors[0]?.tee)).toBe(true);
    const holes = fillMissingHolePins(
      [
        { hole: 1, par: 4, distance_ft: 565, tee: { label: "Blue", lat: null, lng: null }, target: { label: "Main", lat: null, lng: null } },
        { hole: 3, par: 3, tee: { label: "Blue", lat: 35.1, lng: -77.1 }, target: { label: "Main", lat: 35.2, lng: -77.2 } },
      ],
      [donors, [{ hole: 3, tee: { lat: 9, lng: 9 }, target: { lat: 8, lng: 8 } }]],
    );
    expect(holes[0]?.tee).toMatchObject({ label: "Blue", lat: 35.6048891, lng: -77.5758821 });
    expect(holes[0]?.target).toMatchObject({ label: "Main", lat: 35.6063939 });
    expect(holes[0]?.distance_ft).toBe(565);
    expect(holes[1]?.tee).toMatchObject({ lat: 35.1, lng: -77.1 });
  });

  it("lets the current layout beat the position pool, and leaves a full card alone", () => {
    const filled = fillMissingHolePins(
      [{ hole: 2, tee: { label: "Blue" }, target: { label: "Yellow" } }],
      [
        holesFromPositionLabels([
          { label: "Hole 2 tee", lat: 1, lng: 2 },
          { label: "Hole 2 basket", lat: 3, lng: 4 },
        ]),
        [{ hole: 2, tee: { lat: 35.5, lng: -77.5 }, target: { lat: 35.51, lng: -77.49 } }],
      ],
    );
    expect(filled[0]?.tee).toMatchObject({ label: "Blue", lat: 35.5, lng: -77.5 });
    expect(filled[0]?.target).toMatchObject({ label: "Yellow", lat: 35.51, lng: -77.49 });
    expect(fillMissingHolePins(filled, [[{ hole: 2, tee: { lat: 0, lng: 0 }, target: { lat: 1, lng: 1 } }]])).toBe(filled);
  });
});
