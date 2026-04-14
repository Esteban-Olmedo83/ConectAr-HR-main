'use client';

import PayslipsPageContent from '@/app/(app)/payslips/page';

// Reutilizamos el componente de recibos que ya debería mostrar
// solo los recibos del usuario actual.
export default function MyPayslipsPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PayslipsPageContent />
        </div>
    );
}
