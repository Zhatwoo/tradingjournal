'use client';

import Link from "next/link";
import { TrendingUp, BarChart3, Camera, ChevronRight, CheckCircle, ArrowRight } from "lucide-react"; 
import Header from "./components/Header";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-['Inter'] overflow-hidden">

      <Header />  

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center flex-1 px-6 sm:px-10 py-24 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 text-sm text-blue-300 mb-6 border border-blue-500/20">
            <span className="h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Trade smarter, not harder
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent bg-300% animate-gradient">
              Analyze Your Trades,
            </span>
            <br />
            <span className="text-white">Master Your Strategy.</span>
          </h1>

          <p className="text-gray-300 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Advanced trading journal platform that helps you track performance, identify patterns, 
            and transform your trading strategy through data-driven insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/login"
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-8 py-4 rounded-xl font-semibold text-white shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 flex items-center"
            >
              Start Journaling Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
              
          </div>
          
          {/* Stats preview */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99%</div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-sm text-gray-400">Trades Logged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-400">Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 px-6 sm:px-10 bg-gray-900 relative">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-950 to-transparent opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Powerful Features
              </span>
              <br />
              For Serious Traders
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to analyze your trading performance and improve your strategy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Trade Tracking</h3>
              <p className="text-gray-400 mb-4">
                Log all your trades with precision. Record entry/exit points, position size, P&L, and add detailed strategy notes.
              </p>
              <ul className="space-y-2">
                {['Multiple asset classes', 'Custom tagging', 'Trade emotions', 'Strategy classification'].map((item) => (
                  <li key={item} className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="text-purple-400" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Performance Analytics</h3>
              <p className="text-gray-400 mb-4">
                Visualize your performance with interactive charts and statistics. Identify your strengths and weaknesses.
              </p>
              <ul className="space-y-2">
                {['Win rate analysis', 'Profit factor', 'Risk-reward ratios', 'Performance benchmarks'].map((item) => (
                  <li key={item} className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="inline-flex items-center justify-center p-3 bg-rose-500/10 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <Camera className="text-rose-400" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visual Journaling</h3>
              <p className="text-gray-400 mb-4">
                Attach screenshots of your setups and chart analysis. Keep everything organized in one place.
              </p>
              <ul className="space-y-2">
                {['Drag & drop upload', 'Image annotations', 'Chart markup tools', 'Cloud storage'].map((item) => (
                  <li key={item} className="flex items-center text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-rose-500 mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/CTA Section */}
      <section className="py-20 px-6 sm:px-10 bg-gradient-to-br from-gray-900 to-gray-950">
        <div className="max-w-4xl mx-auto text-center rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-12 border border-gray-800">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Ready to Transform Your Trading?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who have improved their performance with our journaling platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-8 py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-blue-500/20 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} TJournal. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="hover:text-blue-400 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-blue-400 transition">Terms</Link>
              <Link href="/contact" className="hover:text-blue-400 transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
