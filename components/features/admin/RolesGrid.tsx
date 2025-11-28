'use client';

import { mockRoles } from '@/lib/mockAdminData';
import { Shield } from 'lucide-react';

export default function RolesGrid() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Roles y Permisos</h2>
                <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">
                    + Nuevo Rol
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockRoles.map(role => (
                    <div key={role.id} className="bg-card border border-white/10 p-6 rounded-2xl hover:border-primary/50 transition group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <Shield size={24} />
                            </div>
                            {role.isSystemRole && (
                                <span className="text-[10px] uppercase tracking-wider font-bold text-foreground/40 bg-white/5 px-2 py-1 rounded-md">
                                    System
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold mb-1">{role.label}</h3>
                        <p className="text-sm text-foreground/60 mb-4">{role.description}</p>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                            <span className="text-foreground/50">{role.permissions.length} permisos</span>
                            <button className="text-primary font-medium hover:underline">Editar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
