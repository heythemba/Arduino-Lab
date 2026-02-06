'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';

type AddCommentState = {
    message?: string;
    success?: boolean;
    error?: boolean;
};

/**
 * Adds a comment to a project.
 */
export async function addComment(prevState: AddCommentState, formData: FormData): Promise<AddCommentState> {
    const t = await getTranslations('Comments');
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: true, message: t('errorLoginRequired') };
    }

    // 2. Extract data
    const projectId = formData.get('projectId') as string;
    const content = formData.get('content') as string;
    const path = formData.get('path') as string; // Current path to revalidate

    if (!projectId || !content || content.trim().length === 0) {
        return { error: true, message: t('errorEmptyContent') };
    }

    try {
        // 3. Insert comment
        const { error } = await supabase
            .from('comments')
            .insert({
                project_id: projectId,
                user_id: user.id,
                content: content.trim()
            });

        if (error) throw error;

        // 4. Revalidate
        if (path) revalidatePath(path);

        return { success: true, message: t('successAdded') };
    } catch (error) {
        console.error('Add Comment Error:', error);
        return { error: true, message: t('errorGeneric') };
    }
}

/**
 * Deletes a comment.
 * RLS policies ensure strict ownership/admin checks, 
 * but we perform a double-check here for better UX feedback.
 */
export async function deleteComment(commentId: string, path: string) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) throw error;

        revalidatePath(path);
        return { success: true };
    } catch (error) {
        console.error('Delete Comment Error:', error);
        return { error: true };
    }
}

/**
 * Toggles a like on a comment for a PUBLIC visitor.
 */
export async function toggleLike(commentId: string, visitorId: string, path: string) {
    const supabase = await createClient();

    try {
        // Check if like exists
        const { data: existingLike } = await supabase
            .from('comment_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('visitor_id', visitorId)
            .single();

        if (existingLike) {
            // Unlike
            await supabase
                .from('comment_likes')
                .delete()
                .eq('id', existingLike.id);
        } else {
            // Like
            await supabase
                .from('comment_likes')
                .insert({
                    comment_id: commentId,
                    visitor_id: visitorId
                });
        }

        revalidatePath(path);
        return { success: true };
    } catch (error) {
        console.error('Toggle Like Error:', error);
        return { error: true };
    }
}

/**
 * Fetch comments for a project with profiles and like counts.
 */
export async function getComments(projectId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('comments')
        .select(`
            id,
            content,
            created_at,
            user_id,
            profiles (
                full_name,
                avatar_url
            ),
            comment_likes (count)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch Comments Error:', error);
        return [];
    }

    return data;
}

/**
 * Fetch recent comments for Admin Dashboard.
 */
export async function getRecentComments() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('comments')
        .select(`
            id,
            content,
            created_at,
            project_id,
            projects (title, slug),
            profiles (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Fetch Recent Comments Error:', error);
        return [];
    }

    return data;
}
