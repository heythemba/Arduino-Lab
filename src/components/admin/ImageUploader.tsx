'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, ImageIcon, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
    /** Current image URL (controlled) */
    value?: string;
    /** Called with the new URL after a successful upload, or '' when cleared */
    onChange: (url: string) => void;
    /** Placeholder hint shown in the drop zone */
    placeholder?: string;
}

/**
 * Drag-and-drop image uploader backed by /api/upload-image (FreeImage.host proxy).
 * 
 * Usage:
 *   <ImageUploader value={url} onChange={(url) => setUrl(url)} />
 */
export default function ImageUploader({ value, onChange, placeholder }: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const upload = useCallback(async (file: File) => {
        setError(null);
        setIsUploading(true);

        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowed.includes(file.type)) {
            setError('Only JPEG, PNG, GIF and WEBP images are allowed.');
            setIsUploading(false);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('File too large. Maximum size is 10MB.');
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
            const data = await res.json() as { url?: string; error?: string };

            if (!res.ok || !data.url) {
                setError(data.error || 'Upload failed. Please try again.');
            } else {
                onChange(data.url);
                setShowSuccessPopup(true);
                setTimeout(() => setShowSuccessPopup(false), 3000);
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, [onChange]);

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        upload(files[0]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleClear = () => {
        onChange('');
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    // ── Render: image already uploaded ──────────────────────────────────────
    if (value) {
        return (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                <div className="relative w-full h-44">
                    {/* Success Toast Overlay inside the container */}
                    {showSuccessPopup && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-2 z-10">
                            <CheckCircle2 className="w-4 h-4" /> Upload successful
                        </div>
                    )}

                    {/* Plain img avoids next/image hostname restrictions for arbitrary existing URLs */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={value}
                        alt="Uploaded image"
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Action bar (URL hidden) */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-200 text-sm font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Image uploaded successfully</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="shrink-0 rounded-md p-1 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Remove image"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // ── Render: drop zone ────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-2">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !isUploading && inputRef.current?.click()}
                className={`
                    relative flex flex-col items-center justify-center gap-3
                    rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all
                    ${isDragging
                        ? 'border-blue-400 bg-blue-50/60 scale-[1.01]'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'}
                    ${isUploading ? 'pointer-events-none opacity-70' : ''}
                `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    onChange={(e) => handleFiles(e.target.files)}
                />

                {isUploading ? (
                    <>
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Uploading…</p>
                    </>
                ) : (
                    <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 ring-4 ring-blue-50">
                            {isDragging
                                ? <ImageIcon className="w-6 h-6 text-blue-500" />
                                : <Upload className="w-6 h-6 text-blue-400" />
                            }
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-700">
                                {isDragging ? 'Drop to upload' : 'Drag & drop or click to browse'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {placeholder ?? 'JPEG, PNG, GIF, WEBP · max 10 MB'}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <p className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <X className="w-3.5 h-3.5 shrink-0" />
                    {error}
                    <button type="button" className="ml-auto underline" onClick={() => setError(null)}>Dismiss</button>
                </p>
            )}
        </div>
    );
}
