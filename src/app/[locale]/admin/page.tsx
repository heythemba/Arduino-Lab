import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit, Settings, Mail } from 'lucide-react';
import DeleteProjectButton from '@/components/admin/DeleteProjectButton';
import RecentCommentsList from '@/components/admin/RecentCommentsList';

export default async function AdminDashboard({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'AdminDashboard' });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Protect the route
    if (!user) {
        redirect(`/${locale}/login`);
    }

    // Fetch Projects and User Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

    // Fetch projects
    let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (profile?.role !== 'admin') {
        query = query.eq('author_id', user.id);
    }

    const { data: projects } = await query;

    return (
        <main className="flex-1 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">

                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t('welcome', { email: profile?.full_name || user.email || 'User' })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {profile?.role === 'admin' && (
                            <>
                                <Link href={`/${locale}/admin/settings`}>
                                    <Button variant="outline" className="gap-2">
                                        <Settings className="h-4 w-4" /> {t('settings') || 'Settings'}
                                    </Button>
                                </Link>
                                <Link href={`/${locale}/admin/users/new`}>
                                    <Button variant="outline" className="gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl leading-none font-bold">+</span>
                                            <span>{t('newUser.title')}</span>
                                        </div>
                                    </Button>
                                </Link>
                            </>
                        )}
                        <Link href={`/${locale}/admin/projects/new`}>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> {t('createProject')}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Projects Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {projects && projects.length > 0 ? (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100/80 text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-6 py-4">{t('table.title')}</th>
                                    <th className="px-6 py-4">{t('table.category')}</th>
                                    <th className="px-6 py-4 text-right">{t('table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {project.title?.[locale] || project.title?.['en'] || 'Untitled'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                {project.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/${locale}/admin/projects/${project.slug}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">{t('table.edit')}</span>
                                                    </Button>
                                                </Link>
                                                <DeleteProjectButton projectId={project.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground">
                            <p>{t('noProjects')}</p>
                        </div>
                    )}
                </div>

                {/* Recent Comments Feed (Admins Only) */}
                {profile?.role === 'admin' && (
                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <RecentCommentsList locale={locale} />
                        </div>
                    </div>
                )}

            </div>

        </main >
    );
}
