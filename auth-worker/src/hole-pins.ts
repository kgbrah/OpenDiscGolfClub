// Fill tee/basket coordinates that a layout or live snapshot left blank.
// Course positions labeled "Hole N tee" / "Hole N basket" are the mapped
// geometry. A later donor (the current layout) wins. Pins already on a hole
// are never replaced — layout-specific tees stay put. Device GPS is not a pin.

type PinMarker = { label?: string | null; lat?: number | null; lng?: number | null };

export type PinHole = {
  hole?: unknown;
  tee?: PinMarker | null;
  target?: PinMarker | null;
};

function finiteCoord(value: unknown): number | null {
  if (value == null || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

export function markerHasPin(marker: unknown): boolean {
  if (!marker || typeof marker !== "object") return false;
  const source = marker as PinMarker;
  return finiteCoord(source.lat) != null && finiteCoord(source.lng) != null;
}

/** Positions named "Hole N tee" / "Hole N basket" become hole donors. Other labels are ignored. */
export function holesFromPositionLabels(positions: readonly unknown[] | null | undefined): PinHole[] {
  const byHole = new Map<number, PinHole>();
  for (const row of positions || []) {
    if (!row || typeof row !== "object") continue;
    const source = row as { label?: unknown; lat?: unknown; lng?: unknown };
    const label = typeof source.label === "string" ? source.label.trim() : "";
    const match = /^Hole\s+(\d+)\s+(tee|basket)$/i.exec(label);
    if (!match) continue;
    const holeRaw = match[1];
    const kindRaw = match[2];
    if (!holeRaw || !kindRaw) continue;
    const hole = Number(holeRaw);
    const lat = finiteCoord(source.lat);
    const lng = finiteCoord(source.lng);
    if (!Number.isInteger(hole) || hole < 1 || lat == null || lng == null) continue;
    const kind = kindRaw.toLowerCase() === "tee" ? "tee" : "target";
    const current = byHole.get(hole) || { hole };
    current[kind] = { label, lat, lng };
    byHole.set(hole, current);
  }
  return [...byHole.values()];
}

function donorPin(marker: PinMarker | null | undefined): PinMarker | null {
  if (!markerHasPin(marker) || !marker) return null;
  return { label: marker.label ?? null, lat: finiteCoord(marker.lat) as number, lng: finiteCoord(marker.lng) as number };
}

function mergedMarker(
  existing: PinMarker | null | undefined,
  donor: PinMarker | null,
): PinMarker | null | undefined {
  if (!donor || markerHasPin(existing)) return existing;
  const kept = existing && typeof existing.label === "string" && existing.label.trim() ? existing.label : (donor.label ?? null);
  return { ...(existing || {}), label: kept, lat: donor.lat, lng: donor.lng };
}

/** Later donor lists override earlier ones. Returns the same array when nothing was missing. */
export function fillMissingHolePins<T extends PinHole>(
  holes: readonly T[],
  donorLists: readonly (readonly PinHole[] | null | undefined)[],
): T[] {
  const lookup = new Map<number, { tee: PinMarker | null; target: PinMarker | null }>();
  for (const list of donorLists) {
    for (const hole of list || []) {
      const n = Number(hole && hole.hole);
      if (!Number.isInteger(n)) continue;
      const prev = lookup.get(n) || { tee: null, target: null };
      const tee = donorPin(hole.tee);
      const target = donorPin(hole.target);
      lookup.set(n, { tee: tee || prev.tee, target: target || prev.target });
    }
  }
  let changed = false;
  const next = holes.map((hole) => {
    const donor = lookup.get(Number(hole && hole.hole));
    if (!donor) return hole;
    const tee = mergedMarker(hole.tee, donor.tee);
    const target = mergedMarker(hole.target, donor.target);
    if (tee === hole.tee && target === hole.target) return hole;
    changed = true;
    return { ...hole, tee, target };
  });
  return changed ? next : (holes as T[]);
}
