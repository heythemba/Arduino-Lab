'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { addComment } from '@/app/actions/comment';
import { Loader2 } from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Link, usePathname } from '@/i18n/routing';

type CommentFormProps = {
    projectId: string;
    currentUser?: any;
};

export default function CommentForm({ projectId, currentUser }: CommentFormProps) {
    const t = useTranslations('Comments');
    const [state, formAction, isPending] = useActionState(addComment, {});
    const pathname = usePathname();
    const [content, setContent] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    // Reset form on success
    useEffect(() => {
        if (state?.success && formRef.current) {
            formRef.current.reset();
            setContent('');
        }
    }, [state?.success]);

    // Removed local refs and handleFormat as they are now in RichTextEditor



    if (!currentUser) {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                <p className="text-slate-600 mb-4">{t('loginToComment')}</p>
                <Link href="/login">
                    <Button variant="outline">{t('login')}</Button>
                </Link>
            </div>
        );
    }

    return (
        <form ref={formRef} action={formAction} className="space-y-4 p-6 border border-slate-200 rounded-3xl bg-slate-50/30">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="path" value={pathname} />

            {/* User Display */}
            <div className="text-sm text-slate-500 pl-1">
                {t('postingAs')} <span className="font-bold text-slate-900">{currentUser.full_name || currentUser.email}</span>
            </div>

            {/* Comment Area */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Add comment ...
                </label>
                <div className="relative">
                    <RichTextEditor
                        name="content"
                        value={content}
                        onChange={setContent}
                        placeholder={t('placeholder')}
                        required
                    />
                    <div className="absolute bottom-2 right-2 z-10">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 h-9 text-xs font-semibold"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                    {t('sending')}
                                </>
                            ) : (
                                t('send')
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {state?.error && (
                <p className="text-sm text-red-500">{state.message}</p>
            )}
        </form>
    );
}
