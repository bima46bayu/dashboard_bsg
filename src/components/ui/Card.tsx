import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 px-5 pt-5",
        className,
      )}
    >
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function RangeTabs({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full bg-bg-muted p-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === opt
              ? "bg-ink text-white"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function FilterChip({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-surface px-3 py-1 text-xs font-medium text-ink-soft hover:bg-bg-muted",
        className,
      )}
    >
      {label}
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
        <path d="M7 10l5 5 5-5z" />
      </svg>
    </button>
  );
}
