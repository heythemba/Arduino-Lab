import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

/**
 * POST /api/upload-image
 * 
 * Secure server-side proxy for ImageBB uploads.
 * The API key stays on the server — the browser never sees it.
 * Requires an authenticated Supabase session.
 */
export async function POST(req: Request) {
    // Require authentication — only logged-in users can upload images
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the file from the incoming request
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate: images only, max 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Only JPEG, PNG, GIF and WEBP images are allowed.' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Forward to ImageBB with our server-side API key
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Image hosting is not configured. Please contact the administrator.' }, { status: 503 });
    }

    // ImageBB handles multipart/form-data efficiently for File objects
    const imgbbFormData = new FormData();
    imgbbFormData.append('key', apiKey);
    imgbbFormData.append('image', file);

    try {
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: imgbbFormData
        });

        const result = await response.json() as {
            data?: { url: string; display_url: string; delete_url: string; };
            success: boolean;
            status: number;
            error?: { message: string; code: number; };
        };

        if (!response.ok || !result.success || !result.data) {
            console.error('ImageBB Upload Error:', result);
            const errMsg = result.error?.message || 'Upload failed';
            return NextResponse.json({ error: errMsg }, { status: 502 });
        }

        if (!result.data.url) {
            console.error('ImageBB returned success but no image URL:', result);
            return NextResponse.json({ error: 'Image URL missing from response' }, { status: 502 });
        }

        return NextResponse.json({ url: result.data.url });

    } catch (error) {
        console.error('ImageBB Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to reach image host. Please try again.' }, { status: 502 });
    }
}
