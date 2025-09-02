'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { Home, PlusCircle, List, Lightbulb, Settings, Menu, X, LogOut } from "lucide-react";

export default function Sidebar({ username = "Trader", active = "Dashboard" }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, href: "/dashboard" },
    { name: "Add Trade", icon: <PlusCircle size={20} />, href: "/dashboard/add-trade" },
    { name: "Trade History", icon: <List size={20} />, href: "/dashboard/history" },
    { name: "Suggestions", icon: <Lightbulb size={20} />, href: "/suggestions" },
    { name: "Settings", icon: <Settings size={20} />, href: "/settings" },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/auth/login"); // Redirect to login page
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 h-screen bg-gray-900 text-white flex-col justify-between
          transition-all duration-300 ease-in-out z-50
          ${isOpen ? "w-56 shadow-xl" : "w-16"}`}
      >
        {/* Toggle */}
        <div className="flex justify-end p-3 border-b border-gray-800">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-800 transition"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Info */}
        <div className={`flex items-center gap-3 p-4 transition-all duration-300 ${isOpen ? "justify-start" : "justify-center"}`}>
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white shadow-md text-lg">
            {username[0].toUpperCase()}
          </div>
          {isOpen && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-sm truncate">{username}</span>
              <span className="text-gray-400 text-xs tracking-wide">Trader</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-1 px-2 mt-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 p-3 rounded transition-all duration-200
                ${isOpen ? "justify-start" : "justify-center"}
                ${active === item.name
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "hover:bg-gray-800 text-gray-300"}`}
            >
              {item.icon}
              {isOpen && <span className="font-medium text-sm truncate">{item.name}</span>}
              {active === item.name && isOpen && (
                <span className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer with Logout */}
        <div className="mt-auto p-4">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full p-3 rounded bg-red-600 hover:bg-red-700 transition-colors duration-200 text-white font-medium
              ${isOpen ? "justify-start" : "justify-center"}`}
          >
            <LogOut size={20} />
            {isOpen && <span className="text-sm">Logout</span>}
          </button>

          {isOpen && (
            <div className="text-center text-gray-400 mt-2 text-xs tracking-wide">
              Tradezella © 2025
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Toggle & Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white shadow-lg"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsMobileOpen(false)}></div>

          {/* Mobile Sidebar */}
          <aside className="relative w-64 h-full bg-gray-900 text-white flex flex-col justify-between shadow-xl transition-transform">
            <div className="flex justify-end p-3 border-b border-gray-800">
              <button onClick={() => setIsMobileOpen(false)} className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-800 transition">
                <X size={20} />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 p-4">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white shadow-md text-lg">
                {username[0].toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold text-sm truncate">{username}</span>
                <span className="text-gray-400 text-xs tracking-wide">Trader</span>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col gap-1 px-2 mt-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded transition-all duration-200 hover:bg-gray-800 text-gray-300"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.icon}
                  <span className="font-medium text-sm truncate">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Footer with Logout */}
            <div className="mt-auto p-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 rounded bg-red-600 hover:bg-red-700 transition-colors duration-200 text-white font-medium"
              >
                <LogOut size={20} />
                <span className="text-sm">Logout</span>
              </button>

              <div className="text-center text-gray-400 mt-2 text-xs tracking-wide">
                Tradezella © 2025
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
