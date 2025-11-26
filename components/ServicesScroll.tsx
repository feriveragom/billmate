'use client';

import { useApp } from '@/lib/store';
import InfiniteCarousel from './InfiniteCarousel';

export default function ServicesScroll() {
    const { services } = useApp();

    return (
        <section className="px-4 py-4">
            <h2 className="text-sm font-semibold text-foreground/60 mb-3 px-1">ALARMAS</h2>
            <InfiniteCarousel
                items={services}
                renderItem={(service) => <ServiceCard {...service} />}
                itemWidth={144} // w-36 = 36*4px = 144px
                gap={12} // gap-3 = 12px
            />
        </section>
    );
}

function ServiceCard({ icon, name, amount, dueDate, status }: {
    icon: string;
    name: string;
    amount: number;
    dueDate: number;
    status: 'paid' | 'pending' | 'overdue';
}) {
    const statusColors = {
        paid: 'bg-green-500/10 border-green-500/30',
        pending: 'bg-yellow-500/10 border-yellow-500/30',
        overdue: 'bg-red-500/10 border-red-500/30'
    };

    return (
        <div className={`flex-shrink-0 w-36 p-4 rounded-2xl ${statusColors[status]} border transition hover:scale-105`}>
            <div className="flex flex-col items-center text-center gap-2">
                <div className="text-4xl mb-1">{icon}</div>
                <h3 className="font-bold text-foreground">{name}</h3>
                <p className="text-2xl font-bold text-primary">${amount.toFixed(2)}</p>
                <p className="text-xs text-foreground/60">Vence: {dueDate}</p>
            </div>
        </div>
    );
}
