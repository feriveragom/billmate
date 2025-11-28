'use client';

import ProtectedRoute from '@/components/features/auth/ProtectedRoute';
import { Users, Shield, FileText, ShieldAlert, Key } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TopHeader from '@/components/layout/TopHeader';
import { useAuth } from '@/components/features/auth/AuthProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { checkPermission } = useAuth();

    return (
        // 1. Protección de Nivel Superior: Acceso al Panel Admin
        <ProtectedRoute requiredPermission="admin.access">
            <div className="min-h-screen bg-background flex flex-col">
                {/* Header Global en Admin */}
                <TopHeader />
                
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Sidebar Admin */}
                    <aside className="w-full lg:w-64 bg-card border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg leading-tight">Admin Panel</h1>
                                <p className="text-xs text-foreground/50">God Mode</p>
                            </div>
                        </div>

                        <nav className="space-y-1 flex-1">
                            {/* 2. Renderizado Condicional de Links por Permiso */}
                            
                            {checkPermission('admin.users.manage') && (
                                <AdminLink
                                    href="/admin/users"
                                    active={pathname === '/admin/users'}
                                    icon={<Users size={20} />}
                                    label="Usuarios"
                                />
                            )}

                            {checkPermission('admin.roles.manage') && (
                                <AdminLink
                                    href="/admin/permissions"
                                    active={pathname === '/admin/permissions'}
                                    icon={<Key size={20} />}
                                    label="Gestión de Permisos"
                                />
                            )}

                            {checkPermission('admin.roles.manage') && (
                                <AdminLink
                                    href="/admin/roles"
                                    active={pathname === '/admin/roles'}
                                    icon={<Shield size={20} />}
                                    label="Roles y Permisos"
                                />
                            )}

                            {checkPermission('admin.logs.view') && (
                                <AdminLink
                                    href="/admin/logs"
                                    active={pathname === '/admin/logs'}
                                    icon={<FileText size={20} />}
                                    label="Logs de Auditoría"
                                />
                            )}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-background/50">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function AdminLink({ active, href, icon, label }: { active: boolean, href: string, icon: React.ReactNode, label: string }) {
    return (
        <Link
            href={href}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                ? 'bg-primary text-white shadow-lg shadow-primary/20 font-medium'
                : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
