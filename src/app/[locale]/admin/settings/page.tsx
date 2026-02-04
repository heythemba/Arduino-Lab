import { getSiteSettings } from '@/lib/api/settings';
import SettingsForm from '@/components/admin/SettingsForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
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
                <h1 className="text-3xl font-bold mb-8 text-slate-900 border-b pb-4">Site Settings</h1>
                <SettingsForm initialSettings={settings} />
            </div>
        </div>
    );
}
