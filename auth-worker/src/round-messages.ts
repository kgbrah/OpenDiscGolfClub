export const MESSAGE_BODY_MAX = 280;
export const MESSAGE_NAME_MAX = 32;
const THREAD_CAP = 400;

export function cleanMessageText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function resolveMessageAuthor(onCard: boolean, serverName: string, typedName: string) {
  const typed = cleanMessageText(typedName, MESSAGE_NAME_MAX);
  const server = cleanMessageText(serverName, MESSAGE_NAME_MAX);
  if (onCard) {
    const name = server && server !== "Player" ? server : typed || server || "Player";
    return { side: "card" as const, name };
  }
  return { side: "watch" as const, name: server || typed };
}

export function publicRoundMessage(row: Record<string, unknown> | null) {
  if (!row) return null;
  const body = cleanMessageText(row.body, MESSAGE_BODY_MAX);
  const author = cleanMessageText(row.author_name, MESSAGE_NAME_MAX);
  if (!body || !author) return null;
  const toName = cleanMessageText(row.to_name, MESSAGE_NAME_MAX);
  const side = row.side === "card" ? "card" : "watch";
  return {
    id: row.id ?? null,
    side,
    authorName: author,
    toName: toName || null,
    body,
    createdAt: row.created_at ?? null,
  };
}

export function threadIsFull(count: number) {
  return count >= THREAD_CAP;
}
