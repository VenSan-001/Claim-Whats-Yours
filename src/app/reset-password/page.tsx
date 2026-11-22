"use client";

import Link from "next/link";
import * as React from "react";
import { resetPassword } from "@/lib/data";
import { passwordError } from "@/lib/rules";

export default function ResetPasswordPage() {
  const [token, setToken] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Read the emailed token on the client to avoid a Suspense boundary for useSearchParams.
  React.useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(t);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const next: Record<string, string> = {};
    if (!token) next.token = "This reset link is missing its token. Request a new link.";
    const pErr = passwordError(password);
    if (pErr) next.password = pErr;
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch (caught) {
      setServerError(caught instanceof Error ? caught.message : "This link has expired or was already used.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div data-nexen-component="ResetPasswordPage" className="mx-auto max-w-md py-10">
      <h1 className="text-2xl font-semibold tracking-tight" data-nexen-id="nx-5beb24c0-0">Set a new password</h1>

      {done ? (
        <div role="status" className="mt-6 rounded-lg border border-border bg-card p-6 text-sm">
          Your password is updated.{" "}
          <Link href="/login" className="font-medium text-primary hover:underline" data-nexen-id="nx-5beb24c0-1">Sign in</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-5beb24c0-2">
          {serverError && <p role="alert" className="text-sm text-destructive" data-nexen-id="nx-5beb24c0-3">{serverError}</p>}
          {errors.token && <p className="text-sm text-destructive" data-nexen-id="nx-5beb24c0-4">{errors.token}</p>}
          <label className="block space-y-1 text-sm" data-nexen-id="nx-5beb24c0-5">
            <span className="font-medium" data-nexen-id="nx-5beb24c0-6">New password</span>
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(errors.password)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"  data-nexen-id="nx-5beb24c0-7"/>
            {errors.password && <span className="text-xs text-destructive" data-nexen-id="nx-5beb24c0-8">{errors.password}</span>}
          </label>
          <label className="block space-y-1 text-sm" data-nexen-id="nx-5beb24c0-9">
            <span className="font-medium" data-nexen-id="nx-5beb24c0-10">Confirm new password</span>
            <input type="password" name="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={Boolean(errors.confirm)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"  data-nexen-id="nx-5beb24c0-11"/>
            {errors.confirm && <span className="text-xs text-destructive" data-nexen-id="nx-5beb24c0-12">{errors.confirm}</span>}
          </label>
          <button type="submit" disabled={submitting} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50" data-nexen-id="nx-5beb24c0-13">
            {submitting ? "Saving..." : "Save new password"}
          </button>
        </form>
      )}
    </div>
  );
}
