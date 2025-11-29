'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
    const { signInWithGoogle, user } = useAuth();
    const router = useRouter();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Redirección si ya hay usuario
    useEffect(() => {
        if (user) router.replace('/');
    }, [user, router]);

    const handleLogin = async () => {
        setIsLoggingIn(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Login error:", error);
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background relative overflow-hidden">

            {/* Columna Izquierda: Visual / Branding (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-dark via-primary to-accent items-center justify-center p-12 overflow-hidden">
                {/* Círculos decorativos animados */}
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 text-white space-y-8 max-w-lg">
                    <div className="space-y-2">
                        <p className="text-accent font-bold tracking-wider uppercase text-sm">Bienvenido a BillMate</p>
                        <h1 className="text-5xl font-bold leading-tight">
                            Tu sistema operativo financiero personal.
                        </h1>
                    </div>

                    <div className="space-y-4">
                        <FeatureItem text="Centraliza todos tus pagos en un solo lugar" />
                        <FeatureItem text="Recordatorios inteligentes para no pagar tarde" />
                        <FeatureItem text="Control total de tus suscripciones y gastos" />
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Formulario de Login */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                {/* Fondo Móvil (Gradientes sutiles) */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="w-full max-w-md space-y-8 relative z-10">
                    {/* Cabecera Móvil / Card Header */}
                    <div className="text-center space-y-6">
                        <div className="inline-block p-4 rounded-3xl bg-primary/5 mb-2">
                            <img src="/logo.png" alt="BillMate Logo" className="w-20 h-20 object-contain" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">Iniciar Sesión</h2>
                            <p className="text-foreground/60">
                                Accede a tu espacio financiero personal
                            </p>
                        </div>
                    </div>

                    {/* Botón de Acción */}
                    <div className="pt-4">
                        <button
                            onClick={handleLogin}
                            disabled={isLoggingIn}
                            className="w-full flex items-center justify-center gap-3 bg-card hover:bg-gray-50 border border-black/10 dark:border-white/10 text-foreground py-4 px-6 rounded-xl transition-all shadow-soft hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {isLoggingIn ? (
                                <Loader2 className="animate-spin text-primary" size={24} />
                            ) : (
                                <>
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium text-lg">Continuar con Google</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-foreground/40 px-6 leading-relaxed">
                        Al continuar, aceptas nuestros <a href="#" className="underline hover:text-primary">Términos de Servicio</a> y <a href="#" className="underline hover:text-primary">Política de Privacidad</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-white/90">
            <div className="p-1 bg-white/20 rounded-full backdrop-blur-sm">
                <CheckCircle2 size={16} className="text-white" />
            </div>
            <span className="text-lg font-light">{text}</span>
        </div>
    );
}
