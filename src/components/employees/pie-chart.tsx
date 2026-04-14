'use client';

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  percentage?: number;
}

interface PieChartProps {
  chartData: ChartData[];
  title: string;
  onSliceClick?: (name: string) => void;
  onBack?: () => void;
  showPercentages?: boolean;
}

const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))',
  'hsl(var(--primary))'
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-xl text-sm border-border/50">
        <p className="font-bold mb-1">{`${data.name}`}</p>
        <p className="text-muted-foreground">{`Cantidad: ${data.value}`}</p>
         {data.percentage && (
            <p className="text-primary font-medium">{`Proporción: ${data.percentage.toFixed(1)}%`}</p>
        )}
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export default function PieChart({ chartData, title, onSliceClick, onBack, showPercentages = true }: PieChartProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
       <div className="w-full flex justify-between items-center mb-2 min-h-[32px]">
         {onBack ? (
           <Button variant="ghost" size="sm" onClick={onBack} className="justify-self-start h-8 px-2">
             <ArrowLeft className="mr-2 h-4 w-4" />
             Volver
           </Button>
         ) : <div className="w-24" />}
         {title && <h3 className="font-semibold text-center text-sm flex-1 truncate text-muted-foreground">{title}</h3>}
         <div className="w-24" />
       </div>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showPercentages ? renderCustomizedLabel : false}
            outerRadius="90%"
            innerRadius="60%"
            paddingAngle={4}
            dataKey="value"
            stroke="none"
            onClick={(data) => onSliceClick && onSliceClick(data.name)}
            style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
             formatter={(value) => (
              <span className="text-[11px] font-medium text-muted-foreground">{value}</span>
            )}
            iconType="circle"
            iconSize={8}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}