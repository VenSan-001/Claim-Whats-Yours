"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { eligibleSchemes } from "@/lib/eligibility";
import { loadChecklist, loadProfile, loadSchemes, saveChecklist } from "@/lib/storage";
import type { Profile, Scheme } from "@/lib/types";
import { NEED_MORE_INFO } from "@/lib/types";

function ChecklistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const schemeId = searchParams.get("scheme") ?? "";

  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setProfile(loadProfile() ?? null);
    setSchemes(loadSchemes());
    setChecked(loadChecklist() ?? {});
    setLoaded(true);
  }, []);

  // Union of documents across likely/possible schemes: docName -> scheme names
  const documents = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!profile) return map;
    for (const { scheme, status } of eligibleSchemes(profile, schemes)) {
      if (status !== "likely" && status !== NEED_MORE_INFO) continue;
      for (const doc of scheme.documents ?? []) {
        const names = map.get(doc) ?? [];
        if (!names.includes(scheme.name)) names.push(scheme.name);
        map.set(doc, names);
      }
    }
    return map;
  }, [profile, schemes]);

  // Matched schemes (likely or need-more-info) for the scheme picker
  const matched = useMemo(() => {
    if (!profile) return [] as Scheme[];
    return eligibleSchemes(profile, schemes)
      .filter(({ status }) => status === "likely" || status === NEED_MORE_INFO)
      .map(({ scheme }) => scheme);
  }, [profile, schemes]);

  const docNames = Array.from(documents.keys());
  const readyCount = docNames.filter((d) => checked[d]).length;

  const selected = schemeId ? schemes.find((s) => s.id === schemeId) : undefined;
  const selectedDocs: string[] = selected?.documents ?? [];
  const selectedReady = selectedDocs.filter((d) => checked[d]).length;
  const applySteps: string[] = (selected as (Scheme & { apply_steps?: string[] }) | undefined)?.apply_steps ?? [];

  function toggle(doc: string, value: boolean) {
    const next = { ...checked, [doc]: value };
    setChecked(next);
    saveChecklist(next);
  }

  function reset() {
    setChecked({});
    saveChecklist({});
  }

  function chooseScheme(value: string) {
    if (!value) return;
    router.push(`/checklist?scheme=${encodeURIComponent(value)}`);
  }

  if (!loaded) {
    return <p className="p-6 text-sm text-gray-500" data-nexen-id="nx-b8e3ba71-0">Loading checklist…</p>;
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <Alert>
          <AlertTitle>No details yet</AlertTitle>
          <AlertDescription>
            <Link href="/" className="font-medium text-blue-700 underline" data-nexen-id="nx-b8e3ba71-1">
              Enter your details first
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const schemeSelect = (id: string, className: string) => (
    <select
      id={id}
      className={className}
      value={schemeId}
      onChange={(e) => chooseScheme(e.target.value)}
    >
      <option value="">Choose a scheme</option>
      {matched.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );

  // No scheme chosen: show only the picker
  if (!schemeId) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Document checklist</h1>
        </header>
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm text-gray-700">
            {matched.length === 0 ? (
              <p>
                No matched schemes yet. Check{" "}
                <Link href="/results" className="font-medium text-blue-700 underline">
                  /results
                </Link>
              </p>
            ) : (
              <>
                <label htmlFor="scheme-select" className="block font-medium text-gray-900">
                  Choose a scheme
                </label>
                {schemeSelect("scheme-select", "w-full rounded border border-gray-300 p-2 text-sm")}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <style>{`@media print { body * { visibility: hidden; } .print-scheme-only, .print-scheme-only * { visibility: visible; } .print-scheme-only { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>

      <header className="space-y-2" data-nexen-id="nx-b8e3ba71-2">
        <h1 className="text-2xl font-bold text-gray-900" data-nexen-id="nx-b8e3ba71-3">Document checklist</h1>
        <div className="print:hidden">
          <label htmlFor="scheme-change" className="mb-1 block text-sm font-medium text-gray-900">
            Change scheme
          </label>
          {schemeSelect("scheme-change", "print:hidden w-full rounded border border-gray-300 p-2 text-sm")}
        </div>
        <div className="print:hidden">
          <Button variant="outline" className="print:hidden" onClick={() => window.print()}>
            Download PDF
          </Button>
        </div>
      </header>

      {!selected ? (
        <Alert>
          <AlertTitle>Scheme not found</AlertTitle>
          <AlertDescription>Pick one of your matched schemes above.</AlertDescription>
        </Alert>
      ) : (
        <div className="print-scheme-only space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">{selected.name}</h2>
          <p className="text-sm text-gray-600">
            {selectedReady} of {selectedDocs.length} documents ready
          </p>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents to keep ready</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDocs.length === 0 ? (
                <p className="text-sm text-gray-700">No documents listed for this scheme.</p>
              ) : (
                <ul className="space-y-3" data-nexen-id="nx-b8e3ba71-9">
                  {selectedDocs.map((doc) => (
                    <li key={doc} data-nexen-id="nx-b8e3ba71-10">
                      <label className="flex cursor-pointer items-start gap-3" data-nexen-id="nx-b8e3ba71-11">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                          checked={!!checked[doc]}
                          onChange={(e) => toggle(doc, e.target.checked)}
                          data-nexen-id="nx-b8e3ba71-12"
                        />
                        <span className="flex-1" data-nexen-id="nx-b8e3ba71-13">
                          <span
                            className={`block text-sm ${checked[doc] ? "text-gray-400 line-through" : "text-gray-900"}`}
                            data-nexen-id="nx-b8e3ba71-14"
                          >
                            {doc}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Apply steps</CardTitle>
            </CardHeader>
            <CardContent>
              {applySteps.length === 0 ? (
                <p className="text-sm text-gray-700">Open the official link below and follow its instructions.</p>
              ) : (
                <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-800">
                  {applySteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          {selected.official_url && (
            <p className="text-sm">
              <a
                href={selected.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-700 underline"
              >
                Open official website
              </a>
            </p>
          )}

          {selected.last_verified && (
            <p className="text-xs text-gray-500">Last verified: {selected.last_verified}</p>
          )}
        </div>
      )}

      <div>
        <Button variant="outline" onClick={reset} data-nexen-id="nx-b8e3ba71-16">
          Reset checklist
        </Button>
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-gray-500">Loading checklist…</p>}>
      <ChecklistContent />
    </Suspense>
  );
}
