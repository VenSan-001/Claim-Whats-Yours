"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EMPTY_PROFILE, type Profile } from "@/lib/types";
import { loadProfile, saveProfile } from "@/lib/storage";
import { TN_DISTRICTS, parseProfileFromText } from "@/lib/parser";


const FIELD_LABELS: Record<keyof Profile, string> = {
  level: "Class / course level",
  category: "Category",
  annual_income_inr: "Annual family income",
  gender: "Gender",
  district: "District",
  school_type: "School type",
  first_generation_graduate: "First-generation graduate",
  college_marks_value: "College marks",
  college_marks_type: "College marks type",
  course_stream: "Course stream",
  college_type: "College type",
  stay_type: "Stay type",
  twelfth_percent: "12th marks (%)",
  tenth_marks: "Class 10 marks (%)",
  school_type_studied: "School type studied in",
  class_year: "Class",
  latest_percent: "Marks (%)",
  differently_abled: "Differently abled",
  year_of_study: "Year of study",
  school_marks: "School marks (%)",
};

const selectClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none";

const CLASS_OPTIONS: Partial<Record<string, { value: string; label: string }[]>> = {
  class8: [{ value: "class8", label: "Class 8" }],
  class9: [{ value: "class9", label: "Class 9" }],
  class10: [{ value: "class10", label: "Class 10" }],
  class11_12: [
    { value: "class11", label: "Class 11" },
    { value: "class12", label: "Class 12" },
  ],
};


type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function HomePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [draft, setDraft] = useState<Profile>(EMPTY_PROFILE);
  const [detected, setDetected] = useState<(keyof Profile)[] | null>(null);

  useEffect(() => {
    const existing = loadProfile();
    if (existing) {
      setDraft({ ...EMPTY_PROFILE, ...existing });
    }
  }, []);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "ta-IN";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setSpeechSupported(true);
    return () => {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try { rec.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    };
  }, []);

  function toggleListening() {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }

  function handleParse() {
    const parsed = parseProfileFromText(text) as Partial<Profile>;
    const merged: Profile = { ...EMPTY_PROFILE, ...parsed };
    setDraft(merged);
    const found = (Object.keys(EMPTY_PROFILE) as (keyof Profile)[]).filter(
      (key) => merged[key] !== null && merged[key] !== undefined
    );
    setDetected(found);
  }

  function setField<K extends keyof Profile>(key: K, value: Profile[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleCheck() {
    const toSave: Profile = {
      level: draft.level || null,
      category: draft.category || null,
      annual_income_inr:
        draft.annual_income_inr === null || Number.isNaN(draft.annual_income_inr)
          ? null
          : draft.annual_income_inr,
      gender: draft.gender || null,
      district: draft.district || null,
      school_type: draft.school_type || null,
      first_generation_graduate: draft.first_generation_graduate ?? null,
      differently_abled: draft.differently_abled ?? null,
      year_of_study: draft.year_of_study || null,
      course_stream: draft.course_stream || null,
      college_type: draft.college_type || null,
      stay_type: draft.stay_type || null,
      school_type_studied: draft.school_type_studied || null,
      class_year: draft.class_year || null,
      latest_percent:
        draft.latest_percent === null ||
        draft.latest_percent === undefined ||
        Number.isNaN(draft.latest_percent)
          ? null
          : draft.latest_percent,


      twelfth_percent:
        draft.twelfth_percent === null ||
        draft.twelfth_percent === undefined ||
        Number.isNaN(draft.twelfth_percent)
          ? null
          : draft.twelfth_percent,
      tenth_marks:
        draft.tenth_marks === null ||
        draft.tenth_marks === undefined ||
        Number.isNaN(draft.tenth_marks)
          ? null
          : draft.tenth_marks,

      school_marks:
        draft.school_marks === null ||
        draft.school_marks === undefined ||
        Number.isNaN(draft.school_marks)
          ? null
          : draft.school_marks,

      college_marks_type: draft.college_marks_type || null,
      college_marks_value:
        draft.college_marks_value === null ||
        draft.college_marks_value === undefined ||
        Number.isNaN(draft.college_marks_value)
          ? null
          : draft.college_marks_value,
    };
    saveProfile(toSave);
    router.push("/results");
  }

  const firstGenValue =
    draft.first_generation_graduate === null ||
    draft.first_generation_graduate === undefined
      ? ""
      : draft.first_generation_graduate
      ? "yes"
      : "no";

  const isSchoolLevel =
    draft.level === "class8" ||
    draft.level === "class9" ||
    draft.level === "class10" ||
    draft.level === "class11_12";


  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header className="space-y-3" data-nexen-id="nx-3393394e-0">
        <h1 className="text-3xl font-bold text-slate-900" data-nexen-id="nx-3393394e-1">
          Find the scholarships you can claim
        </h1>
        <p className="text-slate-700" data-nexen-id="nx-3393394e-2">
          Many students from low-income families in Tamil Nadu miss out on
          scholarships they qualify for. Tell us about yourself in plain
          language, check the details we picked up, and we will show which
          schemes you are likely to be eligible for.
        </p>
      </header>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5" data-nexen-id="nx-3393394e-3">
        <label
          htmlFor="profile-text"
          className="block text-sm font-semibold text-slate-900"
         data-nexen-id="nx-3393394e-4">
          Describe yourself in your own words
        </label>
        <textarea
          id="profile-text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I am a Class 11 student from a Dalit family in Madurai. My family earns about 1.5 lakh a year. I am a girl."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
         data-nexen-id="nx-3393394e-5"/>
        {speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            aria-pressed={listening}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            {listening ? "Stop listening" : "🎤 Speak in Tamil"}
          </button>
        )}
        <button
          type="button"
          onClick={handleParse}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
         data-nexen-id="nx-3393394e-6">
          Read my details
        </button>

        {detected !== null && (
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-900" data-nexen-id="nx-3393394e-7">Parsed from your text</p>
            {detected.length === 0 ? (
              <p className="text-slate-600" data-nexen-id="nx-3393394e-8">
                We could not detect any details. Please fill the form below.
              </p>
            ) : (
              <ul className="mt-1 list-disc pl-5 text-slate-700" data-nexen-id="nx-3393394e-9">
                {detected.map((key) => (
                  <li key={key} data-nexen-id="nx-3393394e-10">{FIELD_LABELS[key]}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-slate-600" data-nexen-id="nx-3393394e-11">
              Check the form below and correct anything that is wrong.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5" data-nexen-id="nx-3393394e-12">
        <h2 className="text-lg font-semibold text-slate-900" data-nexen-id="nx-3393394e-13">Your details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="level" className="text-sm font-medium text-slate-900" data-nexen-id="nx-3393394e-14">
              Class / course level
            </label>
            <select
              id="level"
              className={selectClass}
              value={draft.level ?? ""}
              onChange={(e) => {
                const next = (e.target.value || null) as Profile["level"];
                const nextIsCollege = next === "college";
                const nextIsSchool =
                  next === "class8" ||
                  next === "class9" ||
                  next === "class10" ||
                  next === "class11_12";
                setDraft((prev) => ({
                  ...prev,
                  level: next,
                  ...(nextIsCollege
                    ? {}
                    : {
                        year_of_study: null,
                        college_marks_type: null,
                        college_marks_value: null,
                        course_stream: null,
                        college_type: null,
                        stay_type: null,
                        twelfth_percent: null,
                        school_type_studied: null,
                      }),
                  ...(nextIsSchool
                    ? {}
                    : { class_year: null, school_type: null, latest_percent: null }),
                  ...(nextIsCollege || next === "class11_12"
                    ? {}
                    : { tenth_marks: null }),
                }));
              }}
             data-nexen-id="nx-3393394e-15">
              <option value="">Select</option>
              <option value="class10">Class 10</option>
              <option value="class11_12">Class 11–12</option>
              <option value="college">College / Degree</option>
            </select>
          </div>

          {isSchoolLevel && (
            <div>
              <label htmlFor="class_year" className="text-sm font-medium text-slate-900">
                Class
              </label>
              <select
                id="class_year"
                className={selectClass}
                value={draft.class_year ?? ""}
                onChange={(e) =>
                  setField(
                    "class_year",
                    (e.target.value || null) as Profile["class_year"]
                  )
                }>
                <option value="">Select</option>
                {(CLASS_OPTIONS[draft.level ?? ""] ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {draft.level === "college" && (
            <div>
              <label htmlFor="year_of_study" className="text-sm font-medium text-slate-900">
                Year of study
              </label>
              <select
                id="year_of_study"
                className={selectClass}
                value={draft.year_of_study ?? ""}
                onChange={(e) =>
                  setField(
                    "year_of_study",
                    (e.target.value || null) as Profile["year_of_study"]
                  )
                }>
                <option value="">Select</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
              </select>
            </div>
          )}

          {draft.level === "college" && (
            <div>
              <label htmlFor="college_marks_type" className="text-sm font-medium text-slate-900">
                Marks type
              </label>
              <select
                id="college_marks_type"
                className={selectClass}
                value={draft.college_marks_type ?? ""}
                onChange={(e) =>
                  setField(
                    "college_marks_type",
                    (e.target.value || null) as Profile["college_marks_type"]
                  )
                }>
                <option value="">Select</option>
                <option value="cgpa">CGPA</option>
                <option value="percent">%</option>
              </select>
            </div>
          )}

          {draft.level === "college" && (
            <div>
              <label htmlFor="college_marks_value" className="text-sm font-medium text-slate-900">
                College marks
              </label>
              <input
                id="college_marks_value"
                type="number"
                min={0}
                max={draft.college_marks_type === "cgpa" ? 10 : 100}
                step="any"
                className={selectClass}
                value={draft.college_marks_value ?? ""}
                onChange={(e) =>
                  setField(
                    "college_marks_value",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>
          )}

          {draft.level === "college" && (
            <div>
              <label htmlFor="course_stream" className="text-sm font-medium text-slate-900">
                Course stream
              </label>
              <select
                id="course_stream"
                className={selectClass}
                value={draft.course_stream ?? ""}
                onChange={(e) =>
                  setField(
                    "course_stream",
                    (e.target.value || null) as Profile["course_stream"]
                  )
                }>
                <option value="">Select</option>
                <option value="arts_science">Arts &amp; Science</option>
                <option value="engineering">Engineering</option>
                <option value="medical">Medical</option>
                <option value="polytechnic">Polytechnic</option>
                <option value="iti">ITI</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {draft.level === "college" && (
            <div>
              <label htmlFor="college_type" className="text-sm font-medium text-slate-900">
                College type
              </label>
              <select
                id="college_type"
                className={selectClass}
                value={draft.college_type ?? ""}
                onChange={(e) =>
                  setField(
                    "college_type",
                    (e.target.value || null) as Profile["college_type"]
                  )
                }>
                <option value="">Select</option>
                <option value="government">Government</option>
                <option value="government_aided">Government-aided</option>
                <option value="self_financing">Self-financing</option>
              </select>
            </div>
          )}

          {draft.level === "college" && (
            <div>
              <label htmlFor="stay_type" className="text-sm font-medium text-slate-900">
                Stay type
              </label>
              <select
                id="stay_type"
                className={selectClass}
                value={draft.stay_type ?? ""}
                onChange={(e) =>
                  setField(
                    "stay_type",
                    (e.target.value || null) as Profile["stay_type"]
                  )
                }>
                <option value="">Select</option>
                <option value="hostel">Hostel</option>
                <option value="day_scholar">Day scholar</option>
              </select>
            </div>
          )}

          {draft.level === "college" && (
            <div>
              <label htmlFor="twelfth_percent" className="text-sm font-medium text-slate-900">
                12th marks (%)
              </label>
              <input
                id="twelfth_percent"
                type="number"
                min={0}
                max={100}
                step="any"
                className={selectClass}
                value={draft.twelfth_percent ?? ""}
                onChange={(e) =>
                  setField(
                    "twelfth_percent",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>
          )}

          {(draft.level === "college" || draft.level === "class11_12") && (
            <div>
              <label htmlFor="tenth_marks" className="text-sm font-medium text-slate-900">
                Class 10 marks (%)
              </label>
              <input
                id="tenth_marks"
                type="number"
                min={0}
                max={100}
                step="any"
                className={selectClass}
                value={draft.tenth_marks ?? ""}
                onChange={(e) =>
                  setField(
                    "tenth_marks",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>
          )}

          {draft.level === "college" && (
            <div>
              <label htmlFor="school_type_studied" className="text-sm font-medium text-slate-900">
                School type studied in
              </label>
              <select
                id="school_type_studied"
                className={selectClass}
                value={draft.school_type_studied ?? ""}
                onChange={(e) =>
                  setField(
                    "school_type_studied",
                    (e.target.value || null) as Profile["school_type_studied"]
                  )
                }>
                <option value="">Select</option>
                <option value="government">Government</option>
                <option value="government_aided">Government-aided</option>
                <option value="private">Private</option>
              </select>
            </div>
          )}





          <div>
            <label htmlFor="category" className="text-sm font-medium text-slate-900" data-nexen-id="nx-3393394e-16">
              Category
            </label>
            <select
              id="category"
              className={selectClass}
              value={draft.category ?? ""}
              onChange={(e) =>
                setField(
                  "category",
                  (e.target.value || null) as Profile["category"]
                )
              }
             data-nexen-id="nx-3393394e-17">
              <option value="">Select</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="MBC">MBC</option>
              <option value="BC">BC</option>
              <option value="OBC">OBC</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label htmlFor="annual_income_inr" className="text-sm font-medium text-slate-900" data-nexen-id="nx-3393394e-18">
              Annual family income (₹)
            </label>
            <input
              id="annual_income_inr"
              type="number"
              min={0}
              className={selectClass}
              value={draft.annual_income_inr ?? ""}
              onChange={(e) =>
                setField(
                  "annual_income_inr",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
             data-nexen-id="nx-3393394e-19"/>
          </div>

          <div>
            <label htmlFor="gender" className="text-sm font-medium text-slate-900" data-nexen-id="nx-3393394e-20">
              Gender
            </label>
            <select
              id="gender"
              className={selectClass}
              value={draft.gender ?? ""}
              onChange={(e) =>
                setField("gender", (e.target.value || null) as Profile["gender"])
              }
             data-nexen-id="nx-3393394e-21">
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="district" className="text-sm font-medium text-slate-900" data-nexen-id="nx-3393394e-22">
              District
            </label>
            <select
              id="district"
              className={selectClass}
              value={draft.district ?? ""}
              onChange={(e) => setField("district", e.target.value || null)}
             data-nexen-id="nx-3393394e-23">
              <option value="">Select</option>
              {TN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {isSchoolLevel && (
            <div>
              <label htmlFor="school_type" className="text-sm font-medium text-slate-900" data-nexen-id="nx-3393394e-24">
                School type
              </label>
              <select
                id="school_type"
                className={selectClass}
                value={draft.school_type ?? ""}
                onChange={(e) =>
                  setField(
                    "school_type",
                    (e.target.value || null) as Profile["school_type"]
                  )
                }
               data-nexen-id="nx-3393394e-25">
                <option value="">Select</option>
                <option value="government">Government</option>
                <option value="government_aided">Government-aided</option>
                <option value="private">Private</option>
              </select>
            </div>
          )}

          {isSchoolLevel && (
            <div>
              <label htmlFor="latest_percent" className="text-sm font-medium text-slate-900">
                Marks (%)
              </label>
              <input
                id="latest_percent"
                type="number"
                min={0}
                max={100}
                step="any"
                className={selectClass}
                value={draft.latest_percent ?? ""}
                onChange={(e) =>
                  setField(
                    "latest_percent",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>
          )}

          <div>
            <label htmlFor="first_generation_graduate" className="text-sm font-medium text-slate-900" data-nexen-id="nx-3393394e-28">
              First-generation graduate
            </label>
            <select
              id="first_generation_graduate"
              className={selectClass}
              value={firstGenValue}
              onChange={(e) =>
                setField(
                  "first_generation_graduate",
                  e.target.value === "" ? null : e.target.value === "yes"
                )
              }
             data-nexen-id="nx-3393394e-29">
              <option value="">Not sure</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleCheck}
          className="rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
         data-nexen-id="nx-3393394e-30">
          Check my eligibility
        </button>
        <p className="text-sm text-slate-600" data-nexen-id="nx-3393394e-31">
          Your details stay in this browser only.
        </p>
      </div>
    </div>
  );
}
