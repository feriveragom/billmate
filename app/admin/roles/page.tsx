import RolesGrid from '@/features/admin/components/RolesGrid';
import ProtectedRoute from '@/core/auth/protected-route';

export default function AdminRolesPage() {
    return (
        <ProtectedRoute requiredPermission="roles.view">
            <RolesGrid />
        </ProtectedRoute>
    );
}
