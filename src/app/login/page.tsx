"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length === 0) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setServerError(body?.error ?? "Email or password is incorrect.");
        return;
      }
      router.push("/applications");
      router.refresh();
    } catch {
      setServerError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main data-nexen-component="LoginPage" className="mx-auto max-w-md px-6 py-16" data-nexen-id="nx-0de71383-0">
      <div className="mb-8 flex flex-col items-center text-center">
        <img src="/nexen-logo.jpg" alt="ClaimYours logo" className="mb-4 h-12 w-12 rounded-md"  data-nexen-id="nx-0de71383-1"/>
        <h1 className="text-2xl font-semibold tracking-tight" data-nexen-id="nx-0de71383-2">Sign in to ClaimYours</h1>
        <p className="mt-2 text-sm text-slate-500" data-nexen-id="nx-0de71383-3">Continue to your saved schemes and applications.</p>
      </div>

      {serverError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-lg border bg-white p-6 shadow-sm" data-nexen-id="nx-0de71383-4">
        <div className="space-y-2">
          <Label htmlFor="email" data-nexen-id="nx-0de71383-5">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
           data-nexen-id="nx-0de71383-6"/>
          {errors.email && <p className="text-xs text-red-600" data-nexen-id="nx-0de71383-7">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" data-nexen-id="nx-0de71383-8">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
           data-nexen-id="nx-0de71383-9"/>
          {errors.password && <p className="text-xs text-red-600" data-nexen-id="nx-0de71383-10">{errors.password}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={submitting} data-nexen-id="nx-0de71383-11">
          {submitting ? "Signing in..." : "Sign in"}
        </Button>

        <div className="flex justify-between text-sm">
          <Link href="/forgot-password" className="text-slate-600 underline-offset-4 hover:underline" data-nexen-id="nx-0de71383-12">
            Forgot password?
          </Link>
          <Link href="/signup" className="text-slate-600 underline-offset-4 hover:underline" data-nexen-id="nx-0de71383-13">
            Create account
          </Link>
        </div>
      </form>
    </main>
  );
}
