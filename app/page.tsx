'use client';

import TopHeader from '@/components/TopHeader';
import QuickActions from '@/components/QuickActions';
import ServicesScroll from '@/components/ServicesScroll';
import ActivityFeed from '@/components/ActivityFeed';
import BottomNav from '@/components/BottomNav';
import { useApp } from '@/lib/store';

export default function HomePage() {
  const { showArchivedView } = useApp();

  return (
    <div className="min-h-screen bg-elixir-pattern">
      <div className="grid grid-cols-1 lg:grid-cols-4">
        {/* Lateral izquierdo - solo visible en lg */}
        <div className="hidden lg:block lg:col-span-1 bg-elixir-pattern min-h-screen"></div>

        {/* Contenido central - ocupa todo en mobile, 2/4 en desktop */}
        <div className="col-span-1 lg:col-span-2 bg-background flex flex-col h-screen">
          {/* Header - siempre visible */}
          <div className="flex-none">
            <TopHeader />
          </div>

          {/* Quick Actions - siempre visible */}
          <div className="flex-none">
            <QuickActions />
          </div>

          {/* Área scrolleable - crece y tiene scroll */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <ServicesScroll />
            <ActivityFeed showArchived={showArchivedView} />
          </div>

          {/* BottomNav - siempre visible */}
          <div className="flex-none">
            <BottomNav />
          </div>
        </div>

        {/* Lateral derecho - solo visible en lg */}
        <div className="hidden lg:block lg:col-span-1 bg-elixir-pattern min-h-screen"></div>
      </div>


    </div>
  );
}
