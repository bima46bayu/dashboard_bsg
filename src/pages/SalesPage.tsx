import { useState } from "react";
import { Banknote, Target, Users, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import StatCard from "@/components/ui/StatCard";
import AreaChartCard from "@/components/ui/AreaChartCard";
import BarChartCard from "@/components/ui/BarChartCard";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import {
  Card,
  CardBody,
  CardHeader,
  FilterChip,
  RangeTabs,
} from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { makeSeries, months, toLabeled, weekDays } from "@/data/mock";

type Deal = {
  id: string;
  customer: string;
  segment: string;
  stage: "Lead" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
  value: number;
  probability: number;
  owner: string;
};

const deals: Deal[] = [
  { id: "D-1042", customer: "Northwind Trading", segment: "Enterprise", stage: "Negotiation", value: 184000, probability: 75, owner: "S. Park" },
  { id: "D-1041", customer: "Acme Co.", segment: "SMB", stage: "Proposal", value: 62000, probability: 55, owner: "L. Chen" },
  { id: "D-1040", customer: "Globex Industrial", segment: "Enterprise", stage: "Won", value: 248000, probability: 100, owner: "K. Adler" },
  { id: "D-1039", customer: "Initech LLC", segment: "Mid-Market", stage: "Qualified", value: 41000, probability: 35, owner: "S. Park" },
  { id: "D-1038", customer: "Soylent Corp", segment: "Mid-Market", stage: "Lost", value: 28000, probability: 0, owner: "M. Doyle" },
  { id: "D-1037", customer: "Stark Industries", segment: "Enterprise", stage: "Negotiation", value: 320000, probability: 65, owner: "K. Adler" },
];

const stageTone = {
  Lead: "neutral",
  Qualified: "info",
  Proposal: "warn",
  Negotiation: "warn",
  Won: "good",
  Lost: "bad",
} as const;

export default function SalesPage() {
  const [range, setRange] = useState("1M");

  return (
    <>
      <PageHeader
        title="Sales"
        subtitle="Pipeline, revenue, and team performance"
        actions={
          <>
            <FilterChip label="All regions" />
            <FilterChip label="This quarter" />
          </>
        }
      />
      <div className="grid grid-cols-12 gap-4">
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Total Revenue"
          value={formatCurrency(2_360_000)}
          delta={4.18}
          series={makeSeries(20, 50, 16, 7, 1.4)}
          icon={<Banknote className="h-4 w-4" />}
          accent="lime"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Pipeline Value"
          value={formatCurrency(5_182_000)}
          delta={1.24}
          series={makeSeries(20, 50, 10, 12, 0.6)}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Avg. Deal Size"
          value={formatCurrency(48_500)}
          delta={2.15}
          series={makeSeries(20, 50, 9, 22)}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Win Rate"
          value="38.2%"
          delta={-0.45}
          series={makeSeries(20, 50, 12, 41, -0.2)}
          icon={<Users className="h-4 w-4" />}
          accent="mint"
        />

        <Card className="col-span-12 lg:col-span-8">
          <CardHeader
            title="Revenue Trend"
            subtitle="Monthly bookings versus forecast"
            actions={
              <RangeTabs
                options={["1W", "1M", "3M", "6M", "1Y"]}
                value={range}
                onChange={setRange}
              />
            }
          />
          <CardBody className="pt-2">
            <AreaChartCard
              data={toLabeled(
                makeSeries(12, 180, 30, 19, 4),
                months.slice(0, 12),
              )}
              height={260}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader title="Targets" subtitle="Team vs. quota" />
          <CardBody className="pt-2">
            <TargetBar name="S. Park" pct={92} />
            <TargetBar name="K. Adler" pct={76} />
            <TargetBar name="L. Chen" pct={64} />
            <TargetBar name="M. Doyle" pct={51} />
            <TargetBar name="A. Rivers" pct={42} />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <CardHeader
            title="Orders this week"
            actions={<FilterChip label="Confirmed" />}
          />
          <CardBody className="pt-2">
            <BarChartCard
              data={toLabeled(makeSeries(7, 18, 9, 11), weekDays)}
              height={240}
              highlightIndex={3}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-7">
          <CardHeader
            title="Top Deals"
            actions={<FilterChip label="Open only" />}
          />
          <CardBody className="pt-2">
            <DataTable<Deal>
              rows={deals}
              columns={[
                {
                  key: "id",
                  header: "Deal",
                  render: (r) => (
                    <div>
                      <div className="font-medium text-ink">{r.customer}</div>
                      <div className="text-xs text-ink-muted">
                        {r.id} · {r.segment}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "stage",
                  header: "Stage",
                  render: (r) => (
                    <Badge tone={stageTone[r.stage]}>{r.stage}</Badge>
                  ),
                },
                {
                  key: "value",
                  header: "Value",
                  align: "right",
                  render: (r) => formatCurrency(r.value),
                },
                {
                  key: "prob",
                  header: "Probability",
                  align: "right",
                  render: (r) => `${r.probability}%`,
                },
                {
                  key: "owner",
                  header: "Owner",
                  align: "right",
                  render: (r) => r.owner,
                },
              ]}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function TargetBar({ name, pct }: { name: string; pct: number }) {
  const positive = pct >= 70;
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft">
          {positive ? (
            <ArrowUpRight className="h-3 w-3 text-good" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-bad" />
          )}
          {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-bg-muted">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${pct}%`,
            background: positive ? "#DCF26B" : "#F2C9CE",
          }}
        />
      </div>
    </div>
  );
}
