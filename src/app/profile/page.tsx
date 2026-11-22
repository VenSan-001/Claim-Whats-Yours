"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  changePassword,
  getLinkedStudent,
  getMe,
  linkStudent,
  logout,
  updateMe,
  type LinkedStudent,
  type User,
} from "@/lib/data";
import { emailError, passwordError, requiredError } from "@/lib/rules";

const fieldClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
const buttonClass =
  "rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    getMe().then((me) => {
      setUser(me);
      setName(me.name);
      setEmail(me.email);
    });
  }, []);

  async function onSaveAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Record<string, string> = {};
    const nErr = requiredError(name, "Name");
    const eErr = emailError(email);
    if (nErr) next.name = nErr;
    if (eErr) next.email = eErr;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    try {
      const updated = await updateMe({ name: name.trim(), email: email.trim() });
      setUser(updated);
      setNotice("Account saved.");
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Could not save your account.");
    }
  }

  async function onSignOut() {
    await logout().catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  return (
    <div data-nexen-component="ProfilePage" className="mx-auto max-w-xl space-y-8">
      <header data-nexen-id="nx-99236b1e-0">
        <h1 className="text-3xl font-bold tracking-tight" data-nexen-id="nx-99236b1e-1">Your profile</h1>
        <p className="mt-2 text-sm text-muted-foreground" data-nexen-id="nx-99236b1e-2">Change your name, email and password, or sign out.</p>
      </header>

      {notice && <p role="status" className="text-sm text-muted-foreground" data-nexen-id="nx-99236b1e-3">{notice}</p>}

      <form onSubmit={onSaveAccount} noValidate className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-99236b1e-4">
        <h2 className="font-semibold" data-nexen-id="nx-99236b1e-5">Account</h2>
        <label className="block space-y-1 text-sm" data-nexen-id="nx-99236b1e-6">
          <span className="font-medium" data-nexen-id="nx-99236b1e-7">Name</span>
          <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)}  data-nexen-id="nx-99236b1e-8"/>
          {errors.name && <span className="text-xs text-destructive" data-nexen-id="nx-99236b1e-9">{errors.name}</span>}
        </label>
        <label className="block space-y-1 text-sm" data-nexen-id="nx-99236b1e-10">
          <span className="font-medium" data-nexen-id="nx-99236b1e-11">Email</span>
          <input type="email" className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(errors.email)}  data-nexen-id="nx-99236b1e-12"/>
          {errors.email && <span className="text-xs text-destructive" data-nexen-id="nx-99236b1e-13">{errors.email}</span>}
        </label>
        <button type="submit" disabled={!user} className={buttonClass} data-nexen-id="nx-99236b1e-14">Save account</button>
      </form>

      <PasswordForm />

      {user?.role === "parent" && <LinkStudentCard />}

      <button type="button" onClick={onSignOut} className="rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted" data-nexen-id="nx-99236b1e-15">
        Sign out
      </button>
    </div>
  );
}

function PasswordForm() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDone(false);
    const cErr = requiredError(current, "Current password");
    const pErr = passwordError(next);
    if (cErr) return setError(cErr);
    if (pErr) return setError(pErr);
    if (confirm !== next) return setError("New passwords do not match.");
    setError(null);
    try {
      await changePassword({ current_password: current, new_password: next });
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not change your password.");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-99236b1e-16">
      <h2 className="font-semibold" data-nexen-id="nx-99236b1e-17">Change password</h2>
      <input type="password" aria-label="Current password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} className={fieldClass}  data-nexen-id="nx-99236b1e-18"/>
      <input type="password" aria-label="New password" placeholder="New password" value={next} onChange={(e) => setNext(e.target.value)} className={fieldClass}  data-nexen-id="nx-99236b1e-19"/>
      <input type="password" aria-label="Confirm new password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={fieldClass}  data-nexen-id="nx-99236b1e-20"/>
      {error && <p role="alert" className="text-sm text-destructive" data-nexen-id="nx-99236b1e-21">{error}</p>}
      {done && <p role="status" className="text-sm text-muted-foreground" data-nexen-id="nx-99236b1e-22">Password changed.</p>}
      <button type="submit" className={buttonClass} data-nexen-id="nx-99236b1e-23">Update password</button>
    </form>
  );
}

function LinkStudentCard() {
  const [studentEmail, setStudentEmail] = React.useState("");
  const [linked, setLinked] = React.useState<LinkedStudent | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getLinkedStudent().then(setLinked).catch(() => setLinked(null));
  }, []);

  async function onLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const err = emailError(studentEmail);
    if (err) return setError(err);
    setError(null);
    try {
      setLinked(await linkStudent({ student_email: studentEmail.trim() }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not link this student.");
    }
  }

  return (
    <section data-nexen-component="LinkStudentCard" className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm" data-nexen-id="nx-99236b1e-24">
      <h2 className="font-semibold" data-nexen-id="nx-99236b1e-25">Student you help</h2>
      {linked ? (
        <p className="text-sm" data-nexen-id="nx-99236b1e-26">Linked to {linked.name} ({linked.email}). You see the same schemes and checklists.</p>
      ) : (
        <form onSubmit={onLink} noValidate className="space-y-3" data-nexen-id="nx-99236b1e-27">
          <input type="email" aria-label="Student email" placeholder="Student's email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className={fieldClass}  data-nexen-id="nx-99236b1e-28"/>
          {error && <p role="alert" className="text-sm text-destructive" data-nexen-id="nx-99236b1e-29">{error}</p>}
          <button type="submit" className={buttonClass} data-nexen-id="nx-99236b1e-30">Link student</button>
        </form>
      )}
    </section>
  );
}
