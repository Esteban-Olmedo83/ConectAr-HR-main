
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Employee, DiaLaboral, Sucursal, Structure, Documento } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Camera, Download, FileDown, FilePlus, Pencil, PlusCircle, Save, Trash2, Upload, XCircle, File, ChevronsUpDown, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { obrasSociales as initialObrasSociales } from '@/lib/obras-sociales';
import { artList as initialArtList } from '@/lib/art';
import { conveniosList as initialConveniosList } from '@/lib/convenios';
import { CameraCapture } from '@/components/camera-capture';
import { mockEmployees } from '@/lib/mock-data';
import { getSession } from '@/lib/session';
import { CommentThread } from '@/components/comments/comment-thread';


const getStatus = (fechaEgreso: string | null) => {
  return fechaEgreso ? { text: 'Baja', variant: 'destructive' as const } : { text: 'Activo', variant: 'default' as const };
}

function DataRow({ label, value, isEditing, onChange, children, type = 'text', maxLength, disabled = false }: { label: string, value?: string | number | React.ReactNode | undefined | null, isEditing: boolean, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, children?: React.ReactNode, type?: string, maxLength?: number, disabled?: boolean }) {
    const id = `input-${label.toLowerCase().replace(/\s/g, '-')}`;
    const finalIsEditing = isEditing && !disabled;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b items-center">
            <Label htmlFor={id} className="font-medium text-muted-foreground">{label}</Label>
            <div className="col-span-2">
                {finalIsEditing && typeof value !== 'object' ? (
                    children || <Input id={id} name={id} value={value?.toString() || ''} onChange={onChange} className="text-sm" type={type} maxLength={maxLength} disabled={disabled} />
                ) : (
                    <div className="text-sm">{value || '-'}</div>
                )}
            </div>
        </div>
    );
}

export const emptyEmployee: Omit<Employee, 'id'> = {
    name: '',
    email: '',
    avatar: 'https://avatar.iran.liara.run/public',
    fechaEgreso: null,
    reportaA: null,
    ultimaModificacion: null,
    personal: {
        fechaNacimiento: '', nacionalidad: '', cuil: '', dni: '', sexo: '', estadoCivil: '',
        domicilio: { calle: '', numero: '', piso: '', depto: '', localidad: '', provincia: '', cp: '' },
        telefono: '',
        customFields: {}
    },
    empresa: {
        legajo: '', fechaIngreso: '', antiguedad: '', categoria: '', tarea: '', sector: '',
        dependencia: '',
        horario: {
            tipo: 'Presencial',
            dias: {
                lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' },
                martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' },
                miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' },
                jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' },
                viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' },
                sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' },
                domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }
            },
            sucursalFijo: 'Sucursal Principal'
        },
        customFields: {}
    },
    registracion: {
        modalidadContrato: '', obraSocial: { codigo: '000000', descripcion: 'Ninguna'}, art: '', situacionRevista: '', regimen: '',
        tipoServicio: '', convenioColectivo: '', puesto: '', retribucionPactada: '', modalidadLiquidacion: '',
        domicilioExplotacion: '', actividadEconomica: ''
    },
    bancarios: { banco: '', cuenta: '', cbu: '', alias: '' },
    documentacion: [],
};


interface EmployeeProfileDetailProps {
    employee?: Employee;
    onBack: () => void;
    onSave: (employee: Employee | Omit<Employee, 'id'>) => void;
    onDelete?: (employeeId: string) => void;
    structure: Structure;
    onDownload?: (format: 'pdf' | 'xlsx', employee: Employee) => void;
    puestos: string[];
    sectores: string[];
    dependencias: string[];
    categorias: string[];
}

export function EmployeeProfileDetail({ employee, onBack, onSave, onDelete, structure, onDownload, puestos, sectores, dependencias, categorias }: EmployeeProfileDetailProps) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const [isEditing, setIsEditing] = useState(!employee);
  const [editableEmployee, setEditableEmployee] = useState<Employee | Omit<Employee, 'id'>>(() => {
    if (employee) {
        const withCustomFields = { ...employee };
        if (!withCustomFields.personal.customFields) withCustomFields.personal.customFields = {};
        if (!withCustomFields.empresa.customFields) withCustomFields.empresa.customFields = {};

        structure["Datos Personales"]["Datos Adicionales"].forEach(field => {
            if (!(field.name in withCustomFields.personal.customFields)) {
                withCustomFields.personal.customFields[field.name] = field.defaultValue || '';
            }
        });
         structure["Datos de la Empresa"]["Datos Adicionales"].forEach(field => {
            if (!(field.name in withCustomFields.empresa.customFields)) {
                withCustomFields.empresa.customFields[field.name] = field.defaultValue || '';
            }
        });
        return withCustomFields;
    }
    const newEmployee = JSON.parse(JSON.stringify(emptyEmployee));
    newEmployee.personal.customFields = {};
    newEmployee.empresa.customFields = {};

    structure["Datos Personales"]["Datos Adicionales"].forEach(field => {
        newEmployee.personal.customFields[field.name] = field.defaultValue || '';
    });
    structure["Datos de la Empresa"]["Datos Adicionales"].forEach(field => {
        newEmployee.empresa.customFields[field.name] = field.defaultValue || '';
    });
    return newEmployee;
  });

  const [obrasSociales, setObrasSociales] = useState(initialObrasSociales);
  const [isOsModalOpen, setIsOsModalOpen] = useState(false);
  const [newOs, setNewOs] = useState({ codigo: '', descripcion: '' });

  const [artList, setArtList] = useState(initialArtList);
  const [isArtModalOpen, setIsArtModalOpen] = useState(false);
  const [newArt, setNewArt] = useState('');

  const [convenios, setConvenios] = useState(initialConveniosList);
  const [isConvenioModalOpen, setIsConvenioModalOpen] = useState(false);
  const [newConvenio, setNewConvenio] = useState('');

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [newDocument, setNewDocument] = useState<{ file: File | null; name: string, dataUrl: string | null }>({ file: null, name: '', dataUrl: null });


  const isNew = !employee;
  const status = getStatus(editableEmployee.fechaEgreso);

  // Permissions Logic
  const viewingOwnProfile = session?.userId === (employee as Employee)?.id;
  const isManagerViewingReport = session?.isManager && employee?.reportaA === session.userId;

  const canEditAnyPersonalData = session?.role === 'admin' || viewingOwnProfile;

  const canEditCompanyData = session?.role === 'admin';
  const canEditSchedule = session?.role === 'admin' || isManagerViewingReport;
  const canEditRegistracionBancarios = session?.role === 'admin';

  const canEditProfile = canEditAnyPersonalData || canEditCompanyData || canEditSchedule;
  const canViewDocumentation = session?.role === 'admin' || viewingOwnProfile;
  const canEditDocumentation = session?.role === 'admin' || viewingOwnProfile;
  const canExportData = session?.role === 'admin';
  const canEditHierarchy = session?.role === 'admin';


  const superiorName = editableEmployee.reportaA
    ? mockEmployees.find(e => e.id === editableEmployee.reportaA)
    : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (part: 'registracion' | 'bancarios' , field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditableEmployee(prev => {
        const updatedPart = { ...(prev as Employee)[part], [field]: value };
        return { ...prev, [part]: updatedPart };
    });
  };

  const handleCustomFieldChange = (section: 'personal' | 'empresa', key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditableEmployee(prev => ({
      ...prev,
      [section]: {
          ...(prev as Employee)[section],
          customFields: {
            ...(prev as Employee)[section].customFields,
            [key]: value
          }
      }
    }));
  };

  const handleEmpresaInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditableEmployee(prev => ({
        ...prev,
        empresa: { ...(prev as Employee).empresa, [field]: value }
    }));
  };

  const handleSelectChange = (part: 'registracion' | 'empresa', field: string) => (value: string) => {
     setEditableEmployee(prev => {
        const updatedPart = { ...(prev as Employee)[part], [field]: value };
        return { ...prev, [part]: updatedPart };
    });
  }

  const handleObraSocialChange = (codigo: string) => {
    const obraSocialSeleccionada = obrasSociales.find(os => os.codigo === codigo);
    if (obraSocialSeleccionada) {
        setEditableEmployee(prev => ({
            ...prev,
            registracion: {
                ...(prev as Employee).registracion,
                obraSocial: obraSocialSeleccionada
            }
        }));
    }
  }

  const handleAddNewObraSocial = () => {
    if (newOs.codigo && newOs.descripcion) {
      const nuevaOS = { ...newOs };
      setObrasSociales(prev => [...prev, nuevaOS]);
      handleObraSocialChange(nuevaOS.codigo);
      setIsOsModalOpen(false);
      setNewOs({ codigo: '', descripcion: '' });
    }
  };

  const handleAddNewArt = () => {
    if (newArt) {
      setArtList(prev => [...prev, newArt]);
      handleSelectChange('registracion', 'art')(newArt);
      setIsArtModalOpen(false);
      setNewArt('');
    }
  }

  const handleAddNewConvenio = () => {
    if (newConvenio) {
      setConvenios(prev => [...prev, newConvenio]);
      handleSelectChange('registracion', 'convenioColectivo')(newConvenio);
      setIsConvenioModalOpen(false);
      setNewConvenio('');
    }
  }

  const handleHorarioInputChange = (field: 'tipo' | 'sucursalFijo') => (value: any) => {
    setEditableEmployee(prev => ({
        ...prev,
        empresa: {
            ...(prev as Employee).empresa,
            horario: {
                ...(prev as Employee).empresa.horario,
                [field]: value
            }
        }
    }));
  };

  const handleDiaChange = (dia: keyof Employee['empresa']['horario']['dias']) => (checked: boolean) => {
     setEditableEmployee(prev => ({
        ...prev,
        empresa: {
            ...(prev as Employee).empresa,
            horario: {
                ...(prev as Employee).empresa.horario,
                dias: {
                    ...(prev as Employee).empresa.horario.dias,
                    [dia]: { ...(prev as Employee).empresa.horario.dias[dia], trabaja: checked }
                }
            }
        }
    }));
  }

  const handleDiaSucursalChange = (dia: keyof Employee['empresa']['horario']['dias']) => (value: Sucursal) => {
     setEditableEmployee(prev => ({
        ...prev,
        empresa: {
            ...(prev as Employee).empresa,
            horario: {
                ...(prev as Employee).empresa.horario,
                dias: {
                    ...(prev as Employee).empresa.horario.dias,
                    [dia]: { ...(prev as Employee).empresa.horario.dias[dia], sucursal: value }
                }
            }
        }
    }));
  }

  const handleDiaHorarioChange = (dia: keyof Employee['empresa']['horario']['dias'], tipo: 'horarioEntrada' | 'horarioSalida') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditableEmployee(prev => ({
        ...prev,
        empresa: {
            ...(prev as Employee).empresa,
            horario: {
                ...(prev as Employee).empresa.horario,
                dias: {
                    ...(prev as Employee).empresa.horario.dias,
                    [dia]: { ...(prev as Employee).empresa.horario.dias[dia], [tipo]: value }
                }
            }
        }
    }));
  }


  const handlePersonalInputChange = (field: keyof Omit<Employee['personal'], 'domicilio' | 'customFields'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditableEmployee(prev => ({
        ...prev,
        personal: { ...(prev as Employee).personal, [field]: value }
    }));
  };

  const handleNestedInputChange = (part: 'personal', nestedPart: 'domicilio', field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditableEmployee(prev => {
        const updatedNestedPart = { ...(prev as Employee)[part][nestedPart], [field]: value };
        const updatedPart = { ...(prev as Employee)[part], [nestedPart]: updatedNestedPart };
        return { ...prev, [part]: updatedPart };
    });
  };

  const handleSimpleInputChange = (field: 'name' | 'email' | 'fechaEgreso' | 'avatar') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setEditableEmployee(prev => ({...prev, [field]: value === '' && (field === 'fechaEgreso') ? null : value }));
  }

  const handleReportaAChange = (value: string) => {
    setEditableEmployee(prev => ({ ...prev, reportaA: value === 'ninguno' ? null : value }));
  }

  const handleSave = () => {
    let finalEmployee = {...editableEmployee};
    if (session.role === 'employee' || session.role === 'manager' || session.role === 'admin') {
        finalEmployee = { ...finalEmployee, ultimaModificacion: new Date().toISOString() };
    }
    onSave(finalEmployee as Employee);
    setIsEditing(false);
  };

  const handleDeleteConfirm = () => {
    if (employee && onDelete) {
        onDelete(employee.id);
    }
  }

  const handleCancel = () => {
    if (isNew) {
      onBack();
    } else {
      if (employee) {
        setEditableEmployee(employee);
      }
      setIsEditing(false);
    }
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setNewDocument({ file, name: file.name.replace(/\.[^/.]+$/, ""), dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDocument = () => {
    if (newDocument.file && newDocument.name && newDocument.dataUrl) {
      const newDoc: Documento = {
        id: `doc-${new Date().getTime()}`,
        nombre: newDocument.name,
        nombreOriginal: newDocument.file.name,
        tipo: newDocument.file.type,
        fechaSubida: new Date().toLocaleDateString('es-ES'),
        url: newDocument.dataUrl
      };
      setEditableEmployee(prev => ({
        ...prev,
        documentacion: [...(prev as Employee).documentacion, newDoc]
      }));
      setIsDocumentModalOpen(false);
      setNewDocument({ file: null, name: '', dataUrl: null });
    }
  };

  const handleDeleteDocument = (docId: string) => {
    setEditableEmployee(prev => ({
        ...prev,
        documentacion: (prev as Employee).documentacion.filter(doc => doc.id !== docId)
    }));
    setDocumentToDelete(null);
  }

   const handleDownloadDocument = (doc: Documento) => {
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.nombreOriginal;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setEditableEmployee(prev => ({ ...prev, avatar: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoTaken = (imageSrc: string) => {
    setEditableEmployee(prev => ({ ...prev, avatar: imageSrc }));
    setIsCameraOpen(false);
    setIsAvatarModalOpen(false);
  };


  const diasSemana: (keyof Employee['empresa']['horario']['dias'])[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const sucursales: Sucursal[] = ['Sucursal Principal', 'Sucursal Externa', 'Home Office', 'No aplica'];

  const managers = mockEmployees.filter(e => e.empresa.categoria.toLowerCase().includes('manager') || e.empresa.categoria.toLowerCase().includes('lead') || e.empresa.categoria.toLowerCase().includes('gerente') || e.empresa.categoria.toLowerCase().includes('jefe'));


  return (
    <>
    {/* --- DIALOGS --- */}
    <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Actualizar Foto de Perfil</DialogTitle>
                <DialogDescription>
                    Elige una de las siguientes opciones para cambiar el avatar del empleado.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="avatar-url">Pegar URL de la imagen</Label>
                    <Input
                        id="avatar-url"
                        value={editableEmployee.avatar}
                        onChange={handleSimpleInputChange('avatar')}
                    />
                     <p className="text-xs text-muted-foreground px-1">La imagen se actualizará en tiempo real.</p>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">O</span>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Input
                        id="file-upload"
                        type="file"
                        ref={uploadInputRef}
                        className="hidden"
                        onChange={handleImageUpload}
                        accept="image/png, image/jpeg"
                    />
                    <Button variant="outline" className="w-full justify-start" onClick={() => uploadInputRef.current?.click()}>
                        <Upload className="mr-2"/> Subir desde el dispositivo
                    </Button>
                    <p className="text-xs text-muted-foreground px-1">Sube un archivo JPG o PNG.</p>
                 </div>
                 <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setIsCameraOpen(true)}>
                        <Camera className="mr-2"/> Usar cámara
                    </Button>
                    <p className="text-xs text-muted-foreground px-1">Permite el acceso a tu cámara para tomar una foto.</p>
                 </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button">Aceptar</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent>
             <DialogHeader>
                <DialogTitle>Capturar Foto desde Cámara</DialogTitle>
            </DialogHeader>
            <CameraCapture onPhotoTaken={handlePhotoTaken} />
        </DialogContent>
    </Dialog>


    <Dialog open={isOsModalOpen} onOpenChange={setIsOsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Agregar Nueva Obra Social</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="os-codigo" className="text-right">Código</Label>
                    <Input id="os-codigo" value={newOs.codigo} onChange={(e) => setNewOs(prev => ({...prev, codigo: e.target.value}))} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="os-desc" className="text-right">Descripción</Label>
                    <Input id="os-desc" value={newOs.descripcion} onChange={(e) => setNewOs(prev => ({...prev, descripcion: e.target.value}))} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="button" onClick={handleAddNewObraSocial}>Guardar</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isArtModalOpen} onOpenChange={setIsArtModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Agregar Nueva ART</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="art-desc" className="text-right">Nombre</Label>
                    <Input id="art-desc" value={newArt} onChange={(e) => setNewArt(e.target.value)} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="button" onClick={handleAddNewArt}>Guardar</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isConvenioModalOpen} onOpenChange={setIsConvenioModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Agregar Nuevo Convenio</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="convenio-desc" className="text-right">Nombre</Label>
                    <Input id="convenio-desc" value={newConvenio} onChange={(e) => setNewConvenio(e.target.value)} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="button" onClick={handleAddNewConvenio}>Guardar</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Agregar Nuevo Documento</DialogTitle>
                <DialogDescription>
                    Selecciona un archivo y asígnale un nombre descriptivo.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="doc-file">Archivo</Label>
                    <Input
                        id="doc-file"
                        type="file"
                        onChange={handleDocumentFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                     {newDocument.file && <p className="text-xs text-muted-foreground">{newDocument.file.name}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="doc-name">Nombre del Documento</Label>
                    <Input
                        id="doc-name"
                        value={newDocument.name}
                        onChange={(e) => setNewDocument(prev => ({...prev, name: e.target.value, dataUrl: prev.dataUrl, file: prev.file }))}
                        placeholder="Ej: DNI Frente y Dorso"
                    />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                <Button onClick={handleAddDocument} disabled={!newDocument.file || !newDocument.name}>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Documento
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar este documento?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. El documento será eliminado permanentemente.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDocumentToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteDocument(documentToDelete!)}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
            {(session?.role !== 'employee' && !viewingOwnProfile) && (
                <Button variant="ghost" onClick={onBack} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Volver a la lista
                </Button>
            )}
            <h1 className="text-3xl font-bold font-headline">{isNew ? 'Agregar Nuevo Empleado' : `Legajo de ${employee?.name}`}</h1>
            <p className="text-muted-foreground mt-2">
                {isNew ? 'Complete los datos para dar de alta un nuevo legajo.' : 'Gestión de la información y documentación del empleado.'}
            </p>
        </div>
         <div className="flex gap-2 self-start md:self-auto">
            {!isNew && employee && onDownload && canExportData && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Ficha
                        <ChevronsUpDown className="ml-2 h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onDownload('pdf', employee)}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Descargar PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onDownload('xlsx', employee)}>
                        <File className="mr-2 h-4 w-4" />
                        Descargar XLSX
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
      </header>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start gap-6 space-y-0 p-6">
            <div className="relative group">
                <Avatar className="w-24 h-24 border">
                    <AvatarImage src={editableEmployee.avatar} alt={editableEmployee.name || ''} data-ai-hint="person face" />
                    <AvatarFallback>{editableEmployee.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                {isEditing && canEditDocumentation && (
                    <button onClick={() => setIsAvatarModalOpen(true)} className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Pencil className="w-6 h-6 text-white"/>
                    </button>
                )}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-4">
                    <CardTitle className="text-2xl font-headline">{isNew ? 'Nuevo Legajo' : editableEmployee.name}</CardTitle>
                     {!isNew && <Badge variant={status.variant}>{status.text}</Badge>}
                </div>
                <p className="text-muted-foreground">{editableEmployee.empresa.tarea || 'Tarea'} | {editableEmployee.empresa.sector || 'Sector'}</p>
                 {isEditing && !isNew && canEditDocumentation && (
                    <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Pasa el cursor sobre la imagen para cambiarla.</p>
                    </div>
                )}
            </div>
             <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> {isNew ? 'Crear Legajo' : 'Guardar Cambios'}
                  </Button>
                  <Button variant="ghost" onClick={handleCancel}>
                     <XCircle className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                    {session?.role === 'admin' && !viewingOwnProfile && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar Legajo
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el legajo
                                    de <span className="font-bold">{employee?.name}</span> de nuestros servidores.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConfirm}>Continuar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {canEditProfile && (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Legajo
                        </Button>
                    )}
                </div>
              )}
            </div>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="personal" className="w-full">
                <TabsList className="flex flex-col h-auto md:flex-row md:h-10 mb-4 w-full md:w-auto">
                    <TabsTrigger value="personal" className="w-full md:w-auto">Datos Personales</TabsTrigger>
                    <TabsTrigger value="empresa" className="w-full md:w-auto">Datos de la Empresa</TabsTrigger>
                    {canViewDocumentation && <TabsTrigger value="documentacion" className="w-full md:w-auto" disabled={isNew}>Documentación</TabsTrigger>}
                    {!isNew && <TabsTrigger value="notas" className="w-full md:w-auto">Notas</TabsTrigger>}
                </TabsList>

                <TabsContent value="personal" className="p-4 border rounded-md">
                     <Tabs defaultValue="personal-principales">
                        <TabsList className="flex flex-col sm:flex-row h-auto sm:h-10">
                           <TabsTrigger value="personal-principales">Datos Principales</TabsTrigger>
                           <TabsTrigger value="personal-adicionales">Datos Adicionales (Personales)</TabsTrigger>
                        </TabsList>
                         <TabsContent value="personal-principales" className="pt-4">
                            <dl className="text-sm">
                                <DataRow label="Nombre y Apellido" value={editableEmployee.name} isEditing={isEditing} onChange={handleSimpleInputChange('name')} disabled={!canEditCompanyData} />
                                <DataRow label="Email" value={editableEmployee.email} isEditing={isEditing} onChange={handleSimpleInputChange('email')} disabled={!canEditCompanyData} />
                                <DataRow label="Fecha de Nacimiento" value={editableEmployee.personal.fechaNacimiento} isEditing={isEditing} onChange={handlePersonalInputChange('fechaNacimiento')} disabled={!canEditAnyPersonalData}/>
                                <DataRow label="Nacionalidad" value={editableEmployee.personal.nacionalidad} isEditing={isEditing} onChange={handlePersonalInputChange('nacionalidad')} disabled={!canEditAnyPersonalData}/>
                                <DataRow label="CUIL" value={editableEmployee.personal.cuil} isEditing={isEditing} onChange={handlePersonalInputChange('cuil')} disabled={!canEditAnyPersonalData}/>
                                <DataRow label="DNI" value={editableEmployee.personal.dni} isEditing={isEditing} onChange={handlePersonalInputChange('dni')} disabled={!canEditAnyPersonalData}/>
                                <DataRow label="Sexo" value={editableEmployee.personal.sexo} isEditing={isEditing} disabled={!canEditAnyPersonalData}>
                                    <Select onValueChange={(value) => setEditableEmployee(prev => ({...prev, personal: {...(prev as Employee).personal, sexo: value}}))} value={editableEmployee.personal.sexo} disabled={!isEditing || !canEditAnyPersonalData}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar sexo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Femenino">Femenino</SelectItem>
                                            <SelectItem value="Masculino">Masculino</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                            <SelectItem value="Prefiero no decirlo">Prefiero no decirlo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </DataRow>
                                <DataRow label="Estado Civil" value={editableEmployee.personal.estadoCivil} isEditing={isEditing} onChange={handlePersonalInputChange('estadoCivil')} disabled={!canEditAnyPersonalData}/>
                                <DataRow label="Domicilio" value={`${editableEmployee.personal.domicilio.calle} ${editableEmployee.personal.domicilio.numero}`} isEditing={isEditing} onChange={handleNestedInputChange('personal', 'domicilio', 'calle')} disabled={!canEditAnyPersonalData}/>
                                <DataRow label="Piso" value={editableEmployee.personal.domicilio.piso} isEditing={isEditing} onChange={handleNestedInputChange('personal', 'domicilio', 'piso')} disabled={!canEditAnyPersonalData}/>
                                <DataRow label="Depto" value={editableEmployee.personal.domicilio.depto} isEditing={isEditing} onChange={handleNestedInputChange('personal', 'domicilio', 'depto')} disabled={!canEditAnyPersonalData}/>
                                <DataRow label="Localidad" value={editableEmployee.personal.domicilio.localidad} isEditing={isEditing} onChange={handleNestedInputChange('personal', 'domicilio', 'localidad')} disabled={!canEditAnyPersonalData}/>
                                <DataRow label="Provincia" value={editableEmployee.personal.domicilio.provincia} isEditing={isEditing} onChange={handleNestedInputChange('personal', 'domicilio', 'provincia')} disabled={!canEditAnyPersonalData}/>
                                <DataRow label="C.P." value={editableEmployee.personal.domicilio.cp} isEditing={isEditing} onChange={handleNestedInputChange('personal', 'domicilio', 'cp')} disabled={!canEditAnyPersonalData}/>
                                <DataRow label="Teléfono" value={editableEmployee.personal.telefono} isEditing={isEditing} onChange={handlePersonalInputChange('telefono')} disabled={!canEditAnyPersonalData}/>
                            </dl>
                        </TabsContent>
                         <TabsContent value="personal-adicionales" className="pt-4">
                             <dl className="text-sm">
                                {structure["Datos Personales"]["Datos Adicionales"].length > 0 ? structure["Datos Personales"]["Datos Adicionales"].map((field) => (
                                    <DataRow
                                        key={field.name}
                                        label={field.name}
                                        value={(editableEmployee.personal.customFields as any)?.[field.name] || ''}
                                        isEditing={isEditing}
                                        onChange={handleCustomFieldChange('personal', field.name)}
                                        type={field.type === 'Fecha' ? 'date' : field.type === 'Número' ? 'number' : 'text'}
                                        disabled={!canEditAnyPersonalData}
                                    />
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No hay datos adicionales para esta sección.</p>
                                )}
                            </dl>
                         </TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="empresa" className="p-4 border rounded-md">
                    <Tabs defaultValue="legajo">
                        <TabsList className="flex flex-col sm:flex-row h-auto sm:h-10">
                            <TabsTrigger value="legajo">Datos del Legajo</TabsTrigger>
                            <TabsTrigger value="horario">Horario y Asignación</TabsTrigger>
                            <TabsTrigger value="registracion">Datos de Registración</TabsTrigger>
                            <TabsTrigger value="bancarios">Datos Bancarios</TabsTrigger>
                            <TabsTrigger value="empresa-adicionales">Datos Adicionales (Empresa)</TabsTrigger>
                        </TabsList>
                        <TabsContent value="legajo" className="pt-4">
                            <dl className="text-sm">
                                <DataRow label="Nº de Legajo" value={editableEmployee.empresa.legajo} isEditing={isEditing} onChange={handleEmpresaInputChange('legajo')} disabled={!canEditCompanyData}/>
                                <DataRow label="Fecha de Ingreso" value={editableEmployee.empresa.fechaIngreso} isEditing={isEditing} onChange={handleEmpresaInputChange('fechaIngreso')} disabled={!canEditCompanyData}/>
                                <DataRow label="Fecha de Egreso" value={editableEmployee.fechaEgreso} isEditing={isEditing} onChange={handleSimpleInputChange('fechaEgreso')} disabled={!canEditCompanyData}/>
                                <DataRow label="Antigüedad" value={editableEmployee.empresa.antiguedad} isEditing={isEditing} onChange={handleEmpresaInputChange('antiguedad')} disabled={!canEditCompanyData}/>

                                <DataRow label="Categoría" value={editableEmployee.empresa.categoria} isEditing={isEditing} disabled={!canEditCompanyData}>
                                    <Select onValueChange={handleSelectChange('empresa', 'categoria')} value={editableEmployee.empresa.categoria} disabled={!isEditing || !canEditCompanyData}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar categoría"/></SelectTrigger>
                                        <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </DataRow>

                                <DataRow label="Tarea" value={editableEmployee.empresa.tarea} isEditing={isEditing} disabled={!canEditCompanyData}>
                                    <Select onValueChange={handleSelectChange('empresa', 'tarea')} value={editableEmployee.empresa.tarea} disabled={!isEditing || !canEditCompanyData}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar tarea"/></SelectTrigger>
                                        <SelectContent>{puestos.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                    </Select>
                                </DataRow>
                                <DataRow label="Sector" value={editableEmployee.empresa.sector} isEditing={isEditing} disabled={!canEditCompanyData}>
                                     <Select onValueChange={handleSelectChange('empresa', 'sector')} value={editableEmployee.empresa.sector} disabled={!isEditing || !canEditCompanyData}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar sector"/></SelectTrigger>
                                        <SelectContent>{sectores.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </DataRow>
                                <DataRow label="Dependencia" value={editableEmployee.empresa.dependencia} isEditing={isEditing} disabled={!canEditCompanyData}>
                                    <Select onValueChange={handleSelectChange('empresa', 'dependencia')} value={editableEmployee.empresa.dependencia} disabled={!isEditing || !canEditCompanyData}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar dependencia"/></SelectTrigger>
                                        <SelectContent>{dependencias.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                    </Select>
                                </DataRow>
                                <DataRow
                                    label="Reporta A"
                                    value={!isEditing && superiorName ? `${superiorName.name} | ${superiorName.empresa.tarea}` : (isEditing ? undefined : (superiorName ? `${superiorName.name} | ${superiorName.empresa.tarea}` : 'No aplica'))}
                                    isEditing={isEditing}
                                    disabled={!canEditHierarchy}
                                >
                                     <Select onValueChange={handleReportaAChange} value={editableEmployee.reportaA || 'ninguno'} disabled={!isEditing || !canEditHierarchy}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar superior" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ninguno">No reporta a nadie</SelectItem>
                                            {managers.map(manager => (
                                                <SelectItem key={manager.id} value={manager.id} disabled={manager.id === (employee as Employee)?.id}>
                                                   {manager.name} | {manager.empresa.tarea}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </DataRow>
                           </dl>
                        </TabsContent>
                        <TabsContent value="horario" className="pt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b items-center">
                                <Label className="font-medium text-muted-foreground">Tipo de Horario</Label>
                                <div className="col-span-2">
                                    {isEditing && canEditSchedule ? (
                                        <RadioGroup
                                            value={editableEmployee.empresa.horario.tipo}
                                            onValueChange={(value) => handleHorarioInputChange('tipo')(value as 'Presencial' | 'Híbrido')}
                                            className="flex gap-4"
                                            disabled={!isEditing || !canEditSchedule}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Presencial" id="r-presencial" />
                                                <Label htmlFor="r-presencial">Presencial</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Híbrido" id="r-hibrido" />
                                                <Label htmlFor="r-hibrido">Híbrido</Label>
                                            </div>
                                        </RadioGroup>
                                    ) : (
                                        <p className="text-sm">{editableEmployee.empresa.horario.tipo}</p>
                                    )}
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b items-start">
                                <Label className="font-medium text-muted-foreground pt-2">Días Laborales</Label>
                                <div className="col-span-2 space-y-3">
                                    {diasSemana.map(dia => (
                                        <div key={dia} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                            {isEditing && canEditSchedule ? (
                                                <>
                                                    <div className="flex items-center space-x-2 w-full sm:w-28">
                                                        <Checkbox
                                                            id={`c-${dia}`}
                                                            checked={editableEmployee.empresa.horario.dias[dia].trabaja}
                                                            onCheckedChange={(checked) => handleDiaChange(dia)(Boolean(checked))}
                                                            disabled={!isEditing || !canEditSchedule}
                                                        />
                                                        <Label htmlFor={`c-${dia}`} className="capitalize font-normal flex-1">{dia}</Label>
                                                    </div>
                                                     {editableEmployee.empresa.horario.dias[dia].trabaja && (
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {editableEmployee.empresa.horario.tipo === 'Híbrido' && (
                                                                <Select
                                                                    value={editableEmployee.empresa.horario.dias[dia].sucursal}
                                                                    onValueChange={(value: Sucursal) => handleDiaSucursalChange(dia)(value)}
                                                                    disabled={!isEditing || !canEditSchedule}
                                                                >
                                                                    <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
                                                                        <SelectValue placeholder="Sucursal" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {sucursales.filter(s => s !== 'No aplica').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                            <Input
                                                                type="time"
                                                                value={editableEmployee.empresa.horario.dias[dia].horarioEntrada}
                                                                onChange={(e) => handleDiaHorarioChange(dia, 'horarioEntrada')(e)}
                                                                className="w-[100px] h-8 text-xs"
                                                                aria-label={`Horario de entrada ${dia}`}
                                                                disabled={!isEditing || !canEditSchedule}
                                                            />
                                                            <Input
                                                                type="time"
                                                                value={editableEmployee.empresa.horario.dias[dia].horarioSalida}
                                                                onChange={(e) => handleDiaHorarioChange(dia, 'horarioSalida')(e)}
                                                                className="w-[100px] h-8 text-xs"
                                                                aria-label={`Horario de salida ${dia}`}
                                                                disabled={!isEditing || !canEditSchedule}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                editableEmployee.empresa.horario.dias[dia].trabaja && (
                                                   <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="capitalize">{dia}</Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {editableEmployee.empresa.horario.dias[dia].horarioEntrada} - {editableEmployee.empresa.horario.dias[dia].horarioSalida}
                                                            ({editableEmployee.empresa.horario.tipo === 'Presencial' ? editableEmployee.empresa.horario.sucursalFijo : editableEmployee.empresa.horario.dias[dia].sucursal})
                                                        </span>
                                                   </div>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {editableEmployee.empresa.horario.tipo === 'Presencial' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b items-center">
                                    <Label className="font-medium text-muted-foreground">Sucursal (Presencial)</Label>
                                    <div className="col-span-2">
                                        {isEditing && canEditSchedule ? (
                                            <Select
                                                value={editableEmployee.empresa.horario.sucursalFijo}
                                                onValueChange={(value) => handleHorarioInputChange('sucursalFijo')(value as Sucursal)}
                                                disabled={!isEditing || !canEditSchedule}
                                            >
                                                <SelectTrigger className="w-full sm:w-[180px]">
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sucursales.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm">{editableEmployee.empresa.horario.sucursalFijo}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                        </TabsContent>
                         <TabsContent value="registracion" className="pt-4">
                            <dl className="text-sm">
                                <DataRow label="Modalidad de Contrato" value={editableEmployee.registracion.modalidadContrato} isEditing={isEditing} onChange={handleInputChange('registracion', 'modalidadContrato')} disabled={!canEditRegistracionBancarios} />
                                <DataRow label="Obra Social" value={editableEmployee.registracion.obraSocial.descripcion} isEditing={isEditing} disabled={!canEditRegistracionBancarios}>
                                    <div className="flex gap-2 items-center">
                                        <Select onValueChange={handleObraSocialChange} value={editableEmployee.registracion.obraSocial.codigo} disabled={!isEditing || !canEditRegistracionBancarios}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione una Obra Social" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {obrasSociales.map(os => (
                                                    <SelectItem key={os.codigo} value={os.codigo}>{os.codigo} - {os.descripcion}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="outline" size="icon" onClick={() => setIsOsModalOpen(true)} disabled={!isEditing || !canEditRegistracionBancarios}>
                                            <PlusCircle className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </DataRow>
                                <DataRow label="ART" value={editableEmployee.registracion.art} isEditing={isEditing} disabled={!canEditRegistracionBancarios}>
                                     <div className="flex gap-2 items-center">
                                        <Select onValueChange={handleSelectChange('registracion', 'art')} value={editableEmployee.registracion.art} disabled={!isEditing || !canEditRegistracionBancarios}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione una ART" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {artList.map(art => (
                                                    <SelectItem key={art} value={art}>{art}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="outline" size="icon" onClick={() => setIsArtModalOpen(true)} disabled={!isEditing || !canEditRegistracionBancarios}>
                                            <PlusCircle className="h-4 w-4"/>
                                        </Button>
                                     </div>
                                </DataRow>
                                <DataRow label="Situación de Revista" value={editableEmployee.registracion.situacionRevista} isEditing={isEditing} onChange={handleInputChange('registracion', 'situacionRevista')} disabled={!canEditRegistracionBancarios} />
                                <DataRow label="Régimen" value={editableEmployee.registracion.regimen} isEditing={isEditing} onChange={handleInputChange('registracion', 'regimen')} disabled={!canEditRegistracionBancarios} />
                                <DataRow label="Tipo de Servicio" value={editableEmployee.registracion.tipoServicio} isEditing={isEditing} onChange={handleInputChange('registracion', 'tipoServicio')} disabled={!canEditRegistracionBancarios} />
                                <DataRow label="Convenio Colectivo" value={editableEmployee.registracion.convenioColectivo} isEditing={isEditing} disabled={!canEditRegistracionBancarios}>
                                      <div className="flex gap-2 items-center">
                                        <Select onValueChange={handleSelectChange('registracion', 'convenioColectivo')} value={editableEmployee.registracion.convenioColectivo} disabled={!isEditing || !canEditRegistracionBancarios}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un Convenio" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {convenios.map(cct => (
                                                    <SelectItem key={cct} value={cct}>{cct}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="outline" size="icon" onClick={() => setIsConvenioModalOpen(true)} disabled={!isEditing || !canEditRegistracionBancarios}>
                                            <PlusCircle className="h-4 w-4"/>
                                        </Button>
                                      </div>
                                </DataRow>
                                <DataRow label="Puesto" value={editableEmployee.registracion.puesto} isEditing={isEditing} onChange={handleInputChange('registracion', 'puesto')} disabled={!canEditRegistracionBancarios} />
                                <DataRow label="Retribución Pactada" value={editableEmployee.registracion.retribucionPactada} isEditing={isEditing} onChange={handleInputChange('registracion', 'retribucionPactada')} disabled={!canEditRegistracionBancarios} />
                                <DataRow label="Mod. Liquidación" value={editableEmployee.registracion.modalidadLiquidacion} isEditing={isEditing} onChange={handleInputChange('registracion', 'modalidadLiquidacion')} disabled={!canEditRegistracionBancarios} />
                                <DataRow label="Domicilio de Explotación" value={editableEmployee.registracion.domicilioExplotacion} isEditing={isEditing} onChange={handleInputChange('registracion', 'domicilioExplotacion')} disabled={!canEditRegistracionBancarios} />
                                <DataRow label="Actividad Económica" value={editableEmployee.registracion.actividadEconomica} isEditing={isEditing} onChange={handleInputChange('registracion', 'actividadEconomica')} disabled={!canEditRegistracionBancarios} />
                            </dl>
                        </TabsContent>
                        <TabsContent value="bancarios" className="pt-4">
                            <dl className="text-sm">
                                <DataRow label="Banco" value={editableEmployee.bancarios.banco} isEditing={isEditing} onChange={handleInputChange('bancarios', 'banco')} disabled={!canEditRegistracionBancarios}/>
                                <DataRow label="Nº de Cuenta" value={editableEmployee.bancarios.cuenta} isEditing={isEditing} onChange={handleInputChange('bancarios', 'cuenta')} disabled={!canEditRegistracionBancarios}/>
                                <DataRow label="CBU" value={editableEmployee.bancarios.cbu} isEditing={isEditing} onChange={handleInputChange('bancarios', 'cbu')} maxLength={22} disabled={!canEditRegistracionBancarios}/>
                                <DataRow label="Alias" value={editableEmployee.bancarios.alias} isEditing={isEditing} onChange={handleInputChange('bancarios', 'alias')} disabled={!canEditRegistracionBancarios}/>
                           </dl>
                        </TabsContent>
                        <TabsContent value="empresa-adicionales" className="pt-4">
                            <dl className="text-sm">
                                {structure["Datos de la Empresa"]["Datos Adicionales"].length > 0 ? structure["Datos de la Empresa"]["Datos Adicionales"].map((field) => (
                                    <DataRow
                                        key={field.name}
                                        label={field.name}
                                        value={(editableEmployee.empresa.customFields as any)?.[field.name] || ''}
                                        isEditing={isEditing}
                                        onChange={handleCustomFieldChange('empresa', field.name)}
                                        type={field.type === 'Fecha' ? 'date' : field.type === 'Número' ? 'number' : 'text'}
                                        disabled={!canEditCompanyData}
                                    />
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No hay datos adicionales para esta sección.</p>
                                )}
                            </dl>
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                {canViewDocumentation && (
                    <TabsContent value="documentacion" className="p-4 border rounded-md">
                        <div className="flex justify-end mb-4">
                            <Button variant="outline" onClick={() => setIsDocumentModalOpen(true)} disabled={!isEditing || !canEditDocumentation}>
                                <FilePlus className="mr-2 h-4 w-4" />
                                Agregar Documento
                            </Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre del Archivo</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Fecha de Subida</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {editableEmployee.documentacion.length > 0 ? editableEmployee.documentacion.map(doc => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">{doc.nombre}</TableCell>
                                        <TableCell>{doc.tipo}</TableCell>
                                        <TableCell>{doc.fechaSubida}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={!canEditDocumentation}>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => handleDownloadDocument(doc)}>
                                                        <FileDown className="mr-2 h-4 w-4"/>
                                                        Descargar
                                                    </DropdownMenuItem>
                                                    {canEditDocumentation && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => setDocumentToDelete(doc.id)} disabled={!isEditing}>
                                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground h-24">No hay documentos adjuntos.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>
                )}

                {!isNew && employee && (
                    <TabsContent value="notas" className="p-4 border rounded-md">
                        <CommentThread context="employee" entityId={employee.id} />
                    </TabsContent>
                )}
            </Tabs>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
