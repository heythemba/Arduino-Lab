'use client';

import { Heart } from 'lucide-react';
import { toggleLike } from '@/app/actions/comment';
import { useEffect, useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type LikeButtonProps = {
    commentId: string;
    initialCount: number;
    initialLikedByVisitor?: boolean; // We might not know this server-side without cookie/IP, so we check client-side
};

export default function LikeButton({ commentId, initialCount }: LikeButtonProps) {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    // Check if visitor has liked this comment on mount
    useEffect(() => {
        const visitorId = localStorage.getItem('visitor_id');
        if (visitorId) {
            // In a real app we'd fetch "did I like this" from an API if we want perfect sync across devices (if auth).
            // For public visitor with localStorage, we might store "liked_comments" array in localStorage too 
            // OR we just rely on the server count/state if we could query it by visitor_id.

            // SIMPLIFIED APPROACH:
            // We'll store a list of liked comment IDs in localStorage to show the red heart immediately.
            const likedComments = JSON.parse(localStorage.getItem('liked_comments') || '[]');
            if (likedComments.includes(commentId)) {
                setLiked(true);
            }
        } else {
            // Generate visitor ID if not present
            const newId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('visitor_id', newId);
        }
    }, [commentId]);

    const handleToggle = () => {
        const visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) return;

        // Optimistic Update
        const newLiked = !liked;
        setLiked(newLiked);
        setCount(prev => newLiked ? prev + 1 : prev - 1);

        // Update LocalStorage record
        const likedComments = JSON.parse(localStorage.getItem('liked_comments') || '[]');
        if (newLiked) {
            if (!likedComments.includes(commentId)) likedComments.push(commentId);
        } else {
            const index = likedComments.indexOf(commentId);
            if (index > -1) likedComments.splice(index, 1);
        }
        localStorage.setItem('liked_comments', JSON.stringify(likedComments));

        startTransition(async () => {
            await toggleLike(commentId, visitorId, pathname);
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-900 transition-colors group"
        >
            <Heart
                className={cn("h-5 w-5 transition-all", liked ? "fill-red-500 text-red-500" : "group-hover:scale-110")}
            />
            <span className="text-xs font-semibold">{count}</span>
        </button>
    );
}
