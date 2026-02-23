import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        redirect(`/${locale}/admin`);
    }

    return <LoginForm locale={locale} />;
}
