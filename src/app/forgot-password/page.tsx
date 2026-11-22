"use client";

import Link from "next/link";
import * as React from "react";
import { forgotPassword } from "@/lib/data";
import { emailError } from "@/lib/rules";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const err = emailError(email);
    setError(err);
    if (err) return;
    setSubmitting(true);
    try {
      await forgotPassword({ email: email.trim() });
    } finally {
      // Same message whether or not the account exists.
      setSent(true);
      setSubmitting(false);
    }
  }

  return (
    <div data-nexen-component="ForgotPasswordPage" className="mx-auto max-w-md py-10">
      <h1 className="text-2xl font-semibold tracking-tight" data-nexen-id="nx-d5936786-0">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground" data-nexen-id="nx-d5936786-1">
        Enter your account email and we will send a reset link if an account exists.
      </p>

      {sent ? (
        <div role="status" className="mt-6 rounded-lg border border-border bg-card p-6 text-sm">
          If an account exists for that email, a reset link is on its way. Check your inbox.
          <div className="mt-4">
            <Link href="/login" className="font-medium text-primary hover:underline" data-nexen-id="nx-d5936786-2">
              Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-d5936786-3">
          <label className="block space-y-1 text-sm" data-nexen-id="nx-d5936786-4">
            <span className="font-medium" data-nexen-id="nx-d5936786-5">Email</span>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(error)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
             data-nexen-id="nx-d5936786-6"/>
            {error && <span className="text-xs text-destructive" data-nexen-id="nx-d5936786-7">{error}</span>}
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50"
           data-nexen-id="nx-d5936786-8">
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </div>
  );
}
