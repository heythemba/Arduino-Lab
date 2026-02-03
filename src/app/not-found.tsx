'use client';

import Link from 'next/link';

// Global Not Found (outside [locale]) must render its own html/body
export default function GlobalNotFound() {
    return (
        <html lang="en">
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4 font-sans">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">404 - Page Not Found</h2>
                    <p className="text-gray-600 mb-8">The requested page could not be found.</p>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Return Home
                    </Link>
                </div>
            </body>
        </html>
    );
}
