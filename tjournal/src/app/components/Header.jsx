'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const redirectToLogin = () => router.push("/auth/login");
  const redirectToRegister = () => router.push("/auth/register");

  return (
    <header className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#3b82f6] text-white sticky top-0 z-50 shadow-xl border-b border-blue-500">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-5 px-6 sm:px-10">
        {/* Logo */}
        <h1 className="text-3xl sm:text-3xl font-bold flex items-center gap-3 text-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
          <TrendingUp size={28} /> TJournal
        </h1>

        {/* Desktop Nav */}
        <div className="hidden sm:flex gap-4">
          <button
            onClick={redirectToLogin}
            className="px-5 py-2 rounded bg-gray-800 hover:bg-gray-700 hover:scale-105 transition transform font-semibold shadow-md text-white"
          >
            Login
          </button>
          <button
            onClick={redirectToRegister}
            className="px-5 py-2 rounded bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-95 hover:scale-105 transition transform font-semibold shadow-lg text-white"
          >
            Register
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden px-4 py-2 border rounded border-gray-400 hover:bg-gray-700 transition font-semibold"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="sm:hidden flex flex-col gap-2 px-6 pb-4 bg-gray-800 shadow-inner">
          <button
            onClick={redirectToLogin}
            className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 transition text-center font-semibold shadow-md text-white"
          >
            Login
          </button>
          <button
            onClick={redirectToRegister}
            className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-95 transition text-center font-semibold shadow-lg text-white"
          >
            Register
          </button>
        </div>
      )}
    </header>
  );
}
