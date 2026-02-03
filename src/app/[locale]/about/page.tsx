import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'AboutPage' });

    return {
        title: t('title'),
        description: t('subtitle')
    };
}

export default function AboutPage() {
    const t = useTranslations('AboutPage');

    return (
        <main className="h-full">
            {/* Header Section */}
            <section className="relative py-20 bg-slate-900 text-white overflow-hidden">
                {/* Abstract Background */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 h-[500px] w-[500px] rounded-full bg-blue-500 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-[500px] w-[500px] rounded-full bg-indigo-500 blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">{t('title')}</h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">

                    {/* Mission */}
                    <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
                        <div className="flex-1">
                            <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-4">
                                🎯 {t('missionTitle')}
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Building the Future, One Bot at a Time.</h2>
                            <div className="prose prose-lg text-slate-600 leading-relaxed">
                                <p>{t('missionText')}</p>
                            </div>
                        </div>
                        <div className="flex-1 relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            {/* Placeholder for mission image - utilizing a nice gradient or abstraction if no image */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center">
                                <span className="text-4xl">🚀</span>
                            </div>
                        </div>
                    </div>

                    {/* Story */}
                    <div className="flex flex-col md:flex-row-reverse gap-12 items-center mb-20">
                        <div className="flex-1">
                            <div className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-600 mb-4">
                                📖 {t('storyTitle')}
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">From a Classroom Idea to a Platform.</h2>
                            <div className="prose prose-lg text-slate-600 leading-relaxed">
                                <p>{t('storyText')}</p>
                            </div>
                        </div>
                        <div className="flex-1 relative aspect-square w-full max-w-[300px] mx-auto rounded-full overflow-hidden shadow-xl border-4 border-white bg-slate-100 flex items-center justify-center">
                            <span className="text-6xl">🎓</span>
                        </div>
                    </div>

                    {/* Join */}
                    <div className="bg-slate-50 rounded-3xl p-10 text-center border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('teamTitle')}</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                            {t('teamText')}
                        </p>
                    </div>

                </div>
            </section>
        </main>
    );
}
