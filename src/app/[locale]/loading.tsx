import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
    return (
        <main className="h-full bg-slate-50/50">
            {/* Hero Skeleton */}
            <section className="relative overflow-hidden bg-background pt-8 pb-20 sm:pt-12 sm:pb-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                        <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 flex flex-col gap-4">
                            <Skeleton className="h-6 w-32 rounded-full" />
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-3/4" />
                            <Skeleton className="h-5 w-full mt-2" />
                            <Skeleton className="h-5 w-5/6" />
                            <div className="mt-4 flex gap-4">
                                <Skeleton className="h-12 w-40 rounded-lg" />
                                <Skeleton className="h-12 w-36 rounded-lg" />
                            </div>
                        </div>
                        <div className="relative mt-12 lg:col-span-6 lg:mt-0">
                            <Skeleton className="w-full aspect-4/3 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Section Skeleton */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 flex flex-col items-center gap-3">
                        <Skeleton className="h-9 w-64" />
                        <Skeleton className="h-5 w-80" />
                    </div>
                    {/* Search bar skeleton */}
                    <Skeleton className="h-16 w-full max-w-3xl mx-auto mb-24 rounded-2xl" />
                    {/* Cards grid */}
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-3 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                <Skeleton className="w-full h-48" />
                                <div className="p-4 flex flex-col gap-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                    <Skeleton className="h-4 w-20 mt-2 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
