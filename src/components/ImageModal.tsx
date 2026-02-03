'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

type ImageModalProps = {
    isOpen: boolean;
    imageSrc: string;
    onClose: () => void;
};

export default function ImageModal({ isOpen, imageSrc, onClose }: ImageModalProps) {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-all duration-300"
            onClick={onClose}
        >
            <button
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 rounded-full bg-black/50"
                onClick={onClose}
            >
                <X className="w-8 h-8" />
            </button>

            <div
                className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center p-2"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image area
            >
                <Image
                    src={imageSrc}
                    alt="Full size preview"
                    fill
                    className="object-contain"
                    unoptimized
                />
            </div>
        </div>
    );
}
