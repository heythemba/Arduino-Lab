import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { createProject } from '@/app/admin/actions';
import { X } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import ProjectForm from '@/components/admin/ProjectForm';
import { createClient } from '@/lib/supabase/server';

export default async function CreateProjectPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'ProjectForm' });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profile = null;
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profile = data;
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 font-[family-name:var(--font-geist-sans)]">
            <div className="container max-w-4xl mx-auto px-4">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
                    <Link href={`/${locale}/admin`}>
                        <Button variant="ghost">
                            <X className="h-4 w-4 mr-2" /> {t('cancel')}
                        </Button>
                    </Link>
                </div>

                <ProjectForm locale={locale} action={createProject} userProfile={profile} />

            </div>
            {/* Spacer for fixed footer */}
            <div className="h-24"></div>
        </div>
    );
}

