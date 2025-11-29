'use client';

import { useAuth } from '@/core/auth/auth-provider';
// import { mockRoles, mockPermissions } from '@/lib/mockAdminData';
import { Shield, Mail, User as UserIcon, CheckCircle, Key } from 'lucide-react';

export default function UserProfile() {
    const { user } = useAuth();

    if (!user) return null;

    // Encontrar el rol completo basado en el nombre del rol del usuario
    const roleDetails = {
        label: user.role,
        description: 'Rol asignado',
        permissions: user.permissions || []
    };

    // Encontrar los detalles de los permisos
    const userPermissions = (user.permissions || []).map(code => ({
        id: code,
        code: code,
        description: code,
        module: 'SYSTEM'
    }));

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Cabecera de Perfil */}
            <div className="bg-card border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                {/* Fondo decorativo */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 -z-10" />
                
                <div className="relative mt-4 md:mt-0">
                    <div className="w-32 h-32 rounded-full border-4 border-background bg-card overflow-hidden shadow-xl">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold">
                                {user.name[0]}
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center text-white" title="Activo">
                        <CheckCircle size={16} />
                    </div>
                </div>

                <div className="text-center md:text-left space-y-2 flex-1">
                    <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-foreground/60">
                        <div className="flex items-center gap-2">
                            <Mail size={16} />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            <Shield size={14} />
                            <span>{roleDetails.label}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información del Rol */}
                <div className="bg-card border border-white/10 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                            <UserIcon size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Detalles del Rol</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-sm text-foreground/50 mb-1">Rol Actual</p>
                            <p className="text-lg font-medium">{roleDetails.label}</p>
                            <p className="text-sm text-foreground/60 mt-1">{roleDetails.description}</p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-sm text-foreground/50 mb-1">ID de Usuario</p>
                            <code className="text-xs font-mono bg-black/20 px-2 py-1 rounded">{user.id}</code>
                        </div>
                    </div>
                </div>

                {/* Permisos */}
                <div className="bg-card border border-white/10 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                            <Key size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Permisos Habilitados</h2>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {userPermissions.length > 0 ? (
                            userPermissions.map((perm: any) => (
                                <div key={perm.id} className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-xl transition border border-transparent hover:border-white/5">
                                    <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{perm.code}</p>
                                        <p className="text-xs text-foreground/50">{perm.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-foreground/50">
                                <p>Este rol no tiene permisos explícitos asignados.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

