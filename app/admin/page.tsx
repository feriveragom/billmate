'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/admin/users');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-full text-foreground/50">
            Redirigiendo...
        </div>
    );
}
