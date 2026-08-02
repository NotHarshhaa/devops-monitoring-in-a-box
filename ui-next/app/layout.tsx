import type { Metadata } from 'next'
import { Instrument_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/components/query-provider'
import { SessionProvider } from '@/components/session-provider'
import { AppShell } from '@/components/app-shell'
import { Toaster } from '@/components/_custom/toaster'
import { DEFAULT_SITE_CONFIG } from '@/lib/config/site-config'
import { cn } from '@/lib/utils'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans'
})

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
        alt: DEFAULT_SITE_CONFIG.seo.og.title
      }
    ]
  },
  twitter: {
    card: DEFAULT_SITE_CONFIG.seo.twitter.card as any,
    site: DEFAULT_SITE_CONFIG.seo.twitter.site,
    creator: DEFAULT_SITE_CONFIG.seo.twitter.creator,
    title: DEFAULT_SITE_CONFIG.seo.twitter.title,
    description: DEFAULT_SITE_CONFIG.seo.twitter.description,
    images: [DEFAULT_SITE_CONFIG.seo.twitter.image]
  },
  icons: {
    icon: DEFAULT_SITE_CONFIG.branding.logo.favicon,
    apple: DEFAULT_SITE_CONFIG.branding.logo.apple_touch_icon
  },
  metadataBase: new URL(DEFAULT_SITE_CONFIG.url),
  alternates: {
    canonical: DEFAULT_SITE_CONFIG.seo.canonical
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('min-h-screen font-sans antialiased', instrumentSans.variable)}
    >
      <body className="font-sans antialiased">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <AppShell>{children}</AppShell>
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
