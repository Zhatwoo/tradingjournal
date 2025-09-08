'use client';

import Link from "next/link";
import { Heart, Github, Twitter, Mail } from "lucide-react";

export default function Footer({ 
  sidebarOpen = false, 
  isMobile = false,
  hasSidebar = false 
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-900/95 backdrop-blur-md text-gray-400 border-t border-gray-700/50 transition-all duration-300 w-full ${
      hasSidebar 
        ? (sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-16')
        : 'ml-0'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white text-lg">
                  T
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TJournal
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-md">
                Your comprehensive trading journal platform. Track, analyze, and improve your trading performance with AI-powered insights and real-time metrics.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                <span>for traders</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/addtrade" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                    Add Trade
                  </Link>
                </li>
                <li>
                  <Link href="/tradehistory" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                    Trade History
                  </Link>
                </li>
                <li>
                  <Link href="/overallperf" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                    Performance
                  </Link>
                </li>
                <li>
                  <Link href="/tradingschool" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                    Learn to Trade
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support & Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                    About
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-4 sm:py-6 border-t border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-500">
              &copy; {currentYear} TJournal. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 sm:gap-4">
              <a 
                href="https://github.com/tjournal-app" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/tjournal_app" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="mailto:support@tjournal.com" 
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>

            {/* Version Info */}
            <div className="text-xs text-gray-600">
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
