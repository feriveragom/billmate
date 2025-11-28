'use client';

import ProtectedRoute from '@/components/features/auth/ProtectedRoute';
import UserProfile from '@/components/features/auth/UserProfile';

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background p-4 lg:p-10">
                <UserProfile />
            </div>
        </ProtectedRoute>
    );
}

