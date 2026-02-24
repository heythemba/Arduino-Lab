import { getSiteSettings } from '@/lib/api/settings';
import SettingsForm from '@/components/admin/SettingsForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default async function SettingsPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'AdminDashboard' });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check User Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect(`/${(await params).locale}/admin`);
    }

    // Optional: Add check for specific email if you want to restrict this page only to you
    // if (user.email !== 'heythem.94@gmail.com') { return <div>Access Denied</div> }

    const settings = await getSiteSettings();

    if (!settings) {
        return <div>Error loading settings. Please check database configuration.</div>;
    }

    return (
        <div className="container mx-auto py-12 px-4 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-slate-900">Site Settings</h1>
                    <Link href={`/${locale}/admin`}>
                        <Button variant="ghost" className="gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            {t('newUser.back')}
                        </Button>
                    </Link>
                </div>
                <SettingsForm initialSettings={settings} />
            </div>
        </div>
    );
}
