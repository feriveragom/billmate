import LogsViewer from '@/components/features/admin/LogsViewer';
import ProtectedRoute from '@/components/features/auth/ProtectedRoute';

export default function AdminLogsPage() {
    return (
        <ProtectedRoute requiredPermission="admin.logs.view">
            <LogsViewer />
        </ProtectedRoute>
    );
}
