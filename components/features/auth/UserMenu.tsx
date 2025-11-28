'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Shield, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/components/features/auth/AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function UserMenu() {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) {
        return (
            <Link href="/login" className="text-sm font-bold text-primary hover:underline">
                Iniciar Sesión
            </Link>
        );
    }

    // Determinar si estamos en modo admin para ocultar/mostrar opciones relevantes
    const isAdminRoute = pathname?.startsWith('/admin');

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/5 transition border border-transparent hover:border-white/10"
            >
                {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {user.name?.[0]}
                    </div>
                )}
                <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className={`text-foreground/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-primary/20 rounded-2xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <p className="text-sm font-bold truncate">{user.name}</p>
                        <p className="text-xs text-foreground/50 truncate">{user.email}</p>
                    </div>
                                        
                    <Link 
                        href="/" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition group"
                    >
                         <div className="w-4 h-4 flex items-center justify-center">
                             <img src="/logo.png" alt="BillMate" className="w-full h-full object-contain" />
                         </div>
                         <span className="text-lg font-bold text-primary tracking-tight leading-none">billmate</span>
                         {user.role === 'PREMIUM_USER' && <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded font-bold ml-auto">PRO</span>}
                    </Link>

                    <Link 
                        href="/profile" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-white/5 text-foreground/70 hover:text-primary transition"
                    >
                        <User size={16} />
                        Mi Perfil
                    </Link>

                    {user.role === 'SUPER_ADMIN' && !isAdminRoute && (
                        <Link 
                            href="/admin" 
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-white/5 text-foreground/70 hover:text-primary transition"
                        >
                            <Shield size={16} />
                            Admin Panel
                        </Link>
                    )}
                    
                    <div className="h-px bg-white/5 my-1" />
                    
                    <button 
                        onClick={() => {
                            setIsOpen(false);
                            signOut();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-500 transition"
                    >
                        <LogOut size={16} />
                        Cerrar Sesión
                    </button>
                </div>
            )}
        </div>
    );
}
