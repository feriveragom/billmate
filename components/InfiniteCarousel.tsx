'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, ReactNode } from 'react';

interface InfiniteCarouselProps {
    items: any[];
    renderItem: (item: any, index: number) => ReactNode;
    itemWidth: number; // Ancho en píxeles de cada item
    gap: number; // Gap entre items en píxeles
    align?: 'start' | 'center' | 'end'; // Alineación de los items
    className?: string;
}

export default function InfiniteCarousel({
    items,
    renderItem,
    itemWidth,
    gap,
    align = 'center',
    className = ''
}: InfiniteCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(3);
    const [showArrows, setShowArrows] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calcular cuántos items caben en la pantalla
    useEffect(() => {
        const updateItemsPerView = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const totalItemWidth = itemWidth + gap;
                const fits = Math.floor(containerWidth / totalItemWidth);
                setItemsPerView(fits);
                setShowArrows(items.length > fits);
            }
        };

        updateItemsPerView();
        window.addEventListener('resize', updateItemsPerView);
        return () => window.removeEventListener('resize', updateItemsPerView);
    }, [items.length, itemWidth, gap]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    };

    // Crear array circular de items para mostrar
    const getVisibleItems = () => {
        // Si hay menos items que los que caben, mostrar todos sin duplicar
        if (items.length <= itemsPerView) {
            return items.map((item, index) => ({ item, originalIndex: index }));
        }

        // Si hay más items que los que caben, hacer scroll circular
        const visible = [];
        for (let i = 0; i < itemsPerView; i++) {
            const index = (currentIndex + i) % items.length;
            visible.push({ item: items[index], originalIndex: index });
        }
        return visible;
    };

    const visibleItems = getVisibleItems();

    const alignmentClasses = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end'
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Botón anterior */}
            {showArrows ? (
                <button
                    onClick={handlePrev}
                    className="flex-none p-2 bg-background backdrop-blur rounded-full shadow-lg hover:bg-primary/10 transition border border-primary/20"
                >
                    <ChevronLeft size={20} className="text-primary" />
                </button>
            ) : (
                <div className="w-0"></div>
            )}

            {/* Container de items */}
            <div
                ref={containerRef}
                className={`flex-1 flex overflow-hidden py-2 lg:py-4 ${alignmentClasses[align]}`}
                style={{ gap: `${gap}px` }}
            >
                {visibleItems.map(({ item, originalIndex }, idx) => (
                    <div key={`${originalIndex}-${currentIndex}-${idx}`}>
                        {renderItem(item, originalIndex)}
                    </div>
                ))}
            </div>

            {/* Botón siguiente */}
            {showArrows ? (
                <button
                    onClick={handleNext}
                    className="flex-none p-2 bg-background backdrop-blur rounded-full shadow-lg hover:bg-primary/10 transition border border-primary/20"
                >
                    <ChevronRight size={20} className="text-primary" />
                </button>
            ) : (
                <div className="w-0"></div>
            )}
        </div>
    );
}
