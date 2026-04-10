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
import { Bold, Italic, Underline as UnderlineIcon, Code, SquareTerminal, List, ListOrdered, Link as LinkIcon } from 'lucide-react';

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
            StarterKit,
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
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 
                        ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}
                    `}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 
                        ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}
                    `}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 
                        ${editor.isActive('underline') ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}
                    `}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 
                        ${editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}
                    `}
                >
                    <List className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 
                        ${editor.isActive('orderedList') ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}
                    `}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 
                        ${editor.isActive('code') ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}
                    `}
                >
                    <Code className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 
                        ${editor.isActive('codeBlock') ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}
                    `}
                >
                    <SquareTerminal className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                <Button
                    type="button"
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
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 
                        ${editor.isActive('link') ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}
                    `}
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
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
