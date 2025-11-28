'use client';

import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

export type DialogType = 'error' | 'warning' | 'success' | 'info';

interface ConfirmDialogProps {
    isOpen: boolean;
    type?: DialogType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    type = 'warning',
    title,
    message,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const typeConfig = {
        error: {
            icon: XCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20',
            buttonColor: 'bg-red-500 hover:bg-red-600'
        },
        warning: {
            icon: AlertTriangle,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
            buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
        },
        success: {
            icon: CheckCircle,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20',
            buttonColor: 'bg-green-500 hover:bg-green-600'
        },
        info: {
            icon: Info,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            buttonColor: 'bg-blue-500 hover:bg-blue-600'
        }
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-md bg-card border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 fade-in duration-200">
                {/* Close button - arriba derecha */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-lg transition"
                >
                    <X size={20} className="text-foreground/50" />
                </button>

                {/* Icon - centrado */}
                <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-xl ${config.bgColor} ${config.borderColor} border`}>
                        <Icon className={config.color} size={24} />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-2 text-center">{title}</h3>

                {/* Message */}
                <p className="text-sm text-foreground/70 mb-6 whitespace-pre-line text-center">{message}</p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-foreground font-medium transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 px-4 rounded-xl ${config.buttonColor} text-white font-bold transition shadow-lg`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
