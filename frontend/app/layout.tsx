import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LumenFlow — Remove Green Screen from Video Online | AI Chroma Key Tool",
  description: "Free online green screen removal tool. Convert videos to transparent WebM with alpha channel. Perfect for Unity games. AI-powered chroma key technology.",
  keywords: "remove green screen from video, green screen removal online, ai green screen removal, transparent video converter, unity transparent video, webm alpha channel, chroma key online",
  authors: [{ name: "LumenFlow" }],
  creator: "LumenFlow",
  publisher: "LumenFlow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lumenflow.app",
    title: "LumenFlow — Remove Green Screen from Video Online",
    description: "Free online green screen removal tool. Convert videos to transparent WebM with alpha channel. Perfect for Unity games.",
    siteName: "LumenFlow",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "LumenFlow - AI Green Screen Removal Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LumenFlow — Remove Green Screen from Video Online",
    description: "Free online green screen removal tool for Unity games. AI-powered chroma key technology.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LumenFlow',
    applicationCategory: 'MultimediaApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    description: 'Free online green screen removal tool. Convert videos to transparent WebM with alpha channel for Unity games.',
    operatingSystem: 'Web Browser',
    screenshot: 'https://lumenflow.app/opengraph-image',
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

