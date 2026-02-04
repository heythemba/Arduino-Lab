'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FileUploader from './FileUploader';

type MultiLangString = {
    en: string;
    fr: string;
    ar: string;
};

type Step = {
    id: string;
    title: MultiLangString;
    content: MultiLangString;
    image_url: string;
};

type Attachment = {
    file_type: 'stl' | 'ino' | 'image' | 'other';
    file_name: string;
    file_url: string;
    file_size: number;
};

export type ProjectFormData = {
    id?: string;
    slug?: string;
    category?: string;
    hero_image_url?: string;
    instructor_name?: string;
    school_name?: string;
    title?: MultiLangString;
    description?: MultiLangString;
    steps?: Step[];
    attachments?: Attachment[];
};

type ProjectFormProps = {
    locale: string;
    action: (prevState: any, formData: FormData) => Promise<any>;
    initialData?: ProjectFormData;
    isEditMode?: boolean;
    userProfile?: any;
};

export default function ProjectForm({ locale, action, initialData, isEditMode = false, userProfile }: ProjectFormProps) {
    const t = useTranslations('ProjectForm');
    const router = useRouter();
    const [state, formAction] = useActionState(action, { message: '', success: false });
    const [isDirty, setIsDirty] = useState(false);

    // Populate initialData.instructor_name with userProfile.full_name if it's new
    if (!isEditMode && userProfile && (!initialData?.instructor_name)) {
        if (!initialData) initialData = {};
        initialData.instructor_name = userProfile.full_name;
    }

    // Attachments State
    const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments || []);

    // Initial steps handling
    const initializeSteps = () => {
        if (initialData?.steps && initialData.steps.length > 0) {
            return initialData.steps.map(s => ({
                ...s,
                id: s.id || Math.random().toString(36).substr(2, 9) // Ensure ID
            }));
        }
        return [];
    };

    const [steps, setSteps] = useState<Step[]>(initializeSteps);

    // Load from localStorage ONLY if NOT in edit mode
    useEffect(() => {
        if (!isEditMode) {
            const savedSteps = localStorage.getItem('project_draft_steps');
            if (savedSteps) {
                try {
                    const parsed = JSON.parse(savedSteps);
                    if (parsed.length > 0) setSteps(parsed);
                } catch (e) {
                    console.error("Failed to load draft steps", e);
                }
            }
        }
    }, [isEditMode]);

    // Save to localStorage when steps change
    useEffect(() => {
        if (!isEditMode && steps.length > 0) {
            localStorage.setItem('project_draft_steps', JSON.stringify(steps));
            setIsDirty(true);
        }
        if (isEditMode) {
            setIsDirty(true);
        }
    }, [steps, isEditMode]);

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

    // Clear draft on successful submission
    useEffect(() => {
        if (state?.success) {
            if (!isEditMode) {
                localStorage.removeItem('project_draft_steps');
            }
            setIsDirty(false);
            const timer = setTimeout(() => {
                router.push(`/${locale}/admin`);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state?.success, locale, router, isEditMode]);

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
        <form action={formAction} className="space-y-8">
            <input type="hidden" name="locale" value={locale} />
            {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
            <input type="hidden" name="steps_json" value={JSON.stringify(steps)} />
            <input type="hidden" name="attachments_json" value={JSON.stringify(attachments)} />

            {/* General Info Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b">{t('sections.general')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('labels.slug')}</label>
                        <input
                            name="slug"
                            defaultValue={initialData?.slug}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="my-awesome-robot"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('labels.category')}</label>
                        <select
                            name="category"
                            defaultValue={initialData?.category}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="Robotics">Robotics</option>
                            <option value="IoT">IoT</option>
                            <option value="Sensors">Sensors</option>
                            <option value="Automation">Automation</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">{t('labels.heroImage')}</label>
                        <input
                            name="hero_image_url"
                            defaultValue={initialData?.hero_image_url}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('labels.instructor')}</label>
                        <input
                            name="instructor_name"
                            defaultValue={initialData?.instructor_name || (userProfile?.full_name || '')}
                            maxLength={20}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Max 20 chars"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('labels.school')}</label>
                        <input
                            name="school_name"
                            defaultValue={initialData?.school_name || ''}
                            maxLength={20}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Max 20 chars"
                        />
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
                                    <input
                                        name={`title_${lang}`}
                                        defaultValue={initialData?.title?.[lang as keyof MultiLangString]}
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('sections.description')} ({lang.toUpperCase()})</label>
                                    <textarea
                                        name={`description_${lang}`}
                                        defaultValue={initialData?.description?.[lang as keyof MultiLangString]}
                                        required
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
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
                            <div className="absolute top-4 end-4">
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

            {/* Files & Attachments Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b">{t('sections.files')}</h2>
                <FileUploader
                    t={t}
                    attachments={attachments}
                    setAttachments={setAttachments}
                />
            </div>

            {state.message && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                    {state.message}
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center shadow-2xl z-50">
                <SubmitButton t={t} isEditMode={isEditMode} />
            </div>
        </form>
    );
}

function SubmitButton({ t, isEditMode }: { t: any, isEditMode: boolean }) {
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
                    <Save className="h-4 w-4" /> {isEditMode ? 'Update Project' : t('submit')}
                </>
            )}
        </Button>
    );
}
