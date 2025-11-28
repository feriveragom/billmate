import RolesGrid from '@/components/features/admin/RolesGrid';
import ProtectedRoute from '@/components/features/auth/ProtectedRoute';

export default function AdminRolesPage() {
    return (
        <ProtectedRoute requiredPermission="admin.roles.manage">
            <RolesGrid />
        </ProtectedRoute>
    );
}
