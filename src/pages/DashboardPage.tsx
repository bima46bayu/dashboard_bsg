import { useState } from "react";
import {
  Banknote,
  Boxes,
  KanbanSquare,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import StatCard from "@/components/ui/StatCard";
import Sparkline from "@/components/ui/Sparkline";
import Gauge from "@/components/ui/Gauge";
import AreaChartCard from "@/components/ui/AreaChartCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import {
  Card,
  CardBody,
  CardHeader,
  FilterChip,
  RangeTabs,
} from "@/components/ui/Card";
import { formatCurrency, formatNumber } from "@/lib/format";
import { makeSeries, toLabeled, weekDays } from "@/data/mock";
import { cn } from "@/lib/cn";

type ModuleRow = {
  id: string;
  name: string;
  icon: string;
  primary: string;
  delta24h: number;
  delta7d: number;
  value: string;
  utilization: string;
  series: number[];
};

const moduleRows: ModuleRow[] = [
  {
    id: "sales",
    name: "Sales",
    icon: "$",
    primary: "$1.24M",
    delta24h: 1.24,
    delta7d: 4.18,
    value: "$2.36M",
    utilization: "82%",
    series: makeSeries(20, 50, 18, 11, 1.6),
  },
  {
    id: "inventory",
    name: "Inventory",
    icon: "◇",
    primary: "$362K",
    delta24h: 0.81,
    delta7d: 2.15,
    value: "$362K",
    utilization: "74%",
    series: makeSeries(20, 45, 12, 21, 1.2),
  },
  {
    id: "project",
    name: "Project",
    icon: "□",
    primary: "$95.15K",
    delta24h: 1.27,
    delta7d: 3.14,
    value: "$160K",
    utilization: "61%",
    series: makeSeries(20, 35, 15, 31, -0.4),
  },
  {
    id: "asset",
    name: "Asset",
    icon: "⌗",
    primary: "$1.00M",
    delta24h: -0.05,
    delta7d: 0.12,
    value: "$159K",
    utilization: "67%",
    series: makeSeries(20, 40, 8, 41, 0.2),
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: "✕",
    primary: "$282K",
    delta24h: 1.26,
    delta7d: 3.4,
    value: "$169K",
    utilization: "58%",
    series: makeSeries(20, 30, 22, 51, 2.4),
  },
];

export default function DashboardPage() {
  const [range, setRange] = useState("1W");
  const series = toLabeled(makeSeries(7, 2.4, 0.45, 7, 0.05), weekDays);

  return (
    <>
      <PageHeader
        title="Welcome back, Atlas team"
        subtitle="Tuesday, May 12 · Snapshot across the eight modules"
        actions={
          <>
            <FilterChip label="This week" />
            <FilterChip label="All units" />
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-4">
          <StatCard
            label="Sales"
            value={formatCurrency(1_185_062)}
            delta={3.4}
            series={makeSeries(20, 50, 12, 3, 1.4)}
            accent="lime"
            icon={<Banknote className="h-4 w-4" />}
          />
          <StatCard
            label="Inventory Value"
            value={formatCurrency(2_820_000)}
            delta={1.25}
            series={makeSeries(20, 50, 8, 5)}
            icon={<Boxes className="h-4 w-4" />}
          />
          <StatCard
            label="Active Projects"
            value={formatNumber(95)}
            delta={0.3}
            series={makeSeries(20, 50, 9, 9, -0.2)}
            icon={<KanbanSquare className="h-4 w-4" />}
          />
          <StatCard
            label="Net Margin"
            value="29.8%"
            delta={0.81}
            series={makeSeries(20, 50, 14, 13, 0.6)}
            accent="mint"
            icon={<PieIcon className="h-4 w-4" />}
          />
        </div>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader
            title="Revenue & Margin"
            actions={
              <RangeTabs
                options={["1D", "1W", "1M", "6M", "1Y"]}
                value={range}
                onChange={setRange}
              />
            }
          />
          <CardBody className="pt-2">
            <div className="mb-3 flex items-center gap-4 text-xs text-ink-muted">
              <LegendDot color="#0E0E0E" label="Revenue" />
              <LegendDot color="#DCF26B" label="Margin" />
            </div>
            <AreaChartCard data={series} height={240} />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-8">
          <CardHeader
            title="All Modules"
            actions={
              <div className="flex items-center gap-2">
                <FilterChip label="Volume (24h)" />
                <FilterChip label="Value" />
                <FilterChip label="Filters" />
              </div>
            }
          />
          <CardBody className="pt-2">
            <DataTable<ModuleRow>
              rows={moduleRows}
              columns={modulesColumns}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader title="Org Health Index" actions={<FilterChip label="Filters" />} />
          <CardBody>
            <Gauge value={68} label="Healthy" caption="Composite index" />
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <Pill label="Yesterday" value="70" tone="good" />
              <Pill label="Last Week" value="50" tone="warn" />
              <Pill label="Last Month" value="54" tone="warn" />
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      <span>{label}</span>
    </div>
  );
}

function Pill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "bad";
}) {
  const tones = {
    good: "bg-accent-mint",
    warn: "bg-accent-peach",
    bad: "bg-accent-rose",
  } as const;
  return (
    <div
      className={cn(
        "rounded-2xl px-3 py-2 text-ink",
        tones[tone],
      )}
    >
      <div className="text-display text-xl leading-none num">{value}</div>
      <div className="text-[11px] text-ink-soft">{label}</div>
    </div>
  );
}

const modulesColumns: Column<ModuleRow>[] = [
  {
    key: "name",
    header: "Module",
    render: (r) => (
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-bg-muted text-ink-soft">
          {r.icon}
        </div>
        <span className="font-medium text-ink">{r.name}</span>
      </div>
    ),
  },
  {
    key: "primary",
    header: "Primary KPI",
    align: "right",
    render: (r) => <span>{r.primary}</span>,
  },
  {
    key: "delta24h",
    header: "24h %",
    align: "right",
    render: (r) => (
      <Badge tone={r.delta24h >= 0 ? "good" : "bad"}>
        {r.delta24h >= 0 ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {r.delta24h.toFixed(2)}%
      </Badge>
    ),
  },
  {
    key: "delta7d",
    header: "7d %",
    align: "right",
    render: (r) => (
      <Badge tone={r.delta7d >= 0 ? "good" : "bad"}>
        {r.delta7d >= 0 ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {r.delta7d.toFixed(2)}%
      </Badge>
    ),
  },
  {
    key: "value",
    header: "Volume (24h)",
    align: "right",
    render: (r) => <span>{r.value}</span>,
  },
  {
    key: "utilization",
    header: "Utilization",
    align: "right",
    render: (r) => <span>{r.utilization}</span>,
  },
  {
    key: "spark",
    header: "Last 7 days",
    align: "right",
    width: "180px",
    render: (r) => (
      <div className="ml-auto w-40">
        <Sparkline
          data={r.series}
          color={r.delta24h >= 0 ? "#1F8A4C" : "#D24A3B"}
        />
      </div>
    ),
  },
];
