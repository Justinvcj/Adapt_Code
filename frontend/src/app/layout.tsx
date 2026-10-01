import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className={`${grotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141516',
              color: '#f7f8f8',
              border: '1px solid #34343a',
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
