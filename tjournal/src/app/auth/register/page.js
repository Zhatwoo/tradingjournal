'use client';
import Link from "next/link";
import { Home, ArrowLeft, Search, TrendingUp, Heart, Star } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 font-['Inter'] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-pink-600 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-purple-600 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-yellow-500 rounded-full mix-blend-soft-light filter blur-3xl animate-bounce"></div>
      </div>

      <div className="relative bg-gradient-to-br from-gray-900/70 via-gray-900/80 to-gray-900/70 rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-gray-800 backdrop-blur-md text-center">
        {/* Cute 404 Illustration */}
        <div className="mb-8">
          <div className="relative mx-auto w-32 h-32 mb-6">
            {/* Cute face */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-pulse"></div>
            <div className="absolute top-6 left-6 w-4 h-4 bg-white rounded-full animate-bounce"></div>
            <div className="absolute top-6 right-6 w-4 h-4 bg-white rounded-full animate-bounce animation-delay-200"></div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-white rounded-full"></div>
            {/* Cute blush */}
            <div className="absolute top-8 left-2 w-3 h-3 bg-pink-300 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-8 right-2 w-3 h-3 bg-pink-300 rounded-full opacity-60 animate-pulse animation-delay-1000"></div>
          </div>
          
          {/* Floating hearts */}
          <div className="absolute top-4 left-4 text-pink-400 animate-bounce">
            <Heart size={16} className="fill-current" />
          </div>
          <div className="absolute top-8 right-8 text-purple-400 animate-bounce animation-delay-500">
            <Star size={14} className="fill-current" />
          </div>
          <div className="absolute bottom-16 left-8 text-yellow-400 animate-bounce animation-delay-1000">
            <Heart size={12} className="fill-current" />
          </div>
        </div>

        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-pulse">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Oops! This page is taking a nap! 😴
          </h2>
          <p className="text-gray-400 text-lg mb-6 leading-relaxed">
            Looks like this page decided to go on a little adventure! 
            <br />
            Don't worry, it's probably just exploring the digital universe! ✨
          </p>
        </div>

        {/* Cute message */}
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-6 mb-8 border border-pink-500/20">
          <div className="flex items-center justify-center mb-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-400"></div>
            </div>
          </div>
          <p className="text-pink-300 text-sm">
            "Sometimes the best pages are the ones that don't exist yet!" 
            <br />
            <span className="text-xs text-gray-400">- A wise developer 🧙‍♂️</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 transition-all duration-300 text-white py-4 px-6 rounded-xl font-medium shadow-lg shadow-pink-500/20 group"
          >
            <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Take me home, cutie! 🏠
          </Link>
          
          <Link 
            href="/auth/login"
            className="inline-flex items-center justify-center w-full bg-gray-800/60 hover:bg-gray-700/60 transition-all duration-300 text-gray-300 py-3 px-6 rounded-xl font-medium border border-gray-700 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Go back to login
          </Link>
        </div>

        {/* Fun facts */}
        <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <p className="text-gray-400 text-xs">
            <span className="text-pink-400">💡 Fun fact:</span> 404 errors were named after room 404 at CERN, 
            where the original web servers were located! 
            <br />
            <span className="text-purple-400">🌟</span> Now you know something new today!
          </p>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}