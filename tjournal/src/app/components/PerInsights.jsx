'use client';

export default function PerInsights({ 
  filteredTrades, 
  dailyPnL, 
  maxDrawdown, 
  selectedDuration, 
  handleDurationChange, 
  durationOptions, 
  metricsStartDate, 
  metricsEndDate, 
  handleCustomStartDateChange, 
  handleCustomEndDateChange 
}) {
  return (
    <div className="mb-4 sm:mb-6 lg:mb-8">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
        Performance Summary
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="bg-gray-800/80 backdrop-blur-lg p-3 sm:p-4 lg:p-5 rounded-xl shadow-lg border border-gray-700/50 hover:shadow-xl transition-all duration-300 min-h-[100px] sm:min-h-[120px]">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-gray-400 text-xs sm:text-sm font-medium">Today's P&L</p>
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${dailyPnL >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
          <p className={`text-base sm:text-lg lg:text-xl xl:text-2xl font-bold ${dailyPnL >= 0 ? "text-green-400" : "text-red-500"} leading-tight`}>
            {dailyPnL >= 0 ? "+" : ""}${dailyPnL.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-gray-800/80 backdrop-blur-lg p-3 sm:p-4 lg:p-5 rounded-xl shadow-lg border border-gray-700/50 hover:shadow-xl transition-all duration-300 min-h-[100px] sm:min-h-[120px]">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-gray-400 text-xs sm:text-sm font-medium">Win Rate</p>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
          </div>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-green-400 leading-tight">
            {filteredTrades.length > 0
              ? ((filteredTrades.filter(t => t.profit > 0).length / filteredTrades.length) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
        
        <div className="bg-gray-800/80 backdrop-blur-lg p-3 sm:p-4 lg:p-5 rounded-xl shadow-lg border border-gray-700/50 hover:shadow-xl transition-all duration-300 min-h-[100px] sm:min-h-[120px]">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-gray-400 text-xs sm:text-sm font-medium">Max Drawdown</p>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
          </div>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-red-400 leading-tight">
            ${maxDrawdown.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-gray-800/80 backdrop-blur-lg p-3 sm:p-4 lg:p-5 rounded-xl shadow-lg border border-gray-700/50 hover:shadow-xl transition-all duration-300 min-h-[100px] sm:min-h-[120px]">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-gray-400 text-xs sm:text-sm font-medium">Date Range</p>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-400"></div>
          </div>
          <div className="space-y-2">
            <select
              value={selectedDuration}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="w-full bg-gray-700/70 text-white px-2 py-1 rounded text-xs border border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedDuration === 'CUSTOM' && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">From:</label>
                  <input
                    type="date"
                    value={new Date(metricsStartDate).toISOString().split('T')[0]}
                    onChange={(e) => handleCustomStartDateChange(e.target.value)}
                    className="w-full bg-gray-700/70 text-white px-2 py-1 rounded text-xs border border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">To:</label>
                  <input
                    type="date"
                    value={new Date(metricsEndDate).toISOString().split('T')[0]}
                    onChange={(e) => handleCustomEndDateChange(e.target.value)}
                    className="w-full bg-gray-700/70 text-white px-2 py-1 rounded text-xs border border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
            <div className="text-xs text-gray-400 space-y-1">
              <p>From: {new Date(metricsStartDate).toLocaleDateString()}</p>
              <p>To: {new Date(metricsEndDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

