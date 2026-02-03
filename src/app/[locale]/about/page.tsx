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
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">{t('missionSubtitle')}</h2>
                            <div className="prose prose-lg text-slate-600 leading-relaxed">
                                <p>{t('missionText')}</p>
                            </div>
                        </div>
                        <div className="flex-1 relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-500 group">
                            <Image
                                src="/Robotic-Arm-Using-Arduino.png"
                                alt="Robotic Arm Project"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                    </div>

                    {/* Story */}
                    <div className="flex flex-col md:flex-row-reverse gap-12 items-center mb-20">
                        <div className="flex-1">
                            <div className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-600 mb-4">
                                📖 {t('storyTitle')}
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">{t('storySubtitle')}</h2>
                            <div className="prose prose-lg text-slate-600 leading-relaxed">
                                <p>{t('storyText')}</p>
                            </div>
                        </div>
                        <div className="flex-1 relative aspect-square w-full max-w-[350px] mx-auto rounded-full overflow-hidden shadow-xl border-4 border-white bg-slate-100 group">
                            <Image
                                src="/class_to_world.png"
                                alt="Classroom to World"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                    </div>

                    {/* Join - Split Section */}
                    <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-blue-600 mb-2">{t('teamTitle')}</h2>
                            <p className="text-lg text-slate-500 font-medium">{t('joinSubtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Individuals */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                <div className="text-blue-600 mb-4 bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-2xl">
                                    👤
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{t('joinIndividualsTitle')}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {t('joinIndividualsText')}
                                </p>
                            </div>

                            {/* Partners */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100 to-transparent -mr-10 -mt-10 rounded-full opacity-50 pointer-events-none" />
                                <div className="text-purple-600 mb-4 bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center text-2xl relative z-10">
                                    🤝
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4 relative z-10">{t('joinPartnersTitle')}</h3>
                                <p className="text-slate-600 leading-relaxed relative z-10">
                                    {t('joinPartnersText')}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
}
