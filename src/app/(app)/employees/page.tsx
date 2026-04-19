
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockEmployees, initialStructure } from '@/lib/mock-data';
import { Employee, Structure, CustomField, headerMapping, getHeaders } from '@/lib/definitions';
import { EmployeeProfileDetail } from '@/components/employees/employee-profile-detail';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { File, FileDown, MoreVertical, Users, UserCheck, UserX, UserRoundX, UserPlus, Package, Settings2, ChevronsUpDown, Upload, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { EmployeeListModal } from '@/components/employees/employee-list-modal';
import { es } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import dynamic from 'next/dynamic';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmployeeStructureAdmin } from '@/components/employees/employee-structure-admin';
import { EmployeeImportModal } from '@/components/employees/employee-import-modal';
import { getSession, Session } from '@/lib/session';
import { Skeleton } from '@/components/ui/skeleton';


const PieChart = dynamic(() => import('@/components/employees/pie-chart'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />
});

type Stats = {
  total: number;
  active: number;
  inactive: number;
  inactiveThisMonth: number;
  totalDelMes: number;
};

type ModalInfo = {
  isOpen: boolean;
  title: string;
  employees: Employee[];
}

// Function to get a value from a nested object based on a path string
const get = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export default function EmployeeListPage() {
  const [session, setSession] = useState<Session | null>(null);
  const searchParams = useSearchParams();
  const employeeIdFromUrl = searchParams.get('id');
  const viewParam = searchParams.get('view');

  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [initialEmployees, setInitialEmployees] = useState<Employee[]>([]);

  const [structure, setStructure] = useState<Structure>(initialStructure);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isEditingStructure, setIsEditingStructure] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [modalInfo, setModalInfo] = useState<ModalInfo>({ isOpen: false, title: '', employees: [] });

  const [viewLevel, setViewLevel] = useState<'departments' | 'sectors'>('departments');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const dependencias = useMemo(() => Array.from(new Set(employees.map(e => e.empresa.dependencia))).filter(Boolean), [employees]);
  const sectores = useMemo(() => Array.from(new Set(employees.map(e => e.empresa.sector))).filter(Boolean), [employees]);
  const tareas = useMemo(() => Array.from(new Set(employees.map(e => e.empresa.tarea))).filter(Boolean), [employees]);
  const categorias = useMemo(() => Array.from(new Set(employees.map(e => e.empresa.categoria))).filter(Boolean), [employees]);

  useEffect(() => {
    const sessionData = getSession();
    if (!sessionData) {
      // Session not available, redirect to login will be handled by middleware
      return;
    }
    setSession(sessionData);

    const currentUser = mockEmployees.find(e => e.id === sessionData.userId);
    const isGeneralManager = sessionData.role === 'manager' && currentUser && currentUser.reportaA === null;

    let baseFilteredEmployees: Employee[];

    if (sessionData.role === 'admin' || isGeneralManager) {
      baseFilteredEmployees = mockEmployees;
    } else if (sessionData.role === 'manager') { // Team view for mid-level managers
      baseFilteredEmployees = mockEmployees.filter(e => e.reportaA === sessionData.userId);
    } else { // Employee's own view
      baseFilteredEmployees = mockEmployees.filter(e => e.id === sessionData.userId);
    }

    setInitialEmployees(baseFilteredEmployees);

    const employeeId = employeeIdFromUrl || (sessionData.role === 'employee' ? sessionData.userId : null);

    if (employeeId) {
      const employeeToShow = mockEmployees.find(e => e.id === employeeId);
      if(employeeToShow) {
        if(sessionData.role === 'employee' && employeeToShow.id !== sessionData.userId) {
          setSelectedEmployee(null);
        } else if(sessionData.role === 'manager' && !isGeneralManager && employeeToShow.id !== sessionData.userId && employeeToShow.reportaA !== sessionData.userId) {
          setSelectedEmployee(null);
        } else {
          setSelectedEmployee(employeeToShow);
        }
      }
    } else {
      setSelectedEmployee(null);
    }

  }, [employeeIdFromUrl, viewParam, searchParams]);


  const handleStructureChange = (section: 'Datos Personales' | 'Datos de la Empresa', newField: CustomField) => {
    setStructure(prevStructure => {
        const newCustomFields = [...prevStructure[section]['Datos Adicionales'], newField];
        return {
            ...prevStructure,
            [section]: {
                ...prevStructure[section],
                'Datos Adicionales': newCustomFields,
            },
        };
    });

    const sectionKey = section === 'Datos Personales' ? 'personal' : 'empresa';
    setEmployees(prevEmployees =>
        prevEmployees.map(emp => ({
            ...emp,
            [sectionKey]: {
                ...emp[sectionKey],
                customFields: {
                    ...emp[sectionKey].customFields,
                    [newField.name]: newField.defaultValue || '',
                },
            },
        }))
    );
  };

  const handleStructureFieldDelete = (section: 'Datos Personales' | 'Datos de la Empresa', fieldName: string) => {
    setStructure(prevStructure => {
        const newCustomFields = prevStructure[section]['Datos Adicionales'].filter(
            field => field.name !== fieldName
        );
        return {
            ...prevStructure,
            [section]: {
                ...prevStructure[section],
                'Datos Adicionales': newCustomFields,
            },
        };
    });

    const sectionKey = section === 'Datos Personales' ? 'personal' : 'empresa';
    setEmployees(prevEmployees =>
        prevEmployees.map(emp => {
            const newCustomFields = { ...emp[sectionKey].customFields };
            delete newCustomFields[fieldName];
            return {
                ...emp,
                [sectionKey]: {
                    ...emp[sectionKey],
                    customFields: newCustomFields,
                },
            };
        })
    );
  };


  const activeEmployees = useMemo(() => initialEmployees.filter(e => e.fechaEgreso === null), [initialEmployees]);

  const { stats, departmentData, sectorData } = useMemo(() => {
    const now = new Date();
    const inactiveEmployees = initialEmployees.filter(e => e.fechaEgreso !== null);

    const inactiveThisMonth = inactiveEmployees.filter(e => {
        if (e.fechaEgreso === null) return false;
        try {
            const egresoDate = parse(e.fechaEgreso, 'dd/MM/yyyy', new Date());
            return egresoDate.getFullYear() === now.getFullYear() && egresoDate.getMonth() === now.getMonth();
        } catch(e) { return false; }
    });

    const employeesOfTheMonth = [...activeEmployees, ...inactiveThisMonth];

    const newStats: Stats = {
      total: initialEmployees.length,
      active: activeEmployees.length,
      inactive: inactiveEmployees.length,
      inactiveThisMonth: inactiveThisMonth.length,
      totalDelMes: employeesOfTheMonth.length,
    };

    const deptData: { [key: string]: number } = {};
    activeEmployees.forEach(employee => {
      const department = employee.empresa.dependencia || 'Sin Departamento';
      if (!deptData[department]) deptData[department] = 0;
      deptData[department]++;
    });

    const totalActive = activeEmployees.length;

    const newDepartmentData = Object.entries(deptData)
      .map(([name, value]) => ({ name, value, percentage: totalActive > 0 ? (value / totalActive) * 100 : 0 }))
      .sort((a, b) => b.value - a.value);

    let newSectorData: { name: string, value: number, percentage?: number }[] = [];
    if (selectedDepartment) {
        const sectorCounts: { [key: string]: number } = {};
        const employeesInDept = activeEmployees.filter(e => e.empresa.dependencia === selectedDepartment);
        const totalInDept = employeesInDept.length;

        employeesInDept.forEach(employee => {
            const sector = employee.empresa.sector || 'Sin Sector';
            if (!sectorCounts[sector]) sectorCounts[sector] = 0;
            sectorCounts[sector]++;
        });

        newSectorData = Object.entries(sectorCounts)
            .map(([name, value]) => ({ name, value, percentage: totalInDept > 0 ? (value/totalInDept) * 100 : 0 }))
            .sort((a, b) => b.value - a.value);
    }

    return { stats: newStats, departmentData: newDepartmentData, sectorData: newSectorData };

  }, [initialEmployees, activeEmployees, selectedDepartment]);

  const handleChartClick = (itemName: string) => {
    if (viewLevel === 'departments') {
        setSelectedDepartment(itemName);
        setSelectedSector(null);
        setViewLevel('sectors');
    } else if (viewLevel === 'sectors') {
        setSelectedSector(itemName);
    }
  };

  const handleBackToDepartments = () => {
      setSelectedDepartment(null);
      setSelectedSector(null);
      setViewLevel('departments');
  };

  const getChartData = () => {
    return viewLevel === 'departments' ? departmentData : sectorData;
  };

  const getChartTitle = () => {
    if (viewLevel === 'sectors' && selectedDepartment) {
        return `Sectores en ${selectedDepartment}`;
    }
    return session?.role === 'admin' ? "Distribución de Empleados Activos" : "Distribución de Mi Equipo";
  }


  const getMonthYear = () => {
    const now = new Date();
    const monthYear = format(now, "MMMM yyyy", { locale: es });
    return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
  }

  const handleDownload = (format: 'pdf' | 'xlsx', employee: Employee) => {
    if (format === 'xlsx') {
        const headers = getHeaders(structure);
        const dataToExport = [employee].map(emp => {
            const row: any = {};
            headerMapping.forEach(h => {
                row[h.friendlyName] = get(emp, h.path) || '';
            });

            structure["Datos Personales"]["Datos Adicionales"].forEach(field => {
                row[field.name] = emp.personal.customFields?.[field.name] || '';
            });
            structure["Datos de la Empresa"]["Datos Adicionales"].forEach(field => {
                row[field.name] = emp.empresa.customFields?.[field.name] || '';
            });

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Legajo");
        XLSX.writeFile(wb, `legajo_${employee.empresa.legajo}_${employee.name.replace(/\s/g, '_')}.xlsx`);
        return;
    }

    if (format === 'pdf') {
        const doc = new jsPDF();

        const addHeader = () => {
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text(employee.name, 50, 25);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100);
            doc.text(`${employee.empresa.tarea} | ${employee.empresa.dependencia}`, 50, 32);
            doc.text(employee.email, 50, 39);
        }

        const generatePdfContent = () => {
            addHeader();
            let startY = 60;
            const leftMargin = 15;
            const valueOffset = 50;
            const lineSpacing = 7;
            const sectionSpacing = 12;

            const checkPageBreak = (y: number) => {
                if (y > 270) {
                    doc.addPage();
                    startY = 20;
                    return 20;
                }
                return y;
            }

            const addSection = (title: string, data: [string, any][], y: number) => {
                y = checkPageBreak(y);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(40);
                doc.text(title, leftMargin, y);
                y += 5;
                doc.setDrawColor(220);
                doc.line(leftMargin, y, 195, y);
                y += lineSpacing * 1.5;

                data.forEach(([label, value]) => {
                    if (value) {
                         y = checkPageBreak(y);
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(100);
                        doc.text(label + ':', leftMargin, y, { align: 'left' });

                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(40);
                        doc.text(String(value), leftMargin + valueOffset, y);
                        y += lineSpacing;
                    }
                });
                return y + sectionSpacing / 2;
            };

            const addHorarioSection = (y: number) => {
                y = checkPageBreak(y);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(40);
                doc.text('Horario y Asignación', leftMargin, y);
                y += 5;
                doc.setDrawColor(220);
                doc.line(leftMargin, y, 195, y);
                y += lineSpacing * 1.5;

                // Tipo de Horario y Sucursal Fija
                const horario = employee.empresa.horario;
                y = checkPageBreak(y);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(100);
                doc.text('Tipo de Horario:', leftMargin, y);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(40);
                doc.text(horario.tipo, leftMargin + valueOffset, y);
                y += lineSpacing;

                if (horario.tipo === 'Presencial' && horario.sucursalFijo) {
                    y = checkPageBreak(y);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(100);
                    doc.text('Sucursal:', leftMargin, y);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(40);
                    doc.text(horario.sucursalFijo, leftMargin + valueOffset, y);
                    y += lineSpacing;
                }
                y += lineSpacing / 2;

                // Tabla de días
                const diasLaborales = Object.entries(horario.dias)
                    .filter(([, dia]) => dia.trabaja)
                    .map(([dia, data]) => {
                        const sucursal = horario.tipo === 'Híbrido' ? data.sucursal : horario.sucursalFijo;
                        return [dia.charAt(0).toUpperCase() + dia.slice(1), `${data.horarioEntrada} - ${data.horarioSalida}`, sucursal];
                    });

                if (diasLaborales.length > 0) {
                     y = checkPageBreak(y);
                    autoTable(doc, {
                        startY: y,
                        head: [['Día', 'Horario', 'Sucursal']],
                        body: diasLaborales,
                        theme: 'grid',
                        headStyles: { fillColor: [240, 240, 240], textColor: 60, fontStyle: 'bold' },
                        styles: { fontSize: 9, cellPadding: 2, lineWidth: 0.1, lineColor: 220 },
                        columnStyles: {
                            0: { cellWidth: 40 },
                            1: { cellWidth: 50 },
                            2: { cellWidth: 'auto' },
                        }
                    });
                    // @ts-ignore
                    y = (doc as any).lastAutoTable.finalY;
                }
                return y + sectionSpacing;
            }

            const personalData: [string, any][] = [
                ['Fecha de Nacimiento', employee.personal.fechaNacimiento],
                ['Nacionalidad', employee.personal.nacionalidad],
                ['DNI', employee.personal.dni],
                ['CUIL', employee.personal.cuil],
                ['Sexo', employee.personal.sexo],
                ['Estado Civil', employee.personal.estadoCivil],
                ['Dirección', `${employee.personal.domicilio.calle} ${employee.personal.domicilio.numero}, ${employee.personal.domicilio.piso || ''} ${employee.personal.domicilio.depto || ''}`.replace(/ ,|,$/g, '')],
                ['Localidad', `${employee.personal.domicilio.localidad}, ${employee.personal.domicilio.provincia} (${employee.personal.domicilio.cp})`],
                ['Teléfono', employee.personal.telefono],
            ];
            startY = addSection('Información Personal', personalData, startY);

            const empresaData: [string, any][] = [
                ['N° de Legajo', employee.empresa.legajo],
                ['Fecha de Ingreso', employee.empresa.fechaIngreso],
                ['Antigüedad', employee.empresa.antiguedad],
                ['Categoría', employee.empresa.categoria],
                ['Sector', employee.empresa.sector],
                ['Dependencia', employee.empresa.dependencia],
                ['Estado', employee.fechaEgreso ? `Baja (${employee.fechaEgreso})` : 'Activo'],
                ['Reporta A', employee.reportaA ? (mockEmployees.find(e => e.id === employee.reportaA)?.name || 'N/A') : 'N/A'],
            ];
            startY = addSection('Información de la Empresa', empresaData, startY);

            startY = addHorarioSection(startY);

            const registracionData: [string, any][] = [
                ['Modalidad Contrato', employee.registracion.modalidadContrato],
                ['Obra Social', `${employee.registracion.obraSocial.codigo} - ${employee.registracion.obraSocial.descripcion}`],
                ['ART', employee.registracion.art],
                ['Situación de Revista', employee.registracion.situacionRevista],
                ['Régimen', employee.registracion.regimen],
                ['Tipo de Servicio', employee.registracion.tipoServicio],
                ['Convenio Colectivo', employee.registracion.convenioColectivo],
                ['Puesto / Rol', employee.registracion.puesto],
                ['Retribución Pactada', employee.registracion.retribucionPactada],
                ['Modalidad Liquidación', employee.registracion.modalidadLiquidacion],
                ['Domicilio Explotación', employee.registracion.domicilioExplotacion],
                ['Actividad Económica', employee.registracion.actividadEconomica],
            ];
            startY = addSection('Datos de Registración', registracionData, startY);

            const bancariosData: [string, any][] = [
                ['Banco', employee.bancarios.banco],
                ['N° de Cuenta', employee.bancarios.cuenta],
                ['CBU', employee.bancarios.cbu],
                ['Alias', employee.bancarios.alias],
            ];
            startY = addSection('Datos Bancarios', bancariosData, startY);

            const customFieldsPersonal = Object.entries(employee.personal.customFields);
            const customFieldsEmpresa = Object.entries(employee.empresa.customFields);

            if (customFieldsPersonal.length > 0 || customFieldsEmpresa.length > 0) {
              const allCustomFields = [...customFieldsPersonal, ...customFieldsEmpresa];
              startY = addSection('Información Adicional', allCustomFields, startY);
            }

            doc.save(`legajo_${employee.empresa.legajo}_${employee.name.replace(/\s/g, '_')}.pdf`);
        };

        try {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = employee.avatar;
            img.onload = () => {
                doc.addImage(img, 'PNG', 15, 15, 30, 30);
                generatePdfContent();
            };
            img.onerror = () => {
                console.error("No se pudo cargar la imagen para el PDF. Se continuará sin ella.");
                generatePdfContent();
            }
        } catch (e) {
            console.error("Error al procesar imagen para PDF:", e);
            generatePdfContent();
        }
    }
  };

  const handleExportAllToXLSX = () => {
    const headers = getHeaders(structure);

    const dataToExport = initialEmployees.map(emp => {
        const row: any = {};
        headerMapping.forEach(h => {
            row[h.friendlyName] = get(emp, h.path) || '';
        });

        structure["Datos Personales"]["Datos Adicionales"].forEach(field => {
            row[field.name] = emp.personal.customFields?.[field.name] || '';
        });
        structure["Datos de la Empresa"]["Datos Adicionales"].forEach(field => {
            row[field.name] = emp.empresa.customFields?.[field.name] || '';
        });

        return row;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empleados");
    XLSX.writeFile(wb, "legajos_exportacion.xlsx");
  }

  const handleOpenModal = (type: 'total' | 'active' | 'inactive' | 'inactiveThisMonth' | 'totalDelMes') => {
    let title = '';
    let employeeList: Employee[] = [];

    const inactiveEmployees = initialEmployees.filter(e => e.fechaEgreso !== null);
    const now = new Date();
    const inactiveThisMonth = inactiveEmployees.filter(e => {
        if (e.fechaEgreso === null) return false;
        const egresoDate = parse(e.fechaEgreso, 'dd/MM/yyyy', new Date());
        return egresoDate.getFullYear() === now.getFullYear() && egresoDate.getMonth() === now.getMonth();
    });

    switch(type) {
      case 'total':
        title = session?.role === 'admin' ? 'Todos los Empleados' : 'Todo mi Equipo';
        employeeList = initialEmployees;
        break;
      case 'active':
        title = session?.role === 'admin' ? 'Empleados Activos' : 'Mi Equipo Activo';
        employeeList = activeEmployees;
        break;
      case 'inactive':
        title = session?.role === 'admin' ? 'Empleados Inactivos (Histórico)' : 'Inactivos Históricos de mi Equipo';
        employeeList = inactiveEmployees;
        break;
      case 'inactiveThisMonth':
        title = session?.role === 'admin' ? 'Bajas del Mes' : 'Bajas del Mes en mi Equipo';
        employeeList = inactiveThisMonth;
        break;
      case 'totalDelMes':
        title = session?.role === 'admin' ? `Total Empleados - ${getMonthYear()}` : `Total Equipo - ${getMonthYear()}`;
        employeeList = [...activeEmployees, ...inactiveThisMonth];
        break;
    }

    setModalInfo({ isOpen: true, title, employees: employeeList });
  };

  const handleSelectEmployeeFromModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalInfo({ isOpen: false, title: '', employees: [] });
  };

  const handleBackToList = () => {
    if (session?.role === 'employee') return; // El empleado no puede volver a la lista
    setSelectedEmployee(null);
    setIsCreating(false);
    setIsEditingStructure(false);
  }

  const handleAddNewEmployee = (newEmployeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...newEmployeeData,
      id: new Date().toISOString(), // Simple unique ID for mock data
    };
    setEmployees(prevEmployees => [newEmployee, ...prevEmployees]);
    setInitialEmployees(prev => [newEmployee, ...prev]);
    setIsCreating(false);
    setSelectedEmployee(null);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    const newEmployees = employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp);
    setEmployees(newEmployees);

    if (session?.role === 'employee') {
      setSelectedEmployee(updatedEmployee);
    } else {
        const newInitialEmployees = initialEmployees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp);
        setInitialEmployees(newInitialEmployees);
        setSelectedEmployee(null);
    }
    setIsCreating(false);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    setInitialEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    handleBackToList();
  }

  const handleImportEmployees = (newEmployees: Employee[]) => {
    const existingLegajos = new Set(employees.map(e => e.empresa.legajo));
    const uniqueNewEmployees = newEmployees.filter(ne => !existingLegajos.has(ne.empresa.legajo));

    setEmployees(prev => [...prev, ...uniqueNewEmployees]);
    setInitialEmployees(prev => [...prev, ...uniqueNewEmployees]);
    setIsImporting(false);
  }

  const { filteredEmployees, listTitle } = useMemo(() => {
    let employeesToList = initialEmployees;
    let newTitle = session?.role === 'admin' ? "Lista de Empleados (Todos)" : "Lista de Mi Equipo";

    if (viewLevel === 'departments' && !selectedDepartment) {
        // Vista general, no hacer nada, ya está en todos
    } else if (viewLevel === 'sectors' && selectedDepartment && !selectedSector) {
        employeesToList = initialEmployees.filter(e => e.empresa.dependencia === selectedDepartment);
        newTitle = `Empleados en ${selectedDepartment}`;
    } else if (viewLevel === 'sectors' && selectedDepartment && selectedSector) {
        employeesToList = initialEmployees.filter(e => e.empresa.dependencia === selectedDepartment && e.empresa.sector === selectedSector);
        newTitle = `Empleados en Sector ${selectedSector}`;
    }

    if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        employeesToList = employeesToList.filter(employee =>
            employee.name.toLowerCase().includes(lowerCaseSearch) ||
            employee.empresa.legajo.toLowerCase().includes(lowerCaseSearch) ||
            employee.empresa.tarea.toLowerCase().includes(lowerCaseSearch) ||
            (employee.empresa.sector || '').toLowerCase().includes(lowerCaseSearch) ||
            (employee.empresa.dependencia || '').toLowerCase().includes(lowerCaseSearch)
        );
    }

    return { filteredEmployees: employeesToList, listTitle: newTitle };

  }, [searchTerm, initialEmployees, viewLevel, selectedDepartment, selectedSector, session]);

  if (!session) {
      return (
          <div className="flex justify-center items-center h-full">
              <p>Cargando legajos...</p>
          </div>
      );
  }

  if (selectedEmployee) {
    return <EmployeeProfileDetail
                employee={selectedEmployee}
                onBack={handleBackToList}
                onSave={(updated) => handleUpdateEmployee(updated as Employee)}
                onDelete={handleDeleteEmployee}
                structure={structure}
                onDownload={handleDownload}
                puestos={tareas}
                sectores={sectores}
                dependencias={dependencias}
                categorias={categorias}
            />;
  }

  if (isCreating) {
    return <EmployeeProfileDetail
                onBack={handleBackToList}
                onSave={(created) => handleAddNewEmployee(created as Omit<Employee, 'id'>)}
                structure={structure}
                puestos={tareas}
                sectores={sectores}
                dependencias={dependencias}
                categorias={categorias}
            />;
  }

  if (isEditingStructure) {
    return <EmployeeStructureAdmin
              onBack={handleBackToList}
              structure={structure}
              onStructureChange={handleStructureChange}
              onFieldDelete={handleStructureFieldDelete}
            />;
  }

  return (
    <>
    <EmployeeListModal
      isOpen={modalInfo.isOpen}
      onClose={() => setModalInfo({isOpen: false, title: '', employees: []})}
      title={modalInfo.title}
      employees={modalInfo.employees}
      onEmployeeSelect={handleSelectEmployeeFromModal}
    />
    <EmployeeImportModal
      isOpen={isImporting}
      onClose={() => setIsImporting(false)}
      onImport={handleImportEmployees}
      structure={structure}
    />
    <div className="space-y-6">
       <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Legajos Digitales</h1>
            <p className="text-muted-foreground mt-2">
                {session.role === 'admin'
                  ? 'Busca y gestiona la información y documentación de los empleados.'
                  : `Gestiona la información de tu equipo.`
                }
            </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {session.role === 'admin' && (
            <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <ChevronsUpDown className="mr-2 h-4 w-4" />
                  Importar / Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsImporting(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar desde XLSX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportAllToXLSX}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Empleados a XLSX
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditingStructure(true)}>
                  <Settings2 className="mr-2 h-4 w-4" />
                  Modificar Estructura de Legajos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar Empleado
            </Button>
            </>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
              <CardHeader className="text-center">
                  <CardTitle>Actividad {session.role === 'admin' ? 'Empleados' : 'de Mi Equipo'}</CardTitle>
                   <div className="text-base font-medium text-foreground">{getMonthYear()}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                     <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => handleOpenModal('active')}>
                        <div className="flex items-center gap-3">
                            <UserCheck className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">Activos</span>
                        </div>
                        <span className="text-lg font-bold">{stats.active}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => handleOpenModal('inactiveThisMonth')}>
                        <div className="flex items-center gap-3">
                            <UserX className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">Bajas en el Mes</span>
                        </div>
                        <span className="text-lg font-bold">{stats.inactiveThisMonth}</span>
                    </div>
                     <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => handleOpenModal('totalDelMes')}>
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">Total del Mes</span>
                        </div>
                        <span className="text-lg font-bold">{stats.totalDelMes}</span>
                    </div>
                  </div>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="text-center">
                  <CardTitle>Empleados Totales {session.role === 'admin' ? 'del Sistema' : 'de Mi Equipo'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                     <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => handleOpenModal('active')}>
                        <div className="flex items-center gap-3">
                            <UserCheck className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">Activos</span>
                        </div>
                        <span className="text-lg font-bold">{stats.active}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => handleOpenModal('inactive')}>
                        <div className="flex items-center gap-3">
                            <UserRoundX className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">Inactivos</span>
                        </div>
                        <span className="text-lg font-bold">{stats.inactive}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => handleOpenModal('total')}>
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">Totales</span>
                        </div>
                        <span className="text-lg font-bold">{stats.total}</span>
                    </div>
              </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
           <Card>
               <CardHeader className="text-center">
                  <CardTitle>{getChartTitle()}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center">
                {getChartData().length > 0 ? (
                  <PieChart
                    chartData={getChartData()}
                    title={getChartTitle()}
                    onSliceClick={handleChartClick}
                    onBack={viewLevel === 'sectors' ? handleBackToDepartments : undefined}
                    showPercentages={true}
                  />
                ) : (
                  <div className="text-center text-muted-foreground py-10">
                    No hay datos de empleados para mostrar en el gráfico.
                  </div>
                )}
              </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center">
                <CardTitle>{listTitle}</CardTitle>
                <CardDescription>
                    <Input
                        placeholder="Buscar por nombre, legajo, tarea, etc."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm mt-2 mx-auto"
                    />
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Legajo</TableHead>
                                <TableHead>Nombre y Apellido</TableHead>
                                <TableHead className="hidden sm:table-cell">Tarea</TableHead>
                                <TableHead className="hidden md:table-cell">Departamento</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.map(employee => (
                                <TableRow key={employee.id} onClick={() => setSelectedEmployee(employee)} className="cursor-pointer">
                                    <TableCell className="font-medium">{employee.empresa.legajo}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 border">
                                                <AvatarImage src={employee.avatar} alt={employee.name} data-ai-hint="person face" />
                                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{employee.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">{employee.empresa.tarea}</TableCell>
                                    <TableCell className="hidden md:table-cell">{employee.empresa.dependencia}</TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => handleDownload('pdf', employee)}>
                                                    <FileDown className="mr-2 h-4 w-4"/>
                                                    Descargar PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleDownload('xlsx', employee)}>
                                                    <File className="mr-2 h-4 w-4"/>
                                                    Descargar XLSX
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
