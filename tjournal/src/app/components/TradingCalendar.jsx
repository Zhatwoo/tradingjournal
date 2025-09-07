'use client';

import { useState, useMemo } from 'react';

export default function TradingCalendar({ 
  filteredTrades, 
  selectedDate, 
  setSelectedDate, 
  setSelectedDayTrades, 
  setSelectedDay, 
  setIsModalOpen, 
  setIsDayOptionsModalOpen 
}) {
  // Calendar state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Get current date info
  const now = new Date();
  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  // Calendar calculations
  const tradesInMonth = filteredTrades.filter(trade => {
    const date = new Date(trade.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  // Create calendar days in ascending order (1 to daysInMonth)
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Memoize year generation for performance
  const availableYears = useMemo(() => 
    Array.from({ length: 91 }, (_, i) => 2010 + i).sort((a, b) => b - a), []
  );


  return (
    <div className="bg-white/5 backdrop-blur-lg p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-white/10">
      {/* Calendar Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3 mb-4">
          <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="hidden sm:inline">Trading Calendar</span>
          <span className="sm:hidden">Calendar</span>
        </h2>
        
        {/* Combined Month & Year Navigation - Responsive */}
        <div className="mb-4">
          {/* Desktop Layout - Two Rows for Better Responsiveness */}
          <div className="hidden lg:block">
            {/* Row 1: Month Navigation */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <button
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(prev => prev - 1);
                  } else setSelectedMonth(prev => prev - 1);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="text-center px-6">
                <div className="text-xl font-bold text-white">
                  {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}
                </div>
              </div>

              <button
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(prev => prev + 1);
                  } else setSelectedMonth(prev => prev + 1);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Row 2: Year Selector */}
            <div className="flex items-center justify-center gap-4">
              {/* Current Year Quick Access */}
              <button
                onClick={() => {
                  const currentYear = new Date().getFullYear();
                  setSelectedYear(currentYear);
                  setSelectedMonth(new Date().getMonth());
                }}
                className="px-4 py-2 text-sm font-medium bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-lg transition-all duration-200 border border-green-500/30"
              >
                📅 Today
              </button>

              {/* Year Input Field */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-medium">Year:</span>
                <input
                  type="number"
                  min="2010"
                  max="2100"
                  value={selectedYear}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    if (year >= 2010 && year <= 2100) {
                      setSelectedYear(year);
                    }
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-24 text-center"
                  placeholder="2024"
                />
              </div>

              {/* Year Navigation Arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedYear(Math.max(2010, selectedYear - 1))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedYear <= 2010}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedYear(Math.min(2100, selectedYear + 1))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedYear >= 2100}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tablet Layout - Single Row with Better Spacing */}
          <div className="hidden sm:flex lg:hidden items-center justify-between gap-2">
            {/* Month Navigation - Left Side */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(prev => prev - 1);
                  } else setSelectedMonth(prev => prev - 1);
                }}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="text-center px-2">
                <div className="text-sm font-bold text-white">
                  {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}
                </div>
              </div>

              <button
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(prev => prev + 1);
                  } else setSelectedMonth(prev => prev + 1);
                }}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Year Selector - Right Side */}
            <div className="flex items-center gap-2">
              {/* Current Year Quick Access */}
              <button
                onClick={() => {
                  const currentYear = new Date().getFullYear();
                  setSelectedYear(currentYear);
                  setSelectedMonth(new Date().getMonth());
                }}
                className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-lg transition-all duration-200 border border-green-500/30"
              >
                📅 Today
              </button>

              {/* Year Input Field */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 font-medium">Year:</span>
                <input
                  type="number"
                  min="2010"
                  max="2100"
                  value={selectedYear}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    if (year >= 2010 && year <= 2100) {
                      setSelectedYear(year);
                    }
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-16 text-center"
                  placeholder="2024"
                />
              </div>

              {/* Year Navigation Arrows */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setSelectedYear(Math.max(2010, selectedYear - 1))}
                  className="p-1 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedYear <= 2010}
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedYear(Math.min(2100, selectedYear + 1))}
                  className="p-1 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedYear >= 2100}
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Two Rows for Better UX */}
          <div className="flex sm:hidden flex-col gap-3">
            {/* Row 1: Month Navigation */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(prev => prev - 1);
                  } else setSelectedMonth(prev => prev - 1);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="text-center px-4">
                <div className="text-base font-bold text-white">
                  {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}
                </div>
              </div>

              <button
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(prev => prev + 1);
                  } else setSelectedMonth(prev => prev + 1);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Row 2: Year Controls - Compact Layout */}
            <div className="flex items-center justify-center gap-2">
              {/* Year Navigation Arrows */}
              <button
                onClick={() => setSelectedYear(Math.max(2010, selectedYear - 1))}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedYear <= 2010}
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Year Input Field */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 font-medium">Year:</span>
                <input
                  type="number"
                  min="2010"
                  max="2100"
                  value={selectedYear}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    if (year >= 2010 && year <= 2100) {
                      setSelectedYear(year);
                    }
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-18 text-center"
                  placeholder="2024"
                />
              </div>

              <button
                onClick={() => setSelectedYear(Math.min(2100, selectedYear + 1))}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedYear >= 2100}
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Current Year Quick Access */}
              <button
                onClick={() => {
                  const currentYear = new Date().getFullYear();
                  setSelectedYear(currentYear);
                  setSelectedMonth(new Date().getMonth());
                }}
                className="px-2 py-1.5 text-xs font-medium bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-lg transition-all duration-200 border border-green-500/30"
              >
                📅 Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/10">
        {/* Calendar Days */}
        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, idx) => {

            const dayTrades = tradesInMonth.filter(trade => new Date(trade.date).getDate() === day);
            const dayPnL = dayTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
            const isToday = day === todayDate && selectedMonth === todayMonth && selectedYear === todayYear;
            const hasTrades = dayTrades.length > 0;

            return (
              <div
                key={day}
                className={`
                  relative h-12 sm:h-16 lg:h-20 rounded-md sm:rounded-lg cursor-pointer transition-all duration-300 
                  hover:scale-105 hover:shadow-lg group overflow-hidden touch-manipulation
                  ${isToday 
                    ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400/50 shadow-lg' 
                    : hasTrades
                      ? dayPnL > 0 
                        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 hover:from-green-500/30 hover:to-emerald-500/30'
                        : 'bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-400/30 hover:from-red-500/30 hover:to-rose-500/30'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }
                `}
                title={`${day} ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear}\nP&L: ${dayPnL >= 0 ? "+" : ""}$${dayPnL.toFixed(2)}\nTrades: ${dayTrades.length}`}
                onClick={() => {
                  const clickedDate = new Date(selectedYear, selectedMonth, day);
                  setSelectedDate(clickedDate);
                  
                  if (dayTrades.length > 0) {
                    // Show options for days with existing trades
                    setSelectedDayTrades(dayTrades);
                    setSelectedDay(day);
                    setIsDayOptionsModalOpen(true);
                  } else {
                    // Show options for days with no trades
                    setIsDayOptionsModalOpen(true);
                  }
                }}
              >
                {/* Day Number */}
                <div className="absolute top-1 sm:top-2 left-1 sm:left-2 text-xs sm:text-sm font-bold text-white">
                  {day}
                </div>

                {/* P&L Display */}
                {hasTrades && (
                  <div className="absolute bottom-0.5 sm:bottom-1 left-0.5 sm:left-1 right-0.5 sm:right-1">
                    <div className={`
                      text-[10px] sm:text-xs font-semibold text-center px-0.5 sm:px-1 py-0.5 rounded
                      ${dayPnL > 0 
                        ? 'bg-green-500/30 text-green-200' 
                        : 'bg-red-500/30 text-red-200'
                      }
                    `}>
                      {dayPnL >= 0 ? "+" : ""}${dayPnL.toFixed(0)}
                    </div>
                  </div>
                )}

                {/* Trade Count Indicator */}
                {hasTrades && (
                  <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full"></div>
                  </div>
                )}

                {/* Today Indicator */}
                {isToday && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[8px] sm:border-l-[12px] border-l-transparent border-t-[8px] sm:border-t-[12px] border-t-yellow-400"></div>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="mt-3 flex justify-center">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500/30 rounded"></div>
            <span>Profit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500/30 rounded"></div>
            <span>Loss</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400/30 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

