"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/results", label: "Results" },
  { href: "/schemes", label: "Schemes" },
  { href: "/checklist", label: "Checklist" },
  { href: "/tracking", label: "Tracking" },
  { href: "/admin", label: "Admin" },
];

export default function SiteNav() {
  const pathname = usePathname() ?? "/";

  const isActive = (href: string): boolean =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-b border-slate-200 bg-white" data-nexen-id="nx-885d5af3-0">
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm" data-nexen-id="nx-885d5af3-1">
        <Link href="/" className="mr-2 font-semibold text-slate-900" data-nexen-id="nx-885d5af3-2">
          Claim What&apos;s Yours
        </Link>
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded px-2 py-1 text-xs sm:text-sm",
                active ? "bg-slate-900 font-medium text-white" : "text-slate-600 hover:text-slate-900"
              )}
             data-nexen-id="nx-885d5af3-3">
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
