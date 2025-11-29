import LogsViewer from '@/components/features/admin/LogsViewer';
import ProtectedRoute from '@/core/auth/protected-route';

export default function AdminLogsPage() {
    return (
        <ProtectedRoute requiredPermission="admin.logs.view">
            <LogsViewer />
        </ProtectedRoute>
    );
}
