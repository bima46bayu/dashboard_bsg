import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Banknote, Target, TrendingUp, Award, RefreshCcw, Settings, Filter, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import StatCard from "@/components/ui/StatCard";
import AreaChartCard from "@/components/ui/AreaChartCard";
import BarChartCard from "@/components/ui/BarChartCard";
import DonutChart from "@/components/ui/DonutChart";
import SmallLineChart from "@/components/ui/SmallLineChart";
import {
  Card,
  CardBody,
  CardHeader,
} from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { fetchSalesDashboard, fetchMasterData, type SalesDashboardData, type MasterData } from "@/api/sales";
import { useAuth } from "@/context/AuthContext";

// Helper for Ach %
function AchBadge({ target, real }: { target: number; real: number }) {
  const pct = target > 0 ? (real / target) * 100 : 0;
  let color = "text-slate-500";
  let dot = "bg-slate-300 border-slate-400";
  if (pct >= 100) {
    color = "text-emerald-600";
    dot = "bg-emerald-500 border-emerald-600";
  } else if (pct >= 80) {
    color = "text-amber-500";
    dot = "bg-amber-300 border-amber-400";
  } else if (pct > 0) {
    color = "text-rose-500";
    dot = "bg-rose-500 border-rose-600";
  }
  return (
    <div className="flex items-center justify-end gap-2 pr-2">
      <div className={`w-3 h-3 rounded-full border ${dot} shadow-sm`}></div>
      <span className={`font-semibold ${color} min-w-[3rem] text-right`}>{pct.toFixed(1)}%</span>
    </div>
  );
}

export default function SalesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<SalesDashboardData | null>(null);
  const [master, setMaster] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [trendView, setTrendView] = useState<"monthly" | "yearly">("monthly");
  const [mainTrendView, setMainTrendView] = useState<"monthly" | "yearly">("monthly");
  const [pivotMonth, setPivotMonth] = useState<number | "">("");

  const [expandedEntities, setExpandedEntities] = useState<Record<string, boolean>>({});
  const [expandedAms, setExpandedAms] = useState<Record<string, boolean>>({});

  const toggleEntity = (id: string) => setExpandedEntities(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleAm = (id: string) => setExpandedAms(prev => ({ ...prev, [id]: !prev[id] }));

  // Filters
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterTeam, setFilterTeam] = useState<string>("");
  const [filterEntity, setFilterEntity] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const dashboard = await fetchSalesDashboard({
        year: filterYear,
        month: filterMonth,
        team_id: filterTeam,
        entity_id: filterEntity,
        pivot_month: pivotMonth,
      });
      setData(dashboard);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData().then(setMaster).catch(console.error);
    loadData();
    // eslint-disable-next-line
  }, [filterYear, filterMonth, filterTeam, filterEntity, pivotMonth]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const filterRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Sales Analytics & Performance"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 bg-white text-ink border border-line px-4 py-2 rounded-lg text-sm font-medium hover:bg-bg-muted transition"
              >
                <Filter className="w-4 h-4" />
                Filter Data
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h4 className="font-semibold text-slate-800 mb-4">Filter Analytics</h4>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-sm font-semibold text-ink mb-1 block">Tahun</label>
                      <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full border border-line rounded-md text-sm px-3 py-2 outline-none focus:border-blue-500">
                        <option value="">Semua Tahun</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-ink mb-1 block">Bulan</label>
                      <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full border border-line rounded-md text-sm px-3 py-2 outline-none focus:border-blue-500">
                        <option value="">Semua Bulan</option>
                        {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-ink mb-1 block">Team</label>
                      <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="w-full border border-line rounded-md text-sm px-3 py-2 outline-none focus:border-blue-500">
                        <option value="">Semua Team</option>
                        {master?.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-ink mb-1 block">Entity</label>
                      <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} className="w-full border border-line rounded-md text-sm px-3 py-2 outline-none focus:border-blue-500">
                        <option value="">Semua Entity</option>
                        {master?.entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                    <button onClick={() => { loadData(); setIsFilterOpen(false); }} className="mt-2 bg-blue-600 text-white w-full py-2.5 rounded-md text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition">
                      {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Terapkan Filter"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {user?.role === 'admin' && (
              <Link 
                to="/sales/management"
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition"
              >
                <Settings className="w-4 h-4" />
                CMS Data
              </Link>
            )}
          </div>
        }
      />

      {loading && !data ? (
        <div className="flex justify-center py-20"><RefreshCcw className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Realisasi (Rp)"
              value={formatCurrency(data.total_realization)}
              icon={<Banknote className="h-4 w-4" />}
              accent="sky"
            />
            <StatCard
              label="Total Target (Rp)"
              value={formatCurrency(data.total_target)}
              icon={<Target className="h-4 w-4" />}
              accent="rose"
            />
            <StatCard
              label="Overall Achievement"
              value={`${data.overall_achievement_percentage.toFixed(1)}%`}
              icon={<TrendingUp className="h-4 w-4" />}
              accent="mint"
            />
            <StatCard
              label="Top Entity"
              value={data.achievement_per_entity.sort((a,b)=>b.realization - a.realization)[0]?.entity || "-"}
              icon={<Award className="h-4 w-4" />}
              accent="peach"
            />
          </div>

          <div className="grid grid-cols-12 gap-6 mb-8">
            <Card className="col-span-12 min-w-0">
              <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-slate-800">Target vs Realisasi Trend</h3>
                <div className="bg-slate-100 p-1 rounded-lg flex inline-block shadow-sm">
                  <button onClick={() => setMainTrendView('monthly')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${mainTrendView === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Berdasarkan Bulan</button>
                  <button onClick={() => setMainTrendView('yearly')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${mainTrendView === 'yearly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Berdasarkan Tahun</button>
                </div>
              </div>
              <CardBody className="pt-2">
                {mainTrendView === 'monthly' ? (
                  <AreaChartCard
                    data={data.monthly_trend.map(d => ({
                      label: months[d.month - 1].substring(0, 3),
                      Target: d.target,
                      Realisasi: d.realization
                    }))}
                    height={300}
                  />
                ) : (
                  <AreaChartCard
                    data={data.yearly_trend.map(d => ({
                      label: String(d.year),
                      Target: d.target,
                      Realisasi: d.realization
                    }))}
                    height={300}
                  />
                )}
              </CardBody>
            </Card>

            <Card className="col-span-12 lg:col-span-6 min-w-0">
              <CardHeader title="Team Achievement" />
              <CardBody className="pt-2">
                <BarChartCard
                  data={data.achievement_per_team.map(d => ({
                    label: d.team,
                    Target: d.target,
                    Realisasi: d.realization
                  }))}
                  height={300}
                />
              </CardBody>
            </Card>

            <Card className="col-span-12 md:col-span-6 lg:col-span-3 min-w-0">
              <CardHeader title="Entity Distribution" />
              <CardBody className="pt-2">
                <DonutChart
                  data={data.achievement_per_entity.map((d, i) => ({
                    name: d.entity,
                    value: d.realization,
                    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'][i % 8]
                  }))}
                  height={300}
                />
              </CardBody>
            </Card>

            <Card className="col-span-12 md:col-span-6 lg:col-span-3 min-w-0">
              <CardHeader title="Top End User Dist." />
              <CardBody className="pt-2">
                <DonutChart
                  data={data.achievement_per_end_user.map((d, i) => ({
                    name: d.end_user,
                    value: d.realization,
                    color: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#14b8a6'][i % 8]
                  }))}
                  height={300}
                />
              </CardBody>
            </Card>
          </div>

          <Card className="mb-8 min-w-0">
            <CardHeader title="Top 10 Sales Performance" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-bg-muted text-ink-soft">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Sales Member</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3 text-right">Target</th>
                    <th className="px-4 py-3 text-right">Realisasi</th>
                    <th className="px-4 py-3 text-right">Achievement</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_sales.map((s, i) => (
                    <tr key={i} className="border-b border-line hover:bg-bg-muted transition-colors">
                      <td className="px-4 py-3 font-semibold text-ink">#{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                      <td className="px-4 py-3 text-ink-soft">{s.team}</td>
                      <td className="px-4 py-3 text-right text-ink">{formatCurrency(s.target)}</td>
                      <td className="px-4 py-3 text-right font-medium text-blue-600">{formatCurrency(s.realization)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.achievement_percentage >= 100 ? 'bg-green-100 text-green-700' : s.achievement_percentage >= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {s.achievement_percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.top_sales.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-ink-soft">Belum ada data sales.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Entity Performance Trends */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Entity Performance Trends</h3>
              <div className="bg-slate-100 p-1 rounded-lg flex inline-block shadow-sm">
                <button onClick={() => setTrendView('monthly')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${trendView === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Berdasarkan Bulan</button>
                <button onClick={() => setTrendView('yearly')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${trendView === 'yearly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Berdasarkan Tahun</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {trendView === 'monthly' && data.entity_trends_monthly?.map((trend, idx) => (
                <div key={`m-${idx}`} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 min-w-0">
                  <div className="text-sm font-semibold text-slate-700 mb-4 text-center">{trend.entity}</div>
                  <SmallLineChart
                    data={trend.data.map(d => ({ label: months[d.month - 1].substring(0, 3), target: d.target, realization: d.realization }))}
                    color={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6'][idx % 8]}
                  />
                </div>
              ))}
              {trendView === 'yearly' && data.entity_trends_yearly?.map((trend, idx) => (
                <div key={`y-${idx}`} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 min-w-0">
                  <div className="text-sm font-semibold text-slate-700 mb-4 text-center">{trend.entity}</div>
                  <SmallLineChart
                    data={trend.data}
                    color={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6'][idx % 8]}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pivot Tables */}
          {(() => {
            const pivotCurr = data.filter_meta?.pivot_curr_month || 1;
            const pivotPrev = data.filter_meta?.pivot_prev_month || undefined;
            const currMonthName = months[pivotCurr - 1];
            const prevMonthName = pivotPrev ? months[pivotPrev - 1] : '-';
            const fYear = data.filter_meta?.year || currentYear;

            return (
              <div className="space-y-8 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-semibold text-slate-800">Sales Performance Pivot</h3>
                  
                  <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-slate-100 p-1">
                    <button 
                      onClick={() => setPivotMonth(pivotCurr - 1)}
                      disabled={pivotCurr <= 1}
                      className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 rounded-md transition text-xs font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Bulan Sebelumnya
                    </button>
                    
                    <span className="text-sm font-semibold text-slate-700 px-3 py-1 bg-slate-50 rounded-md border border-slate-100">
                      {currMonthName}
                    </span>

                    <button 
                      onClick={() => setPivotMonth(pivotCurr + 1)}
                      disabled={pivotCurr >= 12}
                      className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 rounded-md transition text-xs font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Bulan Berikutnya
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
                
                {/* Pivot By Entity */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <th rowSpan={2} className="border-r border-slate-200 px-4 py-3 text-left w-64 sticky left-0 bg-slate-50 z-10">By Entity / AM / End User</th>
                          <th colSpan={3} className="border-r border-slate-200 px-3 py-2 text-center">{prevMonthName}</th>
                          <th colSpan={3} className="border-r border-slate-200 px-3 py-2 text-center">{currMonthName}</th>
                          <th colSpan={3} className="px-3 py-2 text-center">Total {fYear}</th>
                        </tr>
                        <tr className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                          <th className="border-r border-slate-200 px-3 py-2">Target</th>
                          <th className="border-r border-slate-200 px-3 py-2">Realisasi</th>
                          <th className="border-r border-slate-200 px-3 py-2">%</th>
                          <th className="border-r border-slate-200 px-3 py-2">Target</th>
                          <th className="border-r border-slate-200 px-3 py-2">Realisasi</th>
                          <th className="border-r border-slate-200 px-3 py-2">%</th>
                          <th className="border-r border-slate-200 px-3 py-2">Target</th>
                          <th className="border-r border-slate-200 px-3 py-2">Realisasi</th>
                          <th className="px-3 py-2">%</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {data.pivot_table?.by_entity?.map((ent: any, i: number) => (
                          <React.Fragment key={i}>
                            <tr className="bg-slate-100 font-semibold text-slate-800 border-b border-slate-200">
                              <td className="border-r border-slate-200 px-4 py-2 text-left sticky left-0 bg-slate-100 z-10 cursor-pointer hover:bg-slate-200 flex items-center gap-2" onClick={() => toggleEntity(`ent-${i}`)}>{expandedEntities[`ent-${i}`] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}{ent.name}</td>
                              <td className="border-r border-slate-200 px-3 py-2">{ent.prev?.target?.toLocaleString('id-ID')}</td>
                              <td className="border-r border-slate-200 px-3 py-2">{ent.prev?.realization?.toLocaleString('id-ID')}</td>
                              <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={ent.prev?.target} real={ent.prev?.realization} /></td>
                              <td className="border-r border-slate-200 px-3 py-2">{ent.curr?.target?.toLocaleString('id-ID')}</td>
                              <td className="border-r border-slate-200 px-3 py-2">{ent.curr?.realization?.toLocaleString('id-ID')}</td>
                              <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={ent.curr?.target} real={ent.curr?.realization} /></td>
                              <td className="border-r border-slate-200 px-3 py-2">{ent.total?.target?.toLocaleString('id-ID')}</td>
                              <td className="border-r border-slate-200 px-3 py-2">{ent.total?.realization?.toLocaleString('id-ID')}</td>
                              <td className="px-3 py-2"><AchBadge target={ent.total?.target} real={ent.total?.realization} /></td>
                            </tr>
                            {expandedEntities[`ent-${i}`] && ent.ams?.map((am: any, j: number) => (
                              <React.Fragment key={`${i}-${j}`}>
                                <tr className="bg-white font-medium text-slate-700 border-b border-slate-100">
                                  <td className="border-r border-slate-200 px-4 py-2 text-left pl-8 sticky left-0 bg-white z-10 cursor-pointer hover:bg-slate-50 flex items-center gap-2" onClick={() => toggleAm(`am-${i}-${j}`)}>{expandedAms[`am-${i}-${j}`] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}{am.name}</td>
                                  <td className="border-r border-slate-200 px-3 py-2">{am.prev?.target?.toLocaleString('id-ID')}</td>
                                  <td className="border-r border-slate-200 px-3 py-2">{am.prev?.realization?.toLocaleString('id-ID')}</td>
                                  <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={am.prev?.target} real={am.prev?.realization} /></td>
                                  <td className="border-r border-slate-200 px-3 py-2">{am.curr?.target?.toLocaleString('id-ID')}</td>
                                  <td className="border-r border-slate-200 px-3 py-2">{am.curr?.realization?.toLocaleString('id-ID')}</td>
                                  <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={am.curr?.target} real={am.curr?.realization} /></td>
                                  <td className="border-r border-slate-200 px-3 py-2">{am.total?.target?.toLocaleString('id-ID')}</td>
                                  <td className="border-r border-slate-200 px-3 py-2">{am.total?.realization?.toLocaleString('id-ID')}</td>
                                  <td className="px-3 py-2"><AchBadge target={am.total?.target} real={am.total?.realization} /></td>
                                </tr>
                                {expandedAms[`am-${i}-${j}`] && am.end_users?.map((eu: any, k: number) => (
                                  <tr key={`${i}-${j}-${k}`} className="bg-white text-slate-500 border-b border-slate-50">
                                    <td className="border-r border-slate-200 px-4 py-2 text-left pl-12 sticky left-0 bg-white z-10">{eu.name}</td>
                                    <td className="border-r border-slate-200 px-3 py-2">{eu.prev?.target?.toLocaleString('id-ID')}</td>
                                    <td className="border-r border-slate-200 px-3 py-2">{eu.prev?.realization?.toLocaleString('id-ID')}</td>
                                    <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={eu.prev?.target} real={eu.prev?.realization} /></td>
                                    <td className="border-r border-slate-200 px-3 py-2">{eu.curr?.target?.toLocaleString('id-ID')}</td>
                                    <td className="border-r border-slate-200 px-3 py-2">{eu.curr?.realization?.toLocaleString('id-ID')}</td>
                                    <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={eu.curr?.target} real={eu.curr?.realization} /></td>
                                    <td className="border-r border-slate-200 px-3 py-2">{eu.total?.target?.toLocaleString('id-ID')}</td>
                                    <td className="border-r border-slate-200 px-3 py-2">{eu.total?.realization?.toLocaleString('id-ID')}</td>
                                    <td className="px-3 py-2"><AchBadge target={eu.total?.target} real={eu.total?.realization} /></td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
{/* Pivot By Team */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <th rowSpan={2} className="border-r border-slate-200 px-4 py-3 text-left w-64 sticky left-0 bg-slate-50 z-10">By Team</th>
                          <th colSpan={3} className="border-r border-slate-200 px-3 py-2 text-center">{prevMonthName}</th>
                          <th colSpan={3} className="border-r border-slate-200 px-3 py-2 text-center">{currMonthName}</th>
                          <th colSpan={3} className="px-3 py-2 text-center">Total {fYear}</th>
                        </tr>
                        <tr className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                          <th className="border-r border-slate-200 px-3 py-2">Target</th>
                          <th className="border-r border-slate-200 px-3 py-2">Realisasi</th>
                          <th className="border-r border-slate-200 px-3 py-2">%</th>
                          <th className="border-r border-slate-200 px-3 py-2">Target</th>
                          <th className="border-r border-slate-200 px-3 py-2">Realisasi</th>
                          <th className="border-r border-slate-200 px-3 py-2">%</th>
                          <th className="border-r border-slate-200 px-3 py-2">Target</th>
                          <th className="border-r border-slate-200 px-3 py-2">Realisasi</th>
                          <th className="px-3 py-2">%</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {data.pivot_table?.by_team?.map((team: any, i: number) => (
                          <tr key={i} className="bg-white text-slate-700 border-b border-slate-100">
                            <td className="border-r border-slate-200 px-4 py-2 text-left sticky left-0 bg-white z-10">{team.name}</td>
                            <td className="border-r border-slate-200 px-3 py-2">{team.prev?.target?.toLocaleString('id-ID')}</td>
                            <td className="border-r border-slate-200 px-3 py-2">{team.prev?.realization?.toLocaleString('id-ID')}</td>
                            <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={team.prev?.target} real={team.prev?.realization} /></td>
                            <td className="border-r border-slate-200 px-3 py-2">{team.curr?.target?.toLocaleString('id-ID')}</td>
                            <td className="border-r border-slate-200 px-3 py-2">{team.curr?.realization?.toLocaleString('id-ID')}</td>
                            <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={team.curr?.target} real={team.curr?.realization} /></td>
                            <td className="border-r border-slate-200 px-3 py-2">{team.total?.target?.toLocaleString('id-ID')}</td>
                            <td className="border-r border-slate-200 px-3 py-2">{team.total?.realization?.toLocaleString('id-ID')}</td>
                            <td className="px-3 py-2"><AchBadge target={team.total?.target} real={team.total?.realization} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                
{/* Pivot By AM */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <th rowSpan={2} className="border-r border-slate-200 px-4 py-3 text-left w-64 sticky left-0 bg-slate-50 z-10">By AM / Entity</th>
                          <th colSpan={3} className="border-r border-slate-200 px-3 py-2 text-center">{prevMonthName}</th>
                          <th colSpan={3} className="border-r border-slate-200 px-3 py-2 text-center">{currMonthName}</th>
                          <th colSpan={3} className="px-3 py-2 text-center">Total {fYear}</th>
                        </tr>
                        <tr className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 text-xs">
                          <th className="border-r border-slate-200 px-3 py-2">Target</th>
                          <th className="border-r border-slate-200 px-3 py-2">Realisasi</th>
                          <th className="border-r border-slate-200 px-3 py-2">%</th>
                          <th className="border-r border-slate-200 px-3 py-2">Target</th>
                          <th className="border-r border-slate-200 px-3 py-2">Realisasi</th>
                          <th className="border-r border-slate-200 px-3 py-2">%</th>
                          <th className="border-r border-slate-200 px-3 py-2">Target</th>
                          <th className="border-r border-slate-200 px-3 py-2">Realisasi</th>
                          <th className="px-3 py-2">%</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {data.pivot_table?.by_am?.map((am: any, i: number) => (
                          <React.Fragment key={i}>
                            <tr className="bg-slate-100 font-semibold text-slate-800 border-b border-slate-200">
                              <td className="border-r border-slate-200 px-4 py-2 text-left sticky left-0 bg-slate-100 z-10">{am.name}</td>
                              <td className="border-r border-slate-200 px-3 py-2">{am.prev?.target?.toLocaleString('id-ID')}</td>
                              <td className="border-r border-slate-200 px-3 py-2">{am.prev?.realization?.toLocaleString('id-ID')}</td>
                              <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={am.prev?.target} real={am.prev?.realization} /></td>
                              <td className="border-r border-slate-200 px-3 py-2">{am.curr?.target?.toLocaleString('id-ID')}</td>
                              <td className="border-r border-slate-200 px-3 py-2">{am.curr?.realization?.toLocaleString('id-ID')}</td>
                              <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={am.curr?.target} real={am.curr?.realization} /></td>
                              <td className="border-r border-slate-200 px-3 py-2">{am.total?.target?.toLocaleString('id-ID')}</td>
                              <td className="border-r border-slate-200 px-3 py-2">{am.total?.realization?.toLocaleString('id-ID')}</td>
                              <td className="px-3 py-2"><AchBadge target={am.total?.target} real={am.total?.realization} /></td>
                            </tr>
                            {am.entities?.map((ent: any, j: number) => (
                              <tr key={`${i}-${j}`} className="bg-white text-slate-600 border-b border-slate-100">
                                <td className="border-r border-slate-200 px-4 py-2 text-left pl-8 sticky left-0 bg-white z-10">{ent.name}</td>
                                <td className="border-r border-slate-200 px-3 py-2">{ent.prev?.target?.toLocaleString('id-ID')}</td>
                                <td className="border-r border-slate-200 px-3 py-2">{ent.prev?.realization?.toLocaleString('id-ID')}</td>
                                <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={ent.prev?.target} real={ent.prev?.realization} /></td>
                                <td className="border-r border-slate-200 px-3 py-2">{ent.curr?.target?.toLocaleString('id-ID')}</td>
                                <td className="border-r border-slate-200 px-3 py-2">{ent.curr?.realization?.toLocaleString('id-ID')}</td>
                                <td className="border-r border-slate-200 px-3 py-2"><AchBadge target={ent.curr?.target} real={ent.curr?.realization} /></td>
                                <td className="border-r border-slate-200 px-3 py-2">{ent.total?.target?.toLocaleString('id-ID')}</td>
                                <td className="border-r border-slate-200 px-3 py-2">{ent.total?.realization?.toLocaleString('id-ID')}</td>
                                <td className="px-3 py-2"><AchBadge target={ent.total?.target} real={ent.total?.realization} /></td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                

              </div>
            );
          })()}

        </>
      ) : null}
    </>
  );
}
