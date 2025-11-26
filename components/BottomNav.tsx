'use client';

import { Home, CreditCard, CalendarDays, Settings } from 'lucide-react';
import { useState } from 'react';

export default function BottomNav() {
    const [active, setActive] = useState('home');

    return (
        <nav className="w-full border-t border-primary/20 bg-elixir-pattern">
            <div className="w-full py-4 flex items-center justify-around">
                <NavButton
                    icon={<Home size={24} />}
                    label="Inicio"
                    active={active === 'home'}
                    onClick={() => setActive('home')}
                />
                <NavButton
                    icon={<CreditCard size={24} />}
                    label="Servicios"
                    active={active === 'services'}
                    onClick={() => setActive('services')}
                />
                <NavButton
                    icon={<CalendarDays size={24} />}
                    label="Calendario"
                    active={active === 'calendar'}
                    onClick={() => setActive('calendar')}
                />
                <NavButton
                    icon={<Settings size={24} />}
                    label="Ajustes"
                    active={active === 'settings'}
                    onClick={() => setActive('settings')}
                />
            </div>
        </nav>
    );
}

function NavButton({ icon, label, active, onClick }: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 transition ${active ? 'text-primary' : 'text-foreground/50'}`}
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
}
