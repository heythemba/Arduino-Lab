import { Skeleton } from '@/components/ui/skeleton';

export default function AboutLoading() {
    return (
        <main className="min-h-screen bg-background">
            <section className="py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="flex flex-col items-center gap-4 text-center mb-16">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-5 w-96" />
                        <Skeleton className="h-5 w-80" />
                    </div>

                    {/* Content blocks */}
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="mb-12 flex flex-col gap-3">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
