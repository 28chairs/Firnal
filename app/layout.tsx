import type { Metadata, Viewport } from 'next';
import { Inter, Nunito } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AppearanceProvider } from '@/lib/appearance-context';
import { cryptoPolyfillScript } from '@/lib/crypto-polyfill';
import { SWRegistration } from '@/components/pwa/SWRegistration';
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
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
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
      <head>
        <script
          id="firnal-crypto-polyfill"
          dangerouslySetInnerHTML={{ __html: cryptoPolyfillScript }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: 'html,body{background-color:#FAF9F6}',
          }}
        />
        <script
          id="firnal-appearance-boot"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem('firnal:appearance');if(!raw)return;var s=JSON.parse(raw);var html=document.documentElement;var theme=s.theme||'cream-journal';html.classList.add('theme-'+theme);if(theme==='midnight')html.classList.add('dark');if(s.accentColor)html.style.setProperty('--accent-override',s.accentColor);var bg={ 'cream-journal':'#FAF9F6', midnight:'#0F172A', 'soft-pastel':'#FDF4FF', 'structured-blue':'#F2F2F7' }[theme];if(bg){html.style.backgroundColor=bg;document.documentElement.style.setProperty('--boot-bg',bg)}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-base">
        <AppearanceProvider>
          {children}
          <Toaster />
          <SWRegistration />
        </AppearanceProvider>
      </body>
    </html>
  );
}
