'use client';

import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';

interface BarChartProps {
    data: any[];
    index: string;
    categories: string[];
    stacked?: boolean;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-xl text-sm border-border/50">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any, index: number) => (
            <p key={index} className="flex items-center gap-2" style={{ color: p.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                {`${p.name === 'value' ? 'Inversión' : p.name}: ${p.value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`}
            </p>
        ))}
      </div>
    );
  }
  return null;
};


export default function BarChart({ data, index, categories, stacked = false }: BarChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                <XAxis
                    dataKey={index}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}/>
                {categories.map((category, i) => (
                     <Bar 
                        key={category} 
                        dataKey={category} 
                        stackId={stacked ? "a" : undefined} 
                        fill={COLORS[i % COLORS.length]} 
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                ))}
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}