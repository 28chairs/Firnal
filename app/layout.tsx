import type { Metadata, Viewport } from 'next';
import { Inter, Nunito } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AppearanceProvider } from '@/lib/appearance-context';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FIRNAL — Voice Journal',
  description: 'Voice-first AI journaling. Ramble about your day; AI organizes it for you.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FIRNAL',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF9F6' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col text-base">
        <AppearanceProvider>
          {children}
          <Toaster />
        </AppearanceProvider>
      </body>
    </html>
  );
}
