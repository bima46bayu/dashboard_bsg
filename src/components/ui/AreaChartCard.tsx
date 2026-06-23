import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: any[];
  height?: number;
  color?: string;
};

export default function AreaChartCard({
  data,
  height = 280,
  color = "#0E0E0E",
}: Props) {
  const maxVal = Math.max(...data.map((d: any) => Math.max(d.Target || 0, d.Realisasi || 0)));
  const needsCap = maxVal > 30000000000;
  
  const chartData = data.map((d: any) => ({
    ...d,
    _RealTarget: d.Target,
    _RealRealisasi: d.Realisasi,
    Target: needsCap && d.Target > 30000000000 ? 35000000000 : d.Target,
    Realisasi: needsCap && d.Realisasi > 30000000000 ? 35000000000 : d.Realisasi,
  }));

  const yTicks = needsCap 
    ? [0, 5000000000, 10000000000, 15000000000, 20000000000, 25000000000, 30000000000, 35000000000]
    : undefined;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 24, bottom: 0, left: 8 }}
        >
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#E5E2D8"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8A8A8A", fontSize: 11 }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8A8A8A", fontSize: 11 }}
            width={130}
            ticks={yTicks}
            domain={needsCap ? [0, 35000000000] : undefined}
            tickFormatter={(val) => {
              if (needsCap && val === 35000000000) return maxVal.toLocaleString('id-ID');
              return val.toLocaleString('id-ID');
            }}
          />
          <Tooltip
            formatter={(_value: any, name: any, props: any) => {
              const realVal = name === 'Target' ? props.payload._RealTarget : props.payload._RealRealisasi;
              return [`Rp ${Number(realVal || 0).toLocaleString('id-ID')}`, name];
            }}
            cursor={{ stroke: "#0E0E0E", strokeWidth: 1, strokeDasharray: "3 3" }}
            contentStyle={{ background: "#0E0E0E", border: "none", borderRadius: 12, color: "#fff", padding: "8px 12px", fontSize: 12 }}
            labelStyle={{ color: "#bbb", fontSize: 11 }}
            itemStyle={{ color: "#fff" }}
          />
          <Area
            type="monotone"
            dataKey="Target"
            stroke="#a78bfa"
            strokeWidth={2}
            fill="transparent"
            isAnimationActive={false}
            activeDot={{ r: 5, fill: "#a78bfa", stroke: "#fff", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="Realisasi"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#areaFill)"
            isAnimationActive={false}
            activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
