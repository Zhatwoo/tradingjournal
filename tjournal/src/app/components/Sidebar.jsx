'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "../lib/firebase";
import { Home, PlusCircle, List, Lightbulb, Settings, Menu, X, LogOut } from "lucide-react";

export default function Sidebar({ 
  username = "Trader", 
  active = "Dashboard", 
  isOpen = true, 
  setIsOpen = () => {}, 
  isMobile = false 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Auto-close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Determine active page based on current path
  useEffect(() => {
    const currentPath = pathname.split('/').pop() || 'dashboard';
    const activeMap = {
      'dashboard': 'Dashboard',
      'add-trade': 'Add Trade',
      'history': 'Trade History',
      'suggestions': 'Suggestions',
      'setting': 'Settings'
    };
    
    const activeName = activeMap[currentPath] || 'Dashboard';
    if (setIsOpen) setIsOpen(activeName);
  }, [pathname, setIsOpen]);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, href: "/dashboard" },
    { name: "Add Trade", icon: <PlusCircle size={20} />, href: "/dashboard/add-trade" },
    { name: "Trade History", icon: <List size={20} />, href: "/trade-history" },
    { name: "Suggestions", icon: <Lightbulb size={20} />, href: "/dashboard/suggestions" },
    { name: "Settings", icon: <Settings size={20} />, href: "/setting" },
  ];

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button - Only show on mobile */}
      {isMobile && (
        <button
          className="lg:hidden fixed top-4 left-4 z-40 flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/70 backdrop-blur-md text-white shadow-lg border border-gray-700/50"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 h-screen bg-gray-900/90 backdrop-blur-md text-white flex-col justify-between
          transition-all duration-300 ease-in-out z-30 overflow-hidden
          ${isOpen ? "w-64" : "w-16"} border-r border-gray-700/50`}
      >
        {/* Header with Toggle */}
        <div className={`p-4 border-b border-gray-700/50 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white text-sm flex-shrink-0">
                {username[0].toUpperCase()}
              </div>
              <span className="font-semibold text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
                TJournal
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white text-sm">
              T
            </div>
          )}
          
          {isOpen && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-800/50 transition backdrop-blur-sm flex-shrink-0"
              aria-label="Collapse sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User Info - Only show when expanded */}
        {isOpen && (
          <div className="flex items-center gap-3 p-4 transition-all duration-300">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white text-lg flex-shrink-0">
              {username[0].toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm truncate text-white">{username}</span>
              <span className="text-gray-300 text-xs">Trader</span>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex flex-col gap-2 px-3 mt-2 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${isOpen ? "justify-start" : "justify-center"}
                ${active === item.name
                  ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white shadow-lg backdrop-blur-md"
                  : "hover:bg-gray-800/50 text-gray-200 backdrop-blur-sm"}`}
            >
              <div className={`${active === item.name ? "text-white" : "text-gray-400 group-hover:text-white"} flex-shrink-0`}>
                {item.icon}
              </div>
              {isOpen && (
                <span className="font-medium text-sm truncate flex-1">
                  {item.name}
                </span>
              )}
              
              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <span className="absolute left-full ml-2 px-3 py-2 bg-gray-800/80 backdrop-blur-md rounded-lg text-xs whitespace-nowrap 
                opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50 border border-gray-700/50">
                  {item.name}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer with Logout */}
        <div className="mt-auto p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full p-3 rounded-xl bg-red-600/80 hover:bg-red-700/80 transition-colors duration-200 text-white font-medium backdrop-blur-md
              ${isOpen ? "justify-start" : "justify-center"} group border border-red-500/30`}
            aria-label="Logout"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {isOpen && <span className="text-sm truncate">Logout</span>}
            
            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <span className="absolute left-full ml-2 px-3 py-2 bg-gray-800/80 backdrop-blur-md rounded-lg text-xs whitespace-nowrap 
              opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50 border border-gray-700/50">
                Logout
              </span>
            )}
          </button>

          {isOpen && (
            <div className="text-center text-gray-400 mt-4 text-xs">
              TJournal© 2025
            </div>
          )}
        </div>
      </aside>

      {/* Expand Button when collapsed */}
      {!isOpen && !isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden lg:flex fixed top-4 left-4 z-30 items-center justify-center w-8 h-8 rounded bg-gray-800/50 backdrop-blur-md text-white transition hover:bg-gray-700/50"
          aria-label="Expand sidebar"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && isMobile && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full bg-gray-900/95 backdrop-blur-md text-white flex flex-col justify-between shadow-xl z-50
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} w-72 border-r border-gray-700/50`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0">
              {username[0].toUpperCase()}
            </div>
            <span className="font-semibold text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              TJournal
            </span>
          </div>
          
          <button
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-800/50 transition backdrop-blur-sm"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white text-xl flex-shrink-0">
            {username[0].toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate text-white">{username}</span>
            <span className="text-gray-300 text-xs">Trader</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-2 px-4 mt-2 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200
                ${active === item.name
                  ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white shadow-lg backdrop-blur-md"
                  : "hover:bg-gray-800/50 text-gray-200 backdrop-blur-sm"}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <div className={`${active === item.name ? "text-white" : "text-gray-400"} flex-shrink-0`}>
                {item.icon}
              </div>
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer with Logout */}
        <div className="mt-auto p-5 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 rounded-xl bg-red-600/80 hover:bg-red-700/80 transition-colors duration-200 text-white font-medium backdrop-blur-md border border-red-500/30"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className="text-sm">Logout</span>
          </button>

          <div className="text-center text-gray-400 mt-4 text-xs">
            TJournal © 2025
          </div>
        </div>
      </aside>

      {/* Content shift for desktop sidebar */}
      {!isMobile && (
        <div className={`hidden lg:block transition-all duration-300 ${isOpen ? "lg:ml-64" : "lg:ml-16"}`} />
      )}
    </>
  );
}