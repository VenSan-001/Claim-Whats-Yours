import type { Category, Gender, Level, Scheme, SchemeStatus } from "./types";

const LEVELS: readonly Level[] = ["class10", "class11_12", "college", "any"];
const CATEGORIES: readonly Category[] = ["SC", "ST", "MBC", "BC", "OBC", "General"];
const GENDERS: readonly Gender[] = ["female", "male", "other", "any"];
const STATUSES: readonly SchemeStatus[] = ["active", "inactive", "closed"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function validateScheme(raw: unknown, index: number): Scheme {
  const at = (field: string): string => `schemes[${index}].${field}`;

  if (!isRecord(raw)) {
    throw new Error(`schemes[${index}] must be an object`);
  }

  if (typeof raw.id !== "string") throw new Error(`${at("id")} must be a string`);
  const id = raw.id;
  if (typeof raw.name !== "string") throw new Error(`${at("name")} must be a string (scheme ${id})`);

  if (!isOneOf(raw.level, LEVELS)) {
    throw new Error(`${at("level")} must be one of ${LEVELS.join(", ")} (scheme ${id})`);
  }

  if (!Array.isArray(raw.category_allowed) || !raw.category_allowed.every((c) => isOneOf(c, CATEGORIES))) {
    throw new Error(`${at("category_allowed")} must be an array of ${CATEGORIES.join(", ")} (scheme ${id})`);
  }

  if (!Array.isArray(raw.gender_allowed) || !raw.gender_allowed.every((g) => isOneOf(g, GENDERS))) {
    throw new Error(`${at("gender_allowed")} must be an array of ${GENDERS.join(", ")} (scheme ${id})`);
  }

  if (typeof raw.income_limit_annual_inr !== "number" || !Number.isFinite(raw.income_limit_annual_inr)) {
    throw new Error(`${at("income_limit_annual_inr")} must be a finite number (scheme ${id})`);
  }

  if (raw.min_percentage !== null && typeof raw.min_percentage !== "number") {
    throw new Error(`${at("min_percentage")} must be a number or null (scheme ${id})`);
  }

  if (!isStringArray(raw.districts)) {
    throw new Error(`${at("districts")} must be an array of strings (scheme ${id})`);
  }

  if (typeof raw.provider !== "string") throw new Error(`${at("provider")} must be a string (scheme ${id})`);
  if (typeof raw.benefit !== "string") throw new Error(`${at("benefit")} must be a string (scheme ${id})`);
  if (raw.benefit_amount_inr_per_year !== null && typeof raw.benefit_amount_inr_per_year !== "number") {
    throw new Error(`${at("benefit_amount_inr_per_year")} must be a number or null (scheme ${id})`);
  }
  if (!isStringArray(raw.documents)) {
    throw new Error(`${at("documents")} must be an array of strings (scheme ${id})`);
  }

  if (typeof raw.deadline !== "string") throw new Error(`${at("deadline")} must be a string (scheme ${id})`);
  if (typeof raw.official_url !== "string") throw new Error(`${at("official_url")} must be a string (scheme ${id})`);
  if (typeof raw.last_verified !== "string") throw new Error(`${at("last_verified")} must be a string (scheme ${id})`);

  if (!isOneOf(raw.status, STATUSES)) {
    throw new Error(`${at("status")} must be one of ${STATUSES.join(", ")} (scheme ${id})`);
  }

  if (typeof raw.notes !== "string") throw new Error(`${at("notes")} must be a string (scheme ${id})`);

  return {
    id,
    name: raw.name,
    provider: raw.provider,
    level: raw.level,
    category_allowed: raw.category_allowed as Category[],
    gender_allowed: raw.gender_allowed as Gender[],
    income_limit_annual_inr: raw.income_limit_annual_inr,
    min_percentage: raw.min_percentage as number | null,
    districts: raw.districts,
    benefit: raw.benefit,
    benefit_amount_inr_per_year: raw.benefit_amount_inr_per_year as number | null,
    documents: raw.documents,
    deadline: raw.deadline,
    official_url: raw.official_url,
    last_verified: raw.last_verified,
    status: raw.status,
    notes: raw.notes,
  };
}

export function validateSchemes(data: unknown): Scheme[] {
  let items: unknown[];
  if (Array.isArray(data)) {
    items = data;
  } else if (isRecord(data) && Array.isArray(data.schemes)) {
    items = data.schemes;
  } else {
    throw new Error("Schemes data must be an array or an object with a 'schemes' array");
  }
  return items.map((raw, index) => validateScheme(raw, index));
}
