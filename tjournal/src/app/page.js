'use client';

import Link from "next/link";
import { TrendingUp, BarChart3, Camera } from "lucide-react"; // Professional icons
import Header from "./components/Header";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-['Roboto']">
      
     <Header/>  

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center flex-1 px-6 sm:px-10 py-20 bg-gray-900">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-blue-400">
          Track Your Trades. Master Your Performance.
        </h1>
        <p className="text-gray-300 text-base sm:text-lg md:text-xl mb-8 max-w-xl sm:max-w-2xl">
          Keep a complete record of your trades, analyze your performance, 
          and grow as a trader. Upload screenshots, track P&L, and stay on top of your game.
        </p>

        {/* CTA Buttons */}
{/* CTA Buttons */}
<div className="flex flex-col sm:flex-row gap-4 justify-center">
<Link
  href="/auth/login" // lowercase
  className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded font-semibold text-center text-white transition"
>
  Get Started
</Link>

</div>


      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 bg-gray-800">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 text-blue-400">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-700 p-6 sm:p-8 rounded-lg text-center shadow hover:shadow-lg transition">
            <TrendingUp className="mx-auto mb-4 text-red-500" size={40} />
            <h3 className="text-xl font-semibold mb-2">Trade Tracking</h3>
            <p className="text-gray-300 text-sm sm:text-base">Log all your trades with details like entry/exit, P&L, and strategy notes.</p>
          </div>
          <div className="bg-gray-700 p-6 sm:p-8 rounded-lg text-center shadow hover:shadow-lg transition">
            <BarChart3 className="mx-auto mb-4 text-blue-400" size={40} />
            <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
            <p className="text-gray-300 text-sm sm:text-base">Visualize your progress with charts and statistics to improve your trading.</p>
          </div>
          <div className="bg-gray-700 p-6 sm:p-8 rounded-lg text-center shadow hover:shadow-lg transition">
            <Camera className="mx-auto mb-4 text-red-500" size={40} />
            <h3 className="text-xl font-semibold mb-2">Screenshot Uploads</h3>
            <p className="text-gray-300 text-sm sm:text-base">Keep screenshots of setups or trades for reference and review.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center border-t border-gray-700">
        &copy; {new Date().getFullYear()} Trading Journal. All rights reserved.
      </footer>
    </div>
  );
}
