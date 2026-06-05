import { BarChart3, FileSpreadsheet, Clock, Download } from "lucide-react";
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
import { formatNumber } from "@/lib/format";
import { makeSeries, toLabeled, weekDays } from "@/data/mock";

type Report = {
  id: string;
  name: string;
  modules: string[];
  schedule: string;
  lastRun: string;
  owner: string;
  status: "Active" | "Paused";
};

const reports: Report[] = [
  { id: "R-321", name: "Executive Weekly Snapshot", modules: ["Sales", "Profitability", "Project"], schedule: "Mon 08:00", lastRun: "Today 08:01", owner: "CEO Office", status: "Active" },
  { id: "R-320", name: "Inventory Reorder Daily", modules: ["Inventory"], schedule: "Daily 06:00", lastRun: "Today 06:00", owner: "Ops", status: "Active" },
  { id: "R-319", name: "Marketing Channel ROI", modules: ["Marketing"], schedule: "Mon 09:00", lastRun: "May 06 09:00", owner: "CMO", status: "Active" },
  { id: "R-318", name: "Compliance Audit Trail", modules: ["Document"], schedule: "Monthly 1st", lastRun: "May 01 02:00", owner: "Compliance", status: "Active" },
  { id: "R-317", name: "Asset Disposal Report", modules: ["Asset"], schedule: "Quarterly", lastRun: "Apr 01 09:00", owner: "Finance", status: "Paused" },
];

const tone = { Active: "good", Paused: "mute" } as const;

const cols: Column<Report>[] = [
  {
    key: "name",
    header: "Report",
    render: (r) => (
      <div>
        <div className="font-medium text-ink">{r.name}</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {r.modules.map((m) => (
            <span
              key={m}
              className="inline-flex items-center rounded-full bg-bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-soft"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  { key: "schedule", header: "Schedule", render: (r) => r.schedule },
  { key: "lastRun", header: "Last Run", render: (r) => r.lastRun },
  { key: "owner", header: "Owner", align: "right", render: (r) => r.owner },
  {
    key: "status",
    header: "Status",
    align: "right",
    render: (r) => <Badge tone={tone[r.status]}>{r.status}</Badge>,
  },
];

export default function ReportingPage() {
  return (
    <>
      <PageHeader
        title="Reporting"
        subtitle="Custom reports, scheduling, and exports"
        actions={
          <>
            <FilterChip label="All modules" />
            <FilterChip label="All owners" />
          </>
        }
      />
      <div className="grid grid-cols-12 gap-4">
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Reports Generated"
          value={formatNumber(1_286)}
          delta={3.4}
          series={makeSeries(20, 50, 9, 3)}
          icon={<BarChart3 className="h-4 w-4" />}
          accent="lime"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Scheduled Active"
          value="42"
          delta={1.0}
          series={makeSeries(20, 50, 6, 11)}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Avg. Load Time"
          value="1.4s"
          delta={-2.6}
          series={makeSeries(20, 50, 8, 22, -0.2)}
          icon={<FileSpreadsheet className="h-4 w-4" />}
          accent="mint"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Exports (week)"
          value="208"
          delta={4.2}
          series={makeSeries(20, 50, 12, 32, 0.5)}
          icon={<Download className="h-4 w-4" />}
          accent="sky"
        />

        <Card className="col-span-12 lg:col-span-7">
          <CardHeader title="Runs This Week" />
          <CardBody className="pt-2">
            <BarChartCard
              data={toLabeled(makeSeries(7, 38, 14, 11), weekDays)}
              height={260}
              highlightIndex={4}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <CardHeader title="Popular Templates" />
          <CardBody className="pt-2 space-y-2">
            <Template name="Executive KPI snapshot" runs={184} />
            <Template name="Inventory reorder daily" runs={142} />
            <Template name="Sales pipeline weekly" runs={118} />
            <Template name="Project health monthly" runs={92} />
            <Template name="P&L by segment" runs={76} />
          </CardBody>
        </Card>

        <Card className="col-span-12">
          <CardHeader
            title="Scheduled Reports"
            actions={<FilterChip label="Active only" />}
          />
          <CardBody className="pt-2">
            <DataTable<Report> rows={reports} columns={cols} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Template({ name, runs }: { name: string; runs: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-line/70 p-3">
      <div className="text-sm font-medium">{name}</div>
      <div className="text-xs text-ink-muted">{runs} runs</div>
    </div>
  );
}
