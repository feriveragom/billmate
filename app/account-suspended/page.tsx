'use client';

import { useAuth } from '@/components/features/auth/AuthProvider';
import { Ban, ShieldAlert, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountSuspendedPage() {
    const { signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background relative overflow-hidden">
            
            {/* Columna Izquierda: Visual / Branding (Desktop) - Rojo para Alerta */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-red-900 via-red-700 to-orange-900 items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-black rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 text-white space-y-8 max-w-lg text-center">
                    <div className="flex justify-center mb-6">
                        <ShieldAlert size={120} className="text-white/80" />
                    </div>
                    <h1 className="text-5xl font-bold leading-tight">
                        Acceso Restringido
                    </h1>
                    <p className="text-xl text-white/80">
                        Hemos detectado un problema con tu cuenta que requiere atención inmediata.
                    </p>
                </div>
            </div>

            {/* Columna Derecha: Mensaje y Acciones */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="text-center space-y-6">
                        <div className="inline-block p-6 rounded-full bg-red-500/10 mb-2">
                            <Ban className="w-16 h-16 text-red-500" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">Cuenta Suspendida</h2>
                            <p className="text-foreground/60 leading-relaxed">
                                Tu cuenta ha sido deshabilitada administrativamente. Esto puede deberse a un incumplimiento de términos, falta de pago o por razones de seguridad.
                            </p>
                        </div>
                    </div>

                    <div className="bg-card border border-red-500/20 rounded-xl p-6 bg-red-500/5">
                        <h3 className="font-bold text-red-500 mb-2">¿Qué puedo hacer?</h3>
                        <p className="text-sm text-foreground/70 mb-4">
                            Si crees que esto es un error, por favor contacta a nuestro equipo de soporte para revisar tu caso.
                        </p>
                        <a 
                            href="mailto:soporte@billmate.com" 
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            soporte@billmate.com
                        </a>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 bg-card hover:bg-gray-50 border border-black/10 dark:border-white/10 text-foreground py-4 px-6 rounded-xl transition-all hover:shadow-lg group"
                        >
                            <LogOut className="w-5 h-5 text-foreground/70 group-hover:text-red-500 transition-colors" />
                            <span className="font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

