import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen`}>
        <AuthProvider>
          <Toaster position="bottom-right" toastOptions={{
            style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' }
          }} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
