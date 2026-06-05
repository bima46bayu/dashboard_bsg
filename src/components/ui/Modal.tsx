import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-md",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "w-full overflow-hidden rounded-2xl bg-white shadow-2xl",
          width,
        )}
      >
        <div className="px-6 pb-2 pt-6">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-3">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalButton({
  variant = "secondary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
}) {
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
      : "border border-line bg-white text-ink hover:bg-bg-muted";
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        styles,
        className,
      )}
    />
  );
}
