export const SHOP_BRANDS = [
  "Innova",
  "Discraft",
  "Discmania",
  "MVP",
  "Axiom",
  "Streamline",
  "Dynamic Discs",
  "Latitude 64",
  "Westside",
  "Prodigy",
  "Kastaplast",
  "Clash",
  "Thought Space",
  "Mint",
  "Gateway",
  "DGA",
  "Infinite",
  "Lone Star",
  "Millennium",
  "Trash Panda",
];

export const SHOP_COLORS = [
  "White",
  "Black",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Orange",
  "Pink",
  "Purple",
  "Glow",
  "Clear",
  "Grey",
  "Gold",
  "Tie-dye",
];

export const SHOP_WEIGHTS = ["150", "155", "160", ...Array.from({ length: 16 }, (_, index) => String(165 + index))];

const CUSTOM = "__custom__";

export function choiceOptions(base, extras) {
  const seen = new Set();
  const options = [];
  for (const raw of [...(base || []), ...(extras || [])]) {
    const value = String(raw || "").trim();
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    options.push(value);
  }
  return options;
}

export function weightOptions(extras) {
  return choiceOptions(SHOP_WEIGHTS, extras).sort((left, right) => Number(left) - Number(right));
}

export function matchChoice(value, options) {
  const want = String(value || "").trim().toLowerCase();
  if (!want) return "";
  return (options || []).find((option) => option.toLowerCase() === want) || "";
}

export { CUSTOM as SHOP_CUSTOM };
