"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { Scheme } from "@/lib/types";
import { loadSchemes, resetSchemes, saveSchemes } from "@/lib/storage";
import { validateSchemes } from "@/lib/validate";
import { ADMIN_PASSCODE } from "@/lib/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}

export default function AdminPage() {
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [jsonText, setJsonText] = useState<string>("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadSchemes();
    setSchemes(loaded);
    setJsonText(JSON.stringify(loaded, null, 2));
  }, []);

  function handleUnlock(): void {
    if (passcodeInput === ADMIN_PASSCODE) {
      setUnlocked(true);
      setGateError(null);
      setPasscodeInput("");
    } else {
      setGateError("That passcode is not correct.");
    }
  }

  function handleValidateAndSave(): void {
    setSaveSuccess(null);
    try {
      const parsed: unknown = JSON.parse(jsonText);
      const validated = validateSchemes(parsed);
      saveSchemes(validated);
      setSchemes(validated);
      setSaveError(null);
      setSaveSuccess("Saved. The eligibility results in this browser now use these rules.");
    } catch (err: unknown) {
      setSaveError(errorMessage(err));
    }
  }

  function handleReset(): void {
    resetSchemes();
    const fresh = loadSchemes();
    setSchemes(fresh);
    setJsonText(JSON.stringify(fresh, null, 2));
    setSaveError(null);
    setSaveSuccess("Reset to the original data.");
  }

  function handleDownload(): void {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "schemes.json";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  if (!unlocked) {
    return (
      <main className="mx-auto max-w-md space-y-6 p-4 md:p-8" data-nexen-id="nx-bc4a8c10-0">
        <h1 className="text-2xl font-bold" data-nexen-id="nx-bc4a8c10-1">Admin: scheme rules</h1>
        <Card data-nexen-id="nx-bc4a8c10-2">
          <CardHeader>
            <CardTitle>Enter passcode</CardTitle>
            <CardDescription>This page is for the volunteer team that keeps scheme rules up to date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passcode" data-nexen-id="nx-bc4a8c10-3">Passcode</Label>
              <Input
                id="passcode"
                type="password"
                value={passcodeInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPasscodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUnlock();
                }}
               data-nexen-id="nx-bc4a8c10-4"/>
            </div>
            {gateError ? (
              <Alert variant="destructive">
                <AlertDescription>{gateError}</AlertDescription>
              </Alert>
            ) : null}
            <Button onClick={handleUnlock} data-nexen-id="nx-bc4a8c10-5">Unlock</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-8" data-nexen-id="nx-bc4a8c10-6">
      <h1 className="text-2xl font-bold" data-nexen-id="nx-bc4a8c10-7">Admin: scheme rules</h1>

      <Alert variant="warning">
        <AlertTitle>Please read before editing</AlertTitle>
        <AlertDescription>
          Changes are saved in this browser only and affect what this browser shows. Verify rules against official
          sources before editing.
        </AlertDescription>
      </Alert>

      <Card data-nexen-id="nx-bc4a8c10-8">
        <CardHeader>
          <CardTitle>Scheme data (JSON)</CardTitle>
          <CardDescription>Edit the scheme list, then validate and save.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={20}
            className="font-mono text-xs"
            value={jsonText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setJsonText(e.target.value);
              setSaveSuccess(null);
            }}
           data-nexen-id="nx-bc4a8c10-9"/>

          {saveError ? (
            <Alert variant="destructive">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          ) : null}
          {saveSuccess ? <p className="text-sm text-green-700" data-nexen-id="nx-bc4a8c10-10">{saveSuccess}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleValidateAndSave} data-nexen-id="nx-bc4a8c10-11">Validate &amp; save</Button>
            <Button variant="outline" onClick={handleReset} data-nexen-id="nx-bc4a8c10-12">
              Reset to original data
            </Button>
            <Button variant="outline" onClick={handleDownload} data-nexen-id="nx-bc4a8c10-13">
              Download JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card data-nexen-id="nx-bc4a8c10-14">
        <CardHeader>
          <CardTitle>Current schemes</CardTitle>
          <CardDescription>A quick view of the rules currently loaded.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Income limit (INR/yr)</TableHead>
                <TableHead>Min %</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Last verified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schemes.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>{s.income_limit_annual_inr}</TableCell>
                  <TableCell>{s.min_percentage === null ? "None" : s.min_percentage}</TableCell>
                  <TableCell>{s.deadline}</TableCell>
                  <TableCell>{s.last_verified}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
