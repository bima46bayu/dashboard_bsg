import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, PlusCircle, Search } from "lucide-react";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";
import {
  useProjects,
  type MonitoringProject,
} from "@/context/ProjectsContext";

type Project = MonitoringProject;

const statusTone = {
  Draft: "neutral",
  Active: "good",
  "On Hold": "warn",
  Closed: "mute",
} as const;

const cols: Column<Project>[] = [
  {
    key: "id",
    header: "Project ID",
    render: (r) => <span className="font-medium text-ink">{r.id}</span>,
  },
  {
    key: "name",
    header: "Project",
    render: (r) => (
      <div>
        <div className="font-medium text-ink">{r.name}</div>
        <div className="text-xs text-ink-muted">{r.customer}</div>
      </div>
    ),
  },
  { key: "pm", header: "P/M", render: (r) => r.pm },
  { key: "date", header: "Date", render: (r) => r.date },
  {
    key: "value",
    header: "Value",
    align: "right",
    render: (r) => formatCurrency(r.value),
  },
  {
    key: "status",
    header: "Status",
    align: "right",
    render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge>,
  },
];

export default function MonitoringProjectsPage() {
  const { projects } = useProjects();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q) ||
        p.pm.toLowerCase().includes(q),
    );
  }, [projects, query]);

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            All registered projects across customers and account managers
          </p>
        </div>
        <Link
          to="/project/monitoring/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" />
          New Project
        </Link>
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="block w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="text-xs text-ink-muted">
            Showing {filtered.length} project{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-bg-muted text-ink-muted">
              <FolderKanban className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">
              {query ? "No projects match your search" : "No projects yet"}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-ink-muted">
              {query
                ? "Try a different search term."
                : "Register your first project to see it listed here."}
            </p>
            {!query && (
              <Link
                to="/project/monitoring/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4" />
                New Project
              </Link>
            )}
          </div>
        ) : (
          <div className="px-5 pb-3">
            <DataTable<Project> rows={filtered} columns={cols} />
          </div>
        )}
      </div>
    </>
  );
}
