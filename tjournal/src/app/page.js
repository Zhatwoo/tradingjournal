'use client';

import Link from "next/link";
import { TrendingUp, BarChart3, Camera, ChevronRight, CheckCircle, ArrowRight } from "lucide-react"; 
import Header from "./components/Header";
import CreatorsSection from "./components/CreatorsSection";
import Footer from "./components/Footer";

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
          
          {/* Why Choose TJournal */}
          <div className="mt-[10vh] max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Left side - Main benefit */}
              <div className="flex-1 text-center lg:text-left group">
                <div className="inline-block p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl border-2 border-green-500/40 mb-6 hover:from-green-500/30 hover:to-blue-500/30 hover:border-green-500/60 hover:scale-105 transition-all duration-300 cursor-pointer group-hover:shadow-lg group-hover:shadow-green-500/20">
                  <div className="text-4xl font-bold text-green-400 mb-2 group-hover:text-green-300 transition-colors duration-300">100% Free</div>
                  <div className="text-lg text-white group-hover:text-gray-100 transition-colors duration-300">No subscriptions, no hidden fees</div>
                  <div className="mt-2 text-sm text-green-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">🚀 Start trading smarter today!</div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  Complete trading journal platform with advanced analytics, 
                  visual documentation, and performance tracking - all at no cost.
                </p>
              </div>
              
              {/* Right side - Secondary benefits */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl border-2 border-gray-700/60 backdrop-blur-sm hover:bg-gray-800/50 hover:border-blue-500/50 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group">
                  <div className="p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-blue-100 transition-colors duration-300">Bank-Level Security</div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Your data is encrypted and protected</div>
                    <div className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">🔒 Military-grade encryption</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl border-2 border-gray-700/60 backdrop-blur-sm hover:bg-gray-800/50 hover:border-purple-500/50 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer group">
                  <div className="p-3 bg-purple-500/10 rounded-full group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-purple-100 transition-colors duration-300">Lightning Fast</div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Quick setup and instant access</div>
                    <div className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">⚡ Sub-second load times</div>
                  </div>
            </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 sm:px-10 bg-gray-900 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Professional Trading Tools</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-white">Built for</span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ml-3">Traders</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Comprehensive trading journal platform designed to elevate your trading performance through data-driven insights and professional-grade analytics.
            </p>
          </div>
          
          {/* Main Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Primary Feature */}
            <div className="space-y-8">
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-500 group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors duration-300">
                    <TrendingUp className="text-blue-400" size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Advanced Trade Analytics</h3>
                    <p className="text-gray-400">Professional-grade performance tracking</p>
                  </div>
              </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  Track every aspect of your trading with precision. From entry/exit analysis to risk management metrics, get the insights you need to improve your strategy.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-400 mb-1">95%+</div>
                    <div className="text-sm text-gray-400">Accuracy Rate</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-400 mb-1">Real-time</div>
                    <div className="text-sm text-gray-400">Data Sync</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Secondary Features */}
            <div className="space-y-6">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors duration-300">
                    <BarChart3 className="text-purple-400" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-white">Performance Insights</h4>
              </div>
                <p className="text-gray-400 leading-relaxed">
                  Comprehensive analytics including win rate, profit factor, and risk-reward analysis to optimize your trading strategy.
                </p>
            </div>

              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors duration-300">
                    <Camera className="text-green-400" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-white">Visual Documentation</h4>
              </div>
                <p className="text-gray-400 leading-relaxed">
                  Attach charts, screenshots, and annotations to document your trading setups and decisions for future reference.
                </p>
              </div>
            </div>
          </div>

          {/* Eye-Catching Features */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-6 backdrop-blur-sm">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-300">Platform Highlights</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Traders Choose Us</h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Experience the difference with our cutting-edge trading platform</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Market Coverage - Floating Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 hover:bg-gray-900/90 transition-all duration-500 cursor-pointer">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <div className="text-3xl">📈</div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">50+</div>
                      <div className="text-sm text-gray-400">Markets</div>
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Multi-Market Trading</h4>
                  <p className="text-gray-300 leading-relaxed mb-6">Trade across forex, stocks, crypto, and commodities with unified analytics and tracking.</p>
                  <div className="flex flex-wrap gap-2">
                    {['Forex', 'Stocks', 'Crypto', 'Commodities'].map((market, index) => (
                      <span key={market} className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 text-sm rounded-full backdrop-blur-sm">
                        {market}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security - Glowing Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 hover:bg-gray-900/90 transition-all duration-500 cursor-pointer">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <div className="text-3xl">🛡️</div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">256-bit</div>
                      <div className="text-sm text-gray-400">Encryption</div>
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Military-Grade Security</h4>
                  <p className="text-gray-300 leading-relaxed mb-6">Your data is protected with bank-level encryption and secure cloud infrastructure.</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">SSL/TLS Protected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Sync - Pulsing Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 hover:bg-gray-900/90 transition-all duration-500 cursor-pointer">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <div className="text-3xl">⚡</div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">&lt;1s</div>
                      <div className="text-sm text-gray-400">Sync Time</div>
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Lightning Fast Sync</h4>
                  <p className="text-gray-300 leading-relaxed mb-6">Access your journal from any device with instant real-time synchronization.</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-purple-400">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Updates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creators Section */}
      <CreatorsSection />

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

      <Footer />

    </div>
  );
}
