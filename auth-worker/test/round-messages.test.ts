import { describe, expect, it } from "vitest";

import { handleRoundMessages } from "../src/round-message-routes.js";
import { resolveMessageAuthor } from "../src/round-messages.js";
import type { Env } from "../src/env.js";

function memoryEnv() {
  const rows: Record<string, unknown>[] = [];
  let nextId = 1;
  const db = {
    prepare(sql: string) {
      const text = sql.replace(/\s+/g, " ").trim();
      const stmt = {
        binds: [] as unknown[],
        bind(...values: unknown[]) {
          stmt.binds = values;
          return stmt;
        },
        async all() {
          const [scope, scopeKey] = stmt.binds;
          return {
            results: rows.filter((row) => row.scope === scope && row.scope_key === scopeKey).slice().reverse(),
            success: true,
          };
        },
        async first() {
          if (text.startsWith("SELECT COUNT")) {
            const [scope, scopeKey] = stmt.binds;
            return { n: rows.filter((row) => row.scope === scope && row.scope_key === scopeKey).length };
          }
          if (text.startsWith("INSERT")) {
            const [scope, scopeKey, side, author, toName, body] = stmt.binds;
            const row = {
              id: nextId++,
              scope,
              scope_key: scopeKey,
              side,
              author_name: author,
              to_name: toName,
              body,
              created_at: "2026-11-04 23:00:00",
            };
            rows.push(row);
            return row;
          }
          return null;
        },
        async run() {
          const [scope, scopeKey, side, author, toName, body] = stmt.binds;
          const row = {
            id: nextId++,
            scope,
            scope_key: scopeKey,
            side,
            author_name: author,
            to_name: toName,
            body,
            created_at: "2026-11-04 23:00:00",
          };
          rows.push(row);
          return { success: true };
        },
      };
      return stmt;
    },
  };
  return {
    env: { DB: db, RATELIMIT: { async get() { return null; }, async put() {} } } as unknown as Env,
    rows,
  };
}

describe("round messages", () => {
  it("lets a watcher write the card and a player answer while the round is live", async () => {
    expect(resolveMessageAuthor(false, "", "Sam").side).toBe("watch");
    expect(resolveMessageAuthor(true, "Kevin", "nope").name).toBe("Kevin");
    const { env } = memoryEnv();
    const post = await handleRoundMessages({
      request: new Request("https://w/rounds/ABCD/live/messages", {
        method: "POST",
        body: JSON.stringify({ body: "Parked it", name: "Sam", toName: "Kevin" }),
      }),
      env,
      origin: "https://gvdgclub.com",
      method: "POST",
      scope: "round",
      scopeKey: "ABCD",
      live: true,
      onCard: false,
      serverName: "",
    });
    expect(post.status).toBe(201);
    const saved = await post.json() as { message: { side: string; toName: string } };
    expect(saved.message.side).toBe("watch");
    expect(saved.message.toName).toBe("Kevin");

    const reply = await handleRoundMessages({
      request: new Request("https://w/rounds/ABCD/live/messages", {
        method: "POST",
        body: JSON.stringify({ body: "Thanks" }),
      }),
      env,
      origin: "https://gvdgclub.com",
      method: "POST",
      scope: "round",
      scopeKey: "ABCD",
      live: true,
      onCard: true,
      serverName: "Kevin",
    });
    expect(reply.status).toBe(201);

    const list = await handleRoundMessages({
      request: new Request("https://w/rounds/ABCD/live/messages"),
      env,
      origin: "https://gvdgclub.com",
      method: "GET",
      scope: "round",
      scopeKey: "ABCD",
      live: true,
      onCard: false,
      serverName: "",
    });
    const body = await list.json() as { open: boolean; messages: { authorName: string }[] };
    expect(body.open).toBe(true);
    expect(body.messages.map((message) => message.authorName)).toEqual(["Sam", "Kevin"]);

    const closed = await handleRoundMessages({
      request: new Request("https://w/rounds/ABCD/live/messages", { method: "POST", body: "{}" }),
      env,
      origin: null,
      method: "POST",
      scope: "round",
      scopeKey: "ABCD",
      live: false,
      onCard: false,
      serverName: "",
    });
    expect(closed.status).toBe(409);
  });
});
