"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const PALETTE = ["#1F5C33", "#7FB8DE", "#D8CDB4", "#4C7A32", "#B98A3C", "#123D22", "#A6482F", "#8A8880"];

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid rgba(138,136,128,0.2)",
    fontSize: 13,
    fontFamily: "inherit",
    direction: "rtl" as const,
  },
};

export function BarChartCard({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(138,136,128,0.15)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#8A8880" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={70}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#8A8880" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(31,92,51,0.06)" }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChartCard({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={220} className="max-w-[220px]">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={90}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="w-full space-y-2">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            <span className="flex-1 text-neutral-dark">{d.name}</span>
            <span className="font-semibold text-neutral-dark">{d.value}</span>
            <span className="w-12 text-left text-xs text-neutral-gray">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
