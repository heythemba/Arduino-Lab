'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Code, Link as LinkIcon } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
    required?: boolean;
    name?: string;
    dir?: 'ltr' | 'rtl';
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write here...',
    minHeight = '120px',
    required = false,
    name,
    dir = 'ltr'
}: RichTextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Adjust height on content change
    // Optional: could implement auto-resize here if needed.

    const handleFormat = (type: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);

        let formatted = selected;
        let prefix = '';
        let suffix = '';

        switch (type) {
            case 'bold':
                prefix = '**';
                suffix = '**';
                break;
            case 'italic':
                prefix = '*';
                suffix = '*';
                break;
            case 'underline':
                prefix = '__';
                suffix = '__';
                break;
            case 'code':
                prefix = '```\n';
                suffix = '\n```';
                break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) {
                    formatted = `[${selected || 'link'}](${url})`;
                    prefix = '';
                    suffix = '';
                } else {
                    return; // Cancelled
                }
                break;
        }

        if (type !== 'link') {
            formatted = prefix + selected + suffix;
        }

        const newText = text.substring(0, start) + formatted + text.substring(end);

        // Update parent state
        onChange(newText);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    return (
        <div className="relative rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden">
            <textarea
                ref={textareaRef}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 border-none focus:ring-0 resize-y text-sm bg-transparent"
                style={{ minHeight }}
                required={required}
                dir={dir}
            />

            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-1">
                    <Button type="button" onClick={() => handleFormat('bold')} onMouseDown={(e) => e.preventDefault()} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button type="button" onClick={() => handleFormat('underline')} onMouseDown={(e) => e.preventDefault()} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                        <Underline className="h-4 w-4" />
                    </Button>
                    <Button type="button" onClick={() => handleFormat('italic')} onMouseDown={(e) => e.preventDefault()} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                        <Italic className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-slate-300 mx-2" />
                    <Button type="button" onClick={() => handleFormat('code')} onMouseDown={(e) => e.preventDefault()} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                        <Code className="h-4 w-4" />
                    </Button>
                    <Button type="button" onClick={() => handleFormat('link')} onMouseDown={(e) => e.preventDefault()} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
