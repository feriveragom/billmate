'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface HorizontalScrollProps {
    children: React.ReactNode;
    className?: string;
}

export default function HorizontalScroll({ children, className = '' }: HorizontalScrollProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // -1 for tolerance
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [children]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300; // Adjust scroll amount as needed
            const newScrollLeft = direction === 'left'
                ? scrollRef.current.scrollLeft - scrollAmount
                : scrollRef.current.scrollLeft + scrollAmount;

            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={`relative group ${className}`}>
            {/* Left Arrow - Only visible on Desktop when needed */}
            {showLeftArrow && (
                <button
                    onClick={() => scroll('left')}
                    className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-primary/20 text-primary hover:bg-primary/10 transition-all"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="overflow-x-auto scrollbar-hide flex gap-3 py-2 px-1"
            >
                {children}
            </div>

            {/* Right Arrow - Only visible on Desktop when needed */}
            {showRightArrow && (
                <button
                    onClick={() => scroll('right')}
                    className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-primary/20 text-primary hover:bg-primary/10 transition-all"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={24} />
                </button>
            )}
        </div>
    );
}
