// Client-side validation and deadline copy. Server enforces the same rules;
// these run on submit so the user sees the error before a request is sent.
import type { ApplicationStatus } from "@/lib/data";

export const APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  "Not Started",
  "Documents Pending",
  "Applied",
  "Under Review",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailError(value: string): string | null {
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
  return null;
}

export function passwordError(value: string): string | null {
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return "Password must include a letter and a number.";
  }
  return null;
}

export function requiredError(value: string, label: string): string | null {
  if (value.trim().length === 0) return `${label} is required.`;
  return null;
}

export function ageError(value: number | null): string | null {
  if (value === null) return null;
  if (!Number.isInteger(value) || value < 10 || value > 30) {
    return "Age must be a whole number between 10 and 30.";
  }
  return null;
}

export function incomeError(value: number | null): string | null {
  if (value === null) return null;
  if (!Number.isFinite(value) || value < 0) {
    return "Family income must be zero or more, in rupees per year.";
  }
  return null;
}

export function parseOptionalNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  return Number(trimmed.replace(/,/g, ""));
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function closesInCopy(days: number): string {
  if (days <= 0) return "Application closed or closes today";
  if (days === 1) return "Application closes in 1 day";
  return `Application closes in ${days} days`;
}

export const ELIGIBILITY_NOTE =
  "You appear to meet the criteria listed. This is not a guarantee: check the official source before you apply.";
