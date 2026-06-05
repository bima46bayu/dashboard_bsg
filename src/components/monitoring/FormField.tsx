import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

type LabelProps = {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
  helpBelow?: string;
};

export function Field({
  label,
  required,
  hint,
  helpBelow,
  className,
  children,
}: LabelProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-ink-soft">
        <span>
          {label}
          {required && <span className="ml-0.5 text-bad">*</span>}
        </span>
        {hint && <span className="text-[11px] text-ink-faint">({hint})</span>}
      </label>
      {children}
      {helpBelow && (
        <p className="mt-1 text-[11px] text-ink-muted">{helpBelow}</p>
      )}
    </div>
  );
}

export const inputBase =
  "block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-ink-faint focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-bg-muted disabled:text-ink-muted";

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, className)} />;
}

export function Textarea({
  className,
  rows = 3,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={cn(inputBase, "resize-y", className)}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          inputBase,
          "appearance-none pr-9",
          className,
        )}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
        fill="currentColor"
      >
        <path d="M7 10l5 5 5-5z" />
      </svg>
    </div>
  );
}
