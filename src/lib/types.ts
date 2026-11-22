export type Level = "class8" | "class9" | "class10" | "class11_12" | "college" | "any";
export type Category = "SC" | "ST" | "MBC" | "BC" | "OBC" | "General";
export type Gender = "female" | "male" | "other" | "any";
export type SchoolType = "government" | "government_aided" | "private";
export type ClassYear = "class8" | "class9" | "class10" | "class11" | "class12";
export type YearOfStudy = "1st" | "2nd" | "3rd" | "4th";
export type CourseStream =
  | "arts_science"
  | "engineering"
  | "medical"
  | "polytechnic"
  | "iti"
  | "other";
export type MarksType = "cgpa" | "percent";
export type CollegeType = "government" | "government_aided" | "self_financing";
export type StayType = "hostel" | "day_scholar";
export type SchemeStatus = "active" | "inactive" | "closed";

export interface Scheme {
  id: string;
  name: string;
  provider: string;
  level: Level;
  category_allowed: Category[];
  gender_allowed: Gender[];
  income_limit_annual_inr: number;
  min_percentage: number | null;
  districts: string[];
  benefit: string;
  benefit_amount_inr_per_year: number | null;
  documents: string[];
  deadline: string;
  official_url: string;
  last_verified: string;
  status: SchemeStatus;
  notes: string;
}

export interface SchemesFile {
  _disclaimer: string;
  schemes: Scheme[];
}

export type ProfileLevel = Exclude<Level, "any">;

// Every field is optional (null = not given). College-only fields apply when
// level is "college"; class_year and latest_percent apply to school levels.
export interface Profile {
  level: ProfileLevel | null;
  class_year: ClassYear | null;
  category: Category | null;
  gender: "female" | "male" | "other" | null;
  annual_income_inr: number | null;
  district: string | null;
  differently_abled: boolean | null;
  school_type: SchoolType | null;
  school_type_studied: SchoolType | null;
  latest_percent: number | null;
  year_of_study: YearOfStudy | null;
  course_stream: CourseStream | null;
  college_marks_type: MarksType | null;
  college_marks_value: number | null;
  college_type: CollegeType | null;
  stay_type: StayType | null;
  twelfth_percent: number | null;
  tenth_marks: number | null;

  school_marks: number | null;
  first_generation_graduate: boolean | null;
}

export const EMPTY_PROFILE: Profile = {
  level: null,
  class_year: null,
  category: null,
  gender: null,
  annual_income_inr: null,
  district: null,
  differently_abled: null,
  school_type: null,
  school_type_studied: null,
  latest_percent: null,
  year_of_study: null,
  course_stream: null,
  college_marks_type: null,
  college_marks_value: null,
  college_type: null,
  stay_type: null,
  twelfth_percent: null,
  tenth_marks: null,

  school_marks: null,
  first_generation_graduate: null,
};

export const NEED_MORE_INFO = "Need more info";

export type EligibilityStatus = "likely" | "Need more info" | "not_eligible";

export interface EligibilityResult {
  scheme: Scheme;
  status: EligibilityStatus;
  reasons: string[];
}

export type ApplicationStatus = "planned" | "submitted" | "approved" | "rejected";

export interface Application {
  id: string;
  scheme_id: string;
  status: ApplicationStatus;
  submitted_on: string | null;
  reminder_date: string | null;
  note: string;
}
