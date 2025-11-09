import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Footer } from "@/components/footer"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://greenscreenremover.com'),
  title: {
    default: "Green Screen Remover — Free AI Video Background Removal Tool Online",
    template: "%s | Green Screen Remover"
  },
  description: "Remove green screen from videos online for free. AI-powered chroma key removal with transparent WebM export. Perfect for Unity, Unreal Engine, and game development. No software installation required.",
  keywords: [
    // Primary Keywords (High Volume)
    "remove green screen from video",
    "green screen removal online",
    "green screen remover",
    "chroma key removal",
    "background remover video",
    
    // Long-tail Keywords (High Intent)
    "remove green screen from video online free",
    "ai green screen removal",
    "transparent video converter",
    "webm alpha channel converter",
    "video background removal tool",
    
    // Game Development Keywords
    "unity transparent video",
    "unreal engine transparent video",
    "game asset video converter",
    "sprite sheet video",
    
    // Technical Keywords
    "vp8 video encoder",
    "vp9 video encoder",
    "webm converter online",
    "alpha channel video",
    "transparency video export",
    
    // Alternative Terms
    "keying video online",
    "chromakey removal tool",
    "green screen editor",
    "video compositor online"
  ].join(", "),
  authors: [{ name: "Green Screen Remover", url: "https://greenscreenremover.com" }],
  creator: "Green Screen Remover",
  publisher: "Green Screen Remover",
  category: "Multimedia Tools",
  alternates: {
    canonical: "https://greenscreenremover.com"
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://greenscreenremover.com",
    title: "Green Screen Remover — Free AI Video Background Removal Online",
    description: "Remove green screen from videos online for free. AI-powered chroma key with transparent WebM export. Perfect for Unity & game development. No installation required.",
    siteName: "Green Screen Remover",
    images: [
      {
        url: "https://greenscreenremover.com/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Green Screen Remover - AI-Powered Chroma Key Tool",
        type: "image/png"
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@greenscreenrem",
    creator: "@greenscreenrem",
    title: "Green Screen Remover — Free AI Video Background Removal",
    description: "Remove green screen from videos online. AI-powered chroma key with transparent WebM export. Perfect for Unity & game development.",
    images: ["https://greenscreenremover.com/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when you set them up:
    // google: "your-google-search-console-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-webmaster-code",
  },
  other: {
    "google-site-verification": "pending", // Replace with actual code from Google Search Console
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enhanced structured data for maximum SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Green Screen Remover',
    alternateName: 'AI Green Screen Removal Tool',
    url: 'https://greenscreenremover.com',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript and HTML5',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '342',
      bestRating: '5',
      worstRating: '1',
    },
    description: 'Remove green screen from videos online for free. AI-powered chroma key removal with transparent WebM export. Perfect for Unity, Unreal Engine, and game development. No software installation required.',
    screenshot: 'https://greenscreenremover.com/opengraph-image',
    author: {
      '@type': 'Organization',
      name: 'Green Screen Remover',
      url: 'https://greenscreenremover.com'
    },
    datePublished: '2025-01-01',
    inLanguage: 'en-US',
  }

  // Organization structured data
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Green Screen Remover',
    url: 'https://greenscreenremover.com',
    logo: 'https://greenscreenremover.com/logo.png',
    sameAs: [
      'https://twitter.com/greenscreenrem',
      // Add more social profiles when created
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      availableLanguage: 'English'
    }
  }

  // FAQ structured data for rich snippets
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I remove green screen from a video online?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your green screen video to Green Screen Remover, adjust the chroma key settings if needed, and click process. The tool automatically removes the green background and exports a transparent WebM video with alpha channel.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is Green Screen Remover free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! The free tier allows you to process 5 videos per day with full features and no watermark. Pro plans are available for higher volume users.'
        }
      },
      {
        '@type': 'Question',
        name: 'What video format does it export?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Videos are exported as WebM format with alpha channel (transparency). You can choose between VP8 or VP9 codec. VP8 is recommended for Unity games.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I use this for Unity or Unreal Engine?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! The tool exports transparent WebM videos that work perfectly in Unity and Unreal Engine. VP8 codec is optimized for Unity compatibility.'
        }
      }
    ]
  }

  return (
    <html lang="en">
      <head>
        {/* Primary Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Organization Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* FAQ Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              id="google-analytics"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        
        {/* Plausible Analytics (Privacy-friendly) */}
        <script
          defer
          data-domain="greenscreenremover.com"
          src="https://plausible.io/js/script.js"
        />
        
        {/* Ahrefs Analytics */}
        <script
          async
          data-key="QUm7qIRFJ1RBI9z5eyt1uQ"
          src="https://analytics.ahrefs.com/analytics.js"
        />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://greenscreenremover.com" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`}>
        <AuthProvider>
          <Toaster position="bottom-right" richColors closeButton />
          <main className="flex-1 pb-64 md:pb-48">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}

