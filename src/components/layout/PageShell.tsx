import type { ReactNode } from "react";
import Header from "./Header";

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="px-4 pb-10 pt-3 sm:px-6 lg:px-8">
        <Header />
        <main className="mt-5">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start sm:items-end justify-between gap-4">
      <div>
        <h1 className="text-display text-4xl leading-none tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
