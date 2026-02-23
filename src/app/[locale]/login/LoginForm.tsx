'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { login } from '@/app/auth/actions';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const initialState = {
    message: '',
};

export default function LoginForm({ locale }: { locale: string }) {
    const t = useTranslations('LoginPage');
    const [state, formAction] = useActionState(login, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <main className="flex-1 flex items-center justify-center bg-slate-50 py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">{t('welcomeBack')}</h1>
                    <p className="text-sm text-slate-500 mt-2">{t('inviteOnlyText')}</p>
                </div>

                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="locale" value={locale} />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('emailLabel')}
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('passwordLabel')}
                        </label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 hover:text-slate-700 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {state.message && (
                        <div className="text-red-500 text-sm p-2 bg-red-50 rounded text-center">
                            {state.message}
                        </div>
                    )}

                    <SubmitButton t={t} />
                </form>
            </div>
        </main>
    );
}

function SubmitButton({ t }: { t: any }) {
    const { pending } = useFormStatus();

    return (
        <Button className="w-full" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('submitting')}
                </>
            ) : (
                t('submitButton')
            )}
        </Button>
    );
}
