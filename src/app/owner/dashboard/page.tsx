'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('@/components/employees/bar-chart'), { ssr: false });
const PieChart = dynamic(() => import('@/components/employees/pie-chart'), { ssr: false });

export default function OwnerDashboardPage() {
  const kpis = [
    { title: 'Empresas Activas', value: '42', icon: Building2, trend: '+3 este mes' },
    { title: 'Usuarios Totales', value: '6,450', icon: Users, trend: '+12% este mes' },
    { title: 'MRR Estimado', value: '$84,500', icon: DollarSign, trend: '+5.4% este mes' },
    { title: 'Uptime Sistema', value: '99.99%', icon: Activity, trend: 'Estable' },
  ];

  const mrrData = [
    { name: 'Ene', MRR: 70000 },
    { name: 'Feb', MRR: 75000 },
    { name: 'Mar', MRR: 78000 },
    { name: 'Abr', MRR: 81000 },
    { name: 'May', MRR: 82000 },
    { name: 'Jun', MRR: 84500 },
  ];

  const plansData = [
    { name: 'Starter', value: 15 },
    { name: 'Pro (Payroll + Leave)', value: 20 },
    { name: 'Enterprise', value: 7 },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Dashboard Propietario</h1>
        <p className="text-muted-foreground mt-2">Visión global del rendimiento y uso de la plataforma ConectAr HR.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de MRR</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <BarChart data={mrrData} index="name" categories={['MRR']} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Planes</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <PieChart chartData={plansData} title="Planes" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
