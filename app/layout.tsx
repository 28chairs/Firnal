import type { Metadata, Viewport } from 'next';
import { Inter, Nunito } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AppearanceProvider } from '@/lib/appearance-context';
import { cryptoPolyfillScript } from '@/lib/crypto-polyfill';
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
          id="firnal-crypto-polyfill"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=globalThis.crypto||(globalThis.crypto={});if(typeof c.randomUUID==='function')return;c.randomUUID=function(){if(c.getRandomValues){var b=new Uint8Array(16);c.getRandomValues(b);b[6]=(b[6]&0x0f)|0x40;b[8]=(b[8]&0x3f)|0x80;var h=Array.from(b,function(x){return x.toString(16).padStart(2,'0')}).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);}return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(ch){var r=Math.random()*16|0,v=ch==='x'?r:(r&0x3|0x8);return v.toString(16);});};}catch(e){}})();`,
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
        </AppearanceProvider>
      </body>
    </html>
  );
}
