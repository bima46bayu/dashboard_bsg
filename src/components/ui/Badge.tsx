import { cn } from "@/lib/cn";

type Tone = "neutral" | "good" | "bad" | "warn" | "info" | "mute";

export default function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const tones: Record<Tone, string> = {
    neutral: "bg-bg-muted text-ink-soft",
    good: "bg-accent-mint text-ink",
    bad: "bg-accent-rose text-ink",
    warn: "bg-accent-peach text-ink",
    info: "bg-accent-sky text-ink",
    mute: "border border-line bg-transparent text-ink-muted",
  };
  return (
    <span className={cn("chip", tones[tone], className)}>{children}</span>
  );
}
