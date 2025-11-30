'use client';

import UsersTable from '@/features/admin/components/UsersTable';
import ProtectedRoute from '@/core/auth/protected-route';

export default function AdminUsersPage() {
    return (
        <ProtectedRoute requiredPermission="users.view">
            <UsersTable />
        </ProtectedRoute>
    );
}
