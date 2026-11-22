import { DEMO_CREDS } from "@/lib/data/demo-creds";

export const DEMO_USER = {
  id: "usr_demo",
  name: "Demo Student",
  email: DEMO_CREDS.email,
  role: "student" as const,
};

export function issueToken(email: string): string {
  return Buffer.from(email, "utf8").toString("base64");
}

export function userFromToken(token: string | null): typeof DEMO_USER | null {
  if (!token) return null;
  const email = Buffer.from(token, "base64").toString("utf8");
  return email === DEMO_CREDS.email ? DEMO_USER : null;
}
