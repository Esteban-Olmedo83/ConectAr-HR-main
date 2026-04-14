import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Employee } from '@/lib/definitions';
import { useMemo } from 'react';
import { parse } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface EmployeeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  employees: Employee[];
  onEmployeeSelect: (employee: Employee) => void;
}

type EmployeeStatus = 'Activo' | 'Baja del mes' | 'Inactivo (Histórico)';

const getEmployeeStatus = (employee: Employee): EmployeeStatus => {
    if (!employee.fechaEgreso) {
        return 'Activo';
    }
    const now = new Date();
    try {
        const egresoDate = parse(employee.fechaEgreso, 'dd/MM/yyyy', new Date());
        if (egresoDate.getFullYear() === now.getFullYear() && egresoDate.getMonth() === now.getMonth()) {
            return 'Baja del mes';
        }
    } catch (e) {
        console.error("Invalid date format for fechaEgreso", employee.fechaEgreso);
    }
    
    return 'Inactivo (Histórico)';
}

export function EmployeeListModal({ isOpen, onClose, title, employees, onEmployeeSelect }: EmployeeListModalProps) {
  
  const groupedEmployees = useMemo(() => {
    return employees.reduce((acc, employee) => {
      const department = employee.empresa.dependencia || 'Sin Departamento';
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(employee);
      return acc;
    }, {} as Record<string, Employee[]>);
  }, [employees]);

  const sortedDepartments = useMemo(() => Object.keys(groupedEmployees).sort(), [groupedEmployees]);

  const renderEmployeeTable = (employeeList: Employee[]) => (
    <Table>
      <TableHeader>
          <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Legajo</TableHead>
              <TableHead>Tarea</TableHead>
          </TableRow>
      </TableHeader>
      <TableBody>
          {employeeList.map((employee) => (
              <TableRow key={employee.id} onClick={() => onEmployeeSelect(employee)} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 border">
                            <AvatarImage src={employee.avatar} alt={employee.name} data-ai-hint="person face" />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.empresa.legajo}</TableCell>
                  <TableCell className="hidden sm:table-cell">{employee.empresa.tarea}</TableCell>
              </TableRow>
          ))}
      </TableBody>
    </Table>
  );

  const renderDepartmentContent = (deptEmployees: Employee[]) => {
    const byStatus = deptEmployees.reduce((acc, employee) => {
        const status = getEmployeeStatus(employee);
        if(!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(employee);
        return acc;
    }, {} as Record<EmployeeStatus, Employee[]>);

    const statusKeys = Object.keys(byStatus) as EmployeeStatus[];

    if (statusKeys.length <= 1 && statusKeys[0] === 'Activo') { // If only active employees, don't group by status
        return renderEmployeeTable(deptEmployees);
    }
    
    const sortedStatusKeys: EmployeeStatus[] = (['Activo', 'Baja del mes', 'Inactivo (Histórico)'] as EmployeeStatus[]).filter(key => statusKeys.includes(key));

    return (
        <Accordion type="multiple" className="w-full bg-muted/50" defaultValue={['Activo']}>
            {sortedStatusKeys.map(status => (
                <AccordionItem value={status} key={status}>
                   <AccordionTrigger className="px-4 hover:no-underline text-sm">
                        <div className="flex justify-between w-full pr-4">
                            <span className="font-medium">{status}</span>
                            <span className="text-muted-foreground">{byStatus[status].length}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                        {renderEmployeeTable(byStatus[status])}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title} ({employees.length})</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 pr-3">
          <Accordion type="multiple" className="w-full" defaultValue={sortedDepartments}>
            {sortedDepartments.map((department) => (
              <AccordionItem value={department} key={department}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex justify-between w-full pr-4">
                    <span className="font-semibold">{department}</span>
                    <span className="text-muted-foreground">{groupedEmployees[department].length} Empleado(s)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                    {renderDepartmentContent(groupedEmployees[department])}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

    