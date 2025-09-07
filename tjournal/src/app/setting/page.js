'use client';

import { useState, useEffect } from 'react';
import Settings from "../components/Settings";
import Footer from "../components/Footer";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        setSidebarOpen(!mobile);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Settings />
      
      <Footer 
        sidebarOpen={sidebarOpen} 
        isMobile={isMobile}
        hasSidebar={false}
      />
    </div>
  );
}