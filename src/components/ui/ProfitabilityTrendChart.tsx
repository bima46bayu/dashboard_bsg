import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

type Props = {
  data: any[];
  height?: number;
};

export default function ProfitabilityTrendChart({
  data,
  height = 280,
}: Props) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 24, bottom: 0, left: 8 }}
        >
          <defs>
            <linearGradient id="areaFillGross" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaFillNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
            width={100}
            tickFormatter={(val) => val >= 1000000000 ? `${(val/1000000000).toFixed(0)} M` : val >= 1000000 ? `${(val/1000000).toFixed(0)} Jt` : val}
          />
          <Tooltip
            formatter={(value: any, name: any) => {
              return [`Rp ${Number(value || 0).toLocaleString('id-ID')}`, name];
            }}
            cursor={{ stroke: "#0E0E0E", strokeWidth: 1, strokeDasharray: "3 3" }}
            contentStyle={{ background: "#0E0E0E", border: "none", borderRadius: 12, color: "#fff", padding: "8px 12px", fontSize: 12 }}
            labelStyle={{ color: "#bbb", fontSize: 11 }}
            itemStyle={{ color: "#fff" }}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }}/>
          <Area
            type="monotone"
            dataKey="pendapatan"
            name="Pendapatan"
            stroke="#a78bfa"
            strokeWidth={2}
            fill="transparent"
            isAnimationActive={false}
            activeDot={{ r: 4, fill: "#a78bfa", stroke: "#fff", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="laba_kotor"
            name="Laba Kotor"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#areaFillGross)"
            isAnimationActive={false}
            activeDot={{ r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="laba_bersih"
            name="Laba Bersih"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#areaFillNet)"
            isAnimationActive={false}
            activeDot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
