'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role: 'FREE_USER' | 'PREMIUM_USER' | 'ADMIN' | 'SUPER_ADMIN' | string;
    is_active?: boolean;
    permissions?: string[];
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    checkPermission: (permissionCode: string) => boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const [supabase] = useState(() => createClient());

    const logAuthEvent = async (action: 'LOGIN' | 'LOGOUT', userEmail: string, userId: string) => {
        try {
            const { logAuthEvent: serverLog } = await import('@/app/auth/actions');
            await serverLog(userId, userEmail, action, { platform: 'web', browser: navigator.userAgent });
        } catch (error) {
            console.error(`Error registrando log ${action}:`, error);
        }
    };

    const fetchProfileWithPermissions = async (userId: string) => {
        // 1. Fetch Profile (Rol)
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`;
        const response = await fetch(url, {
            headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error("❌ [AuthProvider] Error fetching profile:", response.status);
            throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        const profile = data?.[0];

        if (!profile) return null;

        // 2. Fetch Permissions based on Role (usando fetch directo para evitar RLS)
        const roleUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/roles?name=eq.${profile.role}&select=id,name,role_permissions(permissions(code))`;
        const roleResponse = await fetch(roleUrl, {
            headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                'Content-Type': 'application/json'
            }
        });

        let permissions: string[] = [];

        if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            const role = roleData?.[0];

            if (role && role.role_permissions) {
                permissions = role.role_permissions
                    .map((rp: any) => rp.permissions?.code)
                    .filter(Boolean);
            }
        } else {
            console.warn(`⚠️ [AuthProvider] No permissions found for role: ${profile.role}`);
        }

        return { ...profile, permissions };
    };

    const mapAndSetUser = useCallback(async (authUser: any, isLoginEvent = false) => {
        if (!authUser) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        // Recuperar rol y permisos de SessionStorage (Persistencia ante F5)
        const cachedRole = sessionStorage.getItem(`role_${authUser.id}`);
        const cachedPermissions = sessionStorage.getItem(`perms_${authUser.id}`);

        // 1. OPTIMISTIC UPDATE
        const optimisticUser: User = {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata.full_name || authUser.email!,
            avatar_url: authUser.user_metadata.avatar_url,
            role: (user && user.id === authUser.id) ? user.role : (cachedRole || 'FREE_USER'),
            permissions: (user && user.id === authUser.id) ? user.permissions : (cachedPermissions ? JSON.parse(cachedPermissions) : [])
        };

        setUser(currentUser => {
            if (currentUser && currentUser.id === authUser.id && !isLoginEvent) {
                return currentUser;
            }
            return optimisticUser;
        });

        // Si no tenemos permisos cacheados, mantenemos loading true un poco más
        if (!cachedPermissions) {
            // Keep loading
        } else {
            setIsLoading(false);
        }

        // 2. REVALIDACIÓN EN SEGUNDO PLANO
        try {
            const profile = await fetchProfileWithPermissions(authUser.id);

            if (profile) {
                if (profile.is_active === false) {
                    await supabase.auth.signOut();
                    setUser(null);
                    sessionStorage.clear();
                    router.replace('/account-suspended');
                    return;
                }

                sessionStorage.setItem(`role_${authUser.id}`, profile.role);
                sessionStorage.setItem(`perms_${authUser.id}`, JSON.stringify(profile.permissions));

                setUser(prev => {
                    if (prev && (prev.role !== profile.role || JSON.stringify(prev.permissions) !== JSON.stringify(profile.permissions))) {
                        return {
                            ...prev,
                            role: profile.role,
                            permissions: profile.permissions
                        };
                    }
                    if (!prev) {
                        return {
                            id: authUser.id,
                            email: authUser.email!,
                            name: authUser.user_metadata.full_name || authUser.email!,
                            avatar_url: authUser.user_metadata.avatar_url,
                            role: profile.role,
                            permissions: profile.permissions
                        };
                    }
                    return prev;
                });
            }
        } catch (err) {
            console.error("❌ [AuthProvider] Error revalidando perfil:", err);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]); // Removed mapAndSetUser and router to avoid loops

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
                } else {
                    setIsLoading(false);
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
                sessionStorage.clear();
                setUser(null);
                setIsLoading(false);
            } else if (event === 'USER_UPDATED') {
                await mapAndSetUser(session?.user);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [supabase, mapAndSetUser]); // router removed

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
            sessionStorage.clear();
            setUser(null);
            router.replace('/login');
        } catch (error) {
            console.error("Error en signOut:", error);
            setIsLoading(false);
        }
    };

    const checkPermission = useCallback((permissionCode: string): boolean => {
        if (!user) return false;

        // 1. Super Admin -> Acceso Total (Bypass)
        if (user.role === 'SUPER_ADMIN') {
            return true;
        }

        // 2. Verificar permiso explícito
        const hasPermission = user.permissions?.includes(permissionCode);

        return hasPermission || false;
    }, [user]);

    const refreshProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await mapAndSetUser(session.user);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut, checkPermission, refreshProfile }}>
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
