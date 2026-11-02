import { describe, expect, it } from "vitest";
import worker from "../src/index.js";
import { signSession } from "../src/jwt.js";
import { chooseUdiscPlayer, parseUdiscHistory } from "../src/imports/udisc-history.js";
import { jsonObject, arrayField } from "./json.js";

const CSV = [
  "PlayerName,CourseName,LayoutName,Date,Total,+/-,Hole1,Hole2,Hole3",
  'Par,"Farmville, NC",Blue,2024-03-15 1014,,,4,3,3',
  'Jane Doe,"Farmville, NC",Blue,2024-03-15 1014,7,+1,4,0,',
  'Bob,"Farmville, NC",Blue,2024-03-15 1014,11,+2,4,4,3',
  "Par,Other,Main,2024-04-01 930,,,3,3,3",
  "Jane Doe,Other,Main,2024-04-01 930,,-1,2,3,3",
].join("\n");

describe("parseUdiscHistory", () => {
  it("keeps the CSV total, drops unplayed holes, and reads compact times", () => {
    const parsed = parseUdiscHistory(CSV);
    expect("rounds" in parsed).toBe(true);
    if (!("rounds" in parsed)) return;
    expect(parsed.players).toEqual(["Jane Doe", "Bob"]);
    const jane = parsed.rounds.find((round) => round.playerName === "Jane Doe" && round.courseName === "Farmville, NC");
    expect(jane).toMatchObject({
      playedAt: "2024-03-15T10:14:00",
      layoutName: "Blue",
      total: 7,
      toPar: 1,
      holes: [{ hole: 1, par: 4, strokes: 4 }],
    });
    const summed = parsed.rounds.find((round) => round.courseName === "Other");
    expect(summed).toMatchObject({
      playedAt: "2024-04-01T09:30:00",
      total: 8,
      toPar: -1,
    });
    expect(summed?.holes).toHaveLength(3);
  });

  it("rejects a file that is not a rounds export and an empty card", () => {
    expect(parseUdiscHistory("name,score\nA,1")).toEqual({ error: "unrecognized_csv" });
    expect(parseUdiscHistory("PlayerName,CourseName,LayoutName,Date,Total,+/-,Hole1\nPar,C,L,2024-03-15 1014,,,3\n")).toEqual({ error: "empty" });
  });

  it("asks for a player when the file has more than one and none match the profile", () => {
    expect(chooseUdiscPlayer(["Jane Doe", "Bob"], { name: "Sam", udisc: "sam" })).toEqual({ players: ["Jane Doe", "Bob"] });
    expect(chooseUdiscPlayer(["Jane Doe", "Bob"], { name: "Jane Doe", udisc: null })).toEqual({ player: "Jane Doe" });
    expect(chooseUdiscPlayer(["Bob"], { name: "Sam", udisc: null })).toEqual({ player: "Bob" });
    expect(chooseUdiscPlayer(["Bob"], { name: "Sam", udisc: null }, "nope")).toEqual({ error: "unknown_player" });
  });
});

const SECRET = "x".repeat(40);
const members = {
  "member:m_jane": JSON.stringify({ memberId: "m_jane", name: "Jane Doe", udisc: "janedoe", isAdmin: false, pinHash: "x", mustChangePin: false }),
};

type Stored = {
  id: number;
  member_id: string;
  round_key: string;
  player_name: string;
  course_name: string;
  layout_name: string;
  played_at: string;
  total: number | null;
  to_par: number | null;
  holes: string;
};

function memoryDb() {
  const rows: Stored[] = [];
  let nextId = 1;
  return {
    prepare(sql: string) {
      const binds: unknown[] = [];
      return {
        bind(...values: unknown[]) {
          binds.splice(0, binds.length, ...values);
          return this;
        },
        all: async () => {
          if (/FROM udisc_history/i.test(sql)) {
            const memberId = String(binds[0]);
            const limit = Number(binds[1]);
            return {
              results: rows
                .filter((row) => row.member_id === memberId)
                .sort((a, b) => b.played_at.localeCompare(a.played_at) || b.id - a.id)
                .slice(0, limit),
              success: true,
            };
          }
          return { results: [], success: true };
        },
        first: async () => null,
        run: async () => {
          if (/INSERT INTO udisc_history/i.test(sql)) {
            const [member_id, round_key, player_name, course_name, layout_name, played_at, total, to_par, holes] = binds as [
              string, string, string, string, string, string, number | null, number | null, string,
            ];
            const existing = rows.find((row) => row.member_id === member_id && row.round_key === round_key);
            if (existing) Object.assign(existing, { player_name, course_name, layout_name, played_at, total, to_par, holes });
            else rows.push({ id: nextId++, member_id, round_key, player_name, course_name, layout_name, played_at, total, to_par, holes });
            return { results: [], success: true, meta: { changes: 1 } };
          }
          if (/DELETE FROM udisc_history WHERE member_id = \? AND id/i.test(sql)) {
            const before = rows.length;
            for (let i = rows.length - 1; i >= 0; i -= 1) {
              if (rows[i]!.member_id === binds[0] && rows[i]!.id === binds[1]) rows.splice(i, 1);
            }
            return { results: [], success: true, meta: { changes: before - rows.length } };
          }
          if (/DELETE FROM udisc_history WHERE member_id/i.test(sql)) {
            for (let i = rows.length - 1; i >= 0; i -= 1) {
              if (rows[i]!.member_id === binds[0]) rows.splice(i, 1);
            }
            return { results: [], success: true, meta: { changes: 1 } };
          }
          return { results: [], success: true, meta: { changes: 0 } };
        },
      };
    },
  };
}

function env() {
  const kv = new Map<string, string>(Object.entries(members));
  return {
    ROSTER: { get: async (key: string) => kv.get(key) ?? null, put: async () => {}, delete: async () => {} },
    RATELIMIT: { get: async () => null, put: async () => {}, delete: async () => {} },
    DB: memoryDb(),
    JWT_SECRET: SECRET,
    ALLOWED_ORIGINS: "http://localhost:8080",
  } as unknown as Parameters<typeof worker.fetch>[1];
}

async function call(live: Parameters<typeof worker.fetch>[1], path: string, method = "GET", token?: string, body?: unknown) {
  const headers: Record<string, string> = { Origin: "http://localhost:8080" };
  if (token) headers.authorization = "Bearer " + token;
  if (body !== undefined) headers["content-type"] = "application/json";
  return worker.fetch(new Request("https://w" + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  }), live);
}

function asRounds(body: Record<string, unknown>) {
  return arrayField(body, "rounds") as { id?: number; courseName?: string; total?: number; toPar?: number }[];
}

describe("UDisc history routes", () => {
  it("imports the matching player, updates the same round, and deletes only that member's rows", async () => {
    const live = env();
    const token = await signSession({ sub: "m_jane", mustChangePin: false }, SECRET, 900);
    expect((await call(live, "/me/udisc-history")).status).toBe(401);
    const imported = await call(live, "/me/udisc-history", "POST", token, { csv: CSV });
    expect(imported.status).toBe(200);
    expect(await jsonObject(imported)).toMatchObject({ saved: 2, playerName: "Jane Doe" });
    const listed = await jsonObject(await call(live, "/me/udisc-history", "GET", token));
    const rounds = asRounds(listed);
    expect(rounds).toHaveLength(2);
    expect(rounds[0]).toMatchObject({ courseName: "Other", total: 8, toPar: -1 });
    expect(JSON.stringify(listed)).not.toContain("m_jane");
    expect(JSON.stringify(listed)).not.toContain("roundKey");
    const again = CSV.replace("Jane Doe,Other,Main,2024-04-01 930,,-1,2,3,3", "Jane Doe,Other,Main,2024-04-01 930,20,+2,4,4,4");
    expect((await call(live, "/me/udisc-history", "POST", token, { csv: again })).status).toBe(200);
    const updated = asRounds(await jsonObject(await call(live, "/me/udisc-history", "GET", token)));
    expect(updated).toHaveLength(2);
    expect(updated.find((row) => row.courseName === "Other")).toMatchObject({ total: 20, toPar: 2 });
    const id = Number(rounds.find((row) => row.courseName === "Farmville, NC")?.id);
    expect((await call(live, "/me/udisc-history/" + id, "DELETE", token)).status).toBe(200);
    expect((await call(live, "/me/udisc-history/999", "DELETE", token)).status).toBe(404);
    expect((await call(live, "/me/udisc-history", "DELETE", token)).status).toBe(200);
    expect(asRounds(await jsonObject(await call(live, "/me/udisc-history", "GET", token)))).toHaveLength(0);
  });

  it("asks which player when the profile matches neither name", async () => {
    const live = env();
    const token = await signSession({ sub: "m_jane", mustChangePin: false }, SECRET, 900);
    const csv = [
      "PlayerName,CourseName,LayoutName,Date,Total,+/-,Hole1",
      "Par,C,L,2024-05-01 1200,,,3",
      "Bob,C,L,2024-05-01 1200,4,+1,4",
      "Chris,C,L,2024-05-01 1200,5,+2,5",
    ].join("\n");
    const pick = await call(live, "/me/udisc-history", "POST", token, { csv });
    expect(pick.status).toBe(409);
    expect(await jsonObject(pick)).toMatchObject({ error: "pick_player", players: ["Bob", "Chris"] });
    const saved = await call(live, "/me/udisc-history", "POST", token, { csv, playerName: "chris" });
    expect(saved.status).toBe(200);
    expect(await jsonObject(saved)).toMatchObject({ saved: 1, playerName: "Chris" });
    expect(parseUdiscHistory("nope")).toEqual({ error: "unrecognized_csv" });
    expect((await call(live, "/me/udisc-history", "POST", token, { csv: "nope" })).status).toBe(400);
  });
});
