import { HeaderNav } from "@/components/header-nav"
import Link from "next/link"

export const metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions for using Green Screen Remover service."
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Terms of Service</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Last updated: November 7, 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              By accessing and using Green Screen Remover ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">2. Description of Service</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Green Screen Remover is an online video processing tool that removes green screen backgrounds from videos and exports them with transparent alpha channels in WebM format.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">3. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">3.1 Registration</h3>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must be at least 13 years old to use the Service</li>
              <li>One person may not maintain more than one free account</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">3.2 Account Security</h3>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>You are responsible for all activity under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>We are not liable for losses due to stolen credentials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">4. Acceptable Use</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">4.1 You May:</h3>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>Upload your own videos for processing</li>
              <li>Download and use processed videos for any legal purpose</li>
              <li>Use the Service for personal or commercial projects</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">4.2 You May Not:</h3>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>Upload content you don't have rights to</li>
              <li>Upload illegal, harmful, or offensive content</li>
              <li>Attempt to bypass usage limits or restrictions</li>
              <li>Reverse engineer or copy the Service</li>
              <li>Use the Service to harm others or our infrastructure</li>
              <li>Resell or redistribute the Service</li>
              <li>Use automated tools to abuse the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">5. Content Ownership</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">5.1 Your Content</h3>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>You retain all rights to videos you upload</li>
              <li>You grant us temporary rights to process your videos</li>
              <li>We will not use your content for any other purpose</li>
              <li>Videos are automatically deleted after processing</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">5.2 Our Content</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              The Service, including its design, code, and algorithms, is our intellectual property. You may not copy, modify, or redistribute it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">6. Pricing and Payments</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">6.1 Free Tier</h3>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>5 videos per day</li>
              <li>Watermark applied to processed videos</li>
              <li>Subject to usage limits and restrictions</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">6.2 Pro Tier ($12/month)</h3>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>50 videos per month</li>
              <li>No watermark</li>
              <li>All features included</li>
              <li>Billed monthly via Stripe</li>
              <li>Cancel anytime</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">6.3 Payment Terms</h3>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>Payments processed securely through Stripe</li>
              <li>Subscriptions renew automatically</li>
              <li>No refunds for partial months</li>
              <li>Prices subject to change with 30 days notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">7. Service Availability</h2>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>We strive for 99% uptime but cannot guarantee it</li>
              <li>Service may be temporarily unavailable for maintenance</li>
              <li>We are not liable for service interruptions</li>
              <li>We may modify or discontinue features at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">8. Limitation of Liability</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>The Service is provided "AS IS" without warranties</li>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the amount you paid in the past 12 months</li>
              <li>We are not responsible for lost data or content</li>
              <li>You use the Service at your own risk</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">9. Indemnification</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              You agree to indemnify and hold us harmless from any claims arising from:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Content you upload</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">10. Termination</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">10.1 By You</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              You may cancel your account at any time through your account settings.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">10.2 By Us</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li>Violate these Terms</li>
              <li>Abuse the Service</li>
              <li>Engage in illegal activity</li>
              <li>Fail to pay (for Pro accounts)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">11. Changes to Terms</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We may update these Terms at any time. We will notify you of significant changes via email or through the Service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">12. Governing Law</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              These Terms are governed by the laws of the United States. Any disputes will be resolved in courts of competent jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">13. Contact</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Questions about these Terms?
            </p>
            <ul className="list-none text-slate-700 dark:text-slate-300 mb-4 space-y-2">
              <li><strong>Email:</strong> <a href="mailto:legal@greenscreenremover.com" className="text-green-600 dark:text-green-400 hover:underline">legal@greenscreenremover.com</a></li>
              <li><strong>Website:</strong> <a href="https://greenscreenremover.com" className="text-green-600 dark:text-green-400 hover:underline">greenscreenremover.com</a></li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <Link href="/" className="text-green-600 dark:text-green-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

