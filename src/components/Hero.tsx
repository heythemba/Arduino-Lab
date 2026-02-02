import { Link } from '@/i18n/routing';
import { Button } from './ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Hero() {
    const t = useTranslations('HomePage');

    return (
        <section className="relative overflow-hidden bg-background py-20 sm:py-32 lg:pb-32 xl:pb-36">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">

                    {/* Text Content */}
                    <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left flex flex-col justify-center">
                        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-primary bg-primary/10 w-fit mb-6 mx-auto lg:mx-0">
                            <Sparkles className="mr-2 h-4 w-4" />
                            <span className="capitalize">ArduinoLab v1.0</span>
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                            <span className="block xl:inline">{t('title')}</span>
                        </h1>

                        <p className="mt-6 text-base text-muted-foreground sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                            {t('description')}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                            <Link href="/#projects">
                                <Button size="lg" className="w-full sm:w-auto gap-2">
                                    {t('explore')} <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                    {t('learnMore')}
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Visual/Image Area */}
                    <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:items-center">
                        <div className="relative mx-auto w-full rounded-3xl shadow-lg lg:max-w-md overflow-hidden aspect-square border group">
                            <Image
                                src="/hero-image.jpg"
                                alt="Arduino Lab Hero"
                                fill
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
