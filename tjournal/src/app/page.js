'use client';

import Link from "next/link";
import { TrendingUp, BarChart3, Camera } from "lucide-react"; 
import Header from "./components/Header";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-['Roboto']">

      <Header />  

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center flex-1 px-6 sm:px-10 py-24 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
        {/* Optional: subtle chart background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,200 C150,100 350,300 500,200 L500,00 L0,0 Z" fill="#4f46e5"/>
          </svg>
        </div>

        <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Track Your Trades. Master Your Performance.
        </h1>
        <p className="relative text-gray-300 text-lg sm:text-xl mb-8 max-w-xl sm:max-w-2xl">
          Keep a complete record of your trades, analyze your performance, 
          and grow as a trader. Upload screenshots, track P&L, and stay on top of your game.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <Link
            href="/auth/login"
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-purple-600 px-8 py-4 rounded-lg font-semibold text-white shadow-lg transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 px-6 sm:px-10 bg-gray-800">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-blue-400">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          
          <div className="bg-gray-700 p-8 rounded-lg text-center shadow hover:shadow-lg transition transform hover:-translate-y-1">
            <TrendingUp className="mx-auto mb-4 text-green-400" size={48} />
            <h3 className="text-xl font-semibold mb-2">Trade Tracking</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Log all your trades with details like entry/exit, P&L, and strategy notes.
            </p>
          </div>

          <div className="bg-gray-700 p-8 rounded-lg text-center shadow hover:shadow-lg transition transform hover:-translate-y-1">
            <BarChart3 className="mx-auto mb-4 text-blue-400" size={48} />
            <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Visualize your progress with charts and statistics to improve your trading.
            </p>
          </div>

          <div className="bg-gray-700 p-8 rounded-lg text-center shadow hover:shadow-lg transition transform hover:-translate-y-1">
            <Camera className="mx-auto mb-4 text-red-400" size={48} />
            <h3 className="text-xl font-semibold mb-2">Screenshot Uploads</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Keep screenshots of setups or trades for reference and review.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center border-t border-gray-700">
        &copy; {new Date().getFullYear()} TJournal. All rights reserved.
      </footer>
    </div>
  );
}
