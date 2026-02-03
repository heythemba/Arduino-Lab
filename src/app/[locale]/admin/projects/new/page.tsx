'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { createProject } from '@/app/admin/actions';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import ProjectForm from '@/components/admin/ProjectForm';

export default function CreateProjectPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = use(params);
    const t = useTranslations('ProjectForm');
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 py-12 font-[family-name:var(--font-geist-sans)]">
            <div className="container max-w-4xl mx-auto px-4">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
                    <Button variant="ghost" onClick={() => router.back()}>
                        <X className="h-4 w-4 mr-2" /> {t('cancel')}
                    </Button>
                </div>

                <ProjectForm locale={locale} action={createProject} />

            </div>
            {/* Spacer for fixed footer */}
            <div className="h-24"></div>
        </div>
    );
}

