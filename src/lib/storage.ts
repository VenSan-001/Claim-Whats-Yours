import seedFile from "@/data/schemes.json";
import type { Application, Profile, Scheme, SchemesFile } from "./types";
import { validateSchemes } from "./validate";

const KEY_PROFILE = "cwy_profile";
const KEY_CHECKLIST = "cwy_checklist";
const KEY_APPLICATIONS = "cwy_applications";
const KEY_SCHEMES = "cwy_schemes";

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled: nothing else to do.
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function loadProfile(): Profile | null {
  const value = readJson<unknown>(KEY_PROFILE, null);
  return isPlainObject(value) ? (value as unknown as Profile) : null;
}

export function saveProfile(p: Profile): void {
  writeJson(KEY_PROFILE, p);
}

export function clearProfile(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(KEY_PROFILE);
  } catch {
    // Ignore storage errors.
  }
}

export function loadSchemes(): Scheme[] {
  const override = readJson<unknown>(KEY_SCHEMES, null);
  if (Array.isArray(override)) {
    try {
      return validateSchemes(override).slice();
    } catch {
      // Invalid override: fall through to the seed data.
    }
  }
  return [...(seedFile as SchemesFile).schemes];
}

export function saveSchemes(s: Scheme[]): void {
  writeJson(KEY_SCHEMES, s);
}

export function resetSchemes(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(KEY_SCHEMES);
  } catch {
    // Ignore storage errors.
  }
}

export function loadChecklist(): Record<string, boolean> {
  const value = readJson<unknown>(KEY_CHECKLIST, {});
  return isPlainObject(value) ? (value as Record<string, boolean>) : {};
}

export function saveChecklist(r: Record<string, boolean>): void {
  writeJson(KEY_CHECKLIST, r);
}

export function loadApplications(): Application[] {
  const value = readJson<unknown>(KEY_APPLICATIONS, []);
  return Array.isArray(value) ? (value as Application[]) : [];
}

export function saveApplications(a: Application[]): void {
  writeJson(KEY_APPLICATIONS, a);
}
