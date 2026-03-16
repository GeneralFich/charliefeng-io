import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/layout/PageTransition';
import { ChatWidget } from '@/components/chat/ChatWidget';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Charlie Feng — Product Leadership Studio',
    template: '%s | Charlie Feng',
  },
  description:
    'Product Leader at Google building AI systems for the infrastructure that runs the internet. Ex-Amazon PM. Yale MBA.',
  metadataBase: new URL('https://charliefeng.io'),
  openGraph: {
    title: 'Charlie Feng — Product Leadership Studio',
    description:
      'Product Leader at Google building AI systems for the infrastructure that runs the internet.',
    url: 'https://charliefeng.io',
    siteName: 'Charlie Feng',
    locale: 'en_US',
    type: 'website',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className="font-sans"
    >
      <body className="bg-obsidian text-ghost font-sans min-h-screen flex flex-col antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <ChatWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
