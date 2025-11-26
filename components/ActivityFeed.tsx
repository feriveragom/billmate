'use client';

import { useApp } from '@/lib/store';
import { Archive, ArchiveX } from 'lucide-react';

interface ActivityFeedProps {
    showArchived?: boolean;
}

export default function ActivityFeed({ showArchived = false }: ActivityFeedProps) {
    const { activities, archivedActivities, archiveActivity, unarchiveActivity } = useApp();

    const displayActivities = showArchived ? archivedActivities : activities;
    const title = showArchived ? 'NOTIFICACIONES ARCHIVADAS' : 'NOTIFICACIONES';

    return (
        <section className="px-4 pt-4 pb-0">
            <h2 className="text-sm font-semibold text-foreground/60 mb-3 px-1">{title}</h2>
            <div className="space-y-3">
                {displayActivities.length === 0 ? (
                    <div className="text-center py-8 text-foreground/40">
                        {showArchived ? 'No hay notificaciones archivadas' : 'No hay notificaciones recientes'}
                    </div>
                ) : (
                    displayActivities.map(activity => (
                        <ActivityCard
                            key={activity.id}
                            {...activity}
                            isArchived={showArchived}
                            onArchive={() => archiveActivity(activity.id)}
                            onUnarchive={() => unarchiveActivity(activity.id)}
                        />
                    ))
                )}
            </div>
        </section>
    );
}

function ActivityCard({
    icon,
    title,
    description,
    time,
    isArchived,
    onArchive,
    onUnarchive
}: {
    icon: string;
    title: string;
    description: string;
    time: string;
    isArchived: boolean;
    onArchive: () => void;
    onUnarchive: () => void;
}) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-primary/10 hover:border-primary/30 transition">
            <div className="text-2xl">{icon}</div>
            <div className="flex-1">
                <h4 className="font-semibold text-foreground">{title}</h4>
                <p className="text-sm text-foreground/70">{description}</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/50">{time}</span>
                <button
                    onClick={isArchived ? onUnarchive : onArchive}
                    className="p-1.5 hover:bg-primary/10 rounded-lg transition"
                    title={isArchived ? 'Desarchivar' : 'Archivar'}
                >
                    {isArchived ? (
                        <ArchiveX size={18} className="text-primary" />
                    ) : (
                        <Archive size={18} className="text-primary/60 hover:text-primary" />
                    )}
                </button>
            </div>
        </div>
    );
}
