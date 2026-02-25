'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileIcon, ImageIcon, Code, Box, LinkIcon, Trash2, Loader2, ExternalLink, Plus, Package } from 'lucide-react';

type Attachment = {
    file_type: 'stl' | 'ino' | 'image' | 'other' | 'zip';
    file_name: string;
    file_url: string;
    file_size: number;
};

// Helper to format bytes
function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const FILE_LIMITS = {
    ino: 1 * 1024 * 1024, // 1MB
    stl: 50 * 1024 * 1024, // 50MB
    image: 10 * 1024 * 1024, // 10MB
    zip: 100 * 1024 * 1024, // 100MB
};

export default function FileUploader({
    t,
    attachments,
    setAttachments
}: {
    t: any,
    attachments: Attachment[],
    setAttachments: (att: Attachment[]) => void
}) {
    const [uploading, setUploading] = useState(false);
    const [mode, setMode] = useState<'upload' | 'link'>('upload');
    const [fileType, setFileType] = useState<'stl' | 'ino' | 'image' | 'zip'>('stl');

    // Link State
    const [linkUrl, setLinkUrl] = useState('');
    const [linkName, setLinkName] = useState('');

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate Size
        const limit = FILE_LIMITS[fileType] || 10 * 1024 * 1024;
        if (file.size > limit) {
            alert(`File too large. Limit is ${formatBytes(limit)}`);
            e.target.value = ''; // Reset input
            return;
        }

        setUploading(true);
        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileType}s/${fileName}`; // Organize by type folders

            const { data, error } = await supabase.storage
                .from('project-files')
                .upload(filePath, file);

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project-files')
                .getPublicUrl(filePath);

            const newAttachment: Attachment = {
                file_type: fileType,
                file_name: file.name,
                file_url: publicUrl,
                file_size: file.size
            };

            setAttachments([...attachments, newAttachment]);

        } catch (error: any) {
            console.error('Upload Error:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleAddLink = () => {
        if (!linkUrl || !linkName) return;

        const newAttachment: Attachment = {
            file_type: fileType,
            file_name: linkName,
            file_url: linkUrl,
            file_size: 0 // External link
        };

        setAttachments([...attachments, newAttachment]);
        setLinkUrl('');
        setLinkName('');
    };

    const removeAttachment = (index: number) => {
        const newAtts = [...attachments];
        newAtts.splice(index, 1);
        setAttachments(newAtts);
    };

    return (
        <div className="space-y-6">

            {/* Add New File Area */}
            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                    {/* Type Selector */}
                    <div className="md:col-span-3">
                        <div className="flex items-center h-8 mb-2">
                            <Label>{t('files.type')}</Label>
                        </div>
                        <div className="relative">
                            <select
                                value={fileType}
                                onChange={(e) => setFileType(e.target.value as any)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pl-3"
                            >
                                <option value="stl">3D Model (.stl)</option>
                                <option value="ino">Arduino (.ino)</option>
                                <option value="zip">Arduino Library (.zip)</option>
                                <option value="image">Image</option>
                            </select>
                            {/* Simple chevron icon */}
                            <div className="absolute right-3 top-3 pointer-events-none">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-500">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Mode Toggle & Input */}
                    <div className="md:col-span-9">
                        <div className="flex justify-between items-center h-8 mb-2">
                            <Label>{mode === 'upload' ? t('files.upload') : t('files.enterUrl')}</Label>
                            <div className="flex gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setMode('upload')}
                                    className={`px-2 py-1 rounded ${mode === 'upload' ? 'bg-slate-200 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('link')}
                                    className={`px-2 py-1 rounded ${mode === 'link' ? 'bg-slate-200 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Link
                                </button>
                            </div>
                        </div>

                        {mode === 'upload' ? (
                            <div className="relative">
                                <Input
                                    key="file-input"
                                    type="file"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                    accept={fileType === 'ino' ? '.ino,.txt' : fileType === 'stl' ? '.stl,.obj' : fileType === 'zip' ? '.zip,.rar,.7z' : 'image/*'}
                                    className="pr-10"
                                />
                                {uploading && (
                                    <div className="absolute right-3 top-2.5">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                    </div>
                                )}
                                <p className="text-xs text-slate-500 mt-1">{t(`files.hints.${fileType}`)}</p>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Input
                                    key="link-name"
                                    placeholder={t('files.name')}
                                    value={linkName}
                                    onChange={(e) => setLinkName(e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    key="link-url"
                                    placeholder="https://..."
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="flex-2"
                                />
                                <Button type="button" onClick={handleAddLink} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-2">
                {attachments.map((att, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2 rounded-lg ${att.file_type === 'ino' ? 'bg-blue-100 text-blue-600' :
                                att.file_type === 'stl' ? 'bg-orange-100 text-orange-600' :
                                    att.file_type === 'zip' ? 'bg-purple-100 text-purple-600' :
                                        'bg-slate-100 text-slate-600'
                                }`}>
                                {att.file_type === 'ino' && <Code className="h-5 w-5" />}
                                {att.file_type === 'stl' && <Box className="h-5 w-5" />}
                                {att.file_type === 'image' && <ImageIcon className="h-5 w-5" />}
                                {att.file_type === 'zip' && <Package className="h-5 w-5" />}
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{att.file_name}</p>
                                <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                    {att.file_url.substring(0, 30)}... <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttachment(index)}
                            className="text-slate-400 hover:text-red-500"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
