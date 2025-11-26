'use client';

import { Bell, Search, Moon, Sun, Archive, List } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function TopHeader() {
    const { notifications, archivedActivities, theme, toggleTheme, toggleArchivedView, showArchivedView } = useApp();

    return (
        <header className="sticky top-0 z-50 glass border-b border-white/10">
            <div className="w-full flex items-center justify-between px-4 py-4 gap-4">
                <h1 className="text-2xl font-bold text-gradient flex-shrink-0">billmate</h1>

                <div className="flex items-center gap-3 flex-1 justify-end">
                    {/* Input de búsqueda */}
                    <div className="relative flex-1 max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full px-4 py-2 pr-10 rounded-full bg-card border border-primary/20 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition"
                        />
                        <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60" />
                    </div>

                    <button className="flex-shrink-0 relative p-2 hover:bg-primary/10 rounded-full transition">
                        <Bell size={24} className="text-primary" />
                        {notifications > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>

                    <button
                        onClick={toggleArchivedView}
                        className="flex-shrink-0 relative p-2 hover:bg-primary/10 rounded-full transition"
                        title={showArchivedView ? 'Ver notificaciones actuales' : 'Ver notificaciones archivadas'}
                    >
                        {showArchivedView ? (
                            <List size={24} className="text-primary" />
                        ) : (
                            <Archive size={24} className="text-primary" />
                        )}
                        {!showArchivedView && archivedActivities.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-primary-dark text-xs font-bold rounded-full flex items-center justify-center">
                                {archivedActivities.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="flex-shrink-0 p-2 hover:bg-primary/10 rounded-full transition"
                    >
                        {theme === 'light' ? (
                            <Moon size={24} className="text-primary" />
                        ) : (
                            <Sun size={24} className="text-primary" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
