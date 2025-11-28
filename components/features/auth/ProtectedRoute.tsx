'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string; // Opcional: Rol específico requerido
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Solo redirigir si la carga HA TERMINADO (isLoading === false)
        if (!isLoading) {
            // 1. No autenticado -> Login
            if (!user) {
                router.replace('/login'); // replace es mejor que push para redirecciones de auth
                return;
            }

            // 2. Rol insuficiente -> Home (o 403)
            if (requiredRole && user.role !== requiredRole && user.role !== 'SUPER_ADMIN') {
                console.warn(`Acceso denegado a ${pathname}. Se requiere ${requiredRole}, usuario es ${user.role}`);
                router.replace('/');
            }
        }
    }, [user, isLoading, router, requiredRole, pathname]);

    // Mientras carga (estado inicial o revalidación)
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    // Si no hay usuario (aunque useEffect lo capture, renderizamos null para evitar flash)
    if (!user) {
        return null;
    }

    // Si requiere rol y no lo tiene, no renderizar nada mientras redirige
    if (requiredRole && user.role !== requiredRole && user.role !== 'SUPER_ADMIN') {
        return null;
    }

    return <>{children}</>;
}
