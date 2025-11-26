'use client';

export default function DashboardPanel() {
    return (
        <aside className="sticky top-0 h-screen overflow-y-auto scrollbar-hide p-6 bg-elixir-pattern border-r border-white/10">
            <h2 className="text-xl font-bold text-gradient mb-4">Dashboard</h2>
            <div className="space-y-4">
                {/* Contenido aquí después */}
                <div className="p-4 bg-card rounded-lg border border-primary/20">
                    <p className="text-sm text-foreground/60">Totalizador mensual aquí</p>
                </div>
            </div>
        </aside>
    );
}
