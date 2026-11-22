// The single import point for components.
// Set NEXT_PUBLIC_MOCK_MODE=true (or MOCK_MODE=true) to use mocks.ts instead of api.ts.
import * as real from "@/lib/api";
import * as mock from "./mocks";

const USE_MOCKS =
  process.env.NEXT_PUBLIC_MOCK_MODE === "true" || process.env.MOCK_MODE === "true";

const impl = USE_MOCKS ? mock : real;

export const {
  signUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  changePassword,
  linkStudent,
  getLinkedStudent,
  extractProfile,
  getProfile,
  updateProfile,
  getSchemeMatches,
  getScheme,
  createApplication,
  listApplications,
  getApplication,
  updateApplication,
  listAdminSchemes,
  createScheme,
  updateScheme,
  replaceSchemeRules,
  replaceSchemeChecklist,
  replaceSchemeSteps,
  getAdminScheme,
} = impl;

export type * from "@/lib/api";
