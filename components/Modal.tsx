'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    colorPicker?: React.ReactNode; // Selector de color opcional
}

export default function Modal({ isOpen, onClose, title, children, colorPicker }: ModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Bloquear scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Esperar animación
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-3 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop - Sin onClick para evitar cierre accidental */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />

            {/* Modal Content - Estilo "Hoja" que sube en móvil, centrado en desktop */}
            <div
                className={`
                    relative w-full max-w-lg bg-elixir-pattern backdrop-blur-xl border-t sm:border border-white/10 
                    rounded-3xl sm:rounded-3xl shadow-2xl flex flex-col h-auto max-h-[90vh]
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-full sm:translate-y-10 sm:scale-95'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gradient">{title}</h2>
                    <div className="flex items-center gap-3">
                        {colorPicker && colorPicker}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-black/5 rounded-full transition text-primary/80 hover:text-primary"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 pt-0 overflow-y-auto custom-scrollbar flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
