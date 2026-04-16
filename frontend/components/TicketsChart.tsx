'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

export interface ChartDataPoint {
  name: string;
  valid: number;
  used: number;
}

interface TicketsChartProps {
  data: ChartDataPoint[];
}

const SOFT_POP = {
  secondary: '#2dbaac',
  accent: '#f2a640',
  border: '#000000',
  card: '#ffffff',
  foreground: '#000000',
};

export default function TicketsChart({ data }: TicketsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-muted">
          <BarChart3 className="h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
        </div>
        <p className="text-sm font-semibold text-foreground">No data yet</p>
        <p className="text-xs text-muted-foreground">
          Create an event and generate tickets to see the chart.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke={SOFT_POP.border} strokeOpacity={0.15} />
        <XAxis
          dataKey="name"
          stroke={SOFT_POP.foreground}
          fontSize={11}
          fontFamily="DM Sans, sans-serif"
          tickLine={false}
          axisLine={{ stroke: SOFT_POP.border, strokeWidth: 2 }}
        />
        <YAxis
          stroke={SOFT_POP.foreground}
          fontSize={11}
          fontFamily="DM Sans, sans-serif"
          tickLine={false}
          axisLine={{ stroke: SOFT_POP.border, strokeWidth: 2 }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: SOFT_POP.card,
            border: `2px solid ${SOFT_POP.border}`,
            borderRadius: '0.5rem',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '12px',
            boxShadow: `4px 4px 0 0 ${SOFT_POP.border}`,
          }}
          cursor={{ fill: SOFT_POP.border, fillOpacity: 0.05 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}
          iconType="circle"
        />
        <Bar
          dataKey="valid"
          name="Valid"
          fill={SOFT_POP.secondary}
          stroke={SOFT_POP.border}
          strokeWidth={2}
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="used"
          name="Redeemed"
          fill={SOFT_POP.accent}
          stroke={SOFT_POP.border}
          strokeWidth={2}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
