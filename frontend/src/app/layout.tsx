import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import ThemeApplier from "@/components/adapt/ThemeApplier";
import SplashScreen from "@/components/adapt/SplashScreen";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

// Runs before React hydrates to prevent a theme flash.
const PRELOAD_THEME = `(function(){try{var p=localStorage.getItem('adaptcode.prefs.v1');var t='dark';if(p){var o=JSON.parse(p);if(o&&o.theme)t=o.theme;}document.documentElement.setAttribute('data-theme',t);try{if(sessionStorage.getItem('adaptcode.intro.v2')==='1')document.documentElement.setAttribute('data-intro','seen');}catch(e){}}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

// Type system (2026-11 rebrand): Bricolage Grotesque for headings, Geist for
// everything people read, Geist Mono for code. Geist ships from the repo
// (src/app/fonts) so body text does not depend on a font CDN at build time.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: '--font-display',
  display: 'swap',
});

const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist',
  weight: '100 900',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://adapt-code.vercel.app"),
  title: "AdaptCode — Learn by solving",
  description: "An adaptive DS&A tutor. BKT models your mastery, a LinUCB bandit picks your next problem, Piston grades your code, Gemini explains what broke.",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo.svg" }],
  },
  openGraph: {
    title: "AdaptCode — Learn by solving",
    description: "An adaptive DS&A tutor that learns you while you learn to code.",
    url: "https://adapt-code.vercel.app",
    siteName: "AdaptCode",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "AdaptCode" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AdaptCode — Learn by solving",
    description: "An adaptive DS&A tutor that learns you while you learn to code.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOAD_THEME }} />
      </head>
      {/* Font variables live on <html>, not <body>: the --font / --display tokens
          in globals.css are declared on :root, so the variables they reference
          have to be defined there too or the whole font declaration is invalid
          and the page silently falls back to the system font. */}
      <body className="antialiased">
        <ThemeApplier />
        <SplashScreen />
        <AuthProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-sf)',
                color: 'var(--tx)',
                border: '1px solid var(--border-h)',
                fontSize: 13,
                fontFamily: 'var(--font)',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
