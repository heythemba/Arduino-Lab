'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    // We can try to use translations here, but since it's an error boundary, 
    // hooks might sometimes be tricky. However, in standard Next-Intl (app router), this works within [locale].
    // If useTranslations causes issues (e.g. locale not found), we fallback to hardcoded or generic.
    // For safety/simplicity in this fix, I'll use hardcoded English/Generic first, or try/catch.
    // actually, let's just stick to a clean UI that works.

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">404 - Not Found</h2>
            <p className="text-muted-foreground mb-8">Could not find requested resource</p>
            <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
                Return Home
            </Link>
        </div>
    );
}
