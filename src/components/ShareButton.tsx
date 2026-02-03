'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy } from 'lucide-react';

type ShareButtonProps = {
    label: string;
    copiedLabel: string;
};

export default function ShareButton({ label, copiedLabel }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    return (
        <Button
            variant="ghost"
            className={`w-full justify-center transition-all ${copied ? 'text-green-600 bg-green-50' : 'text-slate-600'}`}
            onClick={handleShare}
        >
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? copiedLabel : label}
        </Button>
    );
}
