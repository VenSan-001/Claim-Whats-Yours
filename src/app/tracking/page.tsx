"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { Application, ApplicationStatus, Scheme } from "@/lib/types";
import { loadApplications, loadSchemes, saveApplications } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const APPLICATION_STATUSES: readonly ApplicationStatus[] = ["planned", "submitted", "approved", "rejected"];

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  planned: "Planned",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

const STATUS_BADGE: Record<ApplicationStatus, BadgeVariant> = {
  planned: "secondary",
  submitted: "default",
  approved: "success",
  rejected: "destructive",
};

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

/** Local calendar date as yyyy-mm-dd (matches the ISO date strings stored on schemes). */
function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const result = new Date(base.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Not set";
  return iso;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

function buildDeadlineIcs(scheme: Scheme): string {
  const ymd = scheme.deadline.replace(/-/g, "");
  const nextDay = addDays(new Date(`${scheme.deadline}T00:00:00`), 1);
  const endYmd = toDateString(nextDay).replace(/-/g, "");
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const description = `Application deadline for ${scheme.name}. Official link: ${scheme.official_url}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Claim What's Yours//Deadlines//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${scheme.id}-${ymd}@claim-what-is-yours`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd}`,
    `DTEND;VALUE=DATE:${endYmd}`,
    `SUMMARY:${escapeIcsText(`${scheme.name} deadline`)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `URL:${scheme.official_url}`,
    "BEGIN:VALARM",
    "TRIGGER:-P7D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(`${scheme.name} closes in 7 days`)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(`${scheme.name} closes in 1 day`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

function downloadDeadlineIcs(scheme: Scheme): void {
  const blob = new Blob([buildDeadlineIcs(scheme)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${scheme.id}-deadline.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const DEADLINE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;


export default function TrackingPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [today, setToday] = useState<string>("");

  const [schemeId, setSchemeId] = useState<string>("");
  const [status, setStatus] = useState<ApplicationStatus>("planned");
  const [submittedOn, setSubmittedOn] = useState<string>("");
  const [reminderDate, setReminderDate] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setSchemes(loadSchemes());
    setApplications(loadApplications());
    setToday(toDateString(new Date()));
  }, []);

  const schemeById = useMemo(() => {
    const map = new Map<string, Scheme>();
    for (const s of schemes) map.set(s.id, s);
    return map;
  }, [schemes]);

  const activeSchemes = useMemo(() => schemes.filter((s) => s.status === "active"), [schemes]);

  const calendarSchemes = useMemo(
    () => activeSchemes.filter((s) => DEADLINE_PATTERN.test(s.deadline ?? "")),
    [activeSchemes],
  );


  const upcomingDeadlines = useMemo(() => {
    if (!today) return [];
    const limit = toDateString(addDays(new Date(), 60));
    return activeSchemes
      .filter((s) => s.deadline <= limit)
      .slice()
      .sort((a, b) => (a.deadline < b.deadline ? -1 : a.deadline > b.deadline ? 1 : 0));
  }, [activeSchemes, today]);

  const dueReminders = useMemo(() => {
    if (!today) return [];
    return applications.filter(
      (a) => a.reminder_date !== null && a.reminder_date <= today && a.status === "planned",
    );
  }, [applications, today]);

  function persist(next: Application[]): void {
    setApplications(next);
    saveApplications(next);
  }

  function handleSave(): void {
    if (!schemeId) {
      setFormError("Please choose a scheme first.");
      return;
    }
    const app: Application = {
      id: Date.now().toString(),
      scheme_id: schemeId,
      status,
      submitted_on: submittedOn ? submittedOn : null,
      reminder_date: reminderDate ? reminderDate : null,
      note: note.trim(),
    };
    persist([...applications, app]);
    setFormError(null);
    setSchemeId("");
    setStatus("planned");
    setSubmittedOn("");
    setReminderDate("");
    setNote("");
  }

  function handleStatusChange(id: string, next: ApplicationStatus): void {
    persist(applications.map((a) => (a.id === id ? { ...a, status: next } : a)));
  }

  function handleRemove(id: string): void {
    persist(applications.filter((a) => a.id !== id));
  }

  function schemeNameFor(schemeIdValue: string): string {
    return schemeById.get(schemeIdValue)?.name ?? schemeIdValue;
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 md:p-8" data-nexen-id="nx-784b21c2-0">
      <header className="space-y-2" data-nexen-id="nx-784b21c2-1">
        <h1 className="text-2xl font-bold" data-nexen-id="nx-784b21c2-2">Track my applications</h1>
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-784b21c2-3">
          Keep a note of the schemes you have applied for, and see deadlines and reminders in one place.
        </p>
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-784b21c2-4">
          Reminders show here when you open this page. They are not sent to your phone.
        </p>
      </header>

      <Card data-nexen-id="nx-784b21c2-5">
        <CardHeader>
          <CardTitle>Add an application</CardTitle>
          <CardDescription>Pick a scheme and tell us where you are with it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheme" data-nexen-id="nx-784b21c2-6">Scheme</Label>
              <select
                id="scheme"
                className={SELECT_CLASS}
                value={schemeId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSchemeId(e.target.value)}
               data-nexen-id="nx-784b21c2-7">
                <option value="">Choose a scheme</option>
                {activeSchemes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" data-nexen-id="nx-784b21c2-8">Status</Label>
              <select
                id="status"
                className={SELECT_CLASS}
                value={status}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as ApplicationStatus)}
               data-nexen-id="nx-784b21c2-9">
                {APPLICATION_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_LABELS[st]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="submitted-on" data-nexen-id="nx-784b21c2-10">Submitted on</Label>
              <Input
                id="submitted-on"
                type="date"
                value={submittedOn}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSubmittedOn(e.target.value)}
               data-nexen-id="nx-784b21c2-11"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-date" data-nexen-id="nx-784b21c2-12">Remind me on</Label>
              <Input
                id="reminder-date"
                type="date"
                value={reminderDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setReminderDate(e.target.value)}
               data-nexen-id="nx-784b21c2-13"/>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" data-nexen-id="nx-784b21c2-14">Note</Label>
            <Textarea
              id="note"
              rows={3}
              placeholder="For example: waiting for the income certificate from the tahsildar office"
              value={note}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
             data-nexen-id="nx-784b21c2-15"/>
          </div>

          {formError ? <p className="text-sm text-red-600" data-nexen-id="nx-784b21c2-16">{formError}</p> : null}

          <Button onClick={handleSave} data-nexen-id="nx-784b21c2-17">Save application</Button>
        </CardContent>
      </Card>

      <section className="space-y-3" data-nexen-id="nx-784b21c2-18">
        <h2 className="text-xl font-semibold" data-nexen-id="nx-784b21c2-19">My applications</h2>
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-nexen-id="nx-784b21c2-20">You have not added any applications yet.</p>
        ) : (
          applications.map((app) => (
            <Card key={app.id} data-nexen-id="nx-784b21c2-21">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg">{schemeNameFor(app.scheme_id)}</CardTitle>
                  <Badge variant={STATUS_BADGE[app.status]} data-nexen-id="nx-784b21c2-22">{STATUS_LABELS[app.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-1 text-sm md:grid-cols-2">
                  <p data-nexen-id="nx-784b21c2-23">
                    <span className="font-medium" data-nexen-id="nx-784b21c2-24">Submitted on:</span> {formatDate(app.submitted_on)}
                  </p>
                  <p data-nexen-id="nx-784b21c2-25">
                    <span className="font-medium" data-nexen-id="nx-784b21c2-26">Reminder date:</span> {formatDate(app.reminder_date)}
                  </p>
                </div>
                {app.note ? <p className="text-sm" data-nexen-id="nx-784b21c2-27">{app.note}</p> : null}

                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[12rem] space-y-2">
                    <Label htmlFor={`status-${app.id}`} data-nexen-id="nx-784b21c2-28">Change status</Label>
                    <select
                      id={`status-${app.id}`}
                      className={SELECT_CLASS}
                      value={app.status}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        handleStatusChange(app.id, e.target.value as ApplicationStatus)
                      }
                     data-nexen-id="nx-784b21c2-29">
                      {APPLICATION_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {STATUS_LABELS[st]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button variant="outline" onClick={() => handleRemove(app.id)} data-nexen-id="nx-784b21c2-30">
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-3" data-nexen-id="nx-784b21c2-31">
        <h2 className="text-xl font-semibold" data-nexen-id="nx-784b21c2-32">Upcoming deadlines</h2>
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-784b21c2-33">Active schemes with a deadline in the next 60 days, or already passed.</p>
        {upcomingDeadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-nexen-id="nx-784b21c2-34">No deadlines in the next 60 days.</p>
        ) : (
          <ul className="space-y-2" data-nexen-id="nx-784b21c2-35">
            {upcomingDeadlines.map((s) => {
              const passed = s.deadline < today;
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3" data-nexen-id="nx-784b21c2-36">
                  <span className="font-medium" data-nexen-id="nx-784b21c2-37">{s.name}</span>
                  <span className="flex items-center gap-2 text-sm" data-nexen-id="nx-784b21c2-38">
                    <span data-nexen-id="nx-784b21c2-39">{s.deadline}</span>
                    {passed ? <Badge variant="destructive" data-nexen-id="nx-784b21c2-40">Passed</Badge> : <Badge variant="warning" data-nexen-id="nx-784b21c2-41">Upcoming</Badge>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3" data-nexen-id="nx-784b21c2-42">
        <h2 className="text-xl font-semibold" data-nexen-id="nx-784b21c2-43">Reminders</h2>
        {dueReminders.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-nexen-id="nx-784b21c2-44">No reminders are due today.</p>
        ) : (
          <ul className="space-y-2" data-nexen-id="nx-784b21c2-45">
            {dueReminders.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3" data-nexen-id="nx-784b21c2-46">
                <span className="font-medium" data-nexen-id="nx-784b21c2-47">{schemeNameFor(a.scheme_id)}</span>
                <span className="flex items-center gap-2 text-sm" data-nexen-id="nx-784b21c2-48">
                  <span data-nexen-id="nx-784b21c2-49">{a.reminder_date}</span>
                  <Badge variant="warning" data-nexen-id="nx-784b21c2-50">Reminder due</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3" data-nexen-id="new-calendar-section">
        <h2 className="text-xl font-semibold">Add deadlines to your calendar</h2>
        <p className="text-sm text-muted-foreground">Downloads an .ics file with an all-day event and reminders 7 days and 1 day before the deadline.</p>
        {calendarSchemes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active schemes have a deadline.</p>
        ) : (
          <ul className="space-y-2">
            {calendarSchemes.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                <span className="text-sm">
                  <span className="font-medium">{s.name}</span> · deadline {s.deadline}
                </span>
                <Button variant="outline" onClick={() => downloadDeadlineIcs(s)}>
                  Add to calendar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

    </main>
  );
}
