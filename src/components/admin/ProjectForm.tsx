'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Save, Sparkles, Languages, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FileUploader from './FileUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import AiNotificationPopup from '@/components/AiNotificationPopup';

// --- Types Definition ---
type MultiLangString = {
    en: string;
    fr: string;
    ar: string;
};

type Step = {
    id: string; // Unique ID for React keys (internal only, not DB ID necessarily)
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
    imageUploadUrl?: string;
};

/**
 * Complex form component for Creating/Editing Projects.
 * 
 * Features:
 * - Multilingual Support (Tabs or stacked inputs for En/Fr/Ar)
 * - Dynamic Step Management (Add/Remove/Reorder steps)
 * - Auto-Save Draft to LocalStorage (for new projects only)
 * - File Upload Integration
 * - Server Action Integration with proper pending states
 */
export default function ProjectForm({ locale, action, initialData, isEditMode = false, userProfile, imageUploadUrl }: ProjectFormProps) {
    const t = useTranslations('ProjectForm');
    const router = useRouter();

    // Server Action State Hook
    const [state, formAction] = useActionState(action, { message: '', success: false });

    // Dirty State Tracking (for unsaved changes warning)
    const [isDirty, setIsDirty] = useState(false);

    // --- Smart-Form AI States ---
    const [isGenerating, setIsGenerating] = useState(false);
    const [summaryInput, setSummaryInput] = useState('');
    const [isDraft, setIsDraft] = useState(false);
    const [translatingStepId, setTranslatingStepId] = useState<string | null>(null);
    const [translatedStepIds, setTranslatedStepIds] = useState<Set<string>>(new Set());
    const [slugValue, setSlugValue] = useState(initialData?.slug || '');
    const [aiNotification, setAiNotification] = useState<{ type: 'success' | 'error'; visible: boolean }>({ type: 'success', visible: false });
    const closeNotification = () => setAiNotification(n => ({ ...n, visible: false }));

    // Multilingual Controlled State for AI Auto-fill
    const [multiLangData, setMultiLangData] = useState({
        title: {
            en: initialData?.title?.en || '',
            fr: initialData?.title?.fr || '',
            ar: initialData?.title?.ar || '',
        },
        description: {
            en: initialData?.description?.en || '',
            fr: initialData?.description?.fr || '',
            ar: initialData?.description?.ar || '',
        }
    });

    const handleGenerate = async () => {
        if (!summaryInput.trim()) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: summaryInput })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error || "Failed to generate content");
            }

            const data = await res.json();

            setMultiLangData({
                title: { en: data.title_en || '', fr: data.title_fr || '', ar: data.title_ar || '' },
                description: { en: data.description_en || '', fr: data.description_fr || '', ar: data.description_ar || '' }
            });

            // Populate the 3 template steps from AI
            if (Array.isArray(data.steps) && data.steps.length > 0) {
                const templateSteps = data.steps.map((s: any, i: number) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    step_number: i + 1,
                    title: {
                        en: s.title_en || '',
                        fr: s.title_fr || '',
                        ar: s.title_ar || '',
                    },
                    content: {
                        en: s.content_en || '',
                        fr: s.content_fr || '',
                        ar: s.content_ar || '',
                    },
                    image_url: '',
                }));
                setSteps(templateSteps);
            }

            setIsDraft(true);
            setIsDirty(true);
            setAiNotification({ type: 'success', visible: true });
            setTimeout(() => setAiNotification(n => ({ ...n, visible: false })), 8000);
        } catch (error: any) {
            console.error(error);
            setAiNotification({ type: 'error', visible: true });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleTranslateStep = async (stepId: string) => {
        const step = steps.find(s => s.id === stepId);
        if (!step) return;
        setTranslatingStepId(stepId);
        try {
            const res = await fetch('/api/translate-step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: step.title, content: step.content })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error || 'Translation failed');
            }
            const data = await res.json();
            setSteps(prev => prev.map(s => {
                if (s.id !== stepId) return s;
                return { ...s, title: data.title, content: data.content };
            }));
            setTranslatedStepIds(prev => new Set(prev).add(stepId));
            setIsDirty(true);
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Step translation failed. Please try again.');
        } finally {
            setTranslatingStepId(null);
        }
    };

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
                id: s.id || Math.random().toString(36).substr(2, 9) // Ensure ID exists for React keys
            }));
        }
        return [];
    };

    const [steps, setSteps] = useState<Step[]>(initializeSteps);

    // Load from localStorage ONLY if NOT in edit mode (Draft feature)
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

    // Warn before unload (Browser navigation confirmation)
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

    // Clear draft on successful submission & Redirect
    useEffect(() => {
        if (state?.success) {
            if (!isEditMode) {
                localStorage.removeItem('project_draft_steps');
            }
            setIsDirty(false);
            const timer = setTimeout(() => {
                router.push(`/${locale}/admin`); // Redirect to dashboard
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state?.success, locale, router, isEditMode]);

    // --- Step Management Handlers ---

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
        <>
            <form action={formAction} className="space-y-8">
                <input type="hidden" name="locale" value={locale} />
                {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
                <input type="hidden" name="steps_json" value={JSON.stringify(steps)} />
                <input type="hidden" name="attachments_json" value={JSON.stringify(attachments)} />

                {/* Smart-Form Generation (AI) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 bg-linear-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-semibold text-blue-900 mb-1">✨ AI Project Generator</label>
                            <textarea
                                value={summaryInput}
                                onChange={(e) => setSummaryInput(e.target.value)}
                                placeholder="Describe your project briefly in any language (e.g. 'A smart plant waterer using Arduino Uno and soil moisture sensor')"
                                className="flex min-h-[60px] w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isGenerating || !summaryInput.trim()}
                            className="w-full md:w-auto md:mt-6 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {isGenerating ? "Generating..." : "Generate & Translate"}
                        </Button>
                    </div>
                </div>

                {/* General Info Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-semibold mb-6 pb-2 border-b">{t('sections.general')}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('labels.slug')}</label>
                            <div className="relative">
                                <input
                                    name="slug"
                                    value={slugValue}
                                    onChange={(e) => {
                                        // Allow only a-z and hyphens, strip everything else, enforce 20 char max
                                        const sanitized = e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z-]/g, '')
                                            .slice(0, 20);
                                        setSlugValue(sanitized);
                                        setIsDirty(true);
                                    }}
                                    onKeyDown={(e) => {
                                        // Block space key explicitly
                                        if (e.key === ' ') e.preventDefault();
                                    }}
                                    required
                                    maxLength={20}
                                    placeholder="my-robot"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-14 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                                <span className={`absolute inset-y-0 end-3 flex items-center text-xs font-mono ${slugValue.length >= 20 ? 'text-red-500' : 'text-slate-400'
                                    }`}>
                                    {slugValue.length}/20
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Only lowercase letters (a-z) and hyphens. Max 20 chars.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('labels.category')}</label>
                            <select
                                name="category"
                                defaultValue={initialData?.category ?? ''}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="" disabled>{t('labels.categoryPlaceholder')}</option>
                                <option value="Robotics">{t('labels.categories.Robotics')}</option>
                                <option value="IoT">{t('labels.categories.IoT')}</option>
                                <option value="Sensors">{t('labels.categories.Sensors')}</option>
                                <option value="Automation">{t('labels.categories.Automation')}</option>
                                <option value="Fundamentals">{t('labels.categories.Fundamentals')}</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">{t('labels.heroImage')}</label>
                            <div className="flex gap-2">
                                <input
                                    name="hero_image_url"
                                    defaultValue={initialData?.hero_image_url}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="https://..."
                                />
                                {imageUploadUrl && (
                                    <a
                                        href={imageUploadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button type="button" variant="outline" className="shrink-0 gap-2 whitespace-nowrap">
                                            <ExternalLink className="h-4 w-4" />
                                            {t('labels.uploadImage')}
                                        </Button>
                                    </a>
                                )}
                            </div>
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
                            <div key={lang} className={`p-4 rounded-lg border ${isDraft ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50/50 border-slate-100'}`}>
                                <span className={`text-xs font-bold uppercase mb-2 block ${isDraft ? 'text-yellow-700' : 'text-slate-400'}`}>{lang}</span>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('labels.title')} ({lang.toUpperCase()})</label>
                                        <input
                                            name={`title_${lang}`}
                                            value={multiLangData.title[lang as keyof MultiLangString]}
                                            onChange={(e) => setMultiLangData(prev => ({ ...prev, title: { ...prev.title, [lang]: e.target.value } }))}
                                            required
                                            dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                            className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isDraft ? 'bg-white border-yellow-300' : 'bg-background border-input'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('sections.description')} ({lang.toUpperCase()})</label>
                                        <textarea
                                            name={`description_${lang}`}
                                            value={multiLangData.description[lang as keyof MultiLangString]}
                                            onChange={(e) => setMultiLangData(prev => ({ ...prev, description: { ...prev.description, [lang]: e.target.value } }))}
                                            required
                                            dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                            className={`flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isDraft ? 'bg-white border-yellow-300' : 'bg-background border-input'}`}
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
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-slate-700">Step {index + 1}</h3>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => handleTranslateStep(step.id)}
                                            disabled={
                                                translatingStepId === step.id ||
                                                !(['en', 'fr', 'ar'] as const).some(
                                                    lang => step.title[lang]?.trim() || step.content[lang]?.trim()
                                                )
                                            }
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400 disabled:opacity-30"
                                        >
                                            {translatingStepId === step.id
                                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                : <Languages className="h-3.5 w-3.5" />}
                                            {translatingStepId === step.id ? 'Translating...' : 'Translate Step'}
                                        </Button>
                                        <Button type="button" onClick={() => removeStep(step.id)} variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">{t('steps.image')}</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={step.image_url}
                                            onChange={(e) => updateStepImage(step.id, e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="https://..."
                                        />
                                        {imageUploadUrl && (
                                            <a
                                                href={imageUploadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button type="button" variant="outline" className="shrink-0 gap-2 whitespace-nowrap">
                                                    <ExternalLink className="h-4 w-4" />
                                                    {t('labels.uploadImage')}
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {(['en', 'fr', 'ar'] as const).map((lang) => {
                                        const isTranslated = translatedStepIds.has(step.id) && (
                                            !steps.find(s => s.id === step.id)?.title[lang] ||
                                            translatingStepId !== step.id
                                        );
                                        return (
                                            <div key={lang} className={`grid grid-cols-1 gap-4 p-3 rounded border ${translatedStepIds.has(step.id)
                                                ? 'bg-yellow-50 border-yellow-200'
                                                : 'bg-white border-slate-100'
                                                }`}>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t('steps.title')} ({lang.toUpperCase()})</label>
                                                    <input
                                                        value={step.title[lang]}
                                                        onChange={(e) => updateStep(step.id, 'title', lang, e.target.value)}
                                                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                                        className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1">{t('steps.content')} ({lang.toUpperCase()})</label>
                                                    <RichTextEditor
                                                        value={step.content[lang]}
                                                        onChange={(value) => updateStep(step.id, 'content', lang, value)}
                                                        placeholder={t('steps.content')}
                                                        minHeight="80px"
                                                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
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
            <AiNotificationPopup
                type={aiNotification.type}
                visible={aiNotification.visible}
                onClose={closeNotification}
            />
        </>
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
