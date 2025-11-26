'use client';

import { useState } from 'react';
import TopHeader from '@/components/TopHeader';
import ServiceDefinitions from '@/components/ServiceDefinitions';
import ServiceInstances from '@/components/ServiceInstances';
import ActivityFeed from '@/components/ActivityFeed';
import BottomNav from '@/components/BottomNav';
import DashboardPanel from '@/components/DashboardPanel';
import UpcomingPanel from '@/components/UpcomingPanel';
import MobileDrawer from '@/components/MobileDrawer';
import { useApp } from '@/lib/store';

export default function HomePage() {
  const { showArchivedView } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Lateral izquierdo - Dashboard (solo desktop) */}
        <div className="hidden lg:block lg:col-span-3">
          <DashboardPanel />
        </div>

        {/* Contenido central */}
        <div className="col-span-1 lg:col-span-6 bg-background flex flex-col h-screen">
          {/* Header */}
          <div className="flex-none">
            <TopHeader onDashboardClick={() => setIsDrawerOpen(true)} />
          </div>

          {/* Área scrolleable */}
          <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 lg:pb-0">
            <ServiceDefinitions />
            <ServiceInstances />
            <ActivityFeed showArchived={showArchivedView} />
          </div>

          {/* BottomNav - SIEMPRE abajo */}
          <div className="flex-none lg:block hidden">
            <BottomNav />
          </div>
        </div>

        {/* Lateral derecho - Upcoming (solo desktop) */}
        <div className="hidden lg:block lg:col-span-3">
          <UpcomingPanel />
        </div>
      </div>
    </div>
  );
}
