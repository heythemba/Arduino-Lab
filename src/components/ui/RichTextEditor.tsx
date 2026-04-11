/**
 * Rich text editor component used for comment content and other rich inputs.
 *
 * Uses Tiptap for a lightweight rich editor with formatting controls and
 * outputs HTML content through the parent `onChange` callback.
 */
'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline as UnderlineIcon, Code, List, ListOrdered, Link as LinkIcon } from 'lucide-react';

// Tooltip wrapper component
function ToolButton({ onClick, onMouseDown, isActive, icon: Icon, tooltip, children }: {
    onClick: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    isActive: boolean;
    icon?: React.ReactNode;
    tooltip: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="relative group">
            <Button
                type="button"
                onClick={onClick}
                onMouseDown={onMouseDown}
                variant="ghost"
                size="icon"
                className={`h-8 w-8 
                    ${isActive ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}
                `}
                title={tooltip}
            >
                {Icon}
            </Button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
            </div>
        </div>
    );
}

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
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: false,
                underline: false,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'focus:outline-none w-full p-4 h-full [&_p]:my-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-2 [&_pre]:my-3 [&_pre]:bg-slate-800 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-xl [&_:not(pre)>code]:text-indigo-600 [&_:not(pre)>code]:bg-indigo-50 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:font-mono [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800 [&_u]:underline [&_strong]:font-bold [&_em]:italic',
                dir: dir,
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
    });

    // Sync external value changes (e.g., from translation API or parent state reset)
    useEffect(() => {
        if (!editor || editor.isDestroyed) return;
        
        // Prevent cursor jumping by NOT updating while the user is typing
        if (editor.isFocused) return;

        const currentHTML = editor.getHTML();
        if (currentHTML === '<p></p>' && !value) return;
        
        if (value !== currentHTML) {
            editor.commands.setContent(value || '', { emitUpdate: false });
        }
    }, [value, editor]);

    if (!editor) {
        return <div style={{ minHeight }} className="flex rounded-xl border border-slate-200 bg-white" />;
    }

    return (
        <div className="relative rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden flex flex-col" style={{ minHeight }}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <ToolButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    isActive={editor.isActive('bold')}
                    icon={<Bold className="h-4 w-4" />}
                    tooltip="Bold"
                />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    isActive={editor.isActive('italic')}
                    icon={<Italic className="h-4 w-4" />}
                    tooltip="Italic"
                />
                <ToolButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    isActive={editor.isActive('underline')}
                    icon={<UnderlineIcon className="h-4 w-4" />}
                    tooltip="Underline"
                />

                <div className="w-px h-4 bg-slate-300 mx-1" />

                <ToolButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    isActive={editor.isActive('bulletList')}
                    icon={<List className="h-4 w-4" />}
                    tooltip="Bullet List"
                />

                <ToolButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    isActive={editor.isActive('orderedList')}
                    icon={<ListOrdered className="h-4 w-4" />}
                    tooltip="Ordered List"
                />

                <div className="w-px h-4 bg-slate-300 mx-1" />

                <ToolButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    isActive={editor.isActive('code')}
                    icon={<Code className="h-4 w-4" />}
                    tooltip="Code"
                />

                <div className="w-px h-4 bg-slate-300 mx-1" />

                <ToolButton
                    onClick={() => {
                        const previousUrl = editor.getAttributes('link').href;
                        const url = window.prompt('URL:', previousUrl);
                        if (url === null) return;
                        if (url === '') {
                            editor.chain().focus().extendMarkRange('link').unsetLink().run();
                            return;
                        }
                        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    isActive={editor.isActive('link')}
                    icon={<LinkIcon className="h-4 w-4" />}
                    tooltip="Link"
                />
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto cursor-text text-sm h-full">
                 <EditorContent editor={editor} className="min-h-full h-full [&>.ProseMirror]:min-h-full" />
            </div>

            {/* Hidden input ensures the editor content is included in native HTML form submissions.
                When parent components use FormData, this allows the rich text value to be serialized. */}
            {name && (
                <input type="hidden" name={name} value={value} required={required} />
            )}
        </div>
    );
}
