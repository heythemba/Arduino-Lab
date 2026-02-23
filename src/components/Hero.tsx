import { Link } from '@/i18n/routing';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ReleaseNotesModal from './ReleaseNotesModal';

export default function Hero() {
    const t = useTranslations('HomePage');

    return (
        <section className="relative overflow-hidden bg-background py-20 sm:py-32 lg:pb-32 xl:pb-36">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">

                    {/* Text Content */}
                    <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-start flex flex-col justify-center">
                        <ReleaseNotesModal />

                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                            <span className="block xl:inline">{t('title')}</span>
                        </h1>

                        <p className="mt-6 text-base text-muted-foreground sm:mt-5 sm:text-xl lg:text-lg xl:text-xl leading-relaxed">
                            {t('description')}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                            <Link href="/#projects">
                                <Button size="lg" className="w-full sm:w-auto gap-2 px-8 py-6 text-lg">
                                    {t('explore')} <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-lg">
                                    {t('learnMore')}
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Visual/Image Area */}
                    <div className="relative mt-12 lg:col-span-6 lg:mt-0">
                        <div className="relative mx-auto w-full rounded-2xl shadow-xl overflow-hidden aspect-4/3 border border-slate-100 group">
                            <Image
                                src="/hero-image.png"
                                alt="Arduino Lab Hero"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
