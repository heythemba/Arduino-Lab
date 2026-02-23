'use client';

import { useActionState, useEffect, use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { createUser } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';

const initialState = {
    message: '',
    success: false
};

export default function NewUserPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('AdminDashboard'); // We can reuse generic terms or add specifics
    const [state, formAction, isPending] = useActionState(createUser, initialState);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (state?.success) {
            // Optional: Redirect after short delay or show success nicely
            setTimeout(() => {
                router.push(`/${locale}/admin`);
            }, 1500);
        }
    }, [state?.success, locale, router]);

    return (
        <main className="flex-1 bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-12 max-w-2xl">

                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/${locale}/admin`}
                        className="text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> {t('newUser.back')}
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">{t('newUser.title')}</h1>
                    <p className="text-slate-500 mt-2">
                        {t('newUser.subtitle')}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <form action={formAction} className="space-y-6">

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">{t('newUser.form.fullName')}</label>
                            <input
                                name="full_name"
                                type="text"
                                required
                                placeholder={t('newUser.form.fullNamePlaceholder')}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">{t('newUser.form.email')}</label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder={t('newUser.form.emailPlaceholder')}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">{t('newUser.form.role')}</label>
                            <select
                                name="role"
                                required
                                defaultValue="volunteer_facilitator"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans bg-white"
                            >
                                <option value="volunteer_facilitator">{t('newUser.form.roleVolunteer')}</option>
                                <option value="teacher">{t('newUser.form.roleTeacher')}</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">{t('newUser.form.password')}</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    placeholder={t('newUser.form.passwordPlaceholder')}
                                    className="w-full px-4 py-2 pr-10 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
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

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">{t('newUser.form.confirmPassword')}</label>
                            <div className="relative">
                                <input
                                    name="password_confirm"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    placeholder={t('newUser.form.confirmPasswordPlaceholder')}
                                    onPaste={(e) => e.preventDefault()}
                                    className="w-full px-4 py-2 pr-10 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(v => !v)}
                                    className="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 hover:text-slate-700 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500">
                                {t('newUser.form.passwordNote')}
                            </p>
                        </div>

                        {/* Feedback Messages */}
                        {state?.message && (
                            <div className={`p-4 rounded-lg text-sm ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {state.message}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 flex items-center justify-end gap-3">
                            <Link href={`/${locale}/admin`}>
                                <Button type="button" variant="ghost">{t('newUser.form.cancel')}</Button>
                            </Link>
                            <Button type="submit" disabled={isPending} className="gap-2">
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('newUser.form.creating')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {t('newUser.form.create')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </main>
    );
}
