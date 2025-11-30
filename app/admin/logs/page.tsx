import LogsViewer from '@/features/admin/components/LogsViewer';
import ProtectedRoute from '@/core/auth/protected-route';

export default function AdminLogsPage() {
    return (
        <ProtectedRoute requiredPermission="logs.view">
            <LogsViewer />
        </ProtectedRoute>
    );
}
