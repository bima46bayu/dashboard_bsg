import {
  Bar,
  BarChart,
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
  showAxis?: boolean;
  highlightIndex?: number;
};

export default function BarChartCard({
  data,
  height = 280,
  color = "#DCF26B",
  showAxis = true,
  highlightIndex,
}: Props) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 8, bottom: 0, left: -8 }}
          barCategoryGap={28}
        >
          {showAxis ? (
            <>
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
            </>
          ) : null}
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
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
          <Bar dataKey="value" radius={[8, 8, 8, 8]}>
            {data.map((_, idx) => (
              <CellLikeFill
                key={idx}
                fill={
                  highlightIndex === idx
                    ? "#0E0E0E"
                    : color
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Recharts requires Cell components for per-bar colors, but we don't want to import another symbol.
import { Cell } from "recharts";
function CellLikeFill({ fill }: { fill: string }) {
  return <Cell fill={fill} />;
}
