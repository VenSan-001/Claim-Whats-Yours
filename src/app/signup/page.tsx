"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { signUp } from "@/lib/data";
import { emailError, passwordError, requiredError } from "@/lib/rules";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const next: Record<string, string> = {};
    const nErr = requiredError(name, "Name");
    const eErr = emailError(email);
    const pErr = passwordError(password);
    if (nErr) next.name = nErr;
    if (eErr) next.email = eErr;
    if (pErr) next.password = pErr;
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await signUp({ name: name.trim(), email: email.trim(), password });
      router.push("/");
      router.refresh();
    } catch (caught) {
      setServerError(caught instanceof Error ? caught.message : "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div data-nexen-component="SignUpPage" className="mx-auto max-w-md py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <img src="/nexen-logo.jpg" alt="ClaimYours logo" className="mb-4 h-12 w-12 rounded-md"  data-nexen-id="nx-85022a33-0"/>
        <h1 className="text-2xl font-semibold tracking-tight" data-nexen-id="nx-85022a33-1">Create your ClaimYours account</h1>
        <p className="mt-2 text-sm text-muted-foreground" data-nexen-id="nx-85022a33-2">Save schemes and track deadlines in one place.</p>
      </div>

      {serverError && (
        <div role="alert" className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-85022a33-3">
        <Field label="Name" name="name" value={name} onChange={setName} error={errors.name} />
        <Field label="Email" name="email" type="email" value={email} onChange={setEmail} error={errors.email} />
        <Field label="Password" name="password" type="password" value={password} onChange={setPassword} error={errors.password} hint="At least 8 characters, with a letter and a number." />
        <Field label="Confirm password" name="confirm" type="password" value={confirm} onChange={setConfirm} error={errors.confirm} />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50"
         data-nexen-id="nx-85022a33-4">
          {submitting ? "Creating account..." : "Create account"}
        </button>
        <p className="text-center text-sm text-muted-foreground" data-nexen-id="nx-85022a33-5">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline" data-nexen-id="nx-85022a33-6">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
}

function Field({ label, name, type = "text", value, onChange, error, hint }: FieldProps) {
  return (
    <label className="block space-y-1 text-sm" data-nexen-id="nx-85022a33-7">
      <span className="font-medium" data-nexen-id="nx-85022a33-8">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
       data-nexen-id="nx-85022a33-9"/>
      {error ? (
        <span className="text-xs text-destructive" data-nexen-id="nx-85022a33-10">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground" data-nexen-id="nx-85022a33-11">{hint}</span>
      ) : null}
    </label>
  );
}
