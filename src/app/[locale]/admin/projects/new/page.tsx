'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { createProject } from '@/app/admin/actions';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { Loader2, Plus, Trash2, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';


type MultiLangString = {
    en: string;
    fr: string;
    ar: string;
};

type Step = {
    id: string; // temp id for key
    title: MultiLangString;
    content: MultiLangString;
    image_url: string;
};

import { use, useEffect } from 'react';

export default function CreateProjectPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = use(params);
    const t = useTranslations('ProjectForm');

    // Re-declare initialState locally if needed or import it, 
    // but here we just need to ensure the hook uses specific initial state.
    // The previous code had initialState defined above.
    // Let's reuse the one valid for this component.

    const [state, formAction] = useActionState(createProject, { message: '', success: false });
    const router = useRouter();
    const [isDirty, setIsDirty] = useState(false);

    // Client-side state for Steps
    const [steps, setSteps] = useState<Step[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedSteps = localStorage.getItem('project_draft_steps');
        if (savedSteps) {
            try {
                setSteps(JSON.parse(savedSteps));
            } catch (e) {
                console.error("Failed to load draft steps", e);
            }
        }
    }, []);

    // Save to localStorage when steps change
    useEffect(() => {
        if (steps.length > 0) {
            localStorage.setItem('project_draft_steps', JSON.stringify(steps));
            setIsDirty(true);
        }
    }, [steps]);

    // Warn before unload
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Clear draft on successful submission (we'll assume form action result handles navigation, 
    // but ideally we clear it right before redirecting)
    useEffect(() => {
        if (state?.success) {
            localStorage.removeItem('project_draft_steps');
            setIsDirty(false); // Disable warning
            const timer = setTimeout(() => {
                router.push(`/${locale}/admin`);
                router.refresh();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state?.success, locale, router]);

    const addStep = () => {
        setSteps([...steps, {
            id: Math.random().toString(36).substr(2, 9),
            title: { en: '', fr: '', ar: '' },
            content: { en: '', fr: '', ar: '' },
            image_url: ''
        }]);
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    const updateStep = (id: string, field: 'title' | 'content', lang: 'en' | 'fr' | 'ar', value: string) => {
        setSteps(steps.map(s => {
            if (s.id === id) {
                return {
                    ...s,
                    [field]: { ...s[field], [lang]: value }
                };
            }
            return s;
        }));
    };

    const updateStepImage = (id: string, value: string) => {
        setSteps(steps.map(s => {
            if (s.id === id) {
                return { ...s, image_url: value };
            }
            return s;
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 font-[family-name:var(--font-geist-sans)]">
            <div className="container max-w-4xl mx-auto px-4">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
                    <Button variant="ghost" onClick={() => router.back()}>
                        <X className="h-4 w-4 mr-2" /> {t('cancel')}
                    </Button>
                </div>

                <form action={formAction} className="space-y-8">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="steps_json" value={JSON.stringify(steps)} />

                    {/* General Info Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-semibold mb-6 pb-2 border-b">{t('sections.general')}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('labels.slug')}</label>
                                <input name="slug" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="my-awesome-robot" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('labels.category')}</label>
                                <select name="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="Robotics">Robotics</option>
                                    <option value="IoT">IoT</option>
                                    <option value="Sensors">Sensors</option>
                                    <option value="Automation">Automation</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">{t('labels.heroImage')}</label>
                                <input name="hero_image_url" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="https://..." />
                            </div>
                        </div>

                        {/* Multilingual Titles & Descriptions */}
                        <div className="space-y-6">
                            {['en', 'fr', 'ar'].map((lang) => (
                                <div key={lang} className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                                    <span className="text-xs font-bold uppercase text-slate-400 mb-2 block">{lang}</span>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">{t('labels.title')} ({lang.toUpperCase()})</label>
                                            <input name={`title_${lang}`} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">{t('sections.description')} ({lang.toUpperCase()})</label>
                                            <textarea name={`description_${lang}`} required className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Steps Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b">
                            <h2 className="text-xl font-semibold">{t('sections.steps')}</h2>
                            <Button type="button" onClick={addStep} variant="outline" size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> {t('steps.add')}
                            </Button>
                        </div>

                        <div className="space-y-8">
                            {steps.map((step, index) => (
                                <div key={step.id} className="relative p-6 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="absolute top-4 right-4">
                                        <Button type="button" onClick={() => removeStep(step.id)} variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <h3 className="font-bold text-slate-700 mb-4">Step {index + 1}</h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">{t('steps.image')}</label>
                                        <input
                                            value={step.image_url}
                                            onChange={(e) => updateStepImage(step.id, e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        {['en', 'fr', 'ar'].map((lang) => (
                                            <div key={lang} className="grid grid-cols-1 gap-4 p-3 bg-white rounded border border-slate-100">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t('steps.title')} ({lang.toUpperCase()})</label>
                                                    <input
                                                        value={step.title[lang as 'en' | 'fr' | 'ar']}
                                                        onChange={(e) => updateStep(step.id, 'title', lang as 'en' | 'fr' | 'ar', e.target.value)}
                                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t('steps.content')} ({lang.toUpperCase()})</label>
                                                    <textarea
                                                        value={step.content[lang as 'en' | 'fr' | 'ar']}
                                                        onChange={(e) => updateStep(step.id, 'content', lang as 'en' | 'fr' | 'ar', e.target.value)}
                                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {steps.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                                    No steps yet. Add one to get started.
                                </div>
                            )}
                        </div>
                    </div>

                    {state.message && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                            {state.message}
                        </div>
                    )}

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center shadow-2xl z-50">
                        <SubmitButton t={t} />
                    </div>
                </form>
            </div>
            {/* Spacer for fixed footer */}
            <div className="h-24"></div>
        </div>
    );
}

function SubmitButton({ t }: { t: any }) {
    const { pending } = useFormStatus();

    return (
        <Button size="lg" className="w-full max-w-md gap-2" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('saving')}
                </>
            ) : (
                <>
                    <Save className="h-4 w-4" /> {t('submit')}
                </>
            )}
        </Button>
    );
}
