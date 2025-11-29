import RolesGrid from '@/components/features/admin/RolesGrid';
import ProtectedRoute from '@/core/auth/protected-route';

export default function AdminRolesPage() {
    return (
        <ProtectedRoute requiredPermission="admin.roles.manage">
            <RolesGrid />
        </ProtectedRoute>
    );
}
