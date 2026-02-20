import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "СтройКомплекс - Система управления строительными проектами",
  description: "Автоматизированная система управления строительными проектами: планы работ, документы КС-2/КС-3, акты скрытых работ, учет персонала и зарплаты, наряды на монтаж, техника безопасности",
  keywords: ["строительство", "управление проектами", "КС-2", "КС-3", "персонал", "зарплата", "монтаж"],
  authors: [{ name: "СтройКомплекс" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "СтройКомплекс",
    description: "Система управления строительными проектами",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="СтройКомплекс" />
        {/* Telegram Mini Apps SDK */}
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
