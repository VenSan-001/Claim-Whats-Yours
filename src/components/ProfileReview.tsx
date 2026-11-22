"use client";

import * as React from "react";
import type { Profile } from "@/lib/data";
import { ageError, incomeError, parseOptionalNumber } from "@/lib/rules";

const CLASS_LEVELS = ["Class 10", "Class 11-12", "UG"];
const CATEGORIES = ["SC", "ST", "MBC", "BC", "OBC", "General"];
const GENDERS = ["female", "male", "other"];
const LOCATIONS = ["rural", "urban"];

interface Props {
  profile: Profile;
  saving: boolean;
  onConfirm: (values: Omit<Profile, "situation_description">) => void;
}

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";
const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";

export function ProfileReview({ profile, saving, onConfirm }: Props) {
  const [age, setAge] = React.useState(profile.age?.toString() ?? "");
  const [classLevel, setClassLevel] = React.useState(profile.class_level ?? "");
  const [income, setIncome] = React.useState(profile.family_income_annual?.toString() ?? "");
  const [caste, setCaste] = React.useState(profile.caste_category ?? "");
  const [gender, setGender] = React.useState(profile.gender ?? "");
  const [location, setLocation] = React.useState(profile.location_type ?? "");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ageValue = parseOptionalNumber(age);
    const incomeValue = parseOptionalNumber(income);
    const next: Record<string, string> = {};
    const aErr = ageError(ageValue);
    const iErr = incomeError(incomeValue);
    if (aErr) next.age = aErr;
    if (iErr) next.income = iErr;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onConfirm({
      age: ageValue,
      class_level: classLevel || null,
      family_income_annual: incomeValue,
      caste_category: caste || null,
      gender: gender || null,
      location_type: location || null,
    });
  }

  return (
    <form
      data-nexen-component="ProfileReview"
      onSubmit={submit}
      noValidate
      className="rounded-lg border border-border bg-card p-6 shadow-sm"
     data-nexen-id="nx-4dfbdaa4-0">
      <h2 className="text-lg font-semibold" data-nexen-id="nx-4dfbdaa4-1">Check what we extracted</h2>
      <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-4dfbdaa4-2">
        Correct anything that looks wrong before we match schemes.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm" data-nexen-id="nx-4dfbdaa4-3">
          <span className="font-medium" data-nexen-id="nx-4dfbdaa4-4">Age</span>
          <input className={inputClass} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} aria-invalid={Boolean(errors.age)}  data-nexen-id="nx-4dfbdaa4-5"/>
          {errors.age && <span className="text-xs text-destructive" data-nexen-id="nx-4dfbdaa4-6">{errors.age}</span>}
        </label>

        <label className="space-y-1 text-sm" data-nexen-id="nx-4dfbdaa4-7">
          <span className="font-medium" data-nexen-id="nx-4dfbdaa4-8">Class</span>
          <select className={selectClass} value={classLevel} onChange={(e) => setClassLevel(e.target.value)} data-nexen-id="nx-4dfbdaa4-9">
            <option value="">Not set</option>
            {CLASS_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label className="space-y-1 text-sm" data-nexen-id="nx-4dfbdaa4-10">
          <span className="font-medium" data-nexen-id="nx-4dfbdaa4-11">Family income (₹ per year)</span>
          <input className={inputClass} inputMode="numeric" value={income} onChange={(e) => setIncome(e.target.value)} aria-invalid={Boolean(errors.income)}  data-nexen-id="nx-4dfbdaa4-12"/>
          {errors.income && <span className="text-xs text-destructive" data-nexen-id="nx-4dfbdaa4-13">{errors.income}</span>}
        </label>

        <label className="space-y-1 text-sm" data-nexen-id="nx-4dfbdaa4-14">
          <span className="font-medium" data-nexen-id="nx-4dfbdaa4-15">Category / caste</span>
          <select className={selectClass} value={caste} onChange={(e) => setCaste(e.target.value)} data-nexen-id="nx-4dfbdaa4-16">
            <option value="">Not set</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label className="space-y-1 text-sm" data-nexen-id="nx-4dfbdaa4-17">
          <span className="font-medium" data-nexen-id="nx-4dfbdaa4-18">Gender</span>
          <select className={selectClass} value={gender} onChange={(e) => setGender(e.target.value)} data-nexen-id="nx-4dfbdaa4-19">
            <option value="">Not set</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>

        <label className="space-y-1 text-sm" data-nexen-id="nx-4dfbdaa4-20">
          <span className="font-medium" data-nexen-id="nx-4dfbdaa4-21">Location type</span>
          <select className={selectClass} value={location} onChange={(e) => setLocation(e.target.value)} data-nexen-id="nx-4dfbdaa4-22">
            <option value="">Not set</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-6 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50"
       data-nexen-id="nx-4dfbdaa4-23">
        {saving ? "Saving..." : "Confirm details"}
      </button>
    </form>
  );
}
