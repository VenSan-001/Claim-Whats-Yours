# Claim What's Yours

Claim What's Yours helps students from low-income families in Tamil Nadu (Class 10–12 and college) find the scholarships and education schemes they are eligible for, understand which documents they need, and track their applications. Many eligible students miss out simply because they never hear about these schemes or cannot work out the rules; this app turns a plain-language description of their situation into a clear list of schemes, a personalised document checklist, and a simple tracker.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).
or just open (https://claim-whats-yours.vercel.app/).

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Where the schemes live

- Scheme data is in `src/data/schemes.json`.
- Admin edits are stored in the browser's `localStorage`, so they apply only on the device and browser where they were made.

## Admin passcode

The admin page is protected by a constant `ADMIN_PASSCODE` defined in `src/lib/config.ts`. The check runs entirely in the client, so it is **not real security** — anyone who can read the bundle can see the passcode. Do not use it to protect sensitive data.

## Disclaimer

- Eligibility rules shown in this app are **indicative only**.
- Verify every scheme on the official government portal before applying.
- Scheme rules must be re-verified against the government source regularly.
- Each scheme entry carries a `last_verified` date; check it before relying on the information.

## Pages

- `/` — Home: describe your situation in plain language.
- `/results` — Eligibility results.
- `/schemes` — Scheme list and scheme details.
- `/checklist` — Personalised document checklist.
- `/tracking` — Track your applications.
- `/admin` — Admin view (passcode protected, client-side only).
  ##prompts
  i have attached the prompts given in the file named prompts
