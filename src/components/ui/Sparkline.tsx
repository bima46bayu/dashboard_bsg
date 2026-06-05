import { Area, AreaChart, ResponsiveContainer } from "recharts";

type Props = {
  data: number[];
  color?: string;
  fill?: string;
  height?: number;
  strokeWidth?: number;
};

export default function Sparkline({
  data,
  color = "#0E0E0E",
  fill,
  height = 40,
  strokeWidth = 1.5,
}: Props) {
  const chartData = data.map((v, i) => ({ i, v }));
  const id = `spark-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fill ?? color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={fill ?? color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={strokeWidth}
            fill={`url(#${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
