import "./globals.css";
import type { Metadata } from "next";
import SiteNav from "@/components/site-nav";
import { NexenInspector } from '@/components/_internal/NexenInspector';

export const metadata: Metadata = {
  title: "Claim What's Yours",
  description: "Find Tamil Nadu student scholarships and education schemes you may be eligible for.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
				<NexenInspector />
        <SiteNav />
        <main className="mx-auto max-w-4xl px-4 py-6" data-nexen-id="nx-cfb47de6-0">{children}</main>
        <footer className="mx-auto max-w-4xl px-4 py-6 text-xs text-slate-500" data-nexen-id="nx-cfb47de6-1">
          Indicative guide only. Verify every scheme on its official portal before applying.
        </footer>
      </body>
    </html>
  );
}
