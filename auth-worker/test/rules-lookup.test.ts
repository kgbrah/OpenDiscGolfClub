import { describe, expect, it } from "vitest";
import { formatPhotoContext, formatRulesContext, rulesForQuestion } from "../src/rules-lookup.js";
import { takeRulingImages } from "../src/photos.js";

describe("rules lookup", () => {
  it("stays quiet for a normal club question", () => {
    expect(rulesForQuestion("when is the next league round?", false)).toEqual([]);
  });

  it("picks the out-of-bounds note without copying a rulebook", () => {
    const notes = rulesForQuestion("Is this disc OB if it crossed the water?", false);
    expect(notes.map((note) => note.id)).toContain("ob");
    expect(formatRulesContext(notes)).toMatch(/not a tournament director/);
    expect(formatRulesContext(notes)).toMatch(/806/);
    expect(formatRulesContext(notes).length).toBeLessThan(4000);
  });

  it("adds the lie notes when a photo is attached, even if the question is short", () => {
    const notes = rulesForQuestion("what's the call?", true);
    expect(notes.map((note) => note.id)).toEqual(expect.arrayContaining(["ob", "mark", "mando", "relief"]));
    expect(notes.length).toBeLessThanOrEqual(5);
  });

  it("says a video is still frames, not motion", () => {
    const text = formatPhotoContext(["A disc is next to a rope."], "video");
    expect(text).toMatch(/still frames/);
    expect(text).toMatch(/foot fault/);
    expect(text).toMatch(/rope/);
  });

  it("rejects a ruling image that is not a real jpeg, png, or webp", () => {
    expect(takeRulingImages(["data:image/svg+xml;base64,PHN2Zy8+"])).toBeNull();
    const jpeg = "data:image/jpeg;base64," + btoa(String.fromCharCode(0xff, 0xd8, 0xff, 0x00));
    expect(takeRulingImages([jpeg])).toHaveLength(1);
  });
});
