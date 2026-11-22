// Mock implementations for demo mode. Names and signatures mirror src/lib/api.ts.
import { DEMO_CREDS } from "./demo-creds";
import type {
  Application,
  ApplicationStatus,
  ChecklistItem,
  LinkedStudent,
  Profile,
  Scheme,
  SchemeMatch,
  SchemeRule,
  SchemeStep,
  User,
} from "../api";

const delay = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 150));

const SCHEMES: Scheme[] = [
  {
    id: "sch_sc_postmatric",
    name: "Post Matric Scholarship for SC Students",
    description: "Tuition and maintenance support for SC students in Class 11 to undergraduate study.",
    official_source_url: "https://scholarships.gov.in",
    official_portal_url: "https://scholarships.gov.in",
    last_verified_date: "2025-03-12",
    application_closes_on: "2026-12-01",
    is_active: true,
    scheme_rules: [
      { id: "r1", criterion: "category", operator: "in", value: "SC", reason_text: "Category is SC" },
      { id: "r2", criterion: "family_income_annual", operator: "<=", value: "250000", reason_text: "Family income is within ₹2.5 lakh" },
      { id: "r3", criterion: "class_level", operator: "in", value: "Class 11-12,UG", reason_text: "Class 11 to undergraduate" },
    ],
    document_checklist_items: [
      { id: "d1", label: "Caste certificate", sort_order: 1 },
      { id: "d2", label: "Income certificate dated this year", sort_order: 2 },
      { id: "d3", label: "Bank passbook copy", sort_order: 3 },
    ],
    scheme_steps: [
      { id: "s1", step_order: 1, text: "Register on the official scholarship portal." },
      { id: "s2", step_order: 2, text: "Fill the application form with your school or college details." },
      { id: "s3", step_order: 3, text: "Upload the documents from your checklist." },
      { id: "s4", step_order: 4, text: "Submit, then get the institution to verify your application." },
    ],
  },
  {
    id: "sch_penn_monthly",
    name: "Pudhumai Penn Monthly Assistance",
    description: "Monthly assistance for girl students from government schools continuing higher education.",
    official_source_url: "https://www.tn.gov.in",
    official_portal_url: "https://www.tn.gov.in",
    last_verified_date: "2025-03-04",
    application_closes_on: "2026-12-15",
    is_active: true,
    scheme_rules: [
      { id: "r4", criterion: "gender", operator: "=", value: "female", reason_text: "Girl student" },
      { id: "r5", criterion: "school_type", operator: "=", value: "govt", reason_text: "Government school" },
    ],
    document_checklist_items: [
      { id: "d4", label: "School bonafide certificate", sort_order: 1 },
      { id: "d5", label: "Aadhaar-linked bank account (you provide details on the portal, not here)", sort_order: 2 },
    ],
    scheme_steps: [
      { id: "s5", step_order: 1, text: "Get the bonafide certificate from your school." },
      { id: "s6", step_order: 2, text: "Apply on the state portal and upload the certificate." },
    ],
  },
  {
    id: "sch_fg_fee",
    name: "First Graduate Fee Concession",
    description: "Tuition fee concession for first-generation graduates in undergraduate study.",
    official_source_url: "https://www.tn.gov.in",
    official_portal_url: "https://www.tn.gov.in",
    last_verified_date: "2025-03-01",
    application_closes_on: "2026-12-10",
    is_active: true,
    scheme_rules: [
      { id: "r6", criterion: "family_income_annual", operator: "<=", value: "250000", reason_text: "Family income within ₹2.5 lakh" },
    ],
    document_checklist_items: [{ id: "d6", label: "Income certificate dated this year", sort_order: 1 }],
    scheme_steps: [{ id: "s7", step_order: 1, text: "Apply on the college admissions portal." }],
  },
];

const daysUntil = (iso: string): number =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));

let applications: Application[] = [
  {
    id: "app_1",
    scheme_id: "sch_sc_postmatric",
    scheme_name: SCHEMES[0].name,
    status: "Documents Pending",
    application_closes_on: SCHEMES[0].application_closes_on,
    days_remaining: daysUntil(SCHEMES[0].application_closes_on),
  },
];

let profile: Profile = {
  situation_description: "Naan Class 11, appa income 2 lakh, SC community. Scholarship irukka?",
  age: 16,
  class_level: "Class 11-12",
  family_income_annual: 200000,
  caste_category: "SC",
  gender: "male",
  location_type: "rural",
};

const user: User = { id: "usr_demo", name: "Demo Student", email: DEMO_CREDS.email, role: "student" };

export async function signUp(input: { name: string; email: string; password: string }): Promise<User> {
  return delay({ id: "usr_new", name: input.name, email: input.email, role: "student" });
}

export async function login(input: { email: string; password: string }): Promise<User> {
  if (input.email !== DEMO_CREDS.email || input.password !== DEMO_CREDS.password) {
    throw new Error("Email or password is incorrect.");
  }
  return delay(user);
}

export async function logout(): Promise<{ ok: true }> {
  return delay({ ok: true as const });
}

export async function forgotPassword(_input: { email: string }): Promise<{ ok: true }> {
  return delay({ ok: true as const });
}

export async function resetPassword(_input: { token: string; password: string }): Promise<{ ok: true }> {
  return delay({ ok: true as const });
}

export async function getMe(): Promise<User> {
  return delay(user);
}

export async function updateMe(input: { name: string; email: string }): Promise<User> {
  return delay({ ...user, ...input });
}

export async function changePassword(input: { current_password: string; new_password: string }): Promise<{ ok: true }> {
  if (input.current_password !== DEMO_CREDS.password) throw new Error("Current password is incorrect.");
  return delay({ ok: true as const });
}

export async function linkStudent(input: { student_email: string }): Promise<LinkedStudent> {
  return delay({ name: "Demo Student", email: input.student_email });
}

export async function getLinkedStudent(): Promise<LinkedStudent | null> {
  return delay({ name: "Demo Student", email: DEMO_CREDS.email });
}

export async function extractProfile(input: { situation_description: string }): Promise<Profile> {
  profile = { ...profile, situation_description: input.situation_description };
  return delay(profile);
}

export async function getProfile(): Promise<Profile> {
  return delay(profile);
}

export async function updateProfile(input: Omit<Profile, "situation_description">): Promise<Profile> {
  profile = { ...profile, ...input };
  return delay(profile);
}

export async function getSchemeMatches(): Promise<SchemeMatch[]> {
  const matches: SchemeMatch[] = SCHEMES.map((s) => ({
    scheme_id: s.id,
    name: s.name,
    application_closes_on: s.application_closes_on,
    status: s.id === "sch_fg_fee" ? "near_miss" : "likely",
    matched: s.scheme_rules.map((r) => r.reason_text),
    missing: s.id === "sch_fg_fee" ? ["Income certificate dated this year"] : [],
  }));
  return delay(matches);
}

export async function getScheme(id: string): Promise<Scheme> {
  const found = SCHEMES.find((s) => s.id === id);
  if (!found) throw new Error("Scheme not found.");
  return delay(found);
}

export async function createApplication(input: { scheme_id: string }): Promise<Application> {
  const scheme = SCHEMES.find((s) => s.id === input.scheme_id);
  if (!scheme) throw new Error("Scheme not found.");
  const created: Application = {
    id: `app_${applications.length + 1}`,
    scheme_id: scheme.id,
    scheme_name: scheme.name,
    status: "Not Started",
    application_closes_on: scheme.application_closes_on,
    days_remaining: daysUntil(scheme.application_closes_on),
  };
  applications = [...applications, created];
  return delay(created);
}

export async function listApplications(): Promise<Application[]> {
  const sorted = [...applications].sort((a, b) => a.days_remaining - b.days_remaining);
  return delay(sorted);
}

export async function getApplication(id: string): Promise<Application> {
  const found = applications.find((a) => a.id === id);
  if (!found) throw new Error("Application not found.");
  return delay(found);
}

export async function updateApplication(id: string, input: { status: ApplicationStatus }): Promise<Application> {
  applications = applications.map((a) => (a.id === id ? { ...a, status: input.status } : a));
  const updated = applications.find((a) => a.id === id);
  if (!updated) throw new Error("Application not found.");
  return delay(updated);
}

export async function listAdminSchemes(): Promise<Scheme[]> {
  return delay(SCHEMES);
}

export async function createScheme(input: Omit<Scheme, "id" | "scheme_rules" | "document_checklist_items" | "scheme_steps">): Promise<Scheme> {
  return delay({ ...input, id: `sch_${SCHEMES.length + 1}`, scheme_rules: [], document_checklist_items: [], scheme_steps: [] });
}

export async function updateScheme(id: string, input: Partial<Scheme>): Promise<Scheme> {
  const found = SCHEMES.find((s) => s.id === id);
  if (!found) throw new Error("Scheme not found.");
  return delay({ ...found, ...input });
}

export async function replaceSchemeRules(id: string, rules: Omit<SchemeRule, "id">[]): Promise<SchemeRule[]> {
  return delay(rules.map((r, i) => ({ ...r, id: `${id}_r${i + 1}` })));
}

export async function replaceSchemeChecklist(id: string, items: Omit<ChecklistItem, "id">[]): Promise<ChecklistItem[]> {
  return delay(items.map((r, i) => ({ ...r, id: `${id}_d${i + 1}` })));
}

export async function replaceSchemeSteps(id: string, steps: Omit<SchemeStep, "id">[]): Promise<SchemeStep[]> {
  return delay(steps.map((r, i) => ({ ...r, id: `${id}_s${i + 1}` })));
}

export async function getAdminScheme(id: string): Promise<Scheme> {
  return getScheme(id);
}
