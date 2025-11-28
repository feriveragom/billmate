'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role: 'GUEST' | 'FREE_USER' | 'PREMIUM_USER' | 'ADMIN' | 'SUPER_ADMIN';
    is_active?: boolean; // Nueva propiedad opcional
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    
    const [supabase] = useState(() => createClient());

    const logAuthEvent = async (action: 'LOGIN' | 'LOGOUT', userEmail: string, userId: string) => {
        try {
            await supabase.rpc('log_audit_event', {
                p_user_id: userId,
                p_user_email: userEmail,
                p_action_type: action,
                p_action_category: 'AUTH',
                p_action_description: action === 'LOGIN' ? 'Inicio de sesión exitoso' : 'Cierre de sesión voluntario',
                p_metadata: { platform: 'web', browser: navigator.userAgent }
            });
        } catch (error) {
            console.error(`Error registrando log ${action}:`, error);
        }
    };

    const fetchProfileDirectly = async (userId: string) => {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`;
        const response = await fetch(url, {
            headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        return data?.[0];
    };

    const mapAndSetUser = useCallback(async (authUser: any, isLoginEvent = false) => {
        if (!authUser) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        // Recuperar rol de SessionStorage (Persistencia ante F5)
        const cachedRole = sessionStorage.getItem(`role_${authUser.id}`);
        
        // 1. OPTIMISTIC UPDATE
        const optimisticUser: User = {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata.full_name || authUser.email!,
            avatar_url: authUser.user_metadata.avatar_url,
            // Prioridad: Rol ya en state > Rol en SessionStorage > FREE_USER
            role: (user && user.id === authUser.id) ? user.role : (cachedRole as any || 'FREE_USER')
        };

        setUser(currentUser => {
            if (currentUser && currentUser.id === authUser.id && !isLoginEvent) {
                return currentUser; 
            }
            return optimisticUser;
        });

        setIsLoading(false);

        // 2. REVALIDACIÓN EN SEGUNDO PLANO
        try {
            let profile = null;
            profile = await fetchProfileDirectly(authUser.id);

            if (profile) {
                // VERIFICACIÓN DE ESTADO ACTIVO
                if (profile.is_active === false) { // Explicit check for false
                    await supabase.auth.signOut();
                    setUser(null);
                    sessionStorage.clear();
                    router.replace('/account-suspended');
                    return;
                }

                // Guardar rol confirmado en SessionStorage para futuros F5
                sessionStorage.setItem(`role_${authUser.id}`, profile.role);

                setUser(prev => {
                    if (prev && prev.role !== profile.role) {
                         return { ...prev, role: profile.role };
                    }
                    return prev;
                });
            }
        } catch (err) {
            console.error("❌ [AuthProvider] Error revalidando perfil:", err);
        }
    }, [router, supabase]); // Removemos 'user' de deps para evitar ciclos, usamos la versión funcional de setUser

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error("Error getSession:", error);
                    if (mounted) setIsLoading(false);
                    return;
                }

                if (mounted) {
                    await mapAndSetUser(session?.user);
                }
            } catch (error) {
                console.error("Excepción en initializeAuth:", error);
                if (mounted) setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (event === 'SIGNED_IN') {
                if (session?.user) {
                    logAuthEvent('LOGIN', session.user.email!, session.user.id);
                }
                await mapAndSetUser(session?.user, true);
            } else if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                await mapAndSetUser(session?.user);
            } else if (event === 'SIGNED_OUT') {
                // Limpiar cache de rol al salir
                sessionStorage.clear();
                setUser(null);
                setIsLoading(false);
                // router.replace('/login'); // Lo manejamos en el botón de logout o componente
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [supabase, mapAndSetUser, router]);

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
    };

    const signOut = async () => {
        try {
            setIsLoading(true);
            if (user) {
                await logAuthEvent('LOGOUT', user.email, user.id);
            }
            await supabase.auth.signOut();
            sessionStorage.clear(); // Limpieza importante
            setUser(null);
            router.replace('/login');
        } catch (error) {
            console.error("Error en signOut:", error);
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
