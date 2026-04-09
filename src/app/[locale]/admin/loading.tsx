import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardLoading() {
    return (
        <main className="flex-1 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-8 sm:px-12 lg:px-16 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-9 w-52" />
                        <Skeleton className="h-4 w-72" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-28 rounded-lg" />
                        <Skeleton className="h-10 w-36 rounded-lg" />
                    </div>
                </div>

                {/* Projects Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Table header */}
                    <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex gap-8">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                    {/* Table rows */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="px-6 py-4 flex items-center gap-8 border-b border-slate-50">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <div className="flex gap-2 ml-auto">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="mt-12">
                    <Skeleton className="h-7 w-44 mb-4" />
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                                <div className="flex flex-col gap-2 flex-1">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
