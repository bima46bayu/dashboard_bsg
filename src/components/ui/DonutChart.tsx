import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

type Slice = { name: string; value: number; color: string };

export default function DonutChart({
  data,
  height = 220,
  centerLabel,
  centerValue,
}: {
  data: Slice[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius="62%"
            outerRadius="85%"
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((s, idx) => (
              <Cell key={idx} fill={s.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name: any) => [`Rp ${value.toLocaleString('id-ID')}`, name]}
            cursor={{ stroke: "#0E0E0E", strokeWidth: 1, strokeDasharray: "3 3" }}
            contentStyle={{
              background: "#0E0E0E",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              padding: "8px 12px",
              fontSize: 12,
            }}
          />
          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            {centerValue && (
              <div className="text-display text-3xl leading-none num">
                {centerValue}
              </div>
            )}
            {centerLabel && (
              <div className="mt-1 text-xs text-ink-muted">{centerLabel}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
