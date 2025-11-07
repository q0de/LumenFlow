import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LumenFlow — Remove Green Screen from Video Online | AI Chroma Key Tool",
  description: "Free online green screen removal tool. Convert videos to transparent WebM with alpha channel. Perfect for Unity games. AI-powered chroma key technology.",
  keywords: "remove green screen from video, green screen removal online, ai green screen removal, transparent video converter, unity transparent video, webm alpha channel, chroma key online",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

