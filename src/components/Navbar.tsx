'use client';

import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Menu, X, Cpu } from 'lucide-react';
import { useState } from 'react';
import { logout } from '@/app/auth/actions';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';

/**
 * Global Navigation Bar.
 * 
 * Features:
 * - Responsive Mobile Menu (Hamburger toggle)
 * - Language Switcher (En/Fr/Ar)
 * - Authentication Status Display (Login vs User Profile)
 * - Navigation Links
 * 
 * @param user - The current authenticated user (if any).
 * @param profile - The extended user profile (if any).
 */
export default function Navbar({ user, profile }: { user?: User | null, profile?: any }) {
    const t = useTranslations('HomePage');
    const navT = useTranslations('Navbar');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Language switcher handler
    // Replaces the current URL with the new locale prefix
    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative h-10 w-40">
                        <Image
                            src="/logo.svg"
                            alt="ArduinoLab"
                            fill
                            className="object-contain object-left transition-transform duration-300 hover:scale-110"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {/* PNL Link */}
                    <a href="https://www.pnlmahdia.com" target="_blank" rel="noopener noreferrer" className="relative h-8 w-24 group">
                        <Image
                            src="/logo-PNL.png"
                            alt="PNL"
                            fill
                            className="object-contain filter grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        />
                    </a>

                    <Link href="/#projects" className="text-sm font-medium hover:text-primary transition-colors">
                        {navT('projects')}
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                        {navT('about')}
                    </Link>



                    {/* Locale Selector */}
                    <div className="flex items-center gap-2">
                        <select
                            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                            value={locale}
                            onChange={(e) => switchLocale(e.target.value)}
                        >
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                            <option value="ar">العربية</option>
                        </select>
                    </div>

                    {/* Auth Actions */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-muted-foreground hidden lg:inline-block">
                                {profile?.full_name || user.email}
                            </span>
                            <Link href="/admin">
                                <Button variant="default">{navT('dashboard')}</Button>
                            </Link>
                            <form action={logout}>
                                <Button variant="ghost">{navT('logout')}</Button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button>{navT('login')}</Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Content */}
            {isOpen && (
                <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 shadow-lg">
                    <a href="https://www.pnlmahdia.com" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="relative h-8 w-24 group mt-2">
                        <Image
                            src="/logo-PNL.png"
                            alt="PNL"
                            fill
                            className="object-contain object-left filter grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        />
                    </a>
                    <Link href="/#projects" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2">
                        {navT('projects')}
                    </Link>
                    <Link href="/about" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2">
                        {navT('about')}
                    </Link>
                    <div className="flex gap-4 py-2">
                        <Button variant="ghost" size="sm" onClick={() => switchLocale('en')} className={locale === 'en' ? 'bg-accent' : ''}>EN</Button>
                        <Button variant="ghost" size="sm" onClick={() => switchLocale('fr')} className={locale === 'fr' ? 'bg-accent' : ''}>FR</Button>
                        <Button variant="ghost" size="sm" onClick={() => switchLocale('ar')} className={locale === 'ar' ? 'bg-accent' : ''}>AR</Button>
                    </div>
                    {user ? (
                        <>
                            <Link href="/admin" onClick={() => setIsOpen(false)}>
                                <Button className="w-full">{navT('dashboard')}</Button>
                            </Link>
                            <form action={logout} className="w-full">
                                <Button variant="secondary" className="w-full">{navT('logout')}</Button>
                            </form>
                        </>
                    ) : (
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                            <Button className="w-full">{navT('login')}</Button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
