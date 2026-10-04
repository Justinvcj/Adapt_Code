import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ThemeApplier from "@/components/adapt/ThemeApplier";
import "./globals.css";

// Runs before React hydrates to prevent a theme flash.
const PRELOAD_THEME = `(function(){try{var p=localStorage.getItem('adaptcode.prefs.v1');var t='dark';if(p){var o=JSON.parse(p);if(o&&o.theme)t=o.theme;}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-grotesk',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AdaptCode — Learn by solving",
  description: "A learning-first programming platform. Twelve concepts, prerequisite-gated progression, adaptive hints.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOAD_THEME }} />
      </head>
      <body className={`${grotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeApplier />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-sf)',
              color: 'var(--tx)',
              border: '1px solid var(--border-h)',
              fontSize: 13,
              fontFamily: 'var(--font-grotesk)',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
