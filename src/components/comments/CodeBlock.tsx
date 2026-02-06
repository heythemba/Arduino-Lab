'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-3 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
            {/* Header/Actions */}
            <div className="flex justify-end p-2 bg-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0 left-0">
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-md transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3" />
                            <span>Copy code</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Content */}
            <pre className="p-4 pt-4 text-sm font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                <code>{code}</code>
            </pre>
        </div>
    );
}
