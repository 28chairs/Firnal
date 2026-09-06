import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: 'FIRNAL — Voice Journal',
  description: 'Voice-first AI journaling. Ramble about your day; AI organizes it for you.',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-base">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
