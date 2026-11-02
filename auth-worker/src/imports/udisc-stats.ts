export const UDISC_STATS_FULL_HOLES = 9;
export const UDISC_STATS_HOLE_SAMPLE = 3;
const HOLE_LINES = 3;

export interface UdiscStatHole {
  hole: number;
  par: number | null;
  strokes: number;
}

export interface UdiscStatRound {
  courseName: string;
  layoutName: string;
  toPar: number | null;
  holes: readonly UdiscStatHole[];
}

export interface UdiscHoleLine {
  courseName: string;
  layoutName: string;
  hole: number;
  avg: number;
  rounds: number;
}

export interface UdiscStats {
  rounds: number;
  courses: number;
  partialRounds: number;
  scoringRounds: number;
  scoringAverage: number | null;
  bestToPar: number | null;
  worstToPar: number | null;
  bogeyFree: number;
  holesPlayed: number;
  aces: number;
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubles: number;
  hardest: UdiscHoleLine[];
  easiest: UdiscHoleLine[];
}

function norm(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

function tenth(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const rounded = sign * Math.round(Math.abs(value) * 10) / 10;
  return rounded === 0 ? 0 : rounded;
}

function bucket(strokes: number, par: number): "aces" | "eagles" | "birdies" | "pars" | "bogeys" | "doubles" {
  if (strokes === 1) return "aces";
  const delta = strokes - par;
  if (delta <= -2) return "eagles";
  if (delta === -1) return "birdies";
  if (delta === 0) return "pars";
  if (delta === 1) return "bogeys";
  return "doubles";
}

export function summarizeUdiscRounds(rows: readonly UdiscStatRound[]): UdiscStats {
  const courses = new Set<string>();
  const holes = new Map<string, { courseName: string; layoutName: string; hole: number; sum: number; rounds: number }>();
  const stats: UdiscStats = {
    rounds: rows.length,
    courses: 0,
    partialRounds: 0,
    scoringRounds: 0,
    scoringAverage: null,
    bestToPar: null,
    worstToPar: null,
    bogeyFree: 0,
    holesPlayed: 0,
    aces: 0,
    eagles: 0,
    birdies: 0,
    pars: 0,
    bogeys: 0,
    doubles: 0,
    hardest: [],
    easiest: [],
  };
  let toParSum = 0;
  for (const round of rows) {
    const courseName = round.courseName.trim();
    if (courseName) courses.add(norm(courseName));
    const full = round.holes.length >= UDISC_STATS_FULL_HOLES && typeof round.toPar === "number" && Number.isFinite(round.toPar);
    if (full) {
      stats.scoringRounds += 1;
      toParSum += round.toPar as number;
      if (stats.bestToPar == null || (round.toPar as number) < stats.bestToPar) stats.bestToPar = round.toPar;
      if (stats.worstToPar == null || (round.toPar as number) > stats.worstToPar) stats.worstToPar = round.toPar;
    }
    let known = 0;
    let clean = true;
    for (const hole of round.holes) {
      stats.holesPlayed += 1;
      if (hole.par == null || hole.par < 2) continue;
      known += 1;
      stats[bucket(hole.strokes, hole.par)] += 1;
      if (hole.strokes > hole.par) clean = false;
      const key = [norm(courseName), norm(round.layoutName || ""), hole.hole].join("\n");
      const line = holes.get(key) || { courseName, layoutName: round.layoutName.trim(), hole: hole.hole, sum: 0, rounds: 0 };
      line.sum += hole.strokes - hole.par;
      line.rounds += 1;
      holes.set(key, line);
    }
    if (full && known > 0 && clean) stats.bogeyFree += 1;
  }
  stats.courses = courses.size;
  stats.partialRounds = stats.rounds - stats.scoringRounds;
  if (stats.scoringRounds) stats.scoringAverage = tenth(toParSum / stats.scoringRounds);
  const ranked = [...holes.values()]
    .filter((line) => line.rounds >= UDISC_STATS_HOLE_SAMPLE)
    .map((line) => ({
      courseName: line.courseName,
      layoutName: line.layoutName,
      hole: line.hole,
      avg: tenth(line.sum / line.rounds),
      rounds: line.rounds,
    }));
  stats.hardest = ranked
    .filter((line) => line.avg > 0)
    .sort((a, b) => b.avg - a.avg || b.rounds - a.rounds || a.hole - b.hole)
    .slice(0, HOLE_LINES);
  stats.easiest = ranked
    .filter((line) => line.avg < 0)
    .sort((a, b) => a.avg - b.avg || b.rounds - a.rounds || a.hole - b.hole)
    .slice(0, HOLE_LINES);
  return stats;
}
