'use client';

import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr, ar } from 'date-fns/locale';
import { Trash2, User as UserIcon } from 'lucide-react';
import LikeButton from './LikeButton';
import { deleteComment } from '@/app/actions/comment';
import { useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { parseCommentContent } from '@/lib/commentParser';

type CommentItemProps = {
    comment: {
        id: string;
        content: string;
        created_at: string;
        user_id: string;
        profiles: { full_name: string | null; avatar_url: string | null } | null;
        comment_likes: { count: number }[];
    };
    currentUserId?: string;
    isAdmin?: boolean;
    locale: string;
};

export default function CommentItem({ comment, currentUserId, isAdmin, locale }: CommentItemProps) {
    const t = useTranslations('Comments');
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    const canDelete = isAdmin || (currentUserId && currentUserId === comment.user_id);
    const likeCount = comment.comment_likes?.[0]?.count || 0;

    // Choose date locale
    const dateLocale = locale === 'fr' ? fr : locale === 'ar' ? ar : enUS;

    const handleDelete = () => {
        if (confirm(t('confirmDelete'))) {
            startTransition(async () => {
                await deleteComment(comment.id, pathname);
            });
        }
    };

    return (
        <div className="flex gap-4 group">
            {/* Avatar */}
            <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                    {comment.profiles?.avatar_url ? (
                        <img src={comment.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-6 h-6" />
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900">
                                {comment.profiles?.full_name || t('anonymous')}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: dateLocale })}
                            </span>
                        </div>

                        <div className="text-slate-700 leading-relaxed font-medium">
                            {parseCommentContent(comment.content)}
                        </div>
                    </div>

                    {/* Like Button & Actions at Top Right or Center Right */}
                    <div className="flex flex-col items-center gap-2 pl-4">
                        <LikeButton commentId={comment.id} initialCount={likeCount} />

                        {canDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleDelete}
                                disabled={isPending}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
