import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: { label: string; target: number; realization: number }[];
  height?: number;
  color?: string;
};

export default function SmallLineChart({
  data,
  height = 180,
  color = "#3b82f6",
}: Props) {
  const maxVal = Math.max(...data.map((d: any) => Math.max(d.target || 0, d.realization || 0)));
  const needsCap = maxVal > 30000000000;
  
  const chartData = data.map((d: any) => ({
    ...d,
    _RealTarget: d.target,
    _RealRealisasi: d.realization,
    target: needsCap && d.target > 30000000000 ? 35000000000 : d.target,
    realization: needsCap && d.realization > 30000000000 ? 35000000000 : d.realization,
  }));

  const yTicks = needsCap 
    ? [0, 5000000000, 10000000000, 15000000000, 20000000000, 25000000000, 30000000000, 35000000000]
    : undefined;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 12, right: 24, bottom: 0, left: 8 }}
        >
          <CartesianGrid
            stroke="#f1f5f9"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 10 }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 10 }}
            width={110}
            ticks={yTicks}
            domain={needsCap ? [0, 35000000000] : undefined}
            tickFormatter={(val) => {
              if (needsCap && val === 35000000000) return maxVal.toLocaleString('id-ID');
              return val.toLocaleString('id-ID');
            }}
          />
          <Tooltip
            formatter={(value: any, name: any, props: any) => {
              const realVal = name === 'target' ? props.payload._RealTarget : props.payload._RealRealisasi;
              return [`Rp ${(realVal || 0).toLocaleString('id-ID')}`, name];
            }}
            cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }}
            contentStyle={{ background: "#0f172a", border: "none", borderRadius: 8, color: "#fff", padding: "8px 12px", fontSize: 12 }}
          />
          {/* Target: Dashed */}
          <Line
            type="monotone"
            dataKey="target"
            stroke="#cbd5e1"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
          />
          {/* Realization: Solid */}
          <Line
            type="monotone"
            dataKey="realization"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: '#fff', stroke: color, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
