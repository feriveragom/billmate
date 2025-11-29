'use client';

import ProtectedRoute from '@/core/auth/protected-route';
import UserProfile from '@/features/users/components/user-profile';

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background p-4 lg:p-10">
                <UserProfile />
            </div>
        </ProtectedRoute>
    );
}

