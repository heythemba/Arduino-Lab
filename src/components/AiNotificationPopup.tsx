'use client';

import { useTranslations } from 'next-intl';

interface AiNotificationPopupProps {
    type: 'success' | 'error';
    visible: boolean;
    onClose: () => void;
}

export default function AiNotificationPopup({ type, visible, onClose }: AiNotificationPopupProps) {
    const t = useTranslations('ProjectForm');

    if (!visible) return null;

    const isSuccess = type === 'success';

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center gap-4 border-t-4 ${isSuccess ? 'border-emerald-500' : 'border-red-500'
                }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${isSuccess ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                    {isSuccess ? '✅' : '❌'}
                </div>
                <h3 className={`text-xl font-bold text-center ${isSuccess ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                    {isSuccess ? t('ai.successTitle') : t('ai.errorTitle')}
                </h3>
                <p className="text-sm text-slate-600 text-center leading-relaxed">
                    {isSuccess ? t('ai.successMessage') : t('ai.errorMessage')}
                </p>
                <button
                    onClick={onClose}
                    className={`mt-2 px-6 py-2 rounded-full font-semibold text-white transition-colors ${isSuccess
                            ? 'bg-emerald-500 hover:bg-emerald-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                >
                    {t('ai.close')}
                </button>
            </div>
        </div>
    );
}
