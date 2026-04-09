import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
    return (
        <main className="flex-1 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-8 sm:px-12 lg:px-16 py-12">
                <div className="flex flex-col gap-2 mb-10">
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-4 w-64" />
                </div>

                {/* Users table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex gap-8">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="px-6 py-4 flex items-center gap-8 border-b border-slate-50">
                            <Skeleton className="h-5 w-44" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-8 w-20 rounded-lg ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
