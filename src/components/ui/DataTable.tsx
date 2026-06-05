import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  width?: string;
  render: (row: T) => ReactNode;
};

export default function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-ink-muted">
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={cn(
                  "py-3 font-medium",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-t border-line/70 transition-colors hover:bg-bg-muted/40"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "py-3 num",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                  )}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
