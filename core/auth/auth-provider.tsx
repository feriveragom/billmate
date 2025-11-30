'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { getUserProfileAndPermissions, logAuthEvent } from '@/features/auth/actions';

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

    const handleLogAuthEvent = async (action: 'LOGIN' | 'LOGOUT', userEmail: string, userId: string) => {
        try {
            await logAuthEvent(userId, userEmail, action, { platform: 'web', browser: navigator.userAgent });
        } catch (error) {
            console.error(`Error registrando log ${action}:`, error);
        }
    };

    const fetchProfile = async (uid: string) => {
        try {
            const profile = await getUserProfileAndPermissions(uid);
            if (profile) {
                return {
                    id: profile.id,
                    email: profile.email,
                    name: profile.fullName,
                    avatar_url: profile.avatarUrl,
                    role: profile.role,
                    is_active: !profile.isBanned,
                    permissions: profile.permissions
                } as User;
            }
            return null;
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    };

    const mapAndSetUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
        if (!firebaseUser) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        // Recuperar rol y permisos de SessionStorage (Persistencia ante F5)
        const cachedRole = sessionStorage.getItem(`role_${firebaseUser.uid}`);
        const cachedPermissions = sessionStorage.getItem(`permissions_${firebaseUser.uid}`);

        if (cachedRole && cachedPermissions) {
            setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || '',
                avatar_url: firebaseUser.photoURL || '',
                role: cachedRole,
                permissions: JSON.parse(cachedPermissions),
                is_active: true
            });
            setIsLoading(false);
        }

        // Fetch fresh data from Server Action (Firestore)
        const profile = await fetchProfile(firebaseUser.uid);

        if (profile) {
            setUser(profile);
            // Update cache
            sessionStorage.setItem(`role_${profile.id}`, profile.role);
            sessionStorage.setItem(`permissions_${profile.id}`, JSON.stringify(profile.permissions));
        } else {
            setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || '',
                avatar_url: firebaseUser.photoURL || '',
                role: 'FREE_USER', // Default fallback
                permissions: [],
                is_active: true
            });
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            mapAndSetUser(firebaseUser);
        });

        return () => unsubscribe();
    }, [mapAndSetUser]);

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log('✅ [Login] Google sign-in successful:', user.email);
            await handleLogAuthEvent('LOGIN', user.email!, user.uid);
            router.push('/');
        } catch (error) {
            console.error('❌ [Login] Error signing in with Google:', error);
        }
    };

    const signOut = async () => {
        try {
            if (user) {
                await handleLogAuthEvent('LOGOUT', user.email, user.id);
            }
            await firebaseSignOut(auth);
            setUser(null);
            sessionStorage.clear();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const checkPermission = (permissionCode: string) => {
        if (!user || !user.permissions) return false;
        // Super Admin bypass
        if (user.role === 'SUPER_ADMIN') return true;
        return user.permissions.includes(permissionCode);
    };

    const refreshProfile = async () => {
        if (user) {
            const profile = await fetchProfile(user.id);
            if (profile) {
                setUser(profile);
                sessionStorage.setItem(`role_${profile.id}`, profile.role);
                sessionStorage.setItem(`permissions_${profile.id}`, JSON.stringify(profile.permissions));
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut, checkPermission, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
