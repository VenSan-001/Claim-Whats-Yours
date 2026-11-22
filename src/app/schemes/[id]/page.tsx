"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { loadApplications, loadSchemes, saveApplications } from "@/lib/storage";
import type { Scheme } from "@/lib/types";
import type { Application } from "@/lib/types";

const LEVEL_TEXT: Record<string, string> = {
  class10: "For Class 10 students",
  class11_12: "For Class 11–12 students",
  college: "For college students",
};

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function eligibilityBullets(scheme: Scheme): string[] {
  const bullets: string[] = [];

  if (scheme.level && scheme.level !== "any") {
    bullets.push(LEVEL_TEXT[scheme.level] ?? `For ${scheme.level} students`);
  }

  const categories: string[] = scheme.category_allowed ?? [];
  if (categories.length > 0 && categories.length < 6 && !categories.includes("any")) {
    bullets.push(`Open to: ${categories.join(", ")}`);
  }

  const genders: string[] = scheme.gender_allowed ?? [];
  if (genders.length > 0 && !genders.includes("any")) {
    if (genders.includes("female") && !genders.includes("male")) bullets.push("For girls");
    else if (genders.includes("male") && !genders.includes("female")) bullets.push("For boys");
    else bullets.push(`Open to: ${genders.join(", ")}`);
  }

  if (scheme.income_limit_annual_inr != null) {
    bullets.push(
      `Family annual income up to Rs ${scheme.income_limit_annual_inr.toLocaleString("en-IN")}`
    );
  }

  if (scheme.min_percentage != null) {
    bullets.push(`Minimum marks of ${scheme.min_percentage}%`);
  }

  const districts: string[] = scheme.districts ?? [];
  if (districts.length === 0 || districts.includes("all")) {
    bullets.push("Districts: all Tamil Nadu");
  } else {
    bullets.push(`Districts: ${districts.join(", ")}`);
  }

  return bullets;
}

type SchemeWithSteps = Scheme & { apply_steps?: string[] };

function applyStepsFor(scheme: Scheme): string[] {
  const steps = (scheme as SchemeWithSteps).apply_steps;
  return Array.isArray(steps) ? steps.filter((s) => typeof s === "string" && s.trim() !== "") : [];
}

const BUTTON_BASE =
  "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors";
const BUTTON_DEFAULT = "bg-gray-900 text-white hover:bg-gray-800";
const BUTTON_OUTLINE = "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50";

export default function SchemeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [schemes, setSchemes] = useState<Scheme[] | null>(null);
  const [doneSteps, setDoneSteps] = useState<Record<string, boolean>>({});
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  useEffect(() => {
    setSchemes(loadSchemes());
  }, []);

  if (schemes === null) {
    return <p className="p-6 text-sm text-gray-500" data-nexen-id="nx-3f72c9ef-0">Loading scheme…</p>;
  }

  const scheme = schemes.find((s) => s.id === id);

  if (!scheme) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <Alert variant="destructive">
          <AlertTitle>Scheme not found</AlertTitle>
          <AlertDescription>
            We could not find this scheme. It may have been removed.
          </AlertDescription>
        </Alert>
        <Link href="/schemes" className="text-sm font-medium text-blue-700 underline" data-nexen-id="nx-3f72c9ef-1">
          Back to all schemes
        </Link>
      </div>
    );
  }

  const bullets = eligibilityBullets(scheme);
  const currentScheme = scheme;

  function markAsApplied() {
    const today = new Date();
    const submittedOn = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const existing = loadApplications();
    const app: Application = {
      id: Date.now().toString(),
      scheme_id: currentScheme.id,
      status: "submitted",
      submitted_on: submittedOn,
      reminder_date: null,
      note: "",
    };
    saveApplications([...existing, app]);
    setAppliedMessage(`Saved to your tracking list as Submitted on ${submittedOn}.`);
  }
  const applySteps = applyStepsFor(scheme);
  const doneCount = applySteps.filter((_, i) => doneSteps[`${scheme.id}-${i}`]).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <Link href="/schemes" className="text-sm font-medium text-blue-700 underline" data-nexen-id="nx-3f72c9ef-2">
        ← All schemes
      </Link>

      <Alert className="border-amber-300 bg-amber-50 text-amber-900">
        <AlertTitle>Check before you apply</AlertTitle>
        <AlertDescription>
          Verify this scheme on the official portal before applying. Rules here are indicative and
          may be outdated.
        </AlertDescription>
      </Alert>

      <header className="space-y-2" data-nexen-id="nx-3f72c9ef-3">
        <h1 className="text-2xl font-bold text-gray-900" data-nexen-id="nx-3f72c9ef-4">{scheme.name}</h1>
        <p className="text-sm text-gray-600" data-nexen-id="nx-3f72c9ef-5">{scheme.provider}</p>
        <Badge variant={scheme.status === "active" ? "default" : "secondary"} data-nexen-id="nx-3f72c9ef-6">
          {scheme.status}
        </Badge>
      </header>

      <Card data-nexen-id="nx-3f72c9ef-7">
        <CardHeader>
          <CardTitle className="text-lg">Benefit</CardTitle>
          {scheme.benefit_amount_inr_per_year != null && (
            <CardDescription className="text-base font-semibold text-gray-900">
              {formatRupees(scheme.benefit_amount_inr_per_year)}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="text-sm text-gray-700">
          <p data-nexen-id="nx-3f72c9ef-8">{scheme.benefit}</p>
        </CardContent>
      </Card>

      <Card data-nexen-id="nx-3f72c9ef-9">
        <CardHeader>
          <CardTitle className="text-lg">Who can apply</CardTitle>
        </CardHeader>
        <CardContent>
          {bullets.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700" data-nexen-id="nx-3f72c9ef-10">
              {bullets.map((b) => (
                <li key={b} data-nexen-id="nx-3f72c9ef-11">{b}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600" data-nexen-id="nx-3f72c9ef-12">No specific eligibility rules listed.</p>
          )}
        </CardContent>
      </Card>

      <Card data-nexen-id="nx-3f72c9ef-13">
        <CardHeader>
          <CardTitle className="text-lg">Documents needed</CardTitle>
        </CardHeader>
        <CardContent>
          {scheme.documents && scheme.documents.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700" data-nexen-id="nx-3f72c9ef-14">
              {scheme.documents.map((doc) => (
                <li key={doc} data-nexen-id="nx-3f72c9ef-15">{doc}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600" data-nexen-id="nx-3f72c9ef-16">No documents listed.</p>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3" data-nexen-id="new-how-to-apply">
        <h2 className="text-lg font-semibold text-gray-900">How to apply</h2>
        {applySteps.length > 0 ? (
          <>
            <p className="text-sm text-gray-700">{doneCount} of {applySteps.length} steps done</p>
            <ol className="space-y-3">
              {applySteps.map((step, i) => {
                const key = `${scheme.id}-${i}`;
                return (
                  <li key={key}>
                    <Card>
                      <CardContent className="pt-6">
                        <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-800">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-gray-300"
                            checked={!!doneSteps[key]}
                            onChange={(e) => setDoneSteps((prev) => ({ ...prev, [key]: e.target.checked }))}
                          />
                          <span className={doneSteps[key] ? "text-gray-400 line-through" : ""}>
                            <span className="font-medium">Step {i + 1}:</span> {step}
                          </span>
                        </label>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ol>
          </>
        ) : (
          <p className="text-sm text-gray-600">Open the official link below and follow its instructions.</p>
        )}
      </section>

      {scheme.official_url && (
        <div className="flex flex-wrap items-center gap-3" data-nexen-id="new-official-button-row">
          <a
            href={scheme.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON_BASE} ${BUTTON_DEFAULT}`}
          >
            Open official website
          </a>
          {scheme.last_verified && (
            <span className="text-sm text-gray-600">Last verified: {formatDate(scheme.last_verified)}</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3" data-nexen-id="new-mark-applied-row">
        <button type="button" onClick={markAsApplied} className={`${BUTTON_BASE} ${BUTTON_OUTLINE}`}>
          Mark as applied
        </button>
        {appliedMessage && <span className="text-sm text-gray-700" role="status">{appliedMessage}</span>}
      </div>

      <Card data-nexen-id="nx-3f72c9ef-17">
        <CardHeader>
          <CardTitle className="text-lg">Key dates and source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p data-nexen-id="nx-3f72c9ef-18">
            <span className="font-medium" data-nexen-id="nx-3f72c9ef-19">Deadline:</span>{" "}
            {scheme.deadline ? formatDate(scheme.deadline) : "Check the official portal"}
          </p>
          {scheme.last_verified && (
            <p data-nexen-id="nx-3f72c9ef-20">
              <span className="font-medium" data-nexen-id="nx-3f72c9ef-21">Last verified:</span> {formatDate(scheme.last_verified)}
            </p>
          )}
          {scheme.official_url && (
            <p data-nexen-id="nx-3f72c9ef-22">
              <a
                href={scheme.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-700 underline"
               data-nexen-id="nx-3f72c9ef-23">
                Official portal ↗
              </a>
            </p>
          )}
          {scheme.notes && <p className="text-gray-600" data-nexen-id="nx-3f72c9ef-24">{scheme.notes}</p>}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/tracking" className={`${BUTTON_BASE} ${BUTTON_DEFAULT}`} data-nexen-id="nx-3f72c9ef-25">
          Track my application
        </Link>
        <Link href="/checklist" className={`${BUTTON_BASE} ${BUTTON_OUTLINE}`} data-nexen-id="nx-3f72c9ef-26">
          Document checklist
        </Link>
        <Link href={`/checklist?scheme=${encodeURIComponent(scheme.id)}`} className={`${BUTTON_BASE} ${BUTTON_OUTLINE}`}>
          View documents checklist
        </Link>

      </div>
    </div>
  );
}