import { useState } from "react";
import { Boxes, PackageCheck, AlertTriangle, Truck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import StatCard from "@/components/ui/StatCard";
import BarChartCard from "@/components/ui/BarChartCard";
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
import { makeSeries, months, toLabeled } from "@/data/mock";

type Sku = {
  id: string;
  name: string;
  sku: string;
  warehouse: string;
  stock: number;
  reorder: number;
  value: number;
  status: "Healthy" | "Reorder" | "Low" | "Out";
};

const skus: Sku[] = [
  { id: "1", name: "Industrial Pump A1", sku: "PMP-A1-220", warehouse: "WH-North", stock: 348, reorder: 120, value: 124800, status: "Healthy" },
  { id: "2", name: "Filter Cartridge", sku: "FLT-C-001", warehouse: "WH-East", stock: 96, reorder: 100, value: 14400, status: "Reorder" },
  { id: "3", name: "Steel Coupling 4\"", sku: "CPL-4-SS", warehouse: "WH-North", stock: 12, reorder: 60, value: 4800, status: "Low" },
  { id: "4", name: "Hydraulic Hose 12m", sku: "HYD-12-BLK", warehouse: "WH-South", stock: 0, reorder: 30, value: 0, status: "Out" },
  { id: "5", name: "Control Valve B3", sku: "CTV-B3-50", warehouse: "WH-Central", stock: 144, reorder: 80, value: 72000, status: "Healthy" },
  { id: "6", name: "Bearing Set 6204", sku: "BRG-6204-2RS", warehouse: "WH-East", stock: 512, reorder: 200, value: 25600, status: "Healthy" },
];

const tone = {
  Healthy: "good",
  Reorder: "warn",
  Low: "warn",
  Out: "bad",
} as const;

const cols: Column<Sku>[] = [
  {
    key: "name",
    header: "Item",
    render: (r) => (
      <div>
        <div className="font-medium text-ink">{r.name}</div>
        <div className="text-xs text-ink-muted">{r.sku}</div>
      </div>
    ),
  },
  { key: "warehouse", header: "Warehouse", render: (r) => r.warehouse },
  {
    key: "stock",
    header: "On hand",
    align: "right",
    render: (r) => formatNumber(r.stock),
  },
  {
    key: "reorder",
    header: "Reorder",
    align: "right",
    render: (r) => formatNumber(r.reorder),
  },
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
    render: (r) => <Badge tone={tone[r.status]}>{r.status}</Badge>,
  },
];

export default function InventoryPage() {
  const [range, setRange] = useState("3M");
  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Stock levels, valuation, and reorder workflow"
        actions={
          <>
            <FilterChip label="All warehouses" />
            <FilterChip label="All categories" />
          </>
        }
      />
      <div className="grid grid-cols-12 gap-4">
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Stock Value"
          value={formatCurrency(2_820_000)}
          delta={1.25}
          series={makeSeries(20, 50, 9, 3)}
          icon={<Boxes className="h-4 w-4" />}
          accent="sky"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Active SKUs"
          value={formatNumber(1842)}
          delta={0.42}
          series={makeSeries(20, 50, 7, 5)}
          icon={<PackageCheck className="h-4 w-4" />}
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Reorder Alerts"
          value="38"
          delta={-2.14}
          series={makeSeries(20, 50, 14, 8, -0.5)}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent="peach"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Fill Rate"
          value="96.4%"
          delta={0.84}
          series={makeSeries(20, 50, 6, 12, 0.2)}
          icon={<Truck className="h-4 w-4" />}
        />

        <Card className="col-span-12 lg:col-span-7">
          <CardHeader
            title="Inventory Value Trend"
            actions={
              <RangeTabs
                options={["1M", "3M", "6M", "1Y"]}
                value={range}
                onChange={setRange}
              />
            }
          />
          <CardBody className="pt-2">
            <AreaChartCard
              data={toLabeled(makeSeries(12, 220, 22, 17, 1.4), months.slice(0, 12))}
              height={260}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <CardHeader title="By Warehouse" />
          <CardBody className="pt-2">
            <BarChartCard
              data={[
                { label: "WH-North", value: 920 },
                { label: "WH-East", value: 640 },
                { label: "WH-South", value: 380 },
                { label: "WH-Central", value: 780 },
                { label: "WH-West", value: 240 },
              ]}
              height={260}
              highlightIndex={0}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12">
          <CardHeader
            title="Items"
            actions={
              <div className="flex items-center gap-2">
                <FilterChip label="Status: all" />
                <FilterChip label="Sort: Value" />
              </div>
            }
          />
          <CardBody className="pt-2">
            <DataTable<Sku> rows={skus} columns={cols} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
