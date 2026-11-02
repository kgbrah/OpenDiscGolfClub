import { describe, expect, it } from "vitest";
import worker from "../src/index.js";
import { handicapFromToPars, handicapKey, handicapsFromRounds } from "../src/handicap.js";
import { arrayField, jsonObject } from "./json.js";

describe("club handicap math", () => {
  it("matches the shared key and allowance", () => {
    expect(handicapKey("m_jane")).toBe("f80beab03abc5111");
    expect(handicapKey("g_guest")).toBe("");
    expect(handicapFromToPars([8])).toMatchObject({ start: -4, rounds: 1, provisional: true });
    expect(handicapFromToPars([-2, -2, -2])).toMatchObject({ start: 2, rounds: 3, provisional: false });
    const players = handicapsFromRounds([
      { member_id: "m_hot", name: "Hot", to_par: -6, played_at: "2026-10-01" },
      { member_id: "m_hot", name: "Hot", to_par: -6, played_at: "2026-09-01" },
      { member_id: "m_hot", name: "Hot", to_par: -6, played_at: "2026-08-01" },
      { member_id: "g_guest", name: "Guest", to_par: -20, played_at: "2026-10-01" },
    ], new Date("2026-11-02T12:00:00Z"));
    expect(players).toEqual([
      { key: handicapKey("m_hot"), name: "Hot", start: 6, rounds: 3, provisional: false },
    ]);
  });
});

const ROUNDS = [
  { member_id: "m_hot", name: "Hot", to_par: -2, played_at: "2026-10-01" },
  { member_id: "m_hot", name: "Hot", to_par: -2, played_at: "2026-09-01" },
  { member_id: "m_hot", name: "Hot", to_par: -2, played_at: "2026-08-01" },
  { member_id: "g_guest", name: "Guest", to_par: -10, played_at: "2026-10-01" },
];

function env() {
  return {
    ROSTER: { get: async () => null, put: async () => {}, delete: async () => {} },
    RATELIMIT: { get: async () => null, put: async () => {}, delete: async () => {} },
    DB: {
      prepare: (sql: string) => ({
        bind() { return this; },
        all: async () => ({ results: /played_at/.test(sql) ? ROUNDS : [], success: true }),
        first: async () => null,
        run: async () => ({ results: [], success: true }),
      }),
    },
    JWT_SECRET: "x".repeat(40),
    ALLOWED_ORIGINS: "http://localhost:8080",
  } as unknown as Parameters<typeof worker.fetch>[1];
}

describe("GET /layouts/:id/handicaps", () => {
  it("returns starts without member ids", async () => {
    const res = await worker.fetch(new Request("https://w/layouts/4/handicaps", { headers: { Origin: "http://localhost:8080" } }), env());
    expect(res.status).toBe(200);
    const body = await jsonObject(res);
    const players = arrayField(body, "players");
    expect(players).toHaveLength(1);
    expect(players[0]).toMatchObject({ name: "Hot", start: 2, rounds: 3, provisional: false });
    expect(players[0]).not.toHaveProperty("member_id");
    expect(JSON.stringify(body)).not.toContain("m_hot");
    expect(JSON.stringify(body)).not.toContain("g_guest");
  });

  it("rejects a bad layout id", async () => {
    const res = await worker.fetch(new Request("https://w/layouts/nope/handicaps", { headers: { Origin: "http://localhost:8080" } }), env());
    expect(res.status).toBe(404);
  });
});
