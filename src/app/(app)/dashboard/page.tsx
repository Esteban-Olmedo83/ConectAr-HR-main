'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Activity, CalendarOff, Briefcase, ArrowUp, ArrowDown, MoreVertical, Edit } from 'lucide-react';
import { mockEmployees, initialRequests, initialVacancies } from '@/lib/mock-data';
import { useState, useEffect, useMemo } from 'react';
import { getSession, Session } from '@/lib/session';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const BarChart = dynamic(() => import('@/components/employees/bar-chart'), {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />
});

const PieChart = dynamic(() => import('@/components/employees/pie-chart'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />
});

const StatCard = ({ title, value, percentage, change, icon: Icon }: { title: string, value: string | number, percentage: number, change: 'increase' | 'decrease', icon: React.ElementType }) => (
    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between">
                <div className="text-3xl font-bold font-headline">{value}</div>
                <div className={`flex items-center gap-1 text-xs font-bold ${change === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                    {change === 'increase' ? <ArrowUp className="h-3 w-3"/> : <ArrowDown className="h-3 w-3"/>}
                    {percentage}%
                </div>
            </div>
             <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
               <span>vs. mes anterior</span>
               <Icon className="w-8 h-8 opacity-10 text-primary" />
            </div>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    const sessionData = getSession();
    if (sessionData.role === 'employee') {
      const employeeProfileUrl = `/employees?id=${sessionData.userId}`;
      router.replace(employeeProfileUrl);
    } else if (sessionData.role === 'guest') {
        router.replace('/login');
    }
    else {
        setSession(sessionData);
    }
  }, [router]);
  
  const stats = useMemo(() => {
    const active = mockEmployees.filter(e => e.fechaEgreso === null).length;
    const pendingRequests = initialRequests.filter(r => r.status === 'Pendiente').length;
    const openVacancies = initialVacancies.filter(v => v.status !== 'Contratado').length;
    
    return { active, pendingRequests, openVacancies };
  }, []);

  const salaryByUnitData = [
    { name: 'Ene', Ventas: 4500000, Sistemas: 6800000 },
    { name: 'Feb', Ventas: 4600000, Sistemas: 6900000 },
    { name: 'Mar', Ventas: 4800000, Sistemas: 7200000 },
    { name: 'Abr', Ventas: 5100000, Sistemas: 7500000 },
    { name: 'May', Ventas: 5400000, Sistemas: 8100000 },
    { name: 'Jun', Ventas: 5800000, Sistemas: 8500000 },
  ];

  const absenceData = [
    { name: 'Vacaciones', value: 45 },
    { name: 'Enfermedad', value: 25 },
    { name: 'Personal', value: 20 },
    { name: 'Estudio', value: 10 },
  ];

  if (!session) return null;
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard de Gestión</h1>
        <p className="text-muted-foreground mt-1">Análisis estratégico de capital humano.</p>
      </header>
      
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Headcount Activo" value={stats.active} percentage={4} change="increase" icon={Users} />
        <StatCard title="Inversión Nómina" value="$12.4M" percentage={12} change="increase" icon={Activity} />
        <StatCard title="Ausencias Hoy" value={stats.pendingRequests} percentage={8} change="decrease" icon={CalendarOff} />
        <StatCard title="Búsquedas Activas" value={stats.openVacancies} percentage={15} change="increase" icon={Briefcase} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-headline">Inversión Salarial por Unidad</CardTitle>
                <CardDescription>Distribución presupuestaria por departamento principal</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
               <BarChart data={salaryByUnitData} index="name" categories={['Ventas', 'Sistemas']} />
            </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-headline">Motivos de Absentismo</CardTitle>
                <CardDescription>Desglose porcentual acumulado</CardDescription>
            </CardHeader>
             <CardContent className="h-[350px] flex items-center justify-center">
               <PieChart chartData={absenceData} title="" showPercentages={true} />
            </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
                <div>
                    <CardTitle className="text-lg font-headline">Novedades de Legajos</CardTitle>
                    <CardDescription>Últimas actualizaciones en la base de datos.</CardDescription>
                </div>
                 <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                  {mockEmployees.slice(0, 5).map(emp => (
                    <div key={emp.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                        <Avatar className="h-10 w-10 border shadow-sm">
                            <AvatarImage src={emp.avatar} alt={emp.name} data-ai-hint="person face" />
                            <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{emp.name}</p>
                            <p className="text-xs text-muted-foreground truncate uppercase">{emp.empresa.tarea}</p>
                        </div>
                        <div className="hidden md:block">
                             <Badge variant="secondary" className="text-[10px] font-bold">{emp.empresa.dependencia}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/employees?id=${emp.id}`)}>
                                <Edit className="h-3 w-3"/>
                            </Button>
                        </div>
                    </div>
                  ))}
                </div>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
