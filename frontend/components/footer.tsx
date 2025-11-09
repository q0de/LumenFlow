import Link from "next/link"
import { Video, Sparkles, Shield } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto bg-gradient-to-br from-slate-50/95 via-green-50/30 to-slate-50/95 dark:from-slate-900/95 dark:via-green-950/20 dark:to-slate-900/95 border-t border-green-200/50 dark:border-green-800/30 shadow-lg">
      <div className="container mx-auto px-4 py-6 md:py-3">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
                <Video className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-base font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                Green Screen Remover
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 max-w-md leading-relaxed">
              AI-powered green screen removal for game developers. Convert videos to transparent WebM.
            </p>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
                <Sparkles className="h-3 w-3 text-green-500" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
                <Shield className="h-3 w-3 text-green-500" />
                <span>Secure</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-1.5">
              <li>
                <Link 
                  href="/" 
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Pricing</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-xs uppercase tracking-wider">Legal</h4>
            <ul className="space-y-1.5">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookies" 
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">Cookie Policy</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-3 border-t border-green-200/50 dark:border-green-800/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              © {currentYear} Green Screen Remover. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com/crypt0e" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                @crypt0e
              </a>
              <a 
                href="mailto:support@greenscreenremover.com"
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

