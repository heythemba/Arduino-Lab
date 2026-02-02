'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { deleteProject } from '@/app/admin/actions';

export default function DeleteProjectButton({ projectId }: { projectId: string }) {
    const t = useTranslations('AdminDashboard.table');
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteProject(projectId);

        if (result.success) {
            setIsOpen(false);
            // Optional: generic toast here
        } else {
            console.error(result.message);
            // Optional: error handling
        }
        setIsDeleting(false);
    };

    if (!isOpen) {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{t('delete')}</span>
            </Button>
        );
    }

    return (
        <>
            {/* Trigger Button (hidden state basically, but we conditionally render the dialog) */}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-50 cursor-not-allowed"
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            {/* Modal Overlay */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                {/* Modal Content */}
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 border border-slate-100 animate-in zoom-in-95 duration-200">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-red-100 rounded-full text-red-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {t('confirmDelete.title')}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                {t('confirmDelete.description')}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isDeleting}
                        >
                            {t('confirmDelete.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                t('confirmDelete.confirm')
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
