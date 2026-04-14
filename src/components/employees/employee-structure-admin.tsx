'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import type { Structure, CustomField, FieldType } from '@/lib/definitions';


interface EmployeeStructureAdminProps {
  onBack: () => void;
  structure: Structure;
  onStructureChange: (section: 'Datos Personales' | 'Datos de la Empresa', newField: CustomField) => void;
  onFieldDelete: (section: 'Datos Personales' | 'Datos de la Empresa', fieldName: string) => void;
}

interface NewFieldInfo {
  name: string;
  type: FieldType;
  defaultValue?: string;
}

interface ModalState {
    isOpen: boolean;
    section: 'Datos Personales' | 'Datos de la Empresa' | null;
}

interface DeleteState {
    field: CustomField | null;
    section: 'Datos Personales' | 'Datos de la Empresa' | null;
}

export function EmployeeStructureAdmin({ onBack, structure, onStructureChange, onFieldDelete }: EmployeeStructureAdminProps) {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, section: null });
  const [newFieldInfo, setNewFieldInfo] = useState<Partial<NewFieldInfo>>({});
  const [deleteState, setDeleteState] = useState<DeleteState>({ field: null, section: null });
  
  const handleOpenModal = (section: 'Datos Personales' | 'Datos de la Empresa') => {
    setNewFieldInfo({ type: 'Texto', defaultValue: '' });
    setModalState({ isOpen: true, section });
  }

  const handleSaveNewField = () => {
    if (newFieldInfo.name && newFieldInfo.type && modalState.section) {
      onStructureChange(modalState.section, newFieldInfo as CustomField);
      setModalState({ isOpen: false, section: null });
      setNewFieldInfo({});
    } else {
        alert("Por favor, complete el nombre y el tipo del campo.");
    }
  }
  
  const handleOpenDeleteDialog = (section: 'Datos Personales' | 'Datos de la Empresa', field: CustomField) => {
    setDeleteState({ field, section });
  }

  const handleDeleteConfirm = () => {
    if (deleteState.field && deleteState.section) {
      onFieldDelete(deleteState.section, deleteState.field.name);
      setDeleteState({ field: null, section: null });
    }
  }
  
  const renderCustomFieldsSection = (
    sectionTitle: 'Datos Personales' | 'Datos de la Empresa', 
    fields: CustomField[]
  ) => (
     <AccordionItem value={`item-adicionales-${sectionTitle.replace(/\s/g, '')}`}>
        <div className="flex justify-between items-center w-full">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline flex-1 text-left">
                <span>Datos Adicionales</span>
            </AccordionTrigger>
            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(sectionTitle)} className="mr-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Campo
            </Button>
        </div>
         <AccordionContent className="pl-4 pt-2">
            {fields.length === 0 ? (
               <p className="text-sm text-muted-foreground py-2">No hay campos personalizados definidos. Puede agregar uno con el botón de arriba.</p>
            ) : (
              <ul className="list-inside space-y-2 text-muted-foreground">
                  {fields.map(field => (
                    <li key={field.name} className="flex items-center justify-between group">
                        <span>{field.name} <span className="text-xs text-muted-foreground/70">({field.type})</span></span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleOpenDeleteDialog(sectionTitle, field)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </li>
                  ))}
              </ul>
            )}
        </AccordionContent>
     </AccordionItem>
  )


  return (
    <>
      <Dialog open={modalState.isOpen} onOpenChange={() => setModalState({ isOpen: false, section: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Campo a "{modalState.section}"</DialogTitle>
            <DialogDescription>
              Defina las propiedades del nuevo campo que se agregará a todos los legajos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="field-name">Nombre del Campo</Label>
              <Input 
                id="field-name" 
                placeholder="Ej: Talle de Camisa"
                value={newFieldInfo.name || ''}
                onChange={(e) => setNewFieldInfo(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="field-type">Tipo de Campo</Label>
              <Select
                value={newFieldInfo.type}
                onValueChange={(value: FieldType) => setNewFieldInfo(prev => ({...prev, type: value}))}
              >
                <SelectTrigger id="field-type">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Texto">Texto</SelectItem>
                  <SelectItem value="Número">Número</SelectItem>
                  <SelectItem value="Fecha">Fecha</SelectItem>
                  <SelectItem value="Alfanumérico">Alfanumérico</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="field-default-value">Valor por Defecto (Opcional)</Label>
              <Input 
                id="field-default-value" 
                placeholder="Ej: Sin especificar"
                value={newFieldInfo.defaultValue || ''}
                onChange={(e) => setNewFieldInfo(prev => ({...prev, defaultValue: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSaveNewField}>Guardar Campo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deleteState.field} onOpenChange={() => setDeleteState({ field: null, section: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este campo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminará el campo <span className="font-bold">"{deleteState.field?.name}"</span> y todos los datos asociados de CADA legajo de empleado en la sección <span className="font-bold">{deleteState.section}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Eliminar Campo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    <div className="space-y-6">
      <header>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>
        <h1 className="text-3xl font-bold font-headline">Modificar Información de Legajos</h1>
        <p className="text-muted-foreground mt-2">
          Agregue o elimine campos personalizados en las diferentes secciones del legajo.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Estructura Actual del Legajo</CardTitle>
          <CardDescription>
            Aquí puede visualizar la estructura fija y agregar o eliminar campos de las secciones de datos adicionales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full" defaultValue={['item-Datos Personales', 'item-Datos de la Empresa']}>
            {Object.entries(structure).filter(([key]) => key !== 'Documentación').map(([sectionTitle, content]) => (
              <AccordionItem value={`item-${sectionTitle.replace(/\s/g, '')}`} key={sectionTitle}>
                <AccordionTrigger className="text-xl font-headline hover:no-underline flex-1 text-left">
                    <span>{sectionTitle}</span>
                </AccordionTrigger>
                <AccordionContent className="pl-4 pt-2">
                    <Accordion type="multiple" className="w-full" defaultValue={['sub-item-0']}>
                       {Object.entries(content).map(([subSectionTitle, fields], subIndex) => {
                            if (subSectionTitle === 'Datos Adicionales') {
                                return renderCustomFieldsSection(sectionTitle as 'Datos Personales' | 'Datos de la Empresa', fields as CustomField[]);
                            }
                            return (
                                <AccordionItem value={`sub-item-${subIndex}`} key={subIndex}>
                                <AccordionTrigger className="flex-1 text-left font-semibold">
                                    <span>{subSectionTitle}</span>
                                </AccordionTrigger>
                                <AccordionContent className="pl-4 pt-2">
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {(fields as string[]).map(field => <li key={field}>{field}</li>)}
                                    </ul>
                                </AccordionContent>
                                </AccordionItem>
                            );
                       })}
                    </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
