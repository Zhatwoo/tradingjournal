'use client';

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { User, Settings, Lightbulb, PlusCircle, Move } from "lucide-react";

export default function DashboardHeader({ username = "Trader", displayName = null, balance = 12500, dailyPnL = 320 }) {
  const router = useRouter();
  
  // Use displayName if available, otherwise fall back to username
  const displayUsername = displayName || username;
  const [position, setPosition] = useState({ x: 0, y: 16 }); // Default centered position
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 16 }); // Store original position
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [returnTimeout, setReturnTimeout] = useState(null);
  const headerRef = useRef(null);

  const handleProfile = () => router.push("/about");
  const handleSettings = () => router.push("/setting");
  const handleSuggestions = () => router.push("/suggestions");
  const handleAddTrade = () => router.push("/dashboard/add-trade");

  // Drag functionality (disabled on mobile)
  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return; // Don't drag if clicking on buttons
    
    // Disable drag on mobile devices
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;
    
    setIsDragging(true);
    const rect = headerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep header within viewport bounds
    const maxX = window.innerWidth - (headerRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (headerRef.current?.offsetHeight || 0);
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Clear any existing timeout
    if (returnTimeout) {
      clearTimeout(returnTimeout);
    }
    
    // Set new timeout to return to original position after 5 seconds
    const timeout = setTimeout(() => {
      setPosition(originalPosition);
    }, 5000);
    
    setReturnTimeout(timeout);
  };

  // Function to return to original position immediately
  const returnToOriginal = () => {
    if (returnTimeout) {
      clearTimeout(returnTimeout);
      setReturnTimeout(null);
    }
    setPosition(originalPosition);
  };

  // Add event listeners for mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isDragging, dragOffset]);

  // Calculate centered position on mount
  useEffect(() => {
    const calculateCenteredPosition = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        const isSmallScreen = screenWidth < 1024; // lg breakpoint - use 2-row layout
        const isMobile = screenWidth < 640; // sm breakpoint - no drag
        
        if (isSmallScreen) {
          // On small screens (mobile/tablet), use sticky positioning (no floating)
          const newPosition = { x: 0, y: 0 };
          setPosition(newPosition);
          setOriginalPosition(newPosition);
        } else {
          // Desktop: center normally (floating)
          const headerWidth = screenWidth * 0.5;
          const centeredX = (screenWidth - headerWidth) / 2;
          
          const newPosition = { x: centeredX, y: 16 };
          setPosition(newPosition);
          setOriginalPosition(newPosition);
        }
      }
    };

    calculateCenteredPosition();
    
    // Recalculate on window resize
    const handleResize = () => {
      calculateCenteredPosition();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (returnTimeout) {
        clearTimeout(returnTimeout);
      }
    };
  }, [returnTimeout]);

  return (
    <header 
      ref={headerRef}
      className={`bg-gray-900/95 backdrop-blur-md text-white border border-gray-600 shadow-lg sticky lg:fixed z-40 w-full lg:w-1/2 rounded-none lg:rounded-xl transition-all duration-200 ${
        isDragging ? 'cursor-grabbing scale-105 shadow-2xl' : 'lg:cursor-grab'
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="py-2 sm:py-2.5 md:py-3 lg:py-3 px-3 sm:px-4 md:px-6 lg:px-6">
        {/* Two-Row Layout - Mobile, Tablet, and Small Desktop */}
        <div className="lg:hidden">
          {/* Top Row - Quick Actions Only */}
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={handleProfile}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded bg-green-600 hover:bg-green-500 transition text-xs sm:text-sm min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
                title="View Profile"
              >
                <User size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleSettings}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded bg-purple-600 hover:bg-purple-500 transition text-xs sm:text-sm min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
              >
                <Settings size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleSuggestions}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded bg-yellow-600 hover:bg-yellow-500 transition text-xs sm:text-sm min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
              >
                <Lightbulb size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
              {returnTimeout && (
                <button
                  onClick={returnToOriginal}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded bg-blue-600 hover:bg-blue-500 transition text-xs sm:text-sm min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
                  title="Return to Original Position"
                >
                  <Move size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row - Profile (Left) and Key Metrics (Right) */}
          <div className="mt-2 sm:mt-2.5 md:mt-3 pt-2 sm:pt-2.5 md:pt-3 border-t border-gray-600">
            <div className="flex justify-between items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
              {/* Profile Section - Left Side */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-shrink">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Move className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400 opacity-50" />
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg">
                    {displayUsername[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-xs sm:text-sm md:text-base truncate">{displayUsername}</span>
                  <span className="text-gray-400 text-[10px] sm:text-xs md:text-sm">Trader</span>
                </div>
              </div>

              {/* Key Metrics - Right Side */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-shrink">
                <div className="text-center min-w-0 flex-shrink">
                  <span className="text-gray-400 text-[10px] sm:text-xs md:text-sm block uppercase">Balance</span>
                  <span className="font-semibold text-xs sm:text-sm md:text-base truncate block">${balance.toLocaleString()}</span>
                </div>
                <div className="text-center min-w-0 flex-shrink">
                  <span className="text-gray-400 text-[10px] sm:text-xs md:text-sm block uppercase">P&L</span>
                  <span className={`font-semibold text-xs sm:text-sm md:text-base truncate block ${dailyPnL >= 0 ? "text-green-400" : "text-red-500"}`}>
                    ${dailyPnL.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Single Row (Large screens only) */}
        <div className="hidden lg:flex justify-between items-center gap-4 xl:gap-6">
          {/* Profile Section - Left Side */}
          <div className="flex items-center gap-3 xl:gap-4">
            <div className="flex items-center gap-2 xl:gap-3">
              <Move className="w-4 h-4 xl:w-5 xl:h-5 text-gray-400 opacity-50" />
              <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base xl:text-lg">
                {displayUsername[0].toUpperCase()}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm xl:text-base">{displayUsername}</span>
              <span className="text-gray-400 text-xs xl:text-sm">Trader</span>
            </div>
            {returnTimeout && (
              <div className="flex items-center gap-2 ml-2">
              </div>
            )}
          </div>

          {/* Key Metrics - Centered */}
          <div className="flex items-center gap-4 xl:gap-6 min-w-0 flex-1 justify-center">
            <div className="text-center min-w-0 flex-shrink">
              <span className="text-gray-400 text-xs xl:text-sm block uppercase">Balance</span>
              <span className="font-semibold text-sm xl:text-base truncate block">${balance.toLocaleString()}</span>
            </div>
            <div className="text-center min-w-0 flex-shrink">
              <span className="text-gray-400 text-xs xl:text-sm block uppercase">P&L</span>
              <span className={`font-semibold text-sm xl:text-base truncate block ${dailyPnL >= 0 ? "text-green-400" : "text-red-500"}`}>
                ${dailyPnL.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 xl:gap-3">
            <button
              onClick={handleProfile}
              className="flex items-center gap-1 px-3 xl:px-4 py-1.5 xl:py-2 rounded bg-green-600 hover:bg-green-500 transition text-xs xl:text-sm"
              title="View Profile"
            >
              <User size={16} className="xl:w-5 xl:h-5" />
            </button>
            <button
              onClick={handleSettings}
              className="flex items-center gap-1 px-3 xl:px-4 py-1.5 xl:py-2 rounded bg-purple-600 hover:bg-purple-500 transition text-xs xl:text-sm"
            >
              <Settings size={16} className="xl:w-5 xl:h-5" />
            </button>
            <button
              onClick={handleSuggestions}
              className="flex items-center gap-1 px-3 xl:px-4 py-1.5 xl:py-2 rounded bg-yellow-600 hover:bg-yellow-500 transition text-xs xl:text-sm"
            >
              <Lightbulb size={16} className="xl:w-5 xl:h-5" />
            </button>
            {returnTimeout && (
              <button
                onClick={returnToOriginal}
                className="flex items-center gap-1 px-3 xl:px-4 py-1.5 xl:py-2 rounded bg-blue-600 hover:bg-blue-500 transition text-xs xl:text-sm"
                title="Return to Original Position"
              >
                <Move size={16} className="xl:w-5 xl:h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
