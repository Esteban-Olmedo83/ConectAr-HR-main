'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format, subMonths, subYears, startOfMonth, endOfMonth, eachMonthOfInterval, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Check, X, Paperclip, Upload, PieChart as PieChartIcon, Search, BarChart as BarChartIcon, MessageSquare } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CommentThread } from '@/components/comments/comment-thread';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSession, Session } from '@/lib/session';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockEmployees, initialRequests } from '@/lib/mock-data';
import type { TimeOffRequest, RequestStatus } from '@/lib/definitions';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { DateRange } from 'react-day-picker';
import dynamic from 'next/dynamic';

const PieChart = dynamic(() => import('@/components/employees/pie-chart'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-full">Cargando gráfico...</div>
});

const BarChart = dynamic(() => import('@/components/employees/bar-chart'), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-full">Cargando gráfico...</div>
});

const timeOffFormSchema = z.object({
  type: z.string({ required_error: 'El tipo de ausencia es requerido.' }),
  transportType: z.string().optional(),
  startDate: z.date({ required_error: 'La fecha de inicio es requerida.' }),
  endDate: z.date({ required_error: 'La fecha de fin es requerida.' }),
  attachment: z.any().optional(),
}).refine(data => {
    if (data.type === 'Licencia por Emergencias (Transporte)' && !data.transportType) {
        return false;
    }
    return true;
}, {
    message: 'Debe seleccionar un tipo de transporte.',
    path: ['transportType'],
});

function LeavePageContent() {
  const [requests, setRequests] = useState<TimeOffRequest[]>(initialRequests);
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  
  const [isClient, setIsClient] = useState(false);
  
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [historicalData, setHistoricalData] = useState<TimeOffRequest[]>([]);
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [barChartCategories, setBarChartCategories] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedRequestForComments, setSelectedRequestForComments] = useState<TimeOffRequest | null>(null);


  useEffect(() => {
    setIsClient(true);
    const sessionData = getSession();
    setSession(sessionData);
  }, []);

  const isGeneralManager = useMemo(() => {
    if (!session || session.role !== 'manager') return false;
    const currentUser = mockEmployees.find(e => e.id === session.userId);
    return currentUser?.reportaA === null;
  }, [session]);

  const form = useForm<z.infer<typeof timeOffFormSchema>>({
    resolver: zodResolver(timeOffFormSchema),
    defaultValues: {
        type: '',
        transportType: '',
    }
  });

  const absenceType = form.watch('type');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentFile(e.target.files[0]);
    }
  }

  function onSubmit(data: z.infer<typeof timeOffFormSchema>) {
    if (!session?.userId || !session.userName) return;

    let finalType = data.type;
    if (data.type === 'Licencia por Emergencias (Transporte)' && data.transportType) {
        finalType = `${data.type}: ${data.transportType}`;
    }

    const newRequest: TimeOffRequest = {
      id: `req-${requests.length + 1}`,
      employeeId: session.userId,
      employeeName: session.userName,
      type: finalType,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'Pendiente',
    };
    
    if (attachmentFile) {
        newRequest.attachment = {
            name: attachmentFile.name,
            url: URL.createObjectURL(attachmentFile),
        };
    }

    setRequests(prev => [newRequest, ...prev]);
    form.reset();
    setAttachmentFile(null);

    toast({
      title: 'Solicitud enviada',
      description: 'Tu solicitud de tiempo libre ha sido enviada para aprobación.',
    });
  }

  const handleStatusChange = (id: string, newStatus: RequestStatus) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
    toast({
      title: `Solicitud actualizada`,
      description: `La solicitud ha sido actualizada a: ${newStatus}`,
    });
  }

  const getBadgeVariant = (status: RequestStatus) => {
    switch (status) {
      case 'Aprobado': return 'default';
      case 'Pendiente': return 'secondary';
      case 'Pendiente de Admin': return 'outline';
      case 'Rechazado': return 'destructive';
      default: return 'secondary';
    }
  }

  const getPieChartData = (data: TimeOffRequest[], key: 'type' | 'department' | 'sector') => {
      const counts: { [key: string]: number } = {};
      
      data.forEach(req => {
        let name: string;
        if (key === 'type') {
            name = req.type.split(':')[0]; // Group by main type for emergencies
        } else {
            const employee = mockEmployees.find(e => e.id === req.employeeId);
            if (key === 'department') {
                name = employee?.empresa.dependencia || 'Sin Departamento';
            } else {
                 name = employee?.empresa.sector || 'Sin Sector';
            }
        }
        if (!counts[name]) counts[name] = 0;
        counts[name]++;
      });

      return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }

 const handleHistoricalSearch = () => {
    setHasSearched(true);
    if (dateRange?.from && dateRange?.to) {
        const relevantRequests = session?.role === 'admin' || isGeneralManager 
            ? requests
            : requests.filter(req => teamIds.includes(req.employeeId));

        const filtered = relevantRequests.filter(req => 
            new Date(req.startDate) >= dateRange.from! && new Date(req.endDate) <= dateRange.to! && req.status === 'Aprobado'
        );
        setHistoricalData(filtered);

        if (filtered.length > 0) {
            const monthsInRange = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
            const allTypes = Array.from(new Set(filtered.map(req => req.type.split(':')[0])));
            setBarChartCategories(allTypes);

            const dataForChart = monthsInRange.map(month => {
                const monthName = format(month, "MMM yyyy", { locale: es });
                const monthData: { [key: string]: any } = { 
                  name: monthName.charAt(0).toUpperCase() + monthName.slice(1) 
                };
                
                allTypes.forEach(type => {
                    monthData[type] = 0;
                });

                filtered.forEach(req => {
                    const reqStartDate = new Date(req.startDate);
                    if (getYear(reqStartDate) === getYear(month) && getMonth(reqStartDate) === getMonth(month)) {
                        const type = req.type.split(':')[0];
                        monthData[type]++;
                    }
                });

                return monthData;
            });
            setBarChartData(dataForChart);
        } else {
            setBarChartData([]);
            setBarChartCategories([]);
        }

    } else {
        setHistoricalData([]);
        setBarChartData([]);
        setBarChartCategories([]);
    }
}


  const setQuickDateRange = (type: 'semester' | 'year' | 'five_years') => {
      const to = new Date();
      let from;
      if (type === 'semester') from = subMonths(to, 6);
      if (type === 'year') from = subYears(to, 1);
      if (type === 'five_years') from = subYears(to, 5);
      setDateRange({ from, to });
  }

  const teamIds = useMemo(() => (session?.isManager && session.role !== 'admin' && !isGeneralManager)
    ? mockEmployees
        .filter(emp => emp.reportaA === session?.userId)
        .map(emp => emp.id)
    : [], [session, isGeneralManager]);
  
  const myRequests = useMemo(() => requests.filter(req => req.employeeId === session?.userId), [requests, session]);
  
  const allTeamRequests = useMemo(() => requests.filter(req => teamIds.includes(req.employeeId)), [requests, teamIds]);
  const pendingTeamRequests = useMemo(() => allTeamRequests.filter(r => r.status === 'Pendiente'), [allTeamRequests]);
  const historicalTeamRequests = useMemo(() => allTeamRequests.filter(r => r.status !== 'Pendiente'), [allTeamRequests]);
  
  const adminRequests = useMemo(() => requests, [requests]);
  
  if (!session || !isClient) {
    return <div>Cargando...</div>
  }

  const renderMyRequests = () => (
    <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Nueva Solicitud</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Ausencia</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="Vacaciones">Vacaciones</SelectItem>
                              <SelectItem value="Asunto Personal">Asunto Personal</SelectItem>
                              <SelectItem value="Licencia por ART">Licencia por ART</SelectItem>
                              <SelectItem value="Licencia por Maternidad">Licencia por Maternidad (90 días)</SelectItem>
                              <SelectItem value="Licencia por Paternidad">Licencia por Paternidad (2 días)</SelectItem>
                              <SelectItem value="Licencia por Nacimiento de Hijo">Licencia por Nacimiento de Hijo (2 días)</SelectItem>
                              <SelectItem value="Licencia por Matrimonio">Licencia por Matrimonio (10 días)</SelectItem>
                              <SelectItem value="Licencia por Fallecimiento (Cónyuge, hijos, padres)">Licencia por Fallecimiento (Cónyuge, hijos, padres)</SelectItem>
                              <SelectItem value="Licencia por Fallecimiento (Hermano)">Licencia por Fallecimiento (Hermano)</SelectItem>
                              <SelectItem value="Licencia por Examen">Licencia por Examen (hasta 10 días anuales)</SelectItem>
                              <SelectItem value="Licencia por Mudanza">Licencia por Mudanza (1 día)</SelectItem>
                              <SelectItem value="Licencia por Donación de Sangre">Licencia por Donación de Sangre</SelectItem>
                              <SelectItem value="Licencia por Adopción">Licencia por Adopción</SelectItem>
                              <SelectItem value="Licencia por Trámites Personales">Licencia por Trámites Personales</SelectItem>
                              <SelectItem value="Licencia por Emergencias (Transporte)">Licencia por Emergencias (Transporte)</SelectItem>
                              <SelectItem value="Licencia sin Goce de Haberes">Licencia sin Goce de Haberes</SelectItem>
                              <SelectItem value="Licencia por Enfermedad">Licencia por Enfermedad</SelectItem>
                              <SelectItem value="Licencia por Excedencia">Licencia por Excedencia (Maternidad)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {absenceType === 'Licencia por Emergencias (Transporte)' && (
                     <FormField
                        control={form.control}
                        name="transportType"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Transporte</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Selecciona un transporte" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Retraso de colectivo">Retraso de colectivo</SelectItem>
                                <SelectItem value="Retraso de tren">Retraso de tren</SelectItem>
                                <SelectItem value="Retraso de subte">Retraso de subte</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Inicio</FormLabel>
                        <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd/MM/yyyy')
                                ) : (
                                  <span>Elige una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setIsStartCalendarOpen(false);
                              }}
                              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Fin</FormLabel>
                        <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd/MM/yyyy')
                                ) : (
                                  <span>Elige una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                               onSelect={(date) => {
                                field.onChange(date);
                                setIsEndCalendarOpen(false);
                              }}
                              disabled={(date) => date < (form.getValues('startDate') || new Date(new Date().setHours(0,0,0,0)))}
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attachment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adjuntar Archivo (Opcional)</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                     <Input 
                                        id="attachment-file" 
                                        type="file" 
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="attachment-file" className={cn(buttonVariants({ variant: 'outline'}), 'w-full cursor-pointer')}>
                                        <Upload className="mr-2 h-4 w-4"/>
                                        {attachmentFile ? attachmentFile.name : 'Seleccionar archivo'}
                                    </label>
                                </div>
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                   />
                  <Button type="submit" className="w-full">Enviar Solicitud</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Mi Historial de Solicitudes</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderRequestTable(myRequests, false, false)}
                </CardContent>
            </Card>
        </div>
    </div>
  );

  const renderManagementView = (isTeamView: boolean) => {
    const dataScope = isTeamView ? allTeamRequests : adminRequests;
    
    const pendingRequests = dataScope.filter(req => req.status === 'Pendiente de Admin' || req.status === 'Pendiente');
    const historicalRequests = dataScope.filter(req => req.status === 'Aprobado' || req.status === 'Rechazado');

    const now = new Date();
    const currentMonthRequests = dataScope.filter(req => new Date(req.startDate).getMonth() === now.getMonth() && new Date(req.startDate).getFullYear() === now.getFullYear() && req.status === 'Aprobado');

    const showDepartmentChart = !isTeamView; // Don't show department chart for a specific team

    return (
        <Tabs defaultValue="stats" className="w-full">
            <TabsList>
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                <TabsTrigger value="pendientes">Solicitudes Pendientes</TabsTrigger>
                <TabsTrigger value="history">Historial General</TabsTrigger>
            </TabsList>
            <TabsContent value="pendientes" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Solicitudes Pendientes de Aprobación</CardTitle>
                        <CardDescription>Otorga la aprobación final a las solicitudes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderRequestTable(pendingRequests, true, true)}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="stats" className="mt-6 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><PieChartIcon/> Ausencias del Mes</CardTitle>
                        <CardDescription>Desglose de ausencias aprobadas en el mes actual.</CardDescription>
                    </CardHeader>
                    <CardContent className={cn("grid gap-8", showDepartmentChart ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
                       <PieChart chartData={getPieChartData(currentMonthRequests, 'type')} title="Por Motivo" />
                       {showDepartmentChart && <PieChart chartData={getPieChartData(currentMonthRequests, 'department')} title="Por Departamento" />}
                       <PieChart chartData={getPieChartData(currentMonthRequests, 'sector')} title="Por Sector" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                         <CardTitle className="font-headline flex items-center gap-2"><BarChartIcon/> Consulta Histórica</CardTitle>
                        <CardDescription>Filtra el historial de ausencias por un rango de fechas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-end gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="date" className="font-medium">
                                  Rango de Fechas
                                </Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id="date"
                                      variant={"outline"}
                                      className={cn(
                                        "w-[300px] justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {dateRange?.from ? (
                                        dateRange.to ? (
                                          <>
                                            {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                            {format(dateRange.to, "LLL dd, y", { locale: es })}
                                          </>
                                        ) : (
                                          format(dateRange.from, "LLL dd, y", { locale: es })
                                        )
                                      ) : (
                                        <span>Elige un rango</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      initialFocus
                                      mode="range"
                                      defaultMonth={dateRange?.from}
                                      selected={dateRange}
                                      onSelect={setDateRange}
                                      numberOfMonths={2}
                                      locale={es}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setQuickDateRange('semester')}>Último Semestre</Button>
                                <Button variant="secondary" onClick={() => setQuickDateRange('year')}>Último Año</Button>
                                <Button variant="secondary" onClick={() => setQuickDateRange('five_years')}>Últimos 5 Años</Button>
                              </div>
                            <Button onClick={handleHistoricalSearch}><Search className="mr-2 h-4 w-4"/>Buscar</Button>
                        </div>
                         {hasSearched ? (
                            historicalData.length > 0 ? (
                                <div className="space-y-6 pt-4">
                                    <div className="h-96">
                                      <BarChart data={barChartData} index="name" categories={barChartCategories} stacked />
                                    </div>
                                    {renderRequestTable(historicalData, true, false)}
                                </div>
                            ) : (
                                <p className="text-sm text-center text-muted-foreground pt-10">No se encontraron resultados para el rango de fechas seleccionado.</p>
                            )
                        ) : (
                           <p className="text-sm text-center text-muted-foreground pt-10">Seleccione un rango y haga clic en buscar para ver los resultados.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="history" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Historial General de Solicitudes</CardTitle>
                        <CardDescription>Consulta el historial completo de ausencias.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderRequestTable(historicalRequests, true, false)}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
  }

  const renderRequestTable = (requestList: TimeOffRequest[], isManagementView: boolean, showActions = true) => (
      <Table>
        <TableHeader>
          <TableRow>
            {isManagementView && <TableHead>Empleado</TableHead>}
            <TableHead>Tipo</TableHead>
            <TableHead>Periodo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Adjunto</TableHead>
            {(showActions) && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requestList.length > 0 ? requestList.map((request) => (
            <TableRow key={request.id}>
              {isManagementView && <TableCell>{request.employeeName}</TableCell>}
              <TableCell>{request.type}</TableCell>
              <TableCell>{`${format(new Date(request.startDate), 'dd/MM/yyyy')} - ${format(new Date(request.endDate), 'dd/MM/yyyy')}`}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(request.status)}>{request.status}</Badge>
              </TableCell>
              <TableCell>
                {request.attachment && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={request.attachment.url} target="_blank" rel="noopener noreferrer">
                      <Paperclip className="mr-2 h-4 w-4" />
                      {request.attachment.name}
                    </a>
                  </Button>
                )}
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                   {(session?.role === 'admin' || isGeneralManager) && (request.status === 'Pendiente' || request.status === 'Pendiente de Admin') && (
                     <div className="flex gap-2 justify-end">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleStatusChange(request.id, 'Aprobado')}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleStatusChange(request.id, 'Rechazado')}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                   )}
                   {session?.isManager && !isGeneralManager && request.status === 'Pendiente' && (
                     <div className="flex gap-2 justify-end">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleStatusChange(request.id, 'Pendiente de Admin')}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleStatusChange(request.id, 'Rechazado')}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                   )}
                   <Button size="icon" variant="ghost" className="h-8 w-8 ml-2" onClick={() => setSelectedRequestForComments(request)} title="Ver comentarios">
                     <MessageSquare className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                   </Button>
                </TableCell>
              )}
            </TableRow>
          )) : (
            <TableRow>
                <TableCell colSpan={isManagementView ? 6 : 5} className="h-24 text-center">
                    No hay solicitudes para mostrar.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
  )

  let title = "Mis Ausencias";
  let description = "Solicita ausencias y revisa tu historial.";
  let content;

  const isTeamView = session.isManager && view === 'team';

  if (session.role === 'admin' || (isGeneralManager && isTeamView)) {
    title = 'Gestión de Ausencias';
    description = 'Revisa estadísticas, aprueba solicitudes y consulta el historial de toda la empresa.';
    content = renderManagementView(false);
  } else if (isTeamView) {
    title = 'Gestión de Ausencias del Equipo';
    description = 'Revisa estadísticas, aprueba o rechaza las solicitudes de tu equipo.';
    content = renderManagementView(true);
  } else {
    // Vista por defecto para empleados y managers (sus propias solicitudes)
    title = session.isManager ? "Mis Ausencias" : "Gestión de Ausencias";
    description = session.isManager ? "Solicita tus ausencias y revisa tu historial." : "Solicita ausencias y revisa tu historial.";
    content = renderMyRequests();
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </header>
      
      {content}

      <Dialog open={!!selectedRequestForComments} onOpenChange={(open) => !open && setSelectedRequestForComments(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comentarios: {selectedRequestForComments?.type}</DialogTitle>
            <DialogDescription>
              Solicitado por {selectedRequestForComments?.employeeName} ({selectedRequestForComments?.startDate ? format(new Date(selectedRequestForComments.startDate), 'dd/MM/yyyy') : ''} - {selectedRequestForComments?.endDate ? format(new Date(selectedRequestForComments.endDate), 'dd/MM/yyyy') : ''})
            </DialogDescription>
          </DialogHeader>
          {selectedRequestForComments && (
            <div className="mt-4">
              <CommentThread 
                context="leave-request" 
                entityId={selectedRequestForComments.id} 
                title="Conversación de Licencia"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LeavePage() {
    return (
        <React.Suspense fallback={<div>Cargando...</div>}>
            <LeavePageContent />
        </React.Suspense>
    )
}
