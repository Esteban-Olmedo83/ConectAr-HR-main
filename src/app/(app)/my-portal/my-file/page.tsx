'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/session';
import { mockEmployees, initialStructure } from '@/lib/mock-data';
import { EmployeeProfileDetail } from '@/components/employees/employee-profile-detail';

export default function MyFilePage() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session) return <div>Cargando...</div>;

  const employee = mockEmployees.find(e => e.id === session.userId);

  if (!employee) return <div>No se encontró el legajo.</div>;

  const dependencias = Array.from(new Set(mockEmployees.map(e => e.empresa.dependencia))).filter(Boolean) as string[];
  const sectores = Array.from(new Set(mockEmployees.map(e => e.empresa.sector))).filter(Boolean) as string[];
  const categorias = Array.from(new Set(mockEmployees.map(e => e.empresa.categoria))).filter(Boolean) as string[];
  const puestos = Array.from(new Set(mockEmployees.map(e => e.registracion.puesto))).filter(Boolean) as string[];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold font-headline mb-6">Mi Legajo</h2>
        {/* Usamos el mismo componente pero en modo solo lectura (ya gestionado por el componente si no es HR) */}
        <EmployeeProfileDetail 
            employee={employee} 
            onBack={() => {}}
            onSave={() => {}}
            structure={initialStructure}
            puestos={puestos}
            sectores={sectores}
            dependencias={dependencias}
            categorias={categorias}
        />
    </div>
  );
}
