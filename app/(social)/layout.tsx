'use client';

import { useState } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import MobileDrawer from '@/components/layout/MobileDrawer';
import ProtectedRoute from '@/components/features/auth/ProtectedRoute';

export default function SocialLayout({ children }: { children: React.ReactNode }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <ProtectedRoute>
             <div className="h-screen flex flex-col bg-background">
                <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
                
                <div className="flex-none">
                    <TopHeader onDashboardClick={() => setIsDrawerOpen(true)} />
                </div>

                <main className="flex-1 overflow-hidden relative">
                    {children}
                </main>

                <div className="flex-none lg:hidden">
                    <BottomNav />
                </div>
             </div>
        </ProtectedRoute>
    );
}

