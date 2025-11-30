import ProtectedRoute from '@/core/auth/protected-route';
import PermissionsTable from '@/features/admin/components/PermissionsTable';

export default function PermissionsPage() {
    return (
        <ProtectedRoute requiredPermission="permissions.view">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Permisos del Sistema</h1>
                    <p className="text-foreground/60">
                        Define las capacidades atómicas que pueden ser asignadas a los roles.
                    </p>
                </div>

                <PermissionsTable />
            </div>
        </ProtectedRoute>
    );
}
