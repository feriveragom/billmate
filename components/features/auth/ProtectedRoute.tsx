'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermission?: string; // Nuevo estándar: Solo validar por permiso
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
    const { user, isLoading, checkPermission } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Debug log para rastrear flujo de decisión
        // console.log(`🛡️ [Protect] Path: ${pathname}, User: ${user?.role}, Loading: ${isLoading}, Req: ${requiredPermission}`);

        // Solo redirigir si la carga HA TERMINADO (isLoading === false)
        if (!isLoading) {
            // 1. No autenticado -> Login
            if (!user) {
                console.warn("⛔ [Protect] No user found. Redirecting to login.");
                router.replace('/login'); 
                return;
            }

            // 2. Permiso insuficiente -> Home
            if (requiredPermission && !checkPermission(requiredPermission)) {
                console.warn(`⛔ [Protect] Acceso denegado a ${pathname}. Requiere permiso: "${requiredPermission}".`);
                router.replace('/');
            }
        }
    }, [user, isLoading, router, requiredPermission, pathname, checkPermission]);

    // Mientras carga (estado inicial o revalidación)
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    // Si no hay usuario (renderizado condicional para evitar flash antes del redirect)
    if (!user) {
        return null;
    }

    // Si requiere permiso y no lo tiene, no renderizar
    if (requiredPermission && !checkPermission(requiredPermission)) {
        return null;
    }

    // console.log("✅ [Protect] Access granted. Rendering content.");
    return <>{children}</>;
}
