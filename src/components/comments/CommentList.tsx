'use client';

import { useState } from 'react';
import CommentItem from './CommentItem';
import { ArrowDownUp, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type CommentListProps = {
    initialComments: any[]; // Using any to avoid complex type duplication for now
    currentUser?: any;
    isAdmin: boolean;
    locale: string;
};

export default function CommentList({ initialComments, currentUser, isAdmin, locale }: CommentListProps) {
    const t = useTranslations('Comments');
    const [sortBy, setSortBy] = useState<'recent' | 'likes'>('recent');

    // Sort logic
    const comments = [...initialComments].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else {
            // Sort by likes count
            const likesA = a.comment_likes?.[0]?.count || 0;
            const likesB = b.comment_likes?.[0]?.count || 0;
            return likesB - likesA;
        }
    });

    const toggleSort = () => {
        setSortBy(prev => prev === 'recent' ? 'likes' : 'recent');
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    {/* Header handled in parent mostly, but we can render sort controls here */}
                    <span className="text-sm font-semibold text-slate-500">
                        {comments.length} {comments.length === 1 ? t('commentSingular') : t('commentPlural')}
                    </span>
                </div>

                <button
                    onClick={toggleSort}
                    className="flex items-center gap-2 text-sm text-slate-500 font-medium cursor-pointer hover:text-slate-800 transition-colors bg-slate-100/50 hover:bg-slate-100 px-3 py-1.5 rounded-lg"
                >
                    <ArrowDownUp className="h-4 w-4" />
                    <span>{sortBy === 'recent' ? t('sortRecent') : t('sortLiked')}</span>
                </button>
            </div>

            <div className="space-y-8">
                {comments.length > 0 ? (
                    comments.map((comment: any) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUser?.id}
                            isAdmin={isAdmin}
                            locale={locale}
                        />
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500">{t('noComments')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
