/**
 * Loading skeleton for the project detail page.
 *
 * Renders placeholders for the hero, description, steps, and attachments
 * while the full project payload is fetched.
 */
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectLoading() {
    return (
        <main className="min-h-screen bg-slate-50/50">
            {/* Hero image */}
            <Skeleton className="w-full h-72 sm:h-96 rounded-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
                {/* Breadcrumb */}
                <div className="flex gap-2 mb-6">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                </div>

                {/* Title & meta */}
                <div className="flex flex-col gap-3 mb-8">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-5 w-40 rounded-full" />
                    <div className="flex gap-4 mt-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2 mb-10">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </div>

                {/* Steps */}
                <Skeleton className="h-7 w-48 mb-6" />
                <div className="flex flex-col gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>

                {/* Attachments */}
                <Skeleton className="h-7 w-40 mt-10 mb-4" />
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </main>
    );
}
