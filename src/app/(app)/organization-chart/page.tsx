
'use client';

import { useState, useMemo, useEffect } from 'react';
import { getSession, Session } from '@/lib/session';
import { mockEmployees as initialEmployees } from '@/lib/mock-data';
import type { Employee } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Save, AlertTriangle, Trash2, Pencil, PlusCircle, Building, Briefcase, Users, Star, Network } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface OrgNode {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isGroup: boolean;
  employees: Employee[];
  children: OrgNode[];
}

const buildOrgTree = (employees: Employee[]): OrgNode[] => {
    const activeEmployees = employees.filter(e => e.fechaEgreso === null);
    const employeeMap = new Map(activeEmployees.map(e => [e.id, { ...e, children: [] as Employee[] }]));
    let roots: Employee[] = [];

    activeEmployees.forEach(emp => {
        if (emp.reportaA && employeeMap.has(emp.reportaA)) {
            const manager = employeeMap.get(emp.reportaA);
            if (manager) manager.children.push(emp);
        } else {
            roots.push(emp);
        }
    });

    if (roots.length === 0 && activeEmployees.length > 0) {
        // As fallback, pick the employee with the lowest ID as root if no one else is root.
        roots = [activeEmployees.sort((a,b) => parseInt(a.id) - parseInt(b.id))[0]];
    }

    const createNode = (employee: Employee): OrgNode => {
        const children = (employeeMap.get(employee.id)?.children || []).sort((a,b) => a.name.localeCompare(b.name));
        return {
            id: employee.id,
            name: employee.name,
            role: employee.empresa.tarea,
            avatar: employee.avatar,
            isGroup: false,
            employees: [employee],
            children: createChildNodes(children),
        };
    };

    const createChildNodes = (children: Employee[]): OrgNode[] => {
        const sectors = new Map<string, Employee[]>();

        children.forEach(child => {
            const sectorName = child.empresa.sector || 'Sin Sector';
            if (!sectors.has(sectorName)) {
                sectors.set(sectorName, []);
            }
            sectors.get(sectorName)?.push(child);
        });

        const sectorNodes: OrgNode[] = [];

        sectors.forEach((employees, sectorName) => {
            if (employees.length === 1 && !employees[0].empresa.sector) {
                 sectorNodes.push(createNode(employees[0]));
            } else {
                sectorNodes.push({
                    id: `sector-${sectorName}`,
                    name: sectorName,
                    role: 'Sector',
                    avatar: '',
                    isGroup: true,
                    employees: employees,
                    children: employees.map(createNode),
                });
            }
        });
        
        const directReports = children.filter(c => !c.empresa.sector);
        return [...directReports.map(createNode), ...sectorNodes.sort((a,b) => a.name.localeCompare(b.name))];
    };

    return roots.map(createNode);
};


const OrgNodeCard = ({ node, onNodeClick }: { node: OrgNode, onNodeClick: () => void }) => (
    <Popover>
        <PopoverTrigger asChild>
             <Card 
                className="w-56 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={onNodeClick}
            >
                <CardHeader className="flex flex-row items-center gap-3 p-3">
                    <Avatar className="w-10 h-10">
                        {node.isGroup ? <Users className="w-full h-full p-2 text-muted-foreground" /> : <AvatarImage src={node.avatar} alt={node.name} />}
                        <AvatarFallback>{node.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                        <p className="font-semibold text-sm truncate">{node.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{node.role}</p>
                    </div>
                </CardHeader>
            </Card>
        </PopoverTrigger>
        {node.employees.length > 0 && (
            <PopoverContent className="w-72">
                 <div className="space-y-2">
                    <h4 className="font-medium leading-none">{node.name}</h4>
                    <p className="text-sm text-muted-foreground">{node.isGroup ? `${node.employees.length} miembros` : node.role}</p>
                  </div>
                   <ScrollArea className="h-48 mt-4">
                      <div className="space-y-2">
                        {node.employees.map(emp => (
                          <div key={emp.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted">
                             <Avatar className="h-6 w-6">
                                <AvatarImage src={emp.avatar} alt={emp.name} />
                                <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-xs font-medium">{emp.name}</p>
                                <p className="text-xs text-muted-foreground">{emp.empresa.tarea} ({emp.empresa.categoria})</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
            </PopoverContent>
        )}
    </Popover>
);

const OrgTree = ({ node }: { node: OrgNode }) => {
    return (
        <div className="flex flex-col items-center">
            <OrgNodeCard node={node} onNodeClick={() => {}}/>
            {node.children && node.children.length > 0 && (
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 pt-12 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:h-12 before:w-px before:bg-border">
                    {node.children.map((child) => (
                       <div key={child.id} className="relative flex flex-col items-center before:absolute before:-top-12 before:h-6 before:w-px before:bg-border after:absolute after:-top-12 after:left-0 after:right-0 after:h-px after:bg-border">
                           <OrgTree node={child} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface StructureItem {
    id: string;
    name: string;
}

type ModalState = {
    isOpen: boolean;
    mode: 'add' | 'edit';
    type: 'dependencia' | 'sector' | 'tarea' | 'categoria' | null;
    item: StructureItem | null;
}

export default function OrganizationChartPage() {
    const [session, setSession] = useState<Session | null>(null);
    const { toast } = useToast();
    
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [dependencias, setDependencias] = useState<StructureItem[]>(() => Array.from(new Set(initialEmployees.map(e => e.empresa.dependencia))).filter(Boolean).map((d, i) => ({ id: `dep-${i}`, name: d })));
    const [sectores, setSectores] = useState<StructureItem[]>(() => Array.from(new Set(initialEmployees.map(e => e.empresa.sector))).filter(Boolean).map((s, i) => ({ id: `sec-${i}`, name: s })));
    const [puestos, setPuestos] = useState<StructureItem[]>(() => Array.from(new Set(initialEmployees.map(e => e.empresa.tarea))).filter(Boolean).map((p, i) => ({ id: `pue-${i}`, name: p })));
    const [categorias, setCategorias] = useState<StructureItem[]>(() => Array.from(new Set(initialEmployees.map(e => e.empresa.categoria))).filter(Boolean).map((c, i) => ({ id: `cat-${i}`, name: c })));
    
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, mode: 'add', type: null, item: null });
    const [editedName, setEditedName] = useState('');
    
    const organizationalTree = useMemo(() => buildOrgTree(employees), [employees]);

    useEffect(() => {
        const currentSession = getSession();
        setSession(currentSession);
    }, []);

    const handleSaveChanges = () => {
        toast({
            title: 'Cambios Guardados',
            description: 'La estructura de roles y asignaciones ha sido actualizada.',
        });
    }

    const openModal = (type: ModalState['type'], mode: 'add' | 'edit', item?: StructureItem) => {
        setEditedName(mode === 'edit' && item ? item.name : '');
        setModalState({ isOpen: true, mode, type, item: item || null });
    };

    const handleModalSubmit = () => {
        const { type, mode, item } = modalState;
        if (!type || !editedName) return;

        const listSetters: {[key: string]: React.Dispatch<React.SetStateAction<StructureItem[]>>} = {
            dependencia: setDependencias,
            sector: setSectores,
            tarea: setPuestos,
            categoria: setCategorias,
        };

        const setter = listSetters[type];
        
        const newItem: StructureItem = {
            id: item ? item.id : `${type}-${Date.now()}`,
            name: editedName,
        };

        if (mode === 'add') {
            setter(prev => [...prev, newItem]);
        } else if (item) {
            setter(prev => prev.map(i => i.id === item.id ? newItem : i));
        }

        setModalState({ isOpen: false, mode: 'add', type: null, item: null });
        setEditedName('');
    }
    
    const handleDeleteItem = (type: 'dependencia' | 'sector' | 'tarea' | 'categoria', id: string) => {
        const listSetters: {[key: string]: React.Dispatch<React.SetStateAction<StructureItem[]>>} = {
            dependencia: setDependencias,
            sector: setSectores,
            tarea: setPuestos,
            categoria: setCategorias,
        };
        listSetters[type](prev => prev.filter(i => i.id !== id));
    };

    if (!session) {
        return (
             <div className="flex justify-center items-center h-full">
                <p>Cargando...</p>
            </div>
        );
    }
    
    const renderStructureColumn = (title: string, items: StructureItem[], type: 'dependencia' | 'sector' | 'tarea' | 'categoria', icon: React.ReactNode) => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">{icon} {title}</CardTitle>
                <CardDescription>Gestiona los {title.toLowerCase()} de la empresa.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button size="sm" className="w-full mb-4" onClick={() => openModal(type, 'add')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Nuevo
                </Button>
                <ScrollArea className="h-72">
                    <div className="space-y-2 pr-2">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <div>
                                    <span className="text-sm font-medium">{item.name}</span>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(type, 'edit', item)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteItem(type, item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );

    return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Organigrama y Estructura</h1>
        <p className="text-muted-foreground mt-2">
            Visualiza la estructura jerárquica y define los roles de la organización.
        </p>
      </header>
       <Alert>
          <Network className="h-4 w-4" />
          <AlertTitle>Página de Administración</AlertTitle>
          <AlertDescription>
            La pestaña "Organigrama" muestra la estructura de reporte. La pestaña "Gestionar Estructura" permite a los administradores modificarla.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="organigrama">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="organigrama">Organigrama</TabsTrigger>
                <TabsTrigger value="gestion" disabled={session.role !== 'admin'}>Gestionar Estructura</TabsTrigger>
            </TabsList>
            
            <TabsContent value="organigrama" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Estructura Organizacional</CardTitle>
                        <CardDescription>Esta es una representación visual de la estructura de reporte actual.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-10 overflow-x-auto">
                         <div className="flex justify-center">
                         {organizationalTree.length > 0 ? (
                            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12">
                               {organizationalTree.map(rootNode => <OrgTree key={rootNode.id} node={rootNode} />)}
                            </div>
                         ) : (
                            <p className="text-muted-foreground text-center py-8">No se pudo generar el organigrama. Verifique que exista un único empleado raíz (sin "Reporta A").</p>
                         )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="gestion" className="mt-6">
                 {session.role === 'admin' ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {renderStructureColumn("Categorías", categorias, 'categoria', <Star />)}
                        {renderStructureColumn("Dependencias (Gerencias)", dependencias, 'dependencia', <Building />)}
                        {renderStructureColumn("Sectores", sectores, 'sector', <Users />)}
                        {renderStructureColumn("Tareas", puestos, 'tarea', <Briefcase />)}
                   </div>
                   <div className="flex justify-end mt-6">
                        <Button onClick={handleSaveChanges}>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios de Estructura
                        </Button>
                    </div>
                </div>
                 ) : (
                    <Card className="mt-6">
                        <CardHeader className="text-center">
                            <AlertTriangle className="mx-auto h-12 w-12 text-destructive"/>
                            <CardTitle>Acceso Denegado</CardTitle>
                            <CardDescription>
                            Solo los administradores pueden gestionar la estructura de la empresa.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                 )}
            </TabsContent>
        </Tabs>

        <Dialog open={modalState.isOpen} onOpenChange={() => setModalState({isOpen: false, mode: 'add', type: null, item: null})}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{modalState.mode === 'add' ? 'Agregar Nueva' : 'Editar'} {modalState.type}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="item-name">Nombre</Label>
                    <Input id="item-name" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                    <Button onClick={handleModalSubmit}>Guardar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
