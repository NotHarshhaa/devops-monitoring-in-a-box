import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { SessionProvider } from "@/components/session-provider";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { DEFAULT_SITE_CONFIG } from "@/lib/config/site-config";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-simple";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: DEFAULT_SITE_CONFIG.seo.title,
  description: DEFAULT_SITE_CONFIG.seo.description,
  keywords: DEFAULT_SITE_CONFIG.seo.keywords,
  authors: [{ name: DEFAULT_SITE_CONFIG.seo.author }],
  robots: DEFAULT_SITE_CONFIG.seo.robots,
  openGraph: {
    title: DEFAULT_SITE_CONFIG.seo.og.title,
    description: DEFAULT_SITE_CONFIG.seo.og.description,
    type: DEFAULT_SITE_CONFIG.seo.og.type as any,
    url: DEFAULT_SITE_CONFIG.seo.og.url,
    siteName: DEFAULT_SITE_CONFIG.seo.og.site_name,
    images: [
      {
        url: DEFAULT_SITE_CONFIG.seo.og.image,
        width: 1200,
        height: 630,
        alt: DEFAULT_SITE_CONFIG.seo.og.title,
      },
    ],
  },
  twitter: {
    card: DEFAULT_SITE_CONFIG.seo.twitter.card as any,
    site: DEFAULT_SITE_CONFIG.seo.twitter.site,
    creator: DEFAULT_SITE_CONFIG.seo.twitter.creator,
    title: DEFAULT_SITE_CONFIG.seo.twitter.title,
    description: DEFAULT_SITE_CONFIG.seo.twitter.description,
    images: [DEFAULT_SITE_CONFIG.seo.twitter.image],
  },
  icons: {
    icon: DEFAULT_SITE_CONFIG.branding.logo.favicon,
    apple: DEFAULT_SITE_CONFIG.branding.logo.apple_touch_icon,
  },
  metadataBase: new URL(DEFAULT_SITE_CONFIG.url),
  alternates: {
    canonical: DEFAULT_SITE_CONFIG.seo.canonical,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <div className="flex h-screen bg-background overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0 main-content transition-all duration-300 ease-in-out">
                  <div className="max-w-[1920px] mx-auto">
                    {children}
                  </div>
                </main>
              </div>
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
