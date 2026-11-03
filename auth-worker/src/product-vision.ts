export interface ProductLabel {
  name: string;
  brand: string;
  productType: string;
  color: string;
  weight: string;
  price: string;
}

export const EMPTY_PRODUCT_LABEL: ProductLabel = {
  name: "",
  brand: "",
  productType: "",
  color: "",
  weight: "",
  price: "",
};

export const PRODUCT_VISION_PROMPT =
  "Read this photo of a disc golf disc, stamp, or shop tag. " +
  'Return ONLY JSON: {"name":string,"brand":string,"productType":string,"color":string,"weight":string,"price":string}. ' +
  "name is the mold, such as Destroyer or Buzzz, not the brand. " +
  "brand is the manufacturer, such as Innova or Discraft. " +
  "productType is one of distance_driver, fairway_driver, midrange, putter, approach, bag, apparel, accessory. " +
  "color is the plastic color. weight is grams as digits only. price is dollars without a dollar sign. " +
  "Use empty strings for anything you cannot see. No extra text.";

const PRODUCT_TYPES = new Set([
  "distance_driver",
  "fairway_driver",
  "midrange",
  "putter",
  "approach",
  "bag",
  "apparel",
  "accessory",
]);

const TYPE_WORDS: Record<string, string> = {
  approach: "approach",
  bag: "bag",
  apparel: "apparel",
  accessory: "accessory",
  distance: "distance_driver",
  "distance driver": "distance_driver",
  driver: "distance_driver",
  fairway: "fairway_driver",
  "fairway driver": "fairway_driver",
  mid: "midrange",
  midrange: "midrange",
  putter: "putter",
  "putting putter": "putter",
};

function clip(value: unknown, max: number): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || text.length > max) return "";
  return text;
}

function productTypeOf(value: unknown): string {
  const text = clip(value, 40).toLowerCase().replace(/-/g, " ");
  if (PRODUCT_TYPES.has(text)) return text;
  return TYPE_WORDS[text] || "";
}

function weightOf(value: unknown): string {
  const text = clip(value, 8).replace(/g$/i, "");
  if (!/^\d{3}$/.test(text)) return "";
  const grams = Number(text);
  return grams >= 100 && grams <= 200 ? text : "";
}

function priceOf(value: unknown): string {
  const text = clip(value, 12).replace(/^\$/, "");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(text)) return "";
  const amount = Number(text);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 400) return "";
  return amount % 1 ? amount.toFixed(2) : String(amount);
}

export function parseProductLabel(text: unknown): ProductLabel {
  if (typeof text !== "string" || !text.trim()) return { ...EMPTY_PRODUCT_LABEL };
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return { ...EMPTY_PRODUCT_LABEL };
  let data: unknown;
  try { data = JSON.parse(text.slice(start, end + 1)); } catch { return { ...EMPTY_PRODUCT_LABEL }; }
  if (!data || typeof data !== "object") return { ...EMPTY_PRODUCT_LABEL };
  const row = data as Record<string, unknown>;
  return {
    name: clip(row.name, 80),
    brand: clip(row.brand, 40),
    productType: productTypeOf(row.productType ?? row.product_type),
    color: clip(row.color, 40),
    weight: weightOf(row.weight),
    price: priceOf(row.price),
  };
}

export function productLabelHasText(label: ProductLabel): boolean {
  return Boolean(label.name || label.brand || label.productType || label.color || label.weight || label.price);
}
