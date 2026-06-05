import { CheckCircle2, AlertCircle, Calendar, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import StatCard from "@/components/ui/StatCard";
import BarChartCard from "@/components/ui/BarChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import {
  Card,
  CardBody,
  CardHeader,
  FilterChip,
} from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { makeSeries, toLabeled, weekDays } from "@/data/mock";

type Project = {
  id: string;
  name: string;
  owner: string;
  health: "Green" | "Amber" | "Red";
  progress: number;
  budgetUsed: number;
  budget: number;
  dueDate: string;
};

const projects: Project[] = [
  { id: "P-021", name: "ERP Migration", owner: "L. Mendes", health: "Green", progress: 72, budgetUsed: 184000, budget: 280000, dueDate: "Jun 14" },
  { id: "P-019", name: "Warehouse Automation", owner: "K. Adler", health: "Amber", progress: 48, budgetUsed: 312000, budget: 420000, dueDate: "Aug 02" },
  { id: "P-018", name: "Brand Refresh 2026", owner: "A. Rivers", health: "Green", progress: 88, budgetUsed: 62000, budget: 80000, dueDate: "May 28" },
  { id: "P-017", name: "Asset Tagging Roll-out", owner: "M. Doyle", health: "Red", progress: 22, budgetUsed: 96000, budget: 120000, dueDate: "Jun 30" },
  { id: "P-016", name: "Compliance Audit FY26", owner: "S. Park", health: "Green", progress: 64, budgetUsed: 44000, budget: 75000, dueDate: "Jul 11" },
];

const healthTone = { Green: "good", Amber: "warn", Red: "bad" } as const;

const cols: Column<Project>[] = [
  {
    key: "name",
    header: "Project",
    render: (r) => (
      <div>
        <div className="font-medium text-ink">{r.name}</div>
        <div className="text-xs text-ink-muted">
          {r.id} · {r.owner}
        </div>
      </div>
    ),
  },
  {
    key: "health",
    header: "Health",
    render: (r) => <Badge tone={healthTone[r.health]}>{r.health}</Badge>,
  },
  {
    key: "progress",
    header: "Progress",
    render: (r) => (
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-32 rounded-full bg-bg-muted">
          <div
            className="h-1.5 rounded-full bg-ink"
            style={{ width: `${r.progress}%` }}
          />
        </div>
        <span className="text-xs text-ink-soft">{r.progress}%</span>
      </div>
    ),
  },
  {
    key: "budget",
    header: "Budget",
    align: "right",
    render: (r) => (
      <span>
        {formatCurrency(r.budgetUsed)}{" "}
        <span className="text-ink-muted">/ {formatCurrency(r.budget)}</span>
      </span>
    ),
  },
  { key: "due", header: "Due", align: "right", render: (r) => r.dueDate },
];

export default function ProjectPage() {
  return (
    <>
      <PageHeader
        title="Project"
        subtitle="Planning, execution, and delivery tracking"
        actions={
          <>
            <FilterChip label="All teams" />
            <FilterChip label="This quarter" />
          </>
        }
      />
      <div className="grid grid-cols-12 gap-4">
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Active Projects"
          value="42"
          delta={1.4}
          series={makeSeries(20, 50, 9, 3)}
          icon={<Calendar className="h-4 w-4" />}
          accent="lime"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="On-Time Delivery"
          value="86%"
          delta={2.1}
          series={makeSeries(20, 50, 7, 11)}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Overdue Milestones"
          value="9"
          delta={-3.4}
          series={makeSeries(20, 50, 12, 21, -0.4)}
          icon={<AlertCircle className="h-4 w-4" />}
          accent="rose"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Resource Utilization"
          value="78%"
          delta={0.6}
          series={makeSeries(20, 50, 8, 31)}
          icon={<Users className="h-4 w-4" />}
          accent="mint"
        />

        <Card className="col-span-12 lg:col-span-7">
          <CardHeader title="Task Completion" subtitle="Closed vs created (this week)" />
          <CardBody className="pt-2">
            <BarChartCard
              data={toLabeled(makeSeries(7, 24, 10, 5), weekDays)}
              height={260}
              highlightIndex={2}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <CardHeader title="Risk Register" />
          <CardBody className="pt-2 space-y-3">
            <Risk title="Vendor delay on automation hardware" project="P-019" level="High" />
            <Risk title="Tag scanner firmware not certified" project="P-017" level="High" />
            <Risk title="Resource conflict in Q3 sprint" project="P-021" level="Med" />
            <Risk title="Compliance documents pending sign-off" project="P-016" level="Low" />
          </CardBody>
        </Card>

        <Card className="col-span-12">
          <CardHeader title="Projects" actions={<FilterChip label="Sort: Progress" />} />
          <CardBody className="pt-2">
            <DataTable<Project> rows={projects} columns={cols} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Risk({
  title,
  project,
  level,
}: {
  title: string;
  project: string;
  level: "Low" | "Med" | "High";
}) {
  const t = { Low: "info", Med: "warn", High: "bad" } as const;
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-line/70 bg-bg-muted/40 p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-ink-muted">{project}</div>
      </div>
      <Badge tone={t[level]}>{level}</Badge>
    </div>
  );
}
