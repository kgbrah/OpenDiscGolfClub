// Turn a spoken admin command into form fields. The model only fills blanks it heard.
// Times stay in Eastern wall-clock form because the admin inputs are datetime-local.

export type VoiceForm = "shop" | "event";

const SHOP_TYPES = new Set([
  "distance_driver",
  "fairway_driver",
  "midrange",
  "putter",
  "approach",
  "bag",
  "apparel",
  "accessory",
]);

const EVENT_TYPES = new Set(["tournament", "league_round", "fundraiser", "meeting"]);
const EVENT_STATUS = new Set(["scheduled", "final", "cancelled"]);
const EVENT_FORMATS = new Set(["singles-stroke", "doubles-stroke", "singles-matchplay", "doubles-matchplay"]);

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const WALL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function voiceForm(value: unknown): VoiceForm | null {
  if (value === "shop" || value === "event") return value;
  return null;
}

export function extractJsonObject(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function text(value: unknown, max: number): string {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).trim().slice(0, max);
}

function money(value: unknown): string {
  const raw = text(value, 12).replace(/[$,]/g, "");
  if (!raw) return "";
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0 || amount > 500) return "";
  return String(Math.round(amount * 100) / 100);
}

function whole(value: unknown, max: number): string {
  const raw = text(value, 8).replace(/[^\d]/g, "");
  if (!raw) return "";
  const amount = Number(raw);
  if (!Number.isInteger(amount) || amount < 0 || amount > max) return "";
  return String(amount);
}

function choice(value: unknown, allowed: Set<string>): string {
  const raw = text(value, 40).toLowerCase().replace(/\s+/g, "_");
  return allowed.has(raw) ? raw : "";
}

export function shopFieldsFromModel(raw: unknown): Record<string, string> {
  const body = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const fields: Record<string, string> = {};
  const name = text(body.name, 160);
  const brand = text(body.brand, 80);
  const category = choice(body.category, new Set(["disc", "accessory"]));
  const productType = choice(body.productType ?? body.product_type, SHOP_TYPES);
  const color = text(body.color, 60);
  const weight = whole(body.weight, 300);
  const price = money(body.price);
  const stock = whole(body.stock, 999);
  const description = text(body.description, 1000);
  if (name) fields.name = name;
  if (brand) fields.brand = brand;
  if (category) fields.category = category;
  if (productType) fields.productType = productType;
  if (color) fields.color = color;
  if (weight) fields.weight = weight;
  if (price) fields.price = price;
  if (stock) fields.stock = stock;
  if (description) fields.description = description;
  return fields;
}

export function eventFieldsFromModel(raw: unknown): Record<string, string | boolean> {
  const body = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const fields: Record<string, string | boolean> = {};
  const type = choice(body.type, EVENT_TYPES);
  const name = text(body.name, 200);
  const date = DATE.test(text(body.date, 10)) ? text(body.date, 10) : "";
  const startsAt = WALL.test(text(body.startsAt ?? body.starts_at, 16)) ? text(body.startsAt ?? body.starts_at, 16) : "";
  const registrationDeadline = WALL.test(text(body.registrationDeadline ?? body.registration_deadline, 16))
    ? text(body.registrationDeadline ?? body.registration_deadline, 16)
    : "";
  const checkinDeadline = WALL.test(text(body.checkinDeadline ?? body.checkin_deadline, 16))
    ? text(body.checkinDeadline ?? body.checkin_deadline, 16)
    : "";
  const status = choice(body.status, EVENT_STATUS);
  let format = choice(body.format, EVENT_FORMATS);
  const notes = text(body.notes, 2000);
  const courseName = text(body.courseName ?? body.course_name, 120);
  const handicap = body.handicap === true || body.handicap === "true" || body.handicap === 1;
  if (handicap && !format.endsWith("stroke")) format = format || "singles-stroke";
  if (type) fields.type = type;
  if (name) fields.name = name;
  if (date) fields.date = date;
  if (startsAt) fields.startsAt = startsAt;
  if (registrationDeadline) fields.registrationDeadline = registrationDeadline;
  if (checkinDeadline) fields.checkinDeadline = checkinDeadline;
  if (status) fields.status = status;
  if (format) fields.format = format;
  if (format.endsWith("stroke") && handicap) fields.handicap = true;
  if (notes) fields.notes = notes;
  if (courseName) fields.courseName = courseName;
  return fields;
}

export function fillPrompt(form: VoiceForm, transcript: string, today: string): { system: string; user: string } {
  const shop = `You fill a disc golf pro shop product form. Reply with JSON only.
Keys: name, brand, category (disc or accessory), productType (distance_driver, fairway_driver, midrange, putter, approach, bag, apparel, accessory), color, weight (grams, integer), price (dollars, number under 500), stock (integer), description.
Use null for anything not said. Do not invent a price or stock.`;
  const event = `You fill a disc golf club event form. Reply with JSON only. Today in America/New_York is ${today}.
Keys: type (tournament, league_round, fundraiser, meeting), name, date (YYYY-MM-DD), startsAt, registrationDeadline, checkinDeadline (YYYY-MM-DDTHH:mm, Eastern wall clock, no timezone suffix), status (scheduled, final, cancelled), format (singles-stroke, doubles-stroke, singles-matchplay, doubles-matchplay), handicap (boolean, stroke play only), notes, courseName.
Use null for anything not said. Do not invent a course.`;
  return {
    system: form === "shop" ? shop : event,
    user: transcript,
  };
}
