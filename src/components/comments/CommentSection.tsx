import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getComments } from '@/app/actions/comment';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

type CommentSectionProps = {
    projectId: string;
    locale: string;
};

export default async function CommentSection({ projectId, locale }: CommentSectionProps) {
    const t = await getTranslations('Comments');
    const supabase = await createClient();

    // Fetch User
    const { data: { user } } = await supabase.auth.getUser();
    let profile = null;
    let isAdmin = false;

    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profile = data;
        isAdmin = profile?.role === 'admin';
    }

    // Fetch Comments
    const comments = await getComments(projectId);

    return (
        <section id="comments" className="scroll-mt-20">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

                <div className="space-y-12">
                    {/* Comment Form */}
                    <div className="bg-white">
                        <CommentForm projectId={projectId} currentUser={profile} />
                    </div>

                    <div className="border-t border-slate-200" />

                    {/* Comments Header & List (Client Component handles sorting) */}
                    <div>
                        <CommentList
                            initialComments={comments}
                            currentUser={user}
                            isAdmin={isAdmin}
                            locale={locale}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
