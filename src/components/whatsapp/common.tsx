import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { WhatsAppStatus } from "@/lib/whatsapp";
import { useApi } from "@/lib/api";

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
        <span>{label}</span>
        {required ? <span className="text-bad">*</span> : null}
      </div>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-ink-faint">{hint}</p> : null}
    </label>
  );
}

export function TextInput(
  props: InputHTMLAttributes<HTMLInputElement>,
) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={cn(
        "w-full rounded-lg border border-line bg-bg-surface px-3 py-2 text-sm outline-none focus:border-blue-500",
        className,
      )}
    />
  );
}

export function Textarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={cn(
        "w-full resize-y rounded-lg border border-line bg-bg-surface px-3 py-2 text-sm leading-relaxed outline-none focus:border-blue-500",
        className,
      )}
    />
  );
}

export function PrimaryButton({
  children,
  disabled,
  loading,
  className,
  ...rest
}: {
  children: ReactNode;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors",
        disabled || loading
          ? "cursor-not-allowed bg-blue-600/40"
          : "bg-blue-600 hover:bg-blue-700",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Working…
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...rest
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-bg-surface px-3 py-2 text-sm font-medium text-ink-soft hover:bg-bg-muted",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ErrorAlert({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg border border-accent-rose/60 bg-accent-rose/30 p-3 text-xs text-ink">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="break-all">{error}</div>
    </div>
  );
}

export function SuccessAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg border border-accent-mint/60 bg-accent-mint/30 p-3 text-xs text-ink">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="break-all">{message}</div>
    </div>
  );
}

export function StatusBanner({
  status,
  loading,
}: {
  status: WhatsAppStatus | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardBody className="flex items-center gap-2 py-3 text-sm text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking Wablas connection…
        </CardBody>
      </Card>
    );
  }

  if (!useApi) {
    return (
      <Card className="border-accent-peach/60 bg-accent-peach/30">
        <CardBody className="flex items-start gap-3 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
          <div className="text-sm text-ink-soft">
            <div className="font-medium text-ink">Backend API not connected</div>
            <div className="mt-0.5 text-xs">
              Set <code>VITE_API_URL</code> in <code>.env</code> and run the
              Express server.
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!status?.configured) {
    return (
      <Card className="border-accent-rose/60 bg-accent-rose/30">
        <CardBody className="flex items-start gap-3 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
          <div className="text-sm text-ink-soft">
            <div className="font-medium text-ink">
              Wablas credentials missing on server
            </div>
            <div className="mt-0.5 text-xs">
              Add <code>WABLAS_TOKEN</code> and <code>WABLAS_SECRET_KEY</code>{" "}
              to <code>server/.env</code> and restart the API.
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-accent-mint/60 bg-accent-mint/30">
      <CardBody className="flex items-center justify-between gap-3 py-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
          <div className="text-sm text-ink-soft">
            <div className="font-medium text-ink">Wablas connected</div>
            <div className="mt-0.5 text-xs">
              {status.baseUrl}
              {status.sender ? ` · Sender: ${status.sender}` : ""}
            </div>
          </div>
        </div>
        <Badge tone="good">Ready</Badge>
      </CardBody>
    </Card>
  );
}
