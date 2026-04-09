import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

/**
 * POST /api/upload-image
 * 
 * Secure server-side proxy for FreeImage.host uploads.
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

    // Forward to FreeImage.host with our server-side API key
    const apiKey = process.env.FREEIMAGE_HOST_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Image hosting is not configured. Please contact the administrator.' }, { status: 503 });
    }

    // Using URLSearchParams and application/x-www-form-urlencoded completely eliminates
    // Node.js multipart boundary/blob parsing issues with FreeImage.host (Chevereto).
    // The API natively takes raw Base64 strings safely via encoded payloads.
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');
    
    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('action', 'upload');
    params.append('source', base64String);
    params.append('format', 'json');

    try {
        const response = await fetch('https://freeimage.host/api/1/upload', {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = await response.json() as {
            status_code: number;
            image?: { url: string; display_url: string };
            error?: { message: string };
        };

        if (!response.ok || result.status_code !== 200) {
            console.error('FreeImage.host Upload Error:', result);
            const errMsg = result.error?.message || 'Upload failed';
            return NextResponse.json({ error: errMsg }, { status: 502 });
        }

        if (!result.image?.url) {
            console.error('FreeImage.host returned success but no image URL:', result);
            return NextResponse.json({ error: 'Image URL missing from response' }, { status: 502 });
        }

        return NextResponse.json({ url: result.image.url });

    } catch {
        return NextResponse.json({ error: 'Failed to reach image host. Please try again.' }, { status: 502 });
    }
}
