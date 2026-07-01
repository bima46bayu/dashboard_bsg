import { ReactNode, useState } from "react";
import { cn } from "@/lib/cn";
import { ChevronDown, ChevronRight } from "lucide-react";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  width?: string;
  render: (row: T) => ReactNode;
};

type RowProps<T> = {
  row: T;
  columns: Column<T>[];
  level?: number;
};

function DataTableRow<T extends { id: string | number; subRows?: T[] }>({ row, columns, level = 0 }: RowProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubRows = row.subRows && row.subRows.length > 0;

  return (
    <>
      <tr className={cn(
        "border-t border-line/70 transition-colors hover:bg-bg-muted/40",
        level > 0 && "bg-slate-50/50"
      )}>
        {columns.map((c, i) => (
          <td
            key={c.key}
            className={cn(
              "py-3 num",
              c.align === "right" && "text-right",
              c.align === "center" && "text-center",
            )}
          >
            {i === 0 ? (
              <div className="flex items-center gap-1.5" style={{ paddingLeft: `${level * 1.5}rem` }}>
                {hasSubRows ? (
                  <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                ) : (
                  <div className="w-5" />
                )}
                {c.render(row)}
              </div>
            ) : (
              c.render(row)
            )}
          </td>
        ))}
      </tr>
      {isExpanded && hasSubRows && row.subRows!.map((subRow) => (
        <DataTableRow key={subRow.id} row={subRow} columns={columns} level={level + 1} />
      ))}
    </>
  );
}

export default function DataTable<T extends { id: string | number; subRows?: T[] }>({
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
            {columns.map((c, i) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={cn(
                  "py-3 font-medium",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                  i === 0 && "pl-7" // extra padding for header first col to match rows
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <DataTableRow key={row.id} row={row} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
