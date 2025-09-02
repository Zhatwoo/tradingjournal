'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const redirectToLogin = () => {
    router.push("/auth/login");
  };

  const redirectToRegister = () => {
    router.push("/auth/register");
  };

  return (
    <header className="bg-gray-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6 sm:px-10">
        <h1 className="text-2xl font-bold">Trading Journal</h1>

        {/* Desktop Nav */}
        <div className="hidden sm:flex gap-4">
          <button
            onClick={redirectToLogin}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            Login
          </button>
          <button
            onClick={redirectToRegister}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition"
          >
            Register
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden px-3 py-2 border rounded border-gray-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="sm:hidden flex flex-col gap-2 px-6 pb-4">
          <button
            onClick={redirectToLogin}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition text-center"
          >
            Login
          </button>
          <button
            onClick={redirectToRegister}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition text-center"
          >
            Register
          </button>
        </div>
      )}
    </header>
  );
}
