'use client';

import LeavePageContent from '@/app/(app)/leave/page';

// Reutilizamos el componente de ausencias que ya maneja la lógica
// para mostrar "Mis Ausencias" si el usuario no es admin/manager.
export default function MyLeavesPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LeavePageContent />
        </div>
    );
}
