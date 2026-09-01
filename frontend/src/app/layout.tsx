import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  weight: ['400', '600', '700']
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains-mono',
  weight: ['400']
});

export const metadata: Metadata = {
  title: "AdaptCode Practice",
  description: "Adaptive programming practice environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <Toaster position="bottom-right" toastOptions={{
            style: { background: '#282A36', color: '#EFF1F6', border: '1px solid rgba(255, 255, 255, 0.08)' }
          }} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
