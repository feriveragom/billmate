'use client';

import ServiceDefinitions from '@/features/billing/components/ServiceDefinitions';
import ServiceInstances from '@/features/billing/components/ServiceInstances';
import ActivityFeed from '@/components/features/dashboard/ActivityFeed';
import DashboardPanel from '@/components/features/dashboard/DashboardPanel';
import UpcomingPanel from '@/components/features/dashboard/UpcomingPanel';
import { useApp } from '@/lib/store';

export default function HomePage() {
  const { showArchivedView } = useApp();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
      {/* Lateral izquierdo - Dashboard (solo desktop) */}
      <div className="hidden lg:block lg:col-span-3 h-full overflow-y-auto p-4">
        <DashboardPanel />
      </div>

      {/* Contenido central */}
      <div className="col-span-1 lg:col-span-6 h-full overflow-y-auto scrollbar-hide pb-20 lg:pb-0 p-4">
          <ServiceDefinitions />
          <ServiceInstances />
          <ServiceInstances showArchived={true} />
          <ActivityFeed showArchived={showArchivedView} />
      </div>

      {/* Lateral derecho - Upcoming (solo desktop) */}
      <div className="hidden lg:block lg:col-span-3 h-full overflow-y-auto p-4">
        <UpcomingPanel />
      </div>
    </div>
  );
}
