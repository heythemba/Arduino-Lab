'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SearchFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const t = useTranslations('SearchFilters');

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams);
        if (category && category !== 'All') {
            params.set('category', category);
        } else {
            params.delete('category');
        }
        replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-3xl mx-auto mb-10 p-4 bg-white/60 backdrop-blur-md rounded-2xl border shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t('placeholder')}
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('q')?.toString()}
                />
            </div>

            {/* Category Dropdown */}
            <div className="relative min-w-[150px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                    className="flex h-10 w-full appearance-none rounded-xl border border-input bg-transparent px-3 py-2 pl-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    defaultValue={searchParams.get('category')?.toString()}
                >
                    <option value="All">{t('allCategories')}</option>
                    <option value="Robotics">{t('robotics')}</option>
                    <option value="IoT">{t('iot')}</option>
                    <option value="Sensors">{t('sensors')}</option>
                    <option value="Automation">{t('automation')}</option>
                </select>
            </div>
        </div>
    );
}
