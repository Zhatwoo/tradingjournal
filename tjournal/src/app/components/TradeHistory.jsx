'use client';

import { useState } from 'react';

export default function TradeHistory({ trades, onDeleteTrade }) {
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterProfit, setFilterProfit] = useState('all'); // all, profit, loss
  const [sortBy, setSortBy] = useState('date'); // date, profit, symbol
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(10); // Number of trades per page

  // Filter and sort trades
  const filteredAndSortedTrades = trades
    .filter(trade => {
      const matchesSymbol = trade.symbol.toLowerCase().includes(filterSymbol.toLowerCase());
      const matchesProfit = filterProfit === 'all' || 
        (filterProfit === 'profit' && trade.profit > 0) ||
        (filterProfit === 'loss' && trade.profit < 0);
      return matchesSymbol && matchesProfit;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'profit':
          aValue = a.profit;
          bValue = b.profit;
          break;
        case 'symbol':
          aValue = a.symbol.toLowerCase();
          bValue = b.symbol.toLowerCase();
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination logic
  const totalTrades = filteredAndSortedTrades.length;
  const totalPages = Math.ceil(totalTrades / tradesPerPage);
  const startIndex = (currentPage - 1) * tradesPerPage;
  const endIndex = startIndex + tradesPerPage;
  const currentTrades = filteredAndSortedTrades.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = (newFilter) => {
    setCurrentPage(1);
    if (typeof newFilter === 'function') {
      newFilter();
    }
  };

  const winningTrades = filteredAndSortedTrades.filter(t => t.profit > 0).length;
  const losingTrades = filteredAndSortedTrades.filter(t => t.profit < 0).length;
  const totalProfit = filteredAndSortedTrades.reduce((sum, t) => sum + t.profit, 0);

  return (
    <div className="bg-gray-800/80 backdrop-blur-lg p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg border border-gray-700/50">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Trade History
        </h2>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="bg-gray-700/50 px-3 py-1 rounded-lg">
            <span className="text-gray-400">Total: </span>
            <span className="text-white font-medium">{totalTrades}</span>
          </div>
          <div className="bg-green-500/20 px-3 py-1 rounded-lg border border-green-500/30">
            <span className="text-green-400">Wins: </span>
            <span className="text-green-300 font-medium">{winningTrades}</span>
          </div>
          <div className="bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/30">
            <span className="text-red-400">Losses: </span>
            <span className="text-red-300 font-medium">{losingTrades}</span>
          </div>
          <div className={`px-3 py-1 rounded-lg ${totalProfit >= 0 ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'} border`}>
            <span className={totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}>P&L: </span>
            <span className={`${totalProfit >= 0 ? 'text-green-300' : 'text-red-300'} font-medium`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Symbol Filter */}
        <div className="flex-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Filter by Symbol</label>
          <input
            type="text"
            placeholder="e.g., EURUSD, GBPJPY"
            value={filterSymbol}
            onChange={(e) => handleFilterChange(() => setFilterSymbol(e.target.value))}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Profit Filter */}
        <div className="sm:w-32">
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Result</label>
          <select
            value={filterProfit}
            onChange={(e) => handleFilterChange(() => setFilterProfit(e.target.value))}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Trades</option>
            <option value="profit">Profitable</option>
            <option value="loss">Losses</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="sm:w-40">
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => handleFilterChange(() => setSortBy(e.target.value))}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          >
            <option value="date">Date</option>
            <option value="profit">Profit/Loss</option>
            <option value="symbol">Symbol</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="sm:w-32">
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => handleFilterChange(() => setSortOrder(e.target.value))}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Trades List */}
      {currentTrades.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-base sm:text-lg font-medium">No trades found</p>
          <p className="text-xs sm:text-sm text-gray-500">
            {trades.length === 0 ? 'Start by adding your first trade' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {currentTrades.map((trade) => (
            <div
              key={trade.id}
              className="bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-3 sm:p-4 border border-gray-600/30 transition-all duration-200 hover:border-gray-500/50"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
                {/* Symbol and Date */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <span className="text-base sm:text-lg font-bold text-white">{trade.symbol}</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs sm:text-sm font-medium w-fit">
                      {trade.lotSize || "0.01"}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-400">
                      {new Date(trade.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Entry/Exit Prices */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-400">Entry: </span>
                      <span className="text-white font-medium">${trade.entry}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Exit: </span>
                      <span className="text-white font-medium">${trade.exit}</span>
                    </div>
                    {trade.notes && (
                      <div className="flex-1">
                        <span className="text-gray-400">Notes: </span>
                        <span className="text-gray-300">{trade.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profit/Loss and Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className={`text-right ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                      {trade.profit >= 0 ? '+' : ''}${trade.profit}
                    </div>
                    <div className="text-sm text-gray-400">
                      {trade.profit >= 0 ? 'Profit' : 'Loss'}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDeleteTrade(trade.id)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 sm:p-2 rounded-lg transition-all duration-200"
                    title="Delete trade"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-600/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Page Info */}
            <div className="text-xs sm:text-sm text-gray-400">
              {/* Pagination info removed */}
            </div>
            
            {/* Pagination Buttons */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs sm:text-sm bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700/50"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2.5 py-1.5 text-xs sm:text-sm rounded-lg transition-colors duration-200 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs sm:text-sm bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700/50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {filteredAndSortedTrades.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-600/30">
          <div className="text-center text-xs sm:text-sm text-gray-400">
            {filterSymbol && `Filtered by "${filterSymbol}"`}
            {filterSymbol && filterProfit !== 'all' && ` • `}
            {filterProfit !== 'all' && `${filterProfit === 'profit' ? 'Profitable' : 'Loss'} trades only`}
          </div>
        </div>
      )}
    </div>
  );
}
