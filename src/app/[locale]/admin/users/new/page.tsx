'use client';

import { useActionState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
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
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">Add New Leader</h1>
                    <p className="text-slate-500 mt-2">
                        Create a new user account manually for a project leader.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <form action={formAction} className="space-y-6">

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Full Name</label>
                            <input
                                name="full_name"
                                type="text"
                                required
                                placeholder="e.g. John Doe"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="e.g. leader@school.edu"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="Min. 6 characters"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Confirm Password</label>
                            <input
                                name="password_confirm"
                                type="password"
                                required
                                minLength={6}
                                placeholder="Retype password"
                                onPaste={(e) => e.preventDefault()}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                            />
                            <p className="text-xs text-slate-500">
                                Share this password with the user securely. They can change it later.
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
                                <Button type="button" variant="ghost">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={isPending} className="gap-2">
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Create Account
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
