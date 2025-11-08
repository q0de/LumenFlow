import { HeaderNav } from "@/components/header-nav"
import Link from "next/link"

export const metadata = {
  title: "Cookie Policy",
  description: "Learn about how Green Screen Remover uses cookies and similar technologies."
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Last updated: November 7, 2025</p>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50">

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">1. What Are Cookies?</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">2. How We Use Cookies</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Green Screen Remover uses cookies for essential functionality and to improve our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">3. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">3.1 Essential Cookies (Required)</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              These cookies are necessary for the service to function:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-600">
                    <th className="text-left py-2 text-slate-900 dark:text-slate-100">Cookie</th>
                    <th className="text-left py-2 text-slate-900 dark:text-slate-100">Purpose</th>
                    <th className="text-left py-2 text-slate-900 dark:text-slate-100">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 dark:text-slate-300">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2"><code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">sb-access-token</code></td>
                    <td className="py-2">Authentication</td>
                    <td className="py-2">1 hour</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2"><code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">sb-refresh-token</code></td>
                    <td className="py-2">Session refresh</td>
                    <td className="py-2">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
              These cookies cannot be disabled as they are required for the service to work.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">3.2 Preference Cookies</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              These cookies remember your settings:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-600">
                    <th className="text-left py-2 text-slate-900 dark:text-slate-100">Cookie</th>
                    <th className="text-left py-2 text-slate-900 dark:text-slate-100">Purpose</th>
                    <th className="text-left py-2 text-slate-900 dark:text-slate-100">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 dark:text-slate-300">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2"><code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">theme</code></td>
                    <td className="py-2">Dark/light mode preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2"><code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">lumenflow-options</code></td>
                    <td className="py-2">Video processing settings</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">3.3 Analytics Cookies (Optional)</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We use Google Analytics to understand how users interact with our service:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-600">
                    <th className="text-left py-2 text-slate-900 dark:text-slate-100">Cookie</th>
                    <th className="text-left py-2 text-slate-900 dark:text-slate-100">Purpose</th>
                    <th className="text-left py-2 text-slate-900 dark:text-slate-100">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 dark:text-slate-300">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2"><code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">_ga</code></td>
                    <td className="py-2">Distinguish users</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2"><code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">_ga_*</code></td>
                    <td className="py-2">Store session state</td>
                    <td className="py-2">2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Learn more about Google Analytics cookies: <a href="https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">Google Analytics Cookie Usage</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">4. Third-Party Cookies</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Some cookies are set by third-party services we use:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li><strong>Supabase:</strong> Authentication cookies</li>
              <li><strong>Stripe:</strong> Payment processing cookies (only on payment pages)</li>
              <li><strong>Google Analytics:</strong> Analytics cookies</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              These services have their own cookie policies:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">Supabase Privacy Policy</a></li>
              <li><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">Stripe Privacy Policy</a></li>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">Google Privacy Policy</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">5. Managing Cookies</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">5.1 Browser Settings</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              You can control cookies through your browser settings:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">Microsoft Edge</a></li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">5.2 Opt-Out of Analytics</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              To opt-out of Google Analytics:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>Install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
              <li>Enable "Do Not Track" in your browser</li>
              <li>Use privacy-focused browsers or extensions</li>
            </ul>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-200">
                <strong>⚠️ Note:</strong> Disabling essential cookies will prevent you from logging in and using the service.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">6. Do Not Track</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We respect the "Do Not Track" browser setting for analytics cookies. Essential cookies will still be used to provide the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">7. Updates to This Policy</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We may update this Cookie Policy. We'll notify you of significant changes through our service or via email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">8. Contact Us</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Questions about our use of cookies?
            </p>
            <ul className="list-none text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li><strong>Email:</strong> <a href="mailto:privacy@greenscreenremover.com" className="text-green-600 dark:text-green-400 hover:underline">privacy@greenscreenremover.com</a></li>
              <li><strong>Privacy Policy:</strong> <Link href="/privacy" className="text-green-600 dark:text-green-400 hover:underline">Read our Privacy Policy</Link></li>
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

