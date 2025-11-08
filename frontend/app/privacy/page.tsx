import { HeaderNav } from "@/components/header-nav"
import Link from "next/link"

export const metadata = {
  title: "Privacy Policy",
  description: "Learn how Green Screen Remover collects, uses, and protects your personal information."
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Last updated: November 7, 2025</p>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50">

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">1. Introduction</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Welcome to Green Screen Remover ("we", "our", or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">2.1 Account Information</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Authentication credentials (encrypted)</li>
              <li>OAuth provider information (Google, GitHub, Discord)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">2.2 Uploaded Videos</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We temporarily process your uploaded videos to remove green screens. Uploaded files are:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>Stored temporarily during processing</li>
              <li>Automatically deleted within 24 hours</li>
              <li>Never shared with third parties</li>
              <li>Processed securely on our servers</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">2.3 Usage Data</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We collect analytics data to improve our service:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>Page views and interactions</li>
              <li>Device and browser information</li>
              <li>IP address (anonymized)</li>
              <li>Video processing statistics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>To provide and maintain our video processing service</li>
              <li>To manage your account and subscriptions</li>
              <li>To send important service updates</li>
              <li>To improve our service and user experience</li>
              <li>To prevent fraud and abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">4. Data Storage and Security</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We take data security seriously:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>All data is encrypted in transit (HTTPS/TLS)</li>
              <li>Database hosted securely with Supabase</li>
              <li>Video files stored temporarily and deleted automatically</li>
              <li>Payment information handled securely by Stripe (we never see your card details)</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">5. Third-Party Services</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We use trusted third-party services:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li><strong>Supabase:</strong> Authentication and database</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Google Analytics:</strong> Usage analytics</li>
              <li><strong>Render:</strong> Hosting and infrastructure</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Each service has their own privacy policy and we encourage you to review them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">6. Cookies</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>Authentication and session management</li>
              <li>User preferences</li>
              <li>Analytics (via Google Analytics)</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              See our <Link href="/cookies" className="text-green-600 dark:text-green-400 hover:underline">Cookie Policy</Link> for more details.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">7. Your Rights (GDPR)</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Under GDPR, you have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your data</li>
              <li><strong>Restriction:</strong> Request limitation of processing</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              To exercise these rights, contact us at: <a href="mailto:privacy@greenscreenremover.com" className="text-green-600 dark:text-green-400 hover:underline">privacy@greenscreenremover.com</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">8. Data Retention</h2>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li><strong>Uploaded videos:</strong> Deleted within 24 hours</li>
              <li><strong>Processed videos:</strong> Available for download for 7 days, then deleted</li>
              <li><strong>Account data:</strong> Retained until account deletion</li>
              <li><strong>Payment records:</strong> Retained for 7 years (legal requirement)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">9. Children's Privacy</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Our service is not intended for users under 13 years old. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">10. Changes to This Policy</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We may update this privacy policy from time to time. We will notify you of significant changes via email or through our service. Continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">11. Contact Us</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              If you have questions about this privacy policy or our data practices:
            </p>
            <ul className="list-none text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li><strong>Email:</strong> <a href="mailto:privacy@greenscreenremover.com" className="text-green-600 dark:text-green-400 hover:underline">privacy@greenscreenremover.com</a></li>
              <li><strong>Website:</strong> <a href="https://greenscreenremover.com" className="text-green-600 dark:text-green-400 hover:underline">greenscreenremover.com</a></li>
            </ul>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-8 pt-6 border-t border-slate-300 dark:border-slate-600">
          <Link href="/" className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors">
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}

