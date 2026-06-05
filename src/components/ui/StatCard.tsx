import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Sparkline from "./Sparkline";
import { cn } from "@/lib/cn";

export type StatCardProps = {
  label: string;
  value: string;
  delta?: number;
  series?: number[];
  accent?: "lime" | "mint" | "sky" | "peach" | "rose";
  icon?: React.ReactNode;
  className?: string;
};

export default function StatCard({
  label,
  value,
  delta,
  series,
  accent,
  icon,
  className,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div
      className={cn(
        "kpi-card",
        accent && `accent-${accent}`,
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full bg-white/70 text-ink",
              !accent && "bg-bg-muted",
            )}
          >
            {icon ?? <span className="text-xs">●</span>}
          </div>
          <span className="text-sm font-medium text-ink-soft">{label}</span>
        </div>
        {series ? (
          <div className="w-24">
            <Sparkline data={series} height={32} />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          {delta !== undefined ? (
            <div
              className={cn(
                "mb-1 inline-flex items-center gap-1 text-xs font-medium",
                positive ? "text-good" : "text-bad",
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              <span>
                {positive ? "+" : ""}
                {delta.toFixed(2)}%
              </span>
            </div>
          ) : null}
          <div className="text-display text-4xl leading-none num">{value}</div>
        </div>
      </div>
    </div>
  );
}
