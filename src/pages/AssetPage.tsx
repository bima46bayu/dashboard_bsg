import { Factory, Wrench, ShieldCheck, Activity } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import StatCard from "@/components/ui/StatCard";
import AreaChartCard from "@/components/ui/AreaChartCard";
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
import { makeSeries, months, toLabeled } from "@/data/mock";

type Asset = {
  id: string;
  name: string;
  category: string;
  location: string;
  bookValue: number;
  status: "Active" | "Maintenance" | "Retired";
  warranty: string;
};

const assets: Asset[] = [
  { id: "AST-001", name: "CNC Mill #4", category: "Machinery", location: "Plant A", bookValue: 184000, status: "Active", warranty: "Mar 2027" },
  { id: "AST-002", name: "Forklift FX-22", category: "Vehicle", location: "WH-North", bookValue: 38000, status: "Maintenance", warranty: "Jul 2026" },
  { id: "AST-003", name: "Server Rack R-7", category: "IT", location: "HQ", bookValue: 76000, status: "Active", warranty: "Nov 2028" },
  { id: "AST-004", name: "HVAC Unit C-2", category: "Facilities", location: "Plant B", bookValue: 22000, status: "Active", warranty: "Feb 2027" },
  { id: "AST-005", name: "Pickup Truck T-3", category: "Vehicle", location: "Field", bookValue: 14000, status: "Retired", warranty: "—" },
];

const tone = { Active: "good", Maintenance: "warn", Retired: "mute" } as const;

const cols: Column<Asset>[] = [
  {
    key: "name",
    header: "Asset",
    render: (r) => (
      <div>
        <div className="font-medium text-ink">{r.name}</div>
        <div className="text-xs text-ink-muted">
          {r.id} · {r.category}
        </div>
      </div>
    ),
  },
  { key: "loc", header: "Location", render: (r) => r.location },
  { key: "bv", header: "Book Value", align: "right", render: (r) => formatCurrency(r.bookValue) },
  {
    key: "status",
    header: "Status",
    align: "right",
    render: (r) => <Badge tone={tone[r.status]}>{r.status}</Badge>,
  },
  { key: "warranty", header: "Warranty", align: "right", render: (r) => r.warranty },
];

export default function AssetPage() {
  return (
    <>
      <PageHeader
        title="Asset"
        subtitle="Lifecycle, depreciation, and maintenance"
        actions={
          <>
            <FilterChip label="All locations" />
            <FilterChip label="All categories" />
          </>
        }
      />
      <div className="grid grid-cols-12 gap-4">
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Total Asset Value"
          value={formatCurrency(18_420_000)}
          delta={0.8}
          series={makeSeries(20, 50, 6, 3)}
          icon={<Factory className="h-4 w-4" />}
          accent="sky"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Depreciation YTD"
          value={formatCurrency(842_000)}
          delta={1.1}
          series={makeSeries(20, 50, 6, 12, 0.4)}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Under Maintenance"
          value="14"
          delta={-1.2}
          series={makeSeries(20, 50, 12, 22, -0.3)}
          icon={<Wrench className="h-4 w-4" />}
          accent="peach"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Warranty Expiring (30d)"
          value="6"
          delta={-0.4}
          series={makeSeries(20, 50, 10, 32)}
          icon={<ShieldCheck className="h-4 w-4" />}
          accent="mint"
        />

        <Card className="col-span-12 lg:col-span-7">
          <CardHeader title="Asset Value vs Depreciation" />
          <CardBody className="pt-2">
            <AreaChartCard
              data={toLabeled(makeSeries(12, 1500, 60, 17), months.slice(0, 12))}
              height={260}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <CardHeader title="By Category" />
          <CardBody className="pt-2">
            <BarChartCard
              data={[
                { label: "Machinery", value: 820 },
                { label: "Vehicles", value: 280 },
                { label: "IT", value: 360 },
                { label: "Facilities", value: 210 },
                { label: "Other", value: 110 },
              ]}
              height={260}
              highlightIndex={0}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12">
          <CardHeader title="Asset Registry" actions={<FilterChip label="Status: all" />} />
          <CardBody className="pt-2">
            <DataTable<Asset> rows={assets} columns={cols} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
