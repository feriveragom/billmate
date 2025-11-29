'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Moon, Sun, Archive, List } from 'lucide-react';
import { useApp } from '@/lib/store';
import Link from 'next/link';
import UserMenu from '@/features/auth/components/user-menu';

export default function TopHeader({ onDashboardClick }: { onDashboardClick?: () => void }) {
    const { notifications, archivedActivities, theme, toggleTheme, toggleArchivedView, showArchivedView } = useApp();

    return (
        <header className="sticky top-0 z-50 glass border-b border-white/10">
            {/* Primera fila: Logo + Iconos */}
            <div className="w-full flex items-center justify-between px-4 py-3 gap-2">
                <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                    <img src="/logo.png" alt="BillMate" className="w-8 h-8" />
                    <h1 className="text-xl md:text-2xl font-bold text-gradient">billmate</h1>
                </Link>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Búsqueda solo en desktop */}
                    <div className="relative hidden md:flex flex-1 max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full px-4 py-2 pr-10 rounded-full bg-card border border-primary/20 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition"
                        />
                        <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60" />
                    </div>

                    <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-2">
                        <button className="flex-shrink-0 relative p-2 hover:bg-primary/10 rounded-full transition text-foreground/70 hover:text-foreground">
                            <Bell size={20} />
                            {notifications > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        <button
                            onClick={toggleArchivedView}
                            className="flex-shrink-0 relative p-2 hover:bg-primary/10 rounded-full transition text-foreground/70 hover:text-foreground"
                            title={showArchivedView ? 'Ver notificaciones actuales' : 'Ver notificaciones archivadas'}
                        >
                            {showArchivedView ? (
                                <List size={20} />
                            ) : (
                                <Archive size={20} />
                            )}
                            {!showArchivedView && archivedActivities.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-primary-dark text-xs font-bold rounded-full flex items-center justify-center">
                                    {archivedActivities.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="flex-shrink-0 p-2 hover:bg-primary/10 rounded-full transition text-foreground/70 hover:text-foreground"
                        >
                            {theme === 'light' ? (
                                <Moon size={20} />
                            ) : (
                                <Sun size={20} />
                            )}
                        </button>
                    </div>

                    {/* User Menu */}
                    <UserMenu />
                </div>
            </div>

            {/* Segunda fila: Búsqueda en móvil */}
            <div className="md:hidden px-4 pb-3">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full px-4 py-2 pr-10 rounded-full bg-card border border-primary/20 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition"
                    />
                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60" />
                </div>
            </div>
        </header>
    );
}
