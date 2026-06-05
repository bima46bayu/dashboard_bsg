import { Link } from "react-router-dom";
import { Megaphone, MousePointer2, Users, Sparkles, MessageCircle } from "lucide-react";
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
} from "@/components/ui/Card";
import { formatCurrency, formatNumber } from "@/lib/format";
import { makeSeries, months, toLabeled } from "@/data/mock";

type Campaign = {
  id: string;
  name: string;
  channel: "SEO" | "SEM" | "Social" | "Email" | "Display";
  spend: number;
  leads: number;
  cpl: number;
  roas: number;
  status: "Live" | "Paused" | "Ended";
};

const campaigns: Campaign[] = [
  { id: "C-91", name: "Spring Industrial Launch", channel: "SEM", spend: 42000, leads: 384, cpl: 109, roas: 4.2, status: "Live" },
  { id: "C-90", name: "Sustainability Microsite", channel: "SEO", spend: 18000, leads: 612, cpl: 29, roas: 6.4, status: "Live" },
  { id: "C-89", name: "LinkedIn Thought Leadership", channel: "Social", spend: 24000, leads: 198, cpl: 121, roas: 3.1, status: "Live" },
  { id: "C-88", name: "Q1 Newsletter Series", channel: "Email", spend: 6000, leads: 240, cpl: 25, roas: 5.7, status: "Ended" },
  { id: "C-87", name: "Retargeting — Pumps", channel: "Display", spend: 14000, leads: 96, cpl: 145, roas: 2.4, status: "Paused" },
];

const tone = { Live: "good", Paused: "warn", Ended: "mute" } as const;

const cols: Column<Campaign>[] = [
  {
    key: "name",
    header: "Campaign",
    render: (r) => (
      <div>
        <div className="font-medium text-ink">{r.name}</div>
        <div className="text-xs text-ink-muted">
          {r.id} · {r.channel}
        </div>
      </div>
    ),
  },
  { key: "spend", header: "Spend", align: "right", render: (r) => formatCurrency(r.spend) },
  { key: "leads", header: "Leads", align: "right", render: (r) => formatNumber(r.leads) },
  { key: "cpl", header: "CPL", align: "right", render: (r) => `$${r.cpl}` },
  {
    key: "roas",
    header: "ROAS",
    align: "right",
    render: (r) => (
      <Badge tone={r.roas >= 4 ? "good" : r.roas >= 3 ? "warn" : "bad"}>
        {r.roas.toFixed(1)}×
      </Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
    align: "right",
    render: (r) => <Badge tone={tone[r.status]}>{r.status}</Badge>,
  },
];

export default function MarketingPage() {
  return (
    <>
      <PageHeader
        title="Digital Marketing"
        subtitle="Campaigns, leads, and channel ROI"
        actions={
          <>
            <Link
              to="/marketing/whatsapp"
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg-muted"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Promo
            </Link>
            <FilterChip label="All channels" />
            <FilterChip label="Q2 2026" />
          </>
        }
      />
      <div className="grid grid-cols-12 gap-4">
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Total Leads"
          value={formatNumber(4_820)}
          delta={6.4}
          series={makeSeries(20, 50, 14, 3, 1.2)}
          icon={<Users className="h-4 w-4" />}
          accent="lime"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Cost per Lead"
          value="$62"
          delta={-3.1}
          series={makeSeries(20, 50, 10, 11, -0.2)}
          icon={<MousePointer2 className="h-4 w-4" />}
          accent="mint"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Conversion Rate"
          value="4.8%"
          delta={0.9}
          series={makeSeries(20, 50, 9, 21)}
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="ROAS"
          value="4.6×"
          delta={2.4}
          series={makeSeries(20, 50, 8, 41, 0.4)}
          icon={<Megaphone className="h-4 w-4" />}
          accent="sky"
        />

        <Card className="col-span-12 lg:col-span-8">
          <CardHeader title="Lead Volume" subtitle="Monthly new leads by all channels" />
          <CardBody className="pt-2">
            <AreaChartCard
              data={toLabeled(makeSeries(12, 380, 60, 13, 8), months.slice(0, 12))}
              height={280}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader title="Channel Mix" subtitle="Share of marketing spend" />
          <CardBody className="pt-2">
            <DonutChart
              data={[
                { name: "SEM", value: 38, color: "#DCF26B" },
                { name: "SEO", value: 22, color: "#C2EAD4" },
                { name: "Social", value: 18, color: "#BFE0F2" },
                { name: "Email", value: 12, color: "#F4D9C2" },
                { name: "Display", value: 10, color: "#F2C9CE" },
              ]}
              centerLabel="of total spend"
              centerValue="38%"
            />
          </CardBody>
        </Card>

        <Card className="col-span-12">
          <CardHeader title="Campaigns" actions={<FilterChip label="Sort: ROAS" />} />
          <CardBody className="pt-2">
            <DataTable<Campaign> rows={campaigns} columns={cols} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
