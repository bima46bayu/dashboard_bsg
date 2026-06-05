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
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
};

export default function AreaChartCard({
  data,
  height = 280,
  color = "#0E0E0E",
}: Props) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 8, bottom: 0, left: -8 }}
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
            width={48}
          />
          <Tooltip
            cursor={{
              stroke: "#0E0E0E",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
            contentStyle={{
              background: "#0E0E0E",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              padding: "8px 12px",
              fontSize: 12,
            }}
            labelStyle={{ color: "#bbb", fontSize: 11 }}
            itemStyle={{ color: "#fff" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#areaFill)"
            isAnimationActive={false}
            activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
