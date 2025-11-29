'use client';

import UsersTable from '@/components/features/admin/UsersTable';
import ProtectedRoute from '@/core/auth/protected-route';

export default function AdminUsersPage() {
    return (
        <ProtectedRoute requiredPermission="admin.users.manage">
            <UsersTable />
        </ProtectedRoute>
    );
}
