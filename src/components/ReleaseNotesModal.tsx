'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Globe, Brain, Package, Users, FileText, MessageCircle, ChevronRight } from 'lucide-react';

const RELEASES = [
    {
        version: 'v2.0.2',
        date: 'February 2026',
        tag: 'Quality of Life',
        tagColor: 'bg-emerald-500',
        features: [
            { icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Volunteer Facilitator & Teacher Roles', desc: 'Replaced the generic "Leader" role with two specific roles (same permissions). Supabase migration included.' },
            { icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Locale-Aware Login Redirect', desc: 'After login, users are redirected to /[their-locale]/admin — French users go to /fr/admin, Arabic to /ar/admin.' },
            { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50', title: 'Password Visibility Toggle', desc: 'Added 👁 eye icon to all password fields in the login and new user forms.' },
            { icon: MessageCircle, color: 'text-orange-500', bg: 'bg-orange-50', title: 'Cursor & UX Fixes', desc: 'Restored hand cursor on all buttons and links (Tailwind Preflight had silently reset it to default).' },
            { icon: Package, color: 'text-pink-500', bg: 'bg-pink-50', title: 'Footer & Navigation Fixes', desc: 'Social icons (LinkedIn, Dribbble) moved to the Support section. Invitation button now fully localized.' },
        ],
    },
    {
        version: 'v2.0.0',
        date: 'February 2026',
        tag: 'Intelligence & Inclusion',
        tagColor: 'bg-blue-500',
        features: [
            {
                icon: Brain,
                color: 'text-purple-500',
                bg: 'bg-purple-50',
                title: 'AI-Assisted Documentation',
                desc: 'Groq Llama 4 Scout auto-expands project briefs and translates technical content across 3 languages instantly — preserving English technical keywords.',
            },
            {
                icon: Globe,
                color: 'text-blue-500',
                bg: 'bg-blue-50',
                title: 'Full Internationalization (EN / FR / AR)',
                desc: 'Complete RTL layout engine for Arabic. Every UI element, form field, and auto-translation respects language direction.',
            },
            {
                icon: Package,
                color: 'text-orange-500',
                bg: 'bg-orange-50',
                title: "The Maker's Vault",
                desc: 'Robust resource system supporting .STL and .ino file uploads with secure Supabase Storage. Download sections auto-organize by file type.',
            },
            {
                icon: Users,
                color: 'text-green-500',
                bg: 'bg-green-50',
                title: 'Collaborative Governance',
                desc: 'Secure Invitation System for onboarding Club Leaders, with role-based access so volunteers can contribute without admin risk.',
            },
            {
                icon: FileText,
                color: 'text-pink-500',
                bg: 'bg-pink-50',
                title: 'Enhanced Authoring',
                desc: 'Custom Rich Text Editor with Markdown support, code snippets, step-by-step guides, and per-step AI translation buttons.',
            },
            {
                icon: MessageCircle,
                color: 'text-teal-500',
                bg: 'bg-teal-50',
                title: 'Community Feedback',
                desc: 'Real-time Commenting System for students and teachers to discuss projects, ask questions, and troubleshoot together.',
            },
        ],
    },
    {
        version: 'v1.0.0',
        date: 'January 2026',
        tag: 'Foundation',
        tagColor: 'bg-slate-500',
        features: [
            { icon: Package, color: 'text-slate-500', bg: 'bg-slate-50', title: 'Project Gallery', desc: 'Searchable, filterable public gallery of Arduino projects.' },
            { icon: Users, color: 'text-slate-500', bg: 'bg-slate-50', title: 'Admin Dashboard', desc: 'Secure project creation and management for school leaders.' },
            { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50', title: 'Step-by-Step Guides', desc: 'Detailed tutorial builder with image support.' },
        ],
    },
];

export default function ReleaseNotesModal() {
    const [open, setOpen] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <>
            {/* Trigger badge — clickable version number */}
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-primary bg-primary/10 w-fit mb-6 mx-auto lg:mx-0 hover:bg-primary/20 transition-colors cursor-pointer group"
            >
                <Sparkles className="me-2 h-4 w-4" />
                <span className="capitalize">ArduinoLab v2.0.2</span>
                <ChevronRight className="ms-1 h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Modal backdrop */}
            {open && (
                <div
                    ref={overlayRef}
                    onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl shrink-0">
                            <div>
                                <h2 className="text-xl font-bold">Release Notes</h2>
                                <p className="text-blue-100 text-sm mt-0.5">ArduinoLab Smart-Library</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-10">
                            {RELEASES.map((release) => (
                                <div key={release.version}>
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-full ${release.tagColor}`}>
                                            {release.version}
                                        </span>
                                        <span className="text-base font-bold text-slate-900">{release.tag}</span>
                                        <span className="text-xs text-slate-400 ms-auto">{release.date}</span>
                                    </div>
                                    <div className="space-y-3">
                                        {release.features.map((f) => (
                                            <div key={f.title} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                                <div className={`shrink-0 p-2.5 rounded-lg h-fit ${f.bg}`}>
                                                    <f.icon className={`h-4 w-4 ${f.color}`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t bg-slate-50 text-xs text-slate-400 text-center rounded-b-2xl shrink-0">
                            Built with ❤️ by PNL Volunteers · Powered by Groq AI · ArduinoLab v2.0.0
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
