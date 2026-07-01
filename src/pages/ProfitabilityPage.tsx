import { useState, useEffect } from "react";
import { Coins, TrendingDown, TrendingUp, PiggyBank, Plus, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageShell";
import StatCard from "@/components/ui/StatCard";
import ProfitabilityTrendChart from "@/components/ui/ProfitabilityTrendChart";
import DonutChart from "@/components/ui/DonutChart";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import {
  Card,
  CardBody,
  CardHeader,
} from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { fetchProfitabilityDashboard } from "@/api/profitability";
import { months } from "@/data/mock";

type EntityMarginRow = {
  id: string;
  entity: string;
  revenue: number;
  cogs: number;
  gross_margin: number;
  net_margin: number;
  subRows?: EntityMarginRow[];
};

const cols: Column<EntityMarginRow>[] = [
  { key: "entity", header: "Entity", render: (r) => <span className="font-medium">{r.entity}</span> },
  { key: "rev", header: "Revenue", align: "right", render: (r) => formatCurrency(r.revenue) },
  { key: "cogs", header: "COGS", align: "right", render: (r) => formatCurrency(r.cogs) },
  {
    key: "gross_margin",
    header: "Gross Margin",
    align: "right",
    render: (r) => (
      <Badge tone={r.gross_margin >= 40 ? "good" : r.gross_margin >= 20 ? "warn" : "bad"}>
        {r.gross_margin.toFixed(1)}%
      </Badge>
    ),
  },
  {
    key: "net_margin",
    header: "Net Margin",
    align: "right",
    render: (r) => (
      <Badge tone={r.net_margin >= 15 ? "good" : r.net_margin >= 5 ? "warn" : "bad"}>
        {r.net_margin.toFixed(1)}%
      </Badge>
    ),
  },
];

export default function ProfitabilityPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [year]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchProfitabilityDashboard(year);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <div className="p-8 text-center flex justify-center text-slate-500"><RefreshCcw className="animate-spin" /></div>;
  }

  const sum = data?.summary || { pendapatan: 0, laba_kotor: 0, laba_operasi: 0, laba_bersih: 0 };

  
  const trendData = data?.trend?.map((t: any) => ({
    label: months[t.month - 1],
    ...t
  })) || [];

  return (
    <>
      <PageHeader
        title="Profitability"
        subtitle="Margin analysis and cost-centre reporting"
        actions={
          <>
            <select 
              value={year} 
              onChange={e => setYear(Number(e.target.value))}
              className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-medium text-slate-700 shadow-sm"
            >
              {[...Array(5)].map((_, i) => (
                <option key={i} value={currentYear - i}>{currentYear - i}</option>
              ))}
            </select>
            <Link
              to="/profitability/manage"
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition ml-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Input Data
            </Link>
          </>
        }
      />
      <div className="grid grid-cols-12 gap-4">
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Laba Kotor"
          value={formatCurrency(sum.laba_kotor)}
          delta={0}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="mint"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Laba Bersih Setelah Pajak"
          value={formatCurrency(sum.laba_bersih)}
          delta={0}
          icon={<PiggyBank className="h-4 w-4" />}
          accent="lime"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Laba Sebelum Pajak"
          value={formatCurrency(sum.laba_sebelum_pajak || sum.laba_operasi)}
          delta={0}
          icon={<Coins className="h-4 w-4" />}
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Pendapatan"
          value={formatCurrency(sum.pendapatan)}
          delta={0}
          icon={<TrendingDown className="h-4 w-4" />}
          accent="rose"
        />

        <Card className="col-span-12 lg:col-span-8">
          <CardHeader
            title="P&L Trend"
            subtitle="Revenue, Gross Profit, and Net Profit over time"
          />
          <CardBody className="pt-2">
            <ProfitabilityTrendChart
              data={trendData}
              height={280}
            />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader title="Cost Allocation" />
          <CardBody className="pt-2 flex flex-col items-center">
            {data?.cost_allocation?.length > 0 ? (
              <>
                <DonutChart
                  data={data.cost_allocation}
                  centerLabel="Total Cost"
                  centerValue={formatCurrency(data.cost_allocation.reduce((a: any, b: any) => a + b.value, 0)).split(',')[0]}
                />
              </>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm w-full bg-slate-50 rounded-lg">Belum ada data</div>
            )}
          </CardBody>
        </Card>

        <Card className="col-span-12">
          <CardHeader title="Margin by Entity" />
          <CardBody className="pt-2">
            <DataTable<EntityMarginRow> 
              rows={data?.entity_margin?.map(function mapRow(e: any): EntityMarginRow {
                return {
                  ...e,
                  id: e.id || e.entity,
                  subRows: e.subRows ? e.subRows.map(mapRow) : undefined
                };
              }) || []} 
              columns={cols} 
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

