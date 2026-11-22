import { NextResponse } from "next/server";
import { DEMO_CREDS } from "@/lib/data/demo-creds";
import { DEMO_USER, issueToken } from "@/lib/authSession";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (email !== DEMO_CREDS.email || password !== DEMO_CREDS.password) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  return NextResponse.json({ ...DEMO_USER, token: issueToken(email) });
}
