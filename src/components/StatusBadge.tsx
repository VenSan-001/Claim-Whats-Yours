import type { ApplicationStatus } from "@/lib/data";

const STYLES: Record<ApplicationStatus, string> = {
  "Not Started": "bg-muted text-muted-foreground",
  "Documents Pending": "bg-accent/15 text-accent",
  Applied: "bg-primary/15 text-primary",
  "Under Review": "bg-secondary/15 text-secondary",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      data-nexen-component="StatusBadge"
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
     data-nexen-id="nx-8753415a-0">
      {status}
    </span>
  );
}
