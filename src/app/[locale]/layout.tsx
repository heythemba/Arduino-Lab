import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next";
import { env } from '@/lib/env';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
  title: {
    default: "ArduinoLab",
    template: "%s | ArduinoLab"
  },
  icons: {
    icon: '/icon.png',
  },
  description: "Your centralized library for school robotics. Document, share, and build amazing robots together.",
  verification: {
    google: "J2EYS4H_LoPgSom3r1WE7MilVppdOwGiupAEYZCbN10",
  },
  openGraph: {
    title: "ArduinoLab",
    description: "Share and document your Arduino projects",
    url: env.NEXT_PUBLIC_BASE_URL,
    type: "website",
    locale: "en_US",
    siteName: "ArduinoLab"
  },
  twitter: {
    card: "summary_large_image",
    title: "ArduinoLab",
    description: "Share and document your Arduino projects"
  }
};

import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

// ... imports ...

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const isRtl = locale === 'ar';

  // Fetch user & profile
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
          <Navbar user={user} profile={profile} />

          <div className="flex-1">
            {children}
          </div>
          <ScrollToTop />
          <Footer />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
