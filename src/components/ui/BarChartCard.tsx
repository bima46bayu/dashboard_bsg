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
  data: any[];
  height?: number;
  showAxis?: boolean;
};

export default function BarChartCard({
  data,
  height = 280,
  showAxis = true,
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
        <BarChart
          data={chartData}
          margin={{ top: 12, right: 8, bottom: 90, left: 8 }}
          barCategoryGap="15%"
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
                tick={{ fill: "#8A8A8A", fontSize: 10, angle: -45, textAnchor: 'end' }}
                interval={0}
                dx={-5}
                dy={5}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#8A8A8A", fontSize: 11 }}
                width={100}
                ticks={yTicks}
                domain={needsCap ? [0, 35000000000] : undefined}
                tickFormatter={(val) => {
                  if (needsCap && val === 35000000000) return maxVal.toLocaleString('id-ID');
                  return val.toLocaleString('id-ID');
                }}
              />
            </>
          ) : null}
          <Tooltip
            formatter={(_value: any, name: any, props: any) => {
              const realVal = name === 'Target' ? props.payload._RealTarget : props.payload._RealRealisasi;
              return [`Rp ${(realVal || 0).toLocaleString('id-ID')}`, name];
            }}
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
          <Bar dataKey="Target" fill="#a78bfa" radius={[4, 4, 4, 4]} />
          <Bar dataKey="Realisasi" fill="#2563eb" radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

