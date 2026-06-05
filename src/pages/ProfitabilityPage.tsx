import { useState } from "react";
import { Coins, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import StatCard from "@/components/ui/StatCard";
import AreaChartCard from "@/components/ui/AreaChartCard";
import DonutChart from "@/components/ui/DonutChart";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import {
  Card,
  CardBody,
  CardHeader,
  FilterChip,
  RangeTabs,
} from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { makeSeries, months, toLabeled } from "@/data/mock";

type LineRow = {
  id: string;
  segment: string;
  revenue: number;
  cogs: number;
  margin: number;
  ytd: number;
};

const rows: LineRow[] = [
  { id: "1", segment: "Industrial Pumps", revenue: 1820000, cogs: 980000, margin: 46.2, ytd: 6.4 },
  { id: "2", segment: "Filtration", revenue: 1240000, cogs: 720000, margin: 41.9, ytd: 3.2 },
  { id: "3", segment: "Valves & Couplings", revenue: 980000, cogs: 580000, margin: 40.8, ytd: -1.1 },
  { id: "4", segment: "Services", revenue: 740000, cogs: 240000, margin: 67.6, ytd: 8.8 },
  { id: "5", segment: "Spare Parts", revenue: 520000, cogs: 360000, margin: 30.8, ytd: 1.5 },
];

const cols: Column<LineRow>[] = [
  { key: "segment", header: "Segment", render: (r) => <span className="font-medium">{r.segment}</span> },
  { key: "rev", header: "Revenue", align: "right", render: (r) => formatCurrency(r.revenue) },
  { key: "cogs", header: "COGS", align: "right", render: (r) => formatCurrency(r.cogs) },
  {
    key: "margin",
    header: "Gross Margin",
    align: "right",
    render: (r) => (
      <Badge tone={r.margin >= 45 ? "good" : r.margin >= 35 ? "warn" : "bad"}>
        {r.margin.toFixed(1)}%
      </Badge>
    ),
  },
  {
    key: "ytd",
    header: "YTD Δ",
    align: "right",
    render: (r) => (
      <span className={r.ytd >= 0 ? "text-good" : "text-bad"}>
        {r.ytd >= 0 ? "+" : ""}
        {r.ytd.toFixed(1)}%
      </span>
    ),
  },
];

export default function ProfitabilityPage() {
  const [range, setRange] = useState("6M");
  return (
    <>
      <PageHeader
        title="Profitability"
        subtitle="Margin analysis and cost-centre reporting"
        actions={
          <>
            <FilterChip label="All units" />
            <FilterChip label="FY 2026" />
          </>
        }
      />
      <div className="grid grid-cols-12 gap-4">
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Gross Margin"
          value="46.2%"
          delta={1.6}
          series={makeSeries(20, 50, 6, 3, 0.2)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="mint"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Net Profit"
          value={formatCurrency(842_000)}
          delta={2.4}
          series={makeSeries(20, 50, 12, 11)}
          icon={<PiggyBank className="h-4 w-4" />}
          accent="lime"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="EBITDA"
          value={formatCurrency(1_220_000)}
          delta={0.9}
          series={makeSeries(20, 50, 9, 31)}
          icon={<Coins className="h-4 w-4" />}
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Cost per Unit"
          value="$184"
          delta={-1.1}
          series={makeSeries(20, 50, 8, 41, -0.2)}
          icon={<TrendingDown className="h-4 w-4" />}
          accent="rose"
        />

        <Card className="col-span-12 lg:col-span-8">
          <CardHeader
            title="P&L Trend"
            subtitle="Revenue, costs, and net profit over time"
            actions={
              <RangeTabs
                options={["3M", "6M", "1Y", "YTD"]}
                value={range}
                onChange={setRange}
              />
            }
          />
          <CardBody className="pt-2">
            <AreaChartCard
              data={toLabeled(makeSeries(12, 600, 80, 23, 14), months.slice(0, 12))}
              height={280}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader title="Cost Allocation" />
          <CardBody className="pt-2">
            <DonutChart
              data={[
                { name: "Materials", value: 42, color: "#DCF26B" },
                { name: "Labour", value: 28, color: "#C2EAD4" },
                { name: "Overhead", value: 18, color: "#BFE0F2" },
                { name: "Logistics", value: 12, color: "#F4D9C2" },
              ]}
              centerLabel="of total cost"
              centerValue="42%"
            />
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <LegendItem color="#DCF26B" label="Materials" />
              <LegendItem color="#C2EAD4" label="Labour" />
              <LegendItem color="#BFE0F2" label="Overhead" />
              <LegendItem color="#F4D9C2" label="Logistics" />
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-12">
          <CardHeader title="Margin by Segment" actions={<FilterChip label="Sort: Margin" />} />
          <CardBody className="pt-2">
            <DataTable<LineRow> rows={rows} columns={cols} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-ink-soft">{label}</span>
    </div>
  );
}
