import type { EligibilityResult, EligibilityStatus, Profile, Scheme } from "./types";
import { NEED_MORE_INFO } from "./types";

const STATUS_RANK: Record<EligibilityStatus, number> = {
  likely: 0,
  [NEED_MORE_INFO]: 1,
  not_eligible: 2,
};

// A list restricts the scheme only when it is non-empty and not open to everyone.
function restricts(allowed: readonly string[]): boolean {
  return allowed.length > 0 && !allowed.includes("any") && !allowed.includes("all");
}

export function evaluateScheme(profile: Profile, scheme: Scheme): EligibilityResult {
  const failures: string[] = [];
  const missing: string[] = [];

  // 1. Level
  if (scheme.level !== "any") {
    if (profile.level === null) {
      missing.push("class/course level");
    } else if (profile.level !== scheme.level) {
      failures.push(`Scheme is for ${scheme.level} students`);
    }
  }

  // 2. Category
  if (restricts(scheme.category_allowed)) {
    if (profile.category === null) {
      missing.push("community category");
    } else if (!scheme.category_allowed.includes(profile.category)) {
      failures.push(`Scheme is not open to the ${profile.category} category`);
    }
  }

  // 3. Gender
  if (restricts(scheme.gender_allowed)) {
    if (profile.gender === null) {
      missing.push("gender");
    } else if (!scheme.gender_allowed.includes(profile.gender)) {
      failures.push(`Scheme is not open to ${profile.gender} students`);
    }
  }

  // 4. Income
  if (profile.annual_income_inr === null) {
    missing.push("annual family income");
  } else if (scheme.income_limit_annual_inr != null && profile.annual_income_inr > scheme.income_limit_annual_inr) {
    failures.push(
      `Annual family income exceeds the limit of Rs ${scheme.income_limit_annual_inr}`,
    );
  }

  // 5. Percentage — school levels use latest_percent, college uses twelfth_percent.
  // Only the field for the student's level is read; a null level yields no marks value.
  if (scheme.min_percentage !== null) {
    const marks =
      profile.level === "college"
        ? profile.twelfth_percent
        : profile.level === null
          ? null
          : profile.latest_percent;
    if (marks === null) {
      missing.push("marks percentage");
    } else if (marks < scheme.min_percentage) {
      failures.push(`Minimum ${scheme.min_percentage}% marks required`);
    }
  }

  // 6. District
  if (restricts(scheme.districts)) {
    if (profile.district === null) {
      missing.push("district");
    } else if (!scheme.districts.includes(profile.district)) {
      failures.push(`Scheme is not available in ${profile.district}`);
    }
  }

  // 7. First-generation graduate (specific scheme only)
  if (scheme.id === "tn-first-graduate-fee-reimbursement") {
    if (profile.first_generation_graduate === null) {
      missing.push("first-generation graduate status");
    } else if (profile.first_generation_graduate === false) {
      failures.push("Scheme is only for first-generation graduates");
    }
  }

  // A real mismatch always wins; a blank required field alone gives NEED_MORE_INFO.
  const status: EligibilityStatus =
    failures.length > 0 ? "not_eligible" : missing.length > 0 ? NEED_MORE_INFO : "likely";

  const reasons = [...failures, ...missing.map((field) => `Need more info: ${field}`)];
  if (reasons.length === 0) {
    reasons.push("Matches all the rules we know about");
  }

  return { scheme, status, reasons };
}

export function eligibleSchemes(profile: Profile, schemes: Scheme[]): EligibilityResult[] {
  return schemes
    .filter((scheme) => scheme.status === "active")
    .map((scheme) => evaluateScheme(profile, scheme))
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
}
