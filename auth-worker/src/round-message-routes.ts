import type { Env } from "./env.js";
import { clientIp, json, readJson } from "./http.js";
import { kvRateLimited } from "./kv-rate-limit.js";
import {
  MESSAGE_BODY_MAX,
  MESSAGE_NAME_MAX,
  cleanMessageText,
  publicRoundMessage,
  resolveMessageAuthor,
  threadIsFull,
} from "./round-messages.js";

const LIST_LIMIT = 80;
const POST_LIMIT = 12;
const POST_WINDOW_SEC = 60;

export async function handleRoundMessages(opts: {
  request: Request;
  env: Env;
  origin: string | null;
  method: string;
  scope: "event" | "round";
  scopeKey: string;
  live: boolean;
  onCard: boolean;
  serverName: string;
}): Promise<Response> {
  const { request, env, origin, method, scope, scopeKey, live } = opts;
  if (method === "GET") {
    if (!live) return json({ open: false, messages: [] }, 200, origin);
    const rows = (await env.DB.prepare(
      `SELECT id, side, author_name, to_name, body, created_at
         FROM round_messages
        WHERE scope = ? AND scope_key = ?
        ORDER BY id DESC
        LIMIT ?`,
    ).bind(scope, scopeKey, LIST_LIMIT).all<Record<string, unknown>>()).results ?? [];
    const messages = rows.map((row) => publicRoundMessage(row)).filter(Boolean).reverse();
    return json({ open: true, messages }, 200, origin);
  }

  if (method !== "POST") return json({ error: "not_found" }, 404, origin);
  if (!live) return json({ error: "chat_closed" }, 409, origin);
  const ip = clientIp(request);
  if (await kvRateLimited(env, "round-msg:" + scope + ":" + scopeKey + ":" + ip, POST_LIMIT, POST_WINDOW_SEC)) {
    return json({ error: "rate_limited" }, 429, origin);
  }
  const payload = (await readJson(request)) ?? {};
  const raw = typeof payload.body === "string" ? payload.body : "";
  if (raw.trim().length > MESSAGE_BODY_MAX) return json({ error: "message_too_long" }, 413, origin);
  const text = cleanMessageText(raw, MESSAGE_BODY_MAX);
  if (!text) return json({ error: "empty_message" }, 400, origin);
  const author = resolveMessageAuthor(opts.onCard, opts.serverName, typeof payload.name === "string" ? payload.name : "");
  if (!author.name) return json({ error: "name_required" }, 400, origin);
  const toName = cleanMessageText(payload.toName ?? payload.to_name, MESSAGE_NAME_MAX) || null;
  const count = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM round_messages WHERE scope = ? AND scope_key = ?",
  ).bind(scope, scopeKey).first<{ n: number }>();
  if (threadIsFull(Number(count?.n ?? 0))) return json({ error: "thread_full" }, 409, origin);
  const row = await env.DB.prepare(
    `INSERT INTO round_messages (scope, scope_key, side, author_name, to_name, body)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING id, side, author_name, to_name, body, created_at`,
  ).bind(scope, scopeKey, author.side, author.name, toName, text).first<Record<string, unknown>>();
  const message = publicRoundMessage(row);
  if (!message) return json({ error: "server_error" }, 500, origin);
  return json({ message }, 201, origin);
}
