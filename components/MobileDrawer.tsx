'use client';

import { X } from 'lucide-react';

export default function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-0 left-0 h-full w-80 bg-background z-50 shadow-2xl transform transition-transform duration-300 lg:hidden overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gradient">Dashboard</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-primary/10 rounded-full transition"
                        >
                            <X size={24} className="text-primary" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Mismo contenido que DashboardPanel */}
                        <div className="p-4 bg-card rounded-lg border border-primary/20">
                            <p className="text-sm text-foreground/60">Totalizador mensual aquí</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
