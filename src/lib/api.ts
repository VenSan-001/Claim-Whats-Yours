// Typed client for the /api/* routes. Pages are Client Components, so every
// call uses a same-origin relative URL. Never hardcode a host here.

import { getToken } from "@/lib/authToken";

export type ApplicationStatus =
  | "Not Started"
  | "Documents Pending"
  | "Applied"
  | "Under Review";

export const APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  "Not Started",
  "Documents Pending",
  "Applied",
  "Under Review",
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "parent" | "admin";
}

export interface Profile {
  situation_description: string;
  age: number | null;
  class_level: string | null;
  family_income_annual: number | null;
  caste_category: string | null;
  gender: string | null;
  location_type: string | null;
}

export interface SchemeRule {
  id: string;
  criterion: string;
  operator: string;
  value: string;
  reason_text: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  sort_order: number;
}

export interface SchemeStep {
  id: string;
  step_order: number;
  text: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  official_source_url: string;
  official_portal_url: string;
  last_verified_date: string;
  application_closes_on: string;
  is_active: boolean;
  scheme_rules: SchemeRule[];
  document_checklist_items: ChecklistItem[];
  scheme_steps: SchemeStep[];
}

export interface SchemeMatch {
  scheme_id: string;
  name: string;
  application_closes_on: string;
  status: "likely" | "near_miss";
  matched: string[];
  missing: string[];
}

export interface Application {
  id: string;
  scheme_id: string;
  scheme_name: string;
  status: ApplicationStatus;
  application_closes_on: string;
  days_remaining: number;
}

export interface LinkedStudent {
  name: string;
  email: string;
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token !== null) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers: Object.keys(headers).length === 0 ? undefined : headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as
    | (T & { error?: string })
    | null;
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

// --- Auth ---
export const signUp = (input: { name: string; email: string; password: string }) =>
  request<User>("POST", "/api/auth/signup", input);
export const login = (input: { email: string; password: string }) =>
  request<User>("POST", "/api/auth/login", input);
export const logout = () => request<{ ok: true }>("POST", "/api/auth/logout");
export const forgotPassword = (input: { email: string }) =>
  request<{ ok: true }>("POST", "/api/auth/forgot-password", input);
export const resetPassword = (input: { token: string; password: string }) =>
  request<{ ok: true }>("POST", "/api/auth/reset-password", input);

// --- Account ---
export const getMe = () => request<User>("GET", "/api/me");
export const updateMe = (input: { name: string; email: string }) =>
  request<User>("PATCH", "/api/me", input);
export const changePassword = (input: { current_password: string; new_password: string }) =>
  request<{ ok: true }>("PATCH", "/api/me/password", input);
export const linkStudent = (input: { student_email: string }) =>
  request<LinkedStudent>("POST", "/api/me/link-student", input);
export const getLinkedStudent = () =>
  request<LinkedStudent | null>("GET", "/api/me/linked-student");

// --- Profile ---
export const extractProfile = (input: { situation_description: string }) =>
  request<Profile>("POST", "/api/profile/extract", input);
export const getProfile = () => request<Profile>("GET", "/api/profile");
export const updateProfile = (input: Omit<Profile, "situation_description">) =>
  request<Profile>("PUT", "/api/profile", input);

// --- Schemes (student) ---
export const getSchemeMatches = () =>
  request<SchemeMatch[]>("GET", "/api/schemes/matches");
export const getScheme = (id: string) =>
  request<Scheme>("GET", `/api/schemes/${encodeURIComponent(id)}`);

// --- Applications ---
export const createApplication = (input: { scheme_id: string }) =>
  request<Application>("POST", "/api/applications", input);
export const listApplications = () =>
  request<Application[]>("GET", "/api/applications");
export const getApplication = (id: string) =>
  request<Application>("GET", `/api/applications/${encodeURIComponent(id)}`);
export const updateApplication = (id: string, input: { status: ApplicationStatus }) =>
  request<Application>("PATCH", `/api/applications/${encodeURIComponent(id)}`, input);

// --- Admin ---
export const listAdminSchemes = () =>
  request<Scheme[]>("GET", "/api/admin/schemes");
export const createScheme = (input: Omit<Scheme, "id" | "scheme_rules" | "document_checklist_items" | "scheme_steps">) =>
  request<Scheme>("POST", "/api/admin/schemes", input);
export const updateScheme = (id: string, input: Partial<Scheme>) =>
  request<Scheme>("PATCH", `/api/admin/schemes/${encodeURIComponent(id)}`, input);
export const replaceSchemeRules = (id: string, rules: Omit<SchemeRule, "id">[]) =>
  request<SchemeRule[]>("PUT", `/api/admin/schemes/${encodeURIComponent(id)}/rules`, rules);
export const replaceSchemeChecklist = (id: string, items: Omit<ChecklistItem, "id">[]) =>
  request<ChecklistItem[]>("PUT", `/api/admin/schemes/${encodeURIComponent(id)}/checklist`, items);
export const replaceSchemeSteps = (id: string, steps: Omit<SchemeStep, "id">[]) =>
  request<SchemeStep[]>("PUT", `/api/admin/schemes/${encodeURIComponent(id)}/steps`, steps);
export const getAdminScheme = (id: string) =>
  request<Scheme>("GET", `/api/admin/schemes/${encodeURIComponent(id)}`);
