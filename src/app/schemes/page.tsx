"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadSchemes } from "@/lib/storage";
import type { Level, Scheme } from "@/lib/types";

const LEVEL_LABELS: Record<Level, string> = {
  class8: "Class 8",
  class9: "Class 9",
  class10: "Class 10",
  class11_12: "Class 11–12",
  college: "College",
  any: "Any level",
};

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[] | null>(null);

  useEffect(() => {
    setSchemes(loadSchemes());
  }, []);

  const active = (schemes ?? []).filter((s) => s.status === "active");

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header className="space-y-2" data-nexen-id="nx-9fe7648a-0">
        <h1 className="text-2xl font-bold text-gray-900" data-nexen-id="nx-9fe7648a-1">All schemes</h1>
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" data-nexen-id="nx-9fe7648a-2">
          Verify on the official portal before applying.
        </p>
      </header>

      {schemes === null ? (
        <p className="text-sm text-gray-500" data-nexen-id="nx-9fe7648a-3">Loading schemes…</p>
      ) : active.length === 0 ? (
        <p className="text-sm text-gray-600" data-nexen-id="nx-9fe7648a-4">No active schemes are available right now.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((scheme) => (
            <Card key={scheme.id} className="flex flex-col" data-nexen-id="nx-9fe7648a-5">
              <CardHeader>
                <CardTitle className="text-lg">{scheme.name}</CardTitle>
                <CardDescription>{scheme.provider}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm text-gray-700">
                <p data-nexen-id="nx-9fe7648a-6">
                  <span className="font-medium" data-nexen-id="nx-9fe7648a-7">Benefit:</span> {scheme.benefit}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" data-nexen-id="nx-9fe7648a-8">
                    {LEVEL_LABELS[scheme.level]}
                  </Badge>
                  <span className="text-xs text-gray-500" data-nexen-id="nx-9fe7648a-9">
                    Deadline: {scheme.deadline ?? "Check official portal"}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/schemes/${scheme.id}`}
                  className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                 data-nexen-id="nx-9fe7648a-10">
                  View details
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}