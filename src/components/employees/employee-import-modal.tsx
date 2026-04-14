'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileDown, AlertTriangle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Employee, Structure } from '@/lib/definitions';
import { emptyEmployee } from './employee-profile-detail';
import { headerMapping, getHeaders } from '@/lib/definitions';


interface EmployeeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (employees: Employee[]) => void;
  structure: Structure;
}

const PREVIEW_ROWS = 5;

// Function to set a value in a nested object based on a path string
const set = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    if (typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  if (keys.length > 0) {
      const lastKey = keys[keys.length - 1];
      if (lastKey !== '__proto__' && lastKey !== 'constructor' && lastKey !== 'prototype') {
        // Convert boolean-like strings to actual booleans for 'trabaja' fields
        if (lastKey === 'trabaja' && typeof value === 'string') {
            current[lastKey] = value.toLowerCase() === 'true';
        } else {
            current[lastKey] = value;
        }
      }
  }
};

export function EmployeeImportModal({ isOpen, onClose, onImport, structure }: EmployeeImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateExcelTemplate = () => {
    const headers = getHeaders(structure);
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empleados");
    XLSX.writeFile(wb, "plantilla_importacion_empleados.xlsx");
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Por favor, sube un archivo en formato XLSX.');
        setFile(null);
        setParsedData([]);
        return;
      }
      setFile(selectedFile);
      setError(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'dd/mm/yyyy' });

          if (jsonData.length < 1) {
              setError('El archivo está vacío o no tiene datos.');
              return;
          }

          const friendlyHeaderToPathMap = new Map<string, string>();
          headerMapping.forEach(h => friendlyHeaderToPathMap.set(h.friendlyName, h.path));
          
          const customPersonalFields = new Set(structure["Datos Personales"]["Datos Adicionales"].map(f => f.name));
          const customEmpresaFields = new Set(structure["Datos de la Empresa"]["Datos Adicionales"].map(f => f.name));

          const newEmployees: Employee[] = jsonData.map((row: any, index: number) => {
            const employeeTemplate = JSON.parse(JSON.stringify(emptyEmployee)); // Deep copy
            
            for (const friendlyHeader in row) {
                const value = row[friendlyHeader];
                 if (value !== undefined && value !== null && value !== '') {
                    const path = friendlyHeaderToPathMap.get(friendlyHeader);
                    if (path) {
                        set(employeeTemplate, path, value);
                    } else if (customPersonalFields.has(friendlyHeader)) {
                        set(employeeTemplate, `personal.customFields.${friendlyHeader}`, value);
                    } else if (customEmpresaFields.has(friendlyHeader)) {
                        set(employeeTemplate, `empresa.customFields.${friendlyHeader}`, value);
                    }
                 }
            }

            return {
                ...employeeTemplate,
                id: `import-${new Date().getTime()}-${index}`, // Temporary ID
            };
          });
          setParsedData(newEmployees);
        } catch (err: any) {
           setError(`Error al procesar el archivo: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleImportClick = () => {
    onImport(parsedData);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Importar Empleados desde Excel</DialogTitle>
          <DialogDescription>
            Sube un archivo XLSX para agregar múltiples legajos al sistema. Asegúrate de que las columnas coincidan con la plantilla.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="space-y-2">
                <Button onClick={generateExcelTemplate} variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Descargar Plantilla XLSX
                </Button>
                <p className="text-xs text-muted-foreground">
                    Usa esta plantilla para asegurar que tu archivo tiene el formato y las columnas correctas.
                </p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="excel-file">Sube tu archivo Excel</Label>
                <div className="flex items-center gap-2">
                    <Input id="excel-file" type="file" accept=".xlsx" onChange={handleFileChange} className="max-w-sm"/>
                    {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {parsedData.length > 0 && (
                <div className="space-y-4">
                    <Alert variant="default" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 dark:text-green-300">Archivo Procesado Correctamente</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400">
                            Se encontraron {parsedData.length} empleados en el archivo. Revisa la previsualización de abajo antes de importar.
                        </AlertDescription>
                    </Alert>

                    <h3 className="font-semibold">Previsualización de Datos</h3>
                    <ScrollArea className="h-64 border rounded-md">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted">
                                <TableRow>
                                    <TableHead>Legajo</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>DNI</TableHead>
                                    <TableHead>Tarea</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedData.slice(0, PREVIEW_ROWS).map((employee, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{employee.empresa.legajo || 'N/A'}</TableCell>
                                        <TableCell>{employee.name || 'N/A'}</TableCell>
                                        <TableCell>{employee.personal.dni || 'N/A'}</TableCell>
                                        <TableCell>{employee.empresa.tarea || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                                {parsedData.length > PREVIEW_ROWS && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            y {parsedData.length - PREVIEW_ROWS} más...
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleImportClick} disabled={parsedData.length === 0}>
            Confirmar Importación ({parsedData.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
