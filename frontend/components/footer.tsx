import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Green Screen Remover
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              AI-powered green screen removal for game developers. Remove backgrounds from videos online.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400">
                  Pricing
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/q0de/LumenFlow" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400">
                  Blog
                </Link>
              </li>
              <li>
                <a 
                  href="https://docs.unity3d.com/Manual/VideoPlayer.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                >
                  Unity Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © {currentYear} Green Screen Remover. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a 
              href="https://twitter.com/greenscreenrem" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
            >
              Twitter
            </a>
            <a 
              href="https://github.com/q0de/LumenFlow" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
            >
              GitHub
            </a>
            <a 
              href="mailto:support@greenscreenremover.com"
              className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

