"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";
import { getApplication, updateApplication, type Application } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";
import { APPLICATION_STATUSES, closesInCopy, isApplicationStatus } from "@/lib/rules";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const [app, setApp] = React.useState<Application | null>(null);
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    getApplication(id)
      .then((data) => {
        setApp(data);
        setStatus(data.status);
      })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load this application."));
  }, [id]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    if (!isApplicationStatus(status)) {
      setError("Choose one of the four statuses.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const updated = await updateApplication(id, { status });
      setApp(updated);
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the status.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !app) return <p role="alert" className="text-sm text-destructive" data-nexen-id="nx-44f77b42-0">{error}</p>;
  if (!app) return <p className="text-sm text-muted-foreground" data-nexen-id="nx-44f77b42-1">Loading...</p>;

  return (
    <div data-nexen-component="ApplicationDetailPage" className="max-w-xl space-y-6">
      <Link href="/applications" className="text-sm text-muted-foreground hover:text-foreground" data-nexen-id="nx-44f77b42-2">← All applications</Link>
      <header className="space-y-3" data-nexen-id="nx-44f77b42-3">
        <h1 className="text-3xl font-bold tracking-tight" data-nexen-id="nx-44f77b42-4">{app.scheme_name}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={app.status} />
          <span className="text-sm font-semibold text-destructive" data-nexen-id="nx-44f77b42-5">{closesInCopy(app.days_remaining)}</span>
        </div>
        <p className="text-xs text-muted-foreground" data-nexen-id="nx-44f77b42-6">Closes on {app.application_closes_on}</p>
      </header>

      <form onSubmit={onSave} noValidate className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-44f77b42-7">
        <label className="block space-y-1 text-sm" data-nexen-id="nx-44f77b42-8">
          <span className="font-medium" data-nexen-id="nx-44f77b42-9">Application status</span>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
           data-nexen-id="nx-44f77b42-10">
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        {error && <p role="alert" className="text-sm text-destructive" data-nexen-id="nx-44f77b42-11">{error}</p>}
        {saved && <p role="status" className="text-sm text-muted-foreground" data-nexen-id="nx-44f77b42-12">Status saved.</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50"
         data-nexen-id="nx-44f77b42-13">
          {saving ? "Saving..." : "Save status"}
        </button>
      </form>
    </div>
  );
}
