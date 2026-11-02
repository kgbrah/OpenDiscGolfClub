// Keep in sync with src/shared/handicap.js. The worker cannot import that module.
// Club handicap — not UDisc's unpublished formula. See the shared file for the rules.

export const HANDICAP_MAX_ROUNDS = 5;
export const HANDICAP_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

const ALLOWANCE: Record<number, number> = { 1: 0.5, 2: 0.75 };

export type HandicapRound = {
  member_id?: string | null;
  memberId?: string | null;
  name?: string | null;
  to_par?: number | null;
  toPar?: number | null;
  played_at?: string | null;
  playedAt?: string | null;
  finalized_at?: string | null;
  created_at?: string | null;
};

export type HandicapPlayer = {
  key: string;
  name: string;
  start: number;
  rounds: number;
  provisional: boolean;
};

export function handicapKey(memberId: string | null | undefined): string {
  const id = String(memberId || "").trim();
  if (!id || id.startsWith("g_") || id.startsWith("op_")) return "";
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < id.length; i++) {
    hash ^= BigInt(id.charCodeAt(i));
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, "0");
}

export function allowanceForRounds(count: number): number {
  const n = Number(count) || 0;
  if (n <= 0) return 0;
  return ALLOWANCE[n] ?? 1;
}

export function handicapFromToPars(toPars: readonly number[]) {
  const rows = (Array.isArray(toPars) ? toPars : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .slice(0, HANDICAP_MAX_ROUNDS);
  if (!rows.length) return null;
  const average = rows.reduce((sum, value) => sum + value, 0) / rows.length;
  const allowance = allowanceForRounds(rows.length);
  return {
    start: -Math.round(average * allowance),
    rounds: rows.length,
    provisional: rows.length < 3,
    average,
  };
}

function roundMemberId(row: HandicapRound): string {
  return String(row.memberId || row.member_id || "");
}

function roundToPar(row: HandicapRound): number | null {
  const value = row.toPar != null ? row.toPar : row.to_par;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function roundPlayedAt(row: HandicapRound): string {
  return String(row.playedAt || row.played_at || row.finalized_at || row.created_at || "");
}

export function handicapsFromRounds(rows: readonly HandicapRound[] | null | undefined, now = new Date()): HandicapPlayer[] {
  const cutoff = now.getTime() - HANDICAP_WINDOW_MS;
  const byKey = new Map<string, { key: string; name: string; toPars: number[] }>();
  const sorted = (Array.isArray(rows) ? rows : []).slice().sort((left, right) => {
    return Date.parse(roundPlayedAt(right)) - Date.parse(roundPlayedAt(left));
  });
  for (const row of sorted) {
    const toPar = roundToPar(row);
    if (toPar == null) continue;
    const when = Date.parse(roundPlayedAt(row));
    if (!Number.isFinite(when) || when < cutoff) continue;
    const key = handicapKey(roundMemberId(row));
    if (!key) continue;
    const bucket = byKey.get(key) || { key, name: "", toPars: [] };
    if (bucket.toPars.length >= HANDICAP_MAX_ROUNDS) continue;
    const name = String(row.name || "").trim();
    if (!bucket.name && name) bucket.name = name;
    bucket.toPars.push(toPar);
    byKey.set(key, bucket);
  }
  const players: HandicapPlayer[] = [];
  for (const bucket of byKey.values()) {
    const handicap = handicapFromToPars(bucket.toPars);
    if (!handicap) continue;
    players.push({
      key: bucket.key,
      name: bucket.name,
      start: handicap.start,
      rounds: handicap.rounds,
      provisional: handicap.provisional,
    });
  }
  players.sort((left, right) => left.name.localeCompare(right.name) || left.key.localeCompare(right.key));
  return players;
}

export function handicapCutoffDate(now = new Date()): string {
  return new Date(now.getTime() - HANDICAP_WINDOW_MS).toISOString().slice(0, 10);
}
