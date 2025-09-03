'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const redirectToLogin = () => {
    router.push("/auth/login");
    setIsOpen(false);
  };
  
  const redirectToRegister = () => {
    router.push("/auth/register");
    setIsOpen(false);
  };
  
  const redirectToHome = () => {
    router.push("/");
    setIsOpen(false);
  };

  // Smooth scroll to Features section
  const scrollToFeatures = () => {
    const section = document.getElementById("features");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false); // close mobile menu if open
  };

  return (
    <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-5 px-6 sm:px-8">
        {/* Logo */}
        <div onClick={redirectToHome} className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg border border-gray-700 group-hover:border-blue-500/50 transition-colors">
              <TrendingUp size={26} className="text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent bg-300% animate-gradient">
            TJournal
          </h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-6 mr-4">
            <span
              onClick={scrollToFeatures}
              className="text-gray-300 hover:text-white transition-colors text-base font-medium cursor-pointer"
            >
              Features
            </span>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors text-base font-medium">
              About
            </a>
          </nav>
          
          <div className="flex gap-3">
          <button
  onClick={redirectToLogin}
  className="group relative px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 transition-all duration-300 font-medium text-white border border-blue-500/30 hover:border-blue-400/50 overflow-hidden"
>
  <span className="relative z-10">Log in</span>
  
  {/* Animated underline effect */}
  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></div>
  
  {/* Moto text that appears on hover */}
  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300 whitespace-nowrap">
    <span className="text-xs text-blue-300 font-light">Track your trades. Master your strategy.</span>
  </div>
</button>
            <button
              onClick={redirectToRegister}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors border border-gray-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800 shadow-xl">
          <div className="flex flex-col p-5">
            <nav className="flex flex-col gap-3 mb-5">
              <span
                onClick={scrollToFeatures}
                className="px-5 py-4 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-base cursor-pointer"
              >
                Features
              </span>
              <a 
                href="#about" 
                className="px-5 py-4 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-base"
              >
                About
              </a>
            </nav>
            
            <div className="flex flex-col gap-4 pt-3 border-t border-gray-800">
              <button
                onClick={redirectToLogin}
                className="px-5 py-4 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors font-medium text-white text-center text-base"
              >
                Sign In
              </button>
              <button
                onClick={redirectToRegister}
                className="px-5 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-colors font-medium text-white text-center text-base"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
