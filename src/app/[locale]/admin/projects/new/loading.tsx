/**
 * Loading skeleton for the new project creation page.
 *
 * Provides visual placeholders for the project form while resources load.
 */
import { Skeleton } from '@/components/ui/skeleton';

export default function NewProjectLoading() {
    return (
        <main className="flex-1 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-8 sm:px-12 lg:px-16 py-12 max-w-4xl">
                <Skeleton className="h-9 w-52 mb-10" />

                {/* Form card */}
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                        <Skeleton className="h-6 w-40 mb-6" />
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-28 w-full rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Steps skeleton */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                    <Skeleton className="h-6 w-24 mb-6" />
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-24 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center shadow-2xl">
                    <Skeleton className="h-12 w-full max-w-md rounded-lg" />
                </div>
            </div>
        </main>
    );
}
