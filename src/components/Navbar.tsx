'use client';

import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Menu, X, Cpu } from 'lucide-react';
import { useState } from 'react';
import { logout } from '@/app/auth/actions';
import { User } from '@supabase/supabase-js';

export default function Navbar({ user }: { user?: User | null }) {
    const t = useTranslations('HomePage');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Language switcher handler
    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                    <Cpu className="h-8 w-8" />
                    <span>ArduinoLab</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/#projects" className="text-sm font-medium hover:text-primary transition-colors">
                        Projects
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                        About
                    </Link>

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

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-muted-foreground hidden lg:inline-block">
                                {user.email}
                            </span>
                            <Link href="/admin">
                                <Button variant="default">Dashboard</Button>
                            </Link>
                            <form action={logout}>
                                <Button variant="ghost">Logout</Button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button>Login</Button>
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

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 shadow-lg">
                    <Link href="/#projects" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2">
                        Projects
                    </Link>
                    <Link href="/about" onClick={() => setIsOpen(false)} className="text-sm font-medium py-2">
                        About
                    </Link>
                    <div className="flex gap-4 py-2">
                        <Button variant="ghost" size="sm" onClick={() => switchLocale('en')} className={locale === 'en' ? 'bg-accent' : ''}>EN</Button>
                        <Button variant="ghost" size="sm" onClick={() => switchLocale('fr')} className={locale === 'fr' ? 'bg-accent' : ''}>FR</Button>
                        <Button variant="ghost" size="sm" onClick={() => switchLocale('ar')} className={locale === 'ar' ? 'bg-accent' : ''}>AR</Button>
                    </div>
                    {user ? (
                        <>
                            <Link href="/admin" onClick={() => setIsOpen(false)}>
                                <Button className="w-full">Dashboard</Button>
                            </Link>
                            <form action={logout} className="w-full">
                                <Button variant="secondary" className="w-full">Logout</Button>
                            </form>
                        </>
                    ) : (
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                            <Button className="w-full">Login</Button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
