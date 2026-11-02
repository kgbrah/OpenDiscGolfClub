// Twin of auth-worker/src/hole-pins.ts. The worker cannot import src/shared.
// Fill blank tee/basket coordinates from mapped donors. Never replace a pin
// that is already on the hole, and never treat device GPS as a pin.

export function markerHasPin(marker) {
  if (!marker || typeof marker !== "object") return false;
  return Number.isFinite(Number(marker.lat)) && Number.isFinite(Number(marker.lng));
}

/** Positions named "Hole N tee" / "Hole N basket" become hole donors. Other labels are ignored. */
export function holesFromPositionLabels(positions) {
  const byHole = new Map();
  for (const row of positions || []) {
    if (!row || typeof row !== "object") continue;
    const label = typeof row.label === "string" ? row.label.trim() : "";
    const match = /^Hole\s+(\d+)\s+(tee|basket)$/i.exec(label);
    if (!match) continue;
    const hole = Number(match[1]);
    const lat = Number(row.lat);
    const lng = Number(row.lng);
    if (!Number.isInteger(hole) || hole < 1 || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const kind = match[2].toLowerCase() === "tee" ? "tee" : "target";
    const current = byHole.get(hole) || { hole };
    current[kind] = { label, lat, lng };
    byHole.set(hole, current);
  }
  return [...byHole.values()];
}

function donorPin(marker) {
  if (!markerHasPin(marker)) return null;
  return { label: marker.label ?? null, lat: Number(marker.lat), lng: Number(marker.lng) };
}

function mergedMarker(existing, donor) {
  if (!donor || markerHasPin(existing)) return existing;
  const kept = existing && typeof existing.label === "string" && existing.label.trim() ? existing.label : (donor.label ?? null);
  return { ...(existing || {}), label: kept, lat: donor.lat, lng: donor.lng };
}

/** Later donor lists override earlier ones. Returns the same array when nothing was missing. */
export function fillMissingHolePins(holes, donorLists) {
  const lookup = new Map();
  for (const list of donorLists || []) {
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
  const next = (Array.isArray(holes) ? holes : []).map((hole) => {
    const donor = lookup.get(Number(hole && hole.hole));
    if (!donor) return hole;
    const tee = mergedMarker(hole.tee, donor.tee);
    const target = mergedMarker(hole.target, donor.target);
    if (tee === hole.tee && target === hole.target) return hole;
    changed = true;
    return { ...hole, tee, target };
  });
  return changed ? next : holes;
}
