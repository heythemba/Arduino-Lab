import { getRecentComments } from '@/app/actions/comment';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr, ar } from 'date-fns/locale';
import Link from 'next/link';
import { ExternalLink, User } from 'lucide-react';

type RecentCommentsListProps = {
    locale: string;
};

export default async function RecentCommentsList({ locale }: RecentCommentsListProps) {
    const comments = await getRecentComments();

    // Date locale mapping
    const dateLocale = locale === 'fr' ? fr : locale === 'ar' ? ar : enUS;

    if (!comments || comments.length === 0) {
        return (
            <div className="text-center py-6 text-muted-foreground text-sm">
                No recent activity.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-slate-900 truncate">
                                {comment.profiles?.full_name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                commented on
                            </span>
                            <Link
                                href={`/${locale}/projects/${comment.projects?.slug || '#'}`} // Assuming projects will store slug or ID. 
                                // Actually getRecentComments select included `projects (title)`.
                                // I should update getRecentComments to include slug too?
                                // For now, let's assume I need to fetch Project Slug.
                                className="text-sm font-medium text-primary hover:underline truncate max-w-[150px]"
                            >
                                {comment.projects?.title?.[locale] || comment.projects?.title?.['en'] || 'Project'}
                            </Link>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                            "{comment.content}"
                        </p>

                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-slate-400">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: dateLocale })}
                            </span>
                            <Link
                                href={`/${locale}/projects/${comment.projects?.slug || '#'}#comments`}
                                className="text-xs text-primary flex items-center gap-1 hover:underline"
                            >
                                View Context <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
