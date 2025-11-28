'use client';

import UsersTable from '@/components/features/admin/UsersTable';
import ProtectedRoute from '@/components/features/auth/ProtectedRoute';

export default function AdminUsersPage() {
    return (
        <ProtectedRoute requiredPermission="admin.users.manage">
            <UsersTable />
        </ProtectedRoute>
    );
}
