import { getSiteSettings } from '@/lib/api/settings';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Mail, Phone, Linkedin, Dribbble, Globe, Heart } from 'lucide-react';
import Image from 'next/image';

export default async function Footer() {
    const t = await getTranslations('Footer'); // We might need to add these keys or just valid hardcoded text for now if translations missing
    const settings = await getSiteSettings();

    const year = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-start">
                    {/* Brand & Bio */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="relative h-8 w-32 opacity-90 grayscale hover:grayscale-0 transition-all">
                                <Image
                                    src="/logo.svg"
                                    alt="ArduinoLab"
                                    fill
                                    className="object-contain ltr:object-left rtl:object-right brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400 mb-6">
                            {t('tagline')}
                        </p>
                        <div className="flex gap-4">
                            {settings?.linkedin_url && (
                                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            )}
                            {settings?.dribbble_url && (
                                <a href={settings.dribbble_url} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
                                    <Dribbble className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">{t('platform')}</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/#projects" className="hover:text-blue-400 transition-colors">{t('explore')}</Link></li>
                            <li><Link href="/about" className="hover:text-blue-400 transition-colors">{t('about')}</Link></li>
                            <li><Link href="/login" className="hover:text-blue-400 transition-colors">{t('admin')}</Link></li>
                        </ul>
                    </div>

                    {/* Organization */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">{t('organization')}</h3>
                        <ul className="space-y-4 text-sm">
                            {settings?.organization_url && (
                                <li>
                                    <a href={settings.organization_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-400 transition-colors">
                                        <Globe className="h-4 w-4" /> {settings.organization_label || t('website')}
                                    </a>
                                </li>
                            )}
                            {settings?.sponsor_url && (
                                <li>
                                    <a href={settings.sponsor_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                                        <Heart className="h-4 w-4" /> {settings.sponsor_label || t('sponsors')}
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">{t('support')}</h3>
                        <ul className="space-y-4 text-sm">
                            {settings?.contact_email && (
                                <li className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-blue-500" />
                                    <a href={`mailto:${settings.contact_email}`} className="hover:text-white transition-colors">{settings.contact_email}</a>
                                </li>
                            )}
                            {settings?.contact_whatsapp && (
                                <li className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-green-500" />
                                    <a href={`https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                        {settings.contact_whatsapp}
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <p>{t('rights', { year })}</p>
                    <p className="flex items-center gap-1 mt-4 md:mt-0">
                        {t('developedBy')}
                        <a href='https://github.com/heythemba' target='_blank' rel='noopener noreferrer'>
                            <span className="text-slate-300 font-medium ms-1">Haythem Baganna</span>
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
