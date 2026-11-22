"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EligibilityResult, EligibilityStatus, Profile } from "@/lib/types";
import { NEED_MORE_INFO } from "@/lib/types";
import { loadProfile, loadSchemes } from "@/lib/storage";
import { eligibleSchemes } from "@/lib/eligibility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Status = EligibilityStatus;

const SECTIONS: { status: Status; heading: string; empty: string }[] = [
  {
    status: "likely",
    heading: "Likely eligible",
    empty: "No schemes are clearly matched yet.",
  },
  {
    status: NEED_MORE_INFO,
    heading: "Possibly eligible — check a condition",
    empty: "No schemes need a condition check.",
  },
  {
    status: "not_eligible",
    heading: "Not eligible",
    empty: "No schemes were ruled out.",
  },
];

const BADGE_LABEL: Record<Status, string> = {
  likely: "Likely eligible",
  [NEED_MORE_INFO]: "Check a condition",
  not_eligible: "Not eligible",
};

const BADGE_CLASS: Record<Status, string> = {
  likely: "bg-green-100 text-green-800 hover:bg-green-100",
  [NEED_MORE_INFO]: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  not_eligible: "bg-red-100 text-red-800 hover:bg-red-100",
};

const LINK_CLASS =
  "inline-block rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100";

export default function ResultsPage() {
  // undefined = still loading on the client; null = no profile saved
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [results, setResults] = useState<EligibilityResult[]>([]);

  useEffect(() => {
    function computeResults() {
      const saved = loadProfile();
      setProfile(saved ?? null);
      setResults(saved ? eligibleSchemes(saved, loadSchemes()) : []);
    }
    computeResults();
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) computeResults();
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  if (profile === undefined) {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-slate-600">Loading…</div>;
  }

  if (profile === null) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Alert>
          <AlertTitle>Enter your details first</AlertTitle>
          <AlertDescription>
            We need a few details about you before we can check which schemes
            you may be eligible for.
          </AlertDescription>
        </Alert>
        <Link href="/" className={LINK_CLASS} data-nexen-id="nx-e8434717-0">
          Go to the home page
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header className="space-y-3" data-nexen-id="nx-e8434717-1">
        <h1 className="text-3xl font-bold text-slate-900" data-nexen-id="nx-e8434717-2">Your eligibility results</h1>
        <Alert>
          <AlertDescription>
            This is an indicative check based on the rules in this app, not a
            confirmation. Verify each scheme on its official portal.
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-3">
          <Link href="/checklist" className={LINK_CLASS} data-nexen-id="nx-e8434717-3">
            Documents checklist
          </Link>
          <Link href="/tracking" className={LINK_CLASS} data-nexen-id="nx-e8434717-4">
            Track my applications
          </Link>
          <Link href="/" className={LINK_CLASS} data-nexen-id="nx-e8434717-5">
            Edit my details
          </Link>
        </div>
      </header>

      {SECTIONS.map((section) => {
        const items = results.filter((r) => r.status === section.status);
        return (
          <section key={section.status} className="space-y-4" data-nexen-id="nx-e8434717-6">
            <h2 className="text-xl font-semibold text-slate-900" data-nexen-id="nx-e8434717-7">
              {section.heading}{" "}
              <span className="text-sm font-normal text-slate-500" data-nexen-id="nx-e8434717-8">({items.length})</span>
            </h2>
            {items.length === 0 ? (
              <p className="text-sm text-slate-600" data-nexen-id="nx-e8434717-9">{section.empty}</p>
            ) : (
              items.map(({ scheme, status, reasons }) => (
                <Card key={scheme.id} data-nexen-id="nx-e8434717-10">
                  <CardHeader className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-lg">{scheme.name}</CardTitle>
                      <Badge className={BADGE_CLASS[status]} data-nexen-id="nx-e8434717-11">{BADGE_LABEL[status]}</Badge>
                    </div>
                    <p className="text-sm text-slate-600" data-nexen-id="nx-e8434717-12">{scheme.provider}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-800" data-nexen-id="nx-e8434717-13">
                      <span className="font-medium" data-nexen-id="nx-e8434717-14">Benefit: </span>
                      {scheme.benefit}
                    </p>
                    {reasons.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-900" data-nexen-id="nx-e8434717-15">
                          {status === "not_eligible" ? "Why not" : "Why"}
                        </p>
                        <ul className="mt-1 list-disc pl-5 text-sm text-slate-700" data-nexen-id="nx-e8434717-16">
                          {reasons.map((reason, i) => (
                            <li key={i} data-nexen-id="nx-e8434717-17">{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Link href={`/schemes/${scheme.id}`} className={LINK_CLASS} data-nexen-id="nx-e8434717-18">
                      View details
                    </Link>
                    <Link href={`/checklist?scheme=${encodeURIComponent(scheme.id)}`} className={LINK_CLASS}>
                      View documents
                    </Link>

                  </CardContent>
                </Card>
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}
