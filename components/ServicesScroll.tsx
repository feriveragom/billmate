'use client';

import { useApp } from '@/lib/store';
import HorizontalScroll from './HorizontalScroll';

export default function ServicesScroll() {
    const { services } = useApp();

    return (
        <section className="px-4 py-4">
            <h2 className="text-sm font-semibold text-foreground/60 mb-3 px-1">ALARMAS</h2>
            <HorizontalScroll>
                {services.map((service) => (
                    <ServiceCard key={service.id} {...service} />
                ))}
            </HorizontalScroll>
        </section>
    );
}

function ServiceCard({ icon, name, amount, dueDate, status }: {
    icon: string;
    name: string;
    amount: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
}) {
    const statusColors = {
        paid: 'bg-green-500/10 border-green-500/30',
        pending: 'bg-yellow-500/10 border-yellow-500/30',
        overdue: 'bg-red-500/10 border-red-500/30'
    };

    // Formatear fecha (ej: 2025-11-25 -> 25 Nov)
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        } catch (e) {
            return dateStr;
        }
    };

    // Detectar si es imagen
    const isImage = (icon: string) => icon?.startsWith('data:image') || icon?.startsWith('http') || icon?.startsWith('/');

    return (
        <div className={`flex-shrink-0 w-36 p-4 rounded-2xl ${statusColors[status]} border transition hover:scale-105`}>
            <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/20 mb-1 overflow-hidden">
                    {isImage(icon) ? (
                        <img src={icon} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl">{icon}</span>
                    )}
                </div>
                <h3 className="font-bold text-foreground truncate w-full">{name}</h3>
                <p className="text-2xl font-bold text-primary">${amount.toFixed(2)}</p>
                <p className="text-xs text-foreground/60">Vence: {formatDate(dueDate)}</p>
            </div>
        </div>
    );
}
