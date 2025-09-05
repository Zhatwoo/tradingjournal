'use client';

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { User, Settings, Lightbulb, PlusCircle, Move } from "lucide-react";

export default function DashboardHeader({ username = "Trader", balance = 12500, dailyPnL = 320 }) {
  const router = useRouter();
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
        const isMobile = screenWidth < 768; // md breakpoint
        
        if (isMobile) {
          // On mobile, use sticky positioning (no floating)
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
      className={`bg-gray-900/95 backdrop-blur-md text-white border border-gray-600 shadow-lg sticky md:fixed z-40 w-full md:w-1/2 rounded-none md:rounded-xl transition-all duration-200 ${
        isDragging ? 'cursor-grabbing scale-105 shadow-2xl' : 'md:cursor-grab'
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="py-2 md:py-3 px-3 md:px-6">
        {/* Mobile Layout - Two Rows */}
        <div className="md:hidden">
          {/* Top Row - Quick Actions Only */}
          <div className="flex justify-center items-center gap-2">
            <div className="flex gap-1">
              <button
                onClick={handleProfile}
                className="flex items-center gap-1 px-2 py-1 rounded bg-green-600 hover:bg-green-500 transition text-xs"
                title="View Profile"
              >
                <User size={14} />
              </button>
              <button
                onClick={handleSettings}
                className="flex items-center gap-1 px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 transition text-xs"
              >
                <Settings size={14} />
              </button>
              <button
                onClick={handleSuggestions}
                className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-600 hover:bg-yellow-500 transition text-xs"
              >
                <Lightbulb size={14} />
              </button>
              {returnTimeout && (
                <button
                  onClick={returnToOriginal}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 transition text-xs"
                  title="Return to Original Position"
                >
                  <Move size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row - Profile (Left) and Key Metrics (Right) */}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="flex justify-between items-center gap-2 min-w-0">
              {/* Profile Section - Left Side */}
              <div className="flex items-center gap-2 min-w-0 flex-shrink">
                <div className="flex items-center gap-1">
                  <Move className="w-3 h-3 text-gray-400 opacity-50" />
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {username[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-xs truncate">{username}</span>
                  <span className="text-gray-400 text-[10px]">Trader</span>
                </div>
              </div>

              {/* Key Metrics - Right Side */}
              <div className="flex items-center gap-2 min-w-0 flex-shrink">
                <div className="text-center min-w-0 flex-shrink">
                  <span className="text-gray-400 text-[10px] block uppercase">Balance</span>
                  <span className="font-semibold text-xs truncate block">${balance.toLocaleString()}</span>
                </div>
                <div className="text-center min-w-0 flex-shrink">
                  <span className="text-gray-400 text-[10px] block uppercase">P&L</span>
                  <span className={`font-semibold text-xs truncate block ${dailyPnL >= 0 ? "text-green-400" : "text-red-500"}`}>
                    ${dailyPnL.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Single Row */}
        <div className="hidden md:flex justify-between items-center gap-6">
          {/* Profile Section - Left Side */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-gray-400 opacity-50" />
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base">
                {username[0].toUpperCase()}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{username}</span>
              <span className="text-gray-400 text-xs">Trader</span>
            </div>
            {returnTimeout && (
              <div className="flex items-center gap-2 ml-2">
              </div>
            )}
          </div>

          {/* Key Metrics - Centered */}
          <div className="flex items-center gap-4 min-w-0 flex-1 justify-center">
            <div className="text-center min-w-0 flex-shrink">
              <span className="text-gray-400 text-xs block uppercase">Balance</span>
              <span className="font-semibold text-sm truncate block">${balance.toLocaleString()}</span>
            </div>
            <div className="text-center min-w-0 flex-shrink">
              <span className="text-gray-400 text-xs block uppercase">P&L</span>
              <span className={`font-semibold text-sm truncate block ${dailyPnL >= 0 ? "text-green-400" : "text-red-500"}`}>
                ${dailyPnL.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleProfile}
              className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 hover:bg-green-500 transition text-xs"
              title="View Profile"
            >
              <User size={16} />
            </button>
            <button
              onClick={handleSettings}
              className="flex items-center gap-1 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 transition text-xs"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={handleSuggestions}
              className="flex items-center gap-1 px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-500 transition text-xs"
            >
              <Lightbulb size={16} />
            </button>
            {returnTimeout && (
              <button
                onClick={returnToOriginal}
                className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 transition text-xs"
                title="Return to Original Position"
              >
                <Move size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
