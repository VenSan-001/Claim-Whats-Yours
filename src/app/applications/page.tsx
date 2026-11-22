"use client";

import Link from "next/link";
import * as React from "react";
import { listApplications, type Application } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";
import { closesInCopy } from "@/lib/rules";

export default function ApplicationsPage() {
  const [items, setItems] = React.useState<Application[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    listApplications()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((caught: unknown) =>
        setError(caught instanceof Error ? caught.message : "Could not load your applications.")
      );
  }, []);

  const list = Array.isArray(items) ? items : [];

  return (
    <div data-nexen-component="ApplicationsPage" className="space-y-6">
      <header data-nexen-id="nx-37531e7a-0">
        <h1 className="text-3xl font-bold tracking-tight" data-nexen-id="nx-37531e7a-1">My applications</h1>
        <p className="mt-2 text-sm text-muted-foreground" data-nexen-id="nx-37531e7a-2">
          Schemes you are applying for, with their status and the nearest deadlines first.
        </p>
      </header>

      {error && <p role="alert" className="text-sm text-destructive" data-nexen-id="nx-37531e7a-3">{error}</p>}
      {items === null && !error && <p className="text-sm text-muted-foreground" data-nexen-id="nx-37531e7a-4">Loading...</p>}
      {items !== null && list.length === 0 && (
        <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground" data-nexen-id="nx-37531e7a-5">
          You have not saved any schemes yet. <Link href="/schemes" className="text-primary hover:underline" data-nexen-id="nx-37531e7a-6">Find schemes</Link>.
        </p>
      )}

      <ul className="grid gap-4 md:grid-cols-2" data-nexen-id="nx-37531e7a-7">
        {list.map((app) => (
          <li key={app.id} data-nexen-id="nx-37531e7a-8">
            <Link
              href={`/applications/${app.id}`}
              className="block rounded-lg border border-border bg-card p-5 shadow-sm hover:border-primary/50"
             data-nexen-id="nx-37531e7a-9">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={app.status} />
                <span className="text-xs font-semibold text-destructive" data-nexen-id="nx-37531e7a-10">{closesInCopy(app.days_remaining)}</span>
              </div>
              <h2 className="mt-3 font-semibold" data-nexen-id="nx-37531e7a-11">{app.scheme_name}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
