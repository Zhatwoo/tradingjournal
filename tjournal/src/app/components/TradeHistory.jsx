'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Scale as RiskIcon, 
  BarChart3, 
  Calendar, 
  Filter,
  DollarSign,
  Percent,
  Activity
} from 'lucide-react';
import { useTimezone } from '../contexts/TimezoneContext';
import { formatDateInTimezone, getDateStringInTimezone, getTimezoneDisplayName } from '../utils/timezoneUtils';

export default function TradeHistory({ 
  trades, 
  onDeleteTrade, 
  isDashboardView = false, 
  currencyFormatter,
  // Delete modal props from parent
  deleteModalOpen = false,
  deleteLoading = false,
  onDeleteClick = null,
  onDeleteCancel = null
}) {
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterProfit, setFilterProfit] = useState('all'); // all, profit, loss
  const [filterStrategy, setFilterStrategy] = useState('all'); // all, or specific strategy
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, yesterday, thisWeek
  const [sortBy, setSortBy] = useState('datetime'); // date, profit, symbol, time, uploadTime, datetime
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc - Always default to newest first
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(10); // Number of trades per page
  const [showMetrics, setShowMetrics] = useState(false); // Toggle metrics section
  const [lastUpdate, setLastUpdate] = useState(null); // Track last update time
  const [isClient, setIsClient] = useState(false);
  
  
  // Trade detail modal state
  const [tradeDetailModalOpen, setTradeDetailModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  
  // Get timezone from context
  const { userTimezone } = useTimezone();

  // Helper function to get date string in user's preferred timezone
  const getUserDateString = (date) => {
    return getDateStringInTimezone(date, userTimezone);
  };

  // Use parent's delete handler
  const handleDeleteClick = (trade) => {
    if (onDeleteClick) {
      onDeleteClick(trade);
    }
  };

  // Trade detail modal functions
  const handleTradeClick = (trade) => {
    setSelectedTrade(trade);
    setTradeDetailModalOpen(true);
  };

  const handleCloseTradeDetail = () => {
    setTradeDetailModalOpen(false);
    setSelectedTrade(null);
  };

  // Set client-side flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setLastUpdate(new Date());
  }, []);

  // Update last update time when trades change
  useEffect(() => {
    if (isClient) {
      setLastUpdate(new Date());
    }
  }, [trades, isClient]);

  // Helper functions
  const formatMoney = currencyFormatter || ((n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }));
  const pct = (n) => `${(n * 100).toFixed(1)}%`;

  // Get unique strategies
  const strategies = useMemo(() => {
    if (!trades || !Array.isArray(trades)) return ["all"];
    const strategyList = trades.map(t => t?.strategy || "Unknown").filter(Boolean);
    return ["all", ...Array.from(new Set(strategyList))];
  }, [trades]);

  // Filter and sort trades
  const filteredAndSortedTrades = useMemo(() => {
    if (!trades || !Array.isArray(trades)) return [];
    
    return trades
      .filter(trade => {
        if (!trade) return false;
        const matchesSymbol = trade.symbol?.toLowerCase().includes(filterSymbol.toLowerCase()) ?? false;
        const matchesProfit = filterProfit === 'all' || 
          (filterProfit === 'profit' && (trade.profit || 0) > 0) ||
          (filterProfit === 'loss' && (trade.profit || 0) < 0);
        const matchesStrategy = filterStrategy === 'all' || trade.strategy === filterStrategy;
      
      // Date range filtering (User's Preferred Timezone)
      let matchesDate = true;
      if (dateRange.start || dateRange.end) {
        const tradeDate = getUserDateString(new Date(trade.createdAt || trade.date)); // YYYY-MM-DD format in user's preferred timezone
        matchesDate = (!dateRange.start || tradeDate >= dateRange.start) && 
                     (!dateRange.end || tradeDate <= dateRange.end);
      }
      
      // Time-based filtering (User's Preferred Timezone)
      let matchesTime = true;
      if (timeFilter !== 'all') {
        const now = new Date();
        const today = getUserDateString(now); // YYYY-MM-DD format in user's preferred timezone
        const yesterday = getUserDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
        const thisWeek = getUserDateString(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
        const tradeDate = getUserDateString(new Date(trade.createdAt || trade.date));
        
        switch (timeFilter) {
          case 'today':
            matchesTime = tradeDate === today;
            break;
          case 'yesterday':
            matchesTime = tradeDate === yesterday;
            break;
          case 'thisWeek':
            matchesTime = tradeDate >= thisWeek;
            break;
          default:
            matchesTime = true;
        }
      }
      
      return matchesSymbol && matchesProfit && matchesStrategy && matchesDate && matchesTime;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          // Sort by date only (YYYY-MM-DD format)
          aValue = getUserDateString(new Date(a.createdAt || a.date || 0));
          bValue = getUserDateString(new Date(b.createdAt || b.date || 0));
          break;
        case 'time':
        case 'uploadTime':
        case 'datetime':
          // Sort by full timestamp including time (upload date and time)
          // Uses timezone-aware timestamps for accurate sorting
          // Prioritizes createdAt (upload time) over date (trade date)
          aValue = new Date(a.createdAt || a.date || 0).getTime();
          bValue = new Date(b.createdAt || b.date || 0).getTime();
          break;
        case 'profit':
          aValue = a.profit || 0;
          bValue = b.profit || 0;
          break;
        case 'symbol':
          aValue = (a.symbol || '').toLowerCase();
          bValue = (b.symbol || '').toLowerCase();
          break;
        default:
          // Default to upload time sorting (most recent first)
          // Uses timezone-aware timestamps for accurate sorting
          aValue = new Date(a.createdAt || a.date || 0).getTime();
          bValue = new Date(b.createdAt || b.date || 0).getTime();
      }

      // Always default to descending order (newest first) for time-based sorts
      if (sortBy === 'datetime' || sortBy === 'time' || sortBy === 'uploadTime' || sortBy === 'date') {
        return bValue > aValue ? 1 : -1; // Newest first
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [trades, filterSymbol, filterProfit, filterStrategy, dateRange, timeFilter, sortBy, sortOrder]);

  // Pagination logic
  const totalTrades = filteredAndSortedTrades.length;
  const totalPages = Math.ceil(totalTrades / tradesPerPage);
  const startIndex = (currentPage - 1) * tradesPerPage;
  const endIndex = startIndex + tradesPerPage;
  const currentTrades = isDashboardView ? filteredAndSortedTrades : filteredAndSortedTrades.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = (newFilter) => {
    setCurrentPage(1);
    if (typeof newFilter === 'function') {
      newFilter();
    }
  };

  // Comprehensive Metrics Calculation
  const metrics = useMemo(() => {
    const filtered = filteredAndSortedTrades;
    const totalTrades = filtered.length;
    
    if (totalTrades === 0) {
      return {
        totalPnL: 0,
        winRate: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        maxWin: 0,
        maxLoss: 0,
        maxDrawdown: 0,
        sharpe: 0,
        totalWins: 0,
        totalLosses: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        bestMonth: 0,
        worstMonth: 0
      };
    }

    const wins = filtered.filter(t => t.profit > 0);
    const losses = filtered.filter(t => t.profit <= 0);
    const totalPnL = filtered.reduce((sum, t) => sum + t.profit, 0);
    const winRate = wins.length / totalTrades;
    const avgWin = wins.length ? wins.reduce((sum, t) => sum + t.profit, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((sum, t) => sum + t.profit, 0) / losses.length) : 0;
    const profitFactor = avgLoss === 0 ? (wins.length ? Infinity : 0) : (wins.reduce((sum, t) => sum + t.profit, 0) / Math.abs(losses.reduce((sum, t) => sum + t.profit, 0)));
    
    const maxWin = wins.length ? Math.max(...wins.map(t => t.profit)) : 0;
    const maxLoss = losses.length ? Math.min(...losses.map(t => t.profit)) : 0;

    // Calculate max drawdown
    let equity = 0;
    let peak = 0;
    let maxDD = 0;
    filtered
      .sort((a, b) => new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime()) // Use upload time for chronological order
      .forEach(t => {
        equity += t.profit;
        if (equity > peak) peak = equity;
        const dd = peak ? (equity - peak) / peak : 0;
        if (dd < maxDD) maxDD = dd;
      });

    // Calculate consecutive wins/losses
    let consecutiveWins = 0;
    let consecutiveLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;
    
    filtered
      .sort((a, b) => new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime()) // Use upload time for chronological order
      .forEach(t => {
        if (t.profit > 0) {
          currentWins++;
          currentLosses = 0;
          consecutiveWins = Math.max(consecutiveWins, currentWins);
        } else {
          currentLosses++;
          currentWins = 0;
          consecutiveLosses = Math.max(consecutiveLosses, currentLosses);
        }
      });

    // Monthly performance
    const monthlyPnL = {};
    filtered.forEach(t => {
      const month = new Date(t.date).toISOString().slice(0, 7);
      monthlyPnL[month] = (monthlyPnL[month] || 0) + t.profit;
    });
    const monthlyValues = Object.values(monthlyPnL);
    const bestMonth = monthlyValues.length ? Math.max(...monthlyValues) : 0;
    const worstMonth = monthlyValues.length ? Math.min(...monthlyValues) : 0;

    // Sharpe ratio (simplified)
    const dailyReturns = filtered.map(t => t.profit);
    const mean = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / dailyReturns.length;
    const std = Math.sqrt(variance);
    const sharpe = std === 0 ? 0 : mean / std;

    return {
      totalPnL,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      maxWin,
      maxLoss,
      maxDrawdown: Math.abs(maxDD),
      sharpe,
      totalWins: wins.length,
      totalLosses: losses.length,
      consecutiveWins,
      consecutiveLosses,
      bestMonth,
      worstMonth
    };
  }, [filteredAndSortedTrades]);

  // Symbol performance analysis
  const symbolPerformance = useMemo(() => {
    const symbolMap = {};
    filteredAndSortedTrades.forEach(trade => {
      if (!symbolMap[trade.symbol]) {
        symbolMap[trade.symbol] = {
          symbol: trade.symbol,
          trades: 0,
          totalPnL: 0,
          wins: 0,
          losses: 0
        };
      }
      symbolMap[trade.symbol].trades++;
      symbolMap[trade.symbol].totalPnL += trade.profit;
      if (trade.profit > 0) symbolMap[trade.symbol].wins++;
      else symbolMap[trade.symbol].losses++;
    });
    
    return Object.values(symbolMap)
      .map(s => ({
        ...s,
        winRate: s.trades > 0 ? s.wins / s.trades : 0
      }))
      .sort((a, b) => b.totalPnL - a.totalPnL)
      .slice(0, 10);
  }, [filteredAndSortedTrades]);

  // Strategy performance analysis
  const strategyPerformance = useMemo(() => {
    const strategyMap = {};
    filteredAndSortedTrades.forEach(trade => {
      const strategy = trade.strategy || "Unknown";
      if (!strategyMap[strategy]) {
        strategyMap[strategy] = {
          strategy,
          trades: 0,
          totalPnL: 0,
          wins: 0,
          losses: 0
        };
      }
      strategyMap[strategy].trades++;
      strategyMap[strategy].totalPnL += trade.profit;
      if (trade.profit > 0) strategyMap[strategy].wins++;
      else strategyMap[strategy].losses++;
    });
    
    return Object.values(strategyMap)
      .map(s => ({
        ...s,
        winRate: s.trades > 0 ? s.wins / s.trades : 0
      }))
      .sort((a, b) => b.totalPnL - a.totalPnL);
  }, [filteredAndSortedTrades]);

  return (
    <div className="bg-gray-800/80 backdrop-blur-lg p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg border border-gray-700/50">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Trade History
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-normal">Live</span>
            </div>
          </h2>
          
          {/* Metrics Toggle */}
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
              showMetrics 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="bg-gray-700/50 px-3 py-1 rounded-lg">
            <span className="text-gray-400">Total: </span>
            <span className="text-white font-medium">{filteredAndSortedTrades.length}</span>
          </div>
          <div className="bg-green-500/20 px-3 py-1 rounded-lg border border-green-500/30">
            <span className="text-green-400">Wins: </span>
            <span className="text-green-300 font-medium">{metrics.totalWins}</span>
          </div>
          <div className="bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/30">
            <span className="text-red-400">Losses: </span>
            <span className="text-red-300 font-medium">{metrics.totalLosses}</span>
          </div>
          <div className={`px-3 py-1 rounded-lg ${metrics.totalPnL >= 0 ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'} border`}>
            <span className={metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}>P&L: </span>
            <span className={`${metrics.totalPnL >= 0 ? 'text-green-300' : 'text-red-300'} font-medium`}>
              {formatMoney(metrics.totalPnL)}
            </span>
          </div>
          <div className="bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/30">
            <span className="text-blue-400">Win Rate: </span>
            <span className="text-blue-300 font-medium">{pct(metrics.winRate)}</span>
          </div>
          <div className="bg-purple-500/20 px-3 py-1 rounded-lg border border-purple-500/30">
            <span className="text-purple-400">P.Factor: </span>
            <span className="text-purple-300 font-medium">
              {Number.isFinite(metrics.profitFactor) ? metrics.profitFactor.toFixed(2) : "∞"}
            </span>
          </div>
        </div>
      </div>

      {/* Comprehensive Metrics Section */}
      {showMetrics && (
        <div className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Real-time Performance Metrics
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-xs text-gray-400">
              {isClient && lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Last updated: --:--:--'}
            </div>
          </h3>
          
          {/* Primary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            <MetricCard 
              title="Total P&L" 
              value={formatMoney(metrics.totalPnL)} 
              icon={<DollarSign className="h-4 w-4" />}
              color={metrics.totalPnL >= 0 ? "green" : "red"}
            />
            <MetricCard 
              title="Win Rate" 
              value={pct(metrics.winRate)} 
              icon={<Target className="h-4 w-4" />}
              color="blue"
            />
            <MetricCard 
              title="Profit Factor" 
              value={Number.isFinite(metrics.profitFactor) ? metrics.profitFactor.toFixed(2) : "∞"} 
              icon={<RiskIcon className="h-4 w-4" />}
              color="purple"
            />
            <MetricCard 
              title="Avg Win" 
              value={formatMoney(metrics.avgWin)} 
              icon={<TrendingUp className="h-4 w-4" />}
              color="green"
            />
            <MetricCard 
              title="Avg Loss" 
              value={formatMoney(metrics.avgLoss)} 
              icon={<TrendingDown className="h-4 w-4" />}
              color="red"
            />
            <MetricCard 
              title="Max DD" 
              value={pct(metrics.maxDrawdown)} 
              icon={<TrendingDown className="h-4 w-4" />}
              color="red"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            <MetricCard 
              title="Max Win" 
              value={formatMoney(metrics.maxWin)} 
              icon={<TrendingUp className="h-4 w-4" />}
              color="green"
            />
            <MetricCard 
              title="Max Loss" 
              value={formatMoney(metrics.maxLoss)} 
              icon={<TrendingDown className="h-4 w-4" />}
              color="red"
            />
            <MetricCard 
              title="Consecutive Wins" 
              value={metrics.consecutiveWins.toString()} 
              icon={<TrendingUp className="h-4 w-4" />}
              color="green"
            />
            <MetricCard 
              title="Consecutive Losses" 
              value={metrics.consecutiveLosses.toString()} 
              icon={<TrendingDown className="h-4 w-4" />}
              color="red"
            />
            <MetricCard 
              title="Best Month" 
              value={formatMoney(metrics.bestMonth)} 
              icon={<Calendar className="h-4 w-4" />}
              color="green"
            />
            <MetricCard 
              title="Worst Month" 
              value={formatMoney(metrics.worstMonth)} 
              icon={<Calendar className="h-4 w-4" />}
              color="red"
            />
          </div>

          {/* Performance Tables */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Top Symbols */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                Top Performing Symbols
              </h4>
              <div className="space-y-2">
                {symbolPerformance.slice(0, 5).map((symbol, index) => (
                  <div key={symbol.symbol} className="flex justify-between items-center text-xs">
                    <span className="text-gray-300">{symbol.symbol}</span>
                    <div className="flex items-center gap-2">
                      <span className={`${symbol.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatMoney(symbol.totalPnL)}
                      </span>
                      <span className="text-gray-400">({symbol.trades})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Performance */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                Strategy Performance
              </h4>
              <div className="space-y-2">
                {strategyPerformance.slice(0, 5).map((strategy, index) => (
                  <div key={strategy.strategy} className="flex justify-between items-center text-xs">
                    <span className="text-gray-300">{strategy.strategy}</span>
                    <div className="flex items-center gap-2">
                      <span className={`${strategy.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatMoney(strategy.totalPnL)}
                      </span>
                      <span className="text-gray-400">({pct(strategy.winRate)})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Filters and Controls - Hidden in dashboard view */}
      {!isDashboardView && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Symbol Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Symbol</label>
          <input
            type="text"
            placeholder="e.g., EURUSD"
            value={filterSymbol}
            onChange={(e) => handleFilterChange(() => setFilterSymbol(e.target.value))}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Strategy Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Strategy</label>
          <select
            value={filterStrategy}
            onChange={(e) => handleFilterChange(() => setFilterStrategy(e.target.value))}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Strategies</option>
            {strategies.slice(1).map(strategy => (
              <option key={strategy} value={strategy}>{strategy}</option>
            ))}
          </select>
        </div>

        {/* Time Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Time Period</label>
          <select
            value={timeFilter}
            onChange={(e) => handleFilterChange(() => setTimeFilter(e.target.value))}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="thisWeek">This Week</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">From Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleFilterChange(() => setDateRange(prev => ({ ...prev, start: e.target.value })))}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">To Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleFilterChange(() => setDateRange(prev => ({ ...prev, end: e.target.value })))}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
      )}

      {/* Sort Controls - Hidden in dashboard view */}
      {!isDashboardView && (
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
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
            <option value="datetime">Date & Time</option>
            <option value="time">Upload Time</option>
            <option value="date">Date Only</option>
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
            <option value="desc">Most Recent First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
      )}

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
              onClick={() => handleTradeClick(trade)}
              className="bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-3 sm:p-4 border border-gray-600/30 transition-all duration-200 hover:border-gray-500/50 cursor-pointer group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
                {/* Symbol and Date */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <span className="text-base sm:text-lg font-bold text-white">{trade.symbol}</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs sm:text-sm font-medium w-fit">
                      {trade.lotSize > 0 ? trade.lotSize : "0.01"}
                    </span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs sm:text-sm font-medium w-fit">
                      {trade.tradeDirection || 'BUY'}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-400">
                      {new Date(trade.createdAt || trade.date).toLocaleDateString(undefined, {
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                      })}
                    </span>
                  </div>
                  
                  {/* Enhanced Summary Information */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm mb-2">
                    <div>
                      <span className="text-gray-400">Entry: </span>
                      <span className="text-white font-medium">${trade.entry || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Exit: </span>
                      <span className="text-white font-medium">${trade.exit || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Time: </span>
                      <span className="text-white font-medium">
                        {formatDateInTimezone(trade.createdAt || trade.date, userTimezone, { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Account: </span>
                      <span className="text-white font-medium">{trade.accountType || 'STANDARD'}</span>
                    </div>
                  </div>

                  {/* Risk Information */}
                  {trade.riskAmount && trade.riskAmount > 0 && (
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm mb-2">
                      <div>
                        <span className="text-gray-400">Risk: </span>
                        <span className="text-red-400 font-medium">${trade.riskAmount}</span>
                      </div>
                      {trade.profit && trade.riskAmount && (
                        <div>
                          <span className="text-gray-400">R/R: </span>
                          <span className="text-blue-400 font-medium">
                            {(Math.abs(trade.profit) / trade.riskAmount).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes Preview */}
                  {trade.notes && (
                    <div className="text-xs sm:text-sm">
                      <span className="text-gray-400">Notes: </span>
                      <span className="text-gray-300">
                        {trade.notes.length > 100 ? `${trade.notes.substring(0, 100)}...` : trade.notes}
                      </span>
                    </div>
                  )}

                  {/* Click indicator */}
                  <div className="mt-2 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    Click to view full details
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(trade);
                    }}
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

      {/* Pagination Controls - Hidden in dashboard view */}
      {!isDashboardView && totalPages > 1 && (
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


      {/* Trade Detail Modal */}
      {tradeDetailModalOpen && selectedTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Trade Details</h2>
              <button
                onClick={handleCloseTradeDetail}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Trade Header */}
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white">{selectedTrade.symbol}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTrade.tradeDirection === 'BUY' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {selectedTrade.tradeDirection || 'BUY'}
                    </span>
                  </div>
                  <div className={`text-right ${selectedTrade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <div className="text-3xl font-bold">
                      {selectedTrade.profit >= 0 ? '+' : ''}${selectedTrade.profit}
                    </div>
                    <div className="text-sm text-gray-400">
                      {selectedTrade.profit >= 0 ? 'Profit' : 'Loss'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Basic Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Currency Pair:</span>
                      <span className="text-white font-medium">{selectedTrade.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trade Direction:</span>
                      <span className={`font-medium ${selectedTrade.tradeDirection === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedTrade.tradeDirection || 'BUY'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lot Size:</span>
                      <span className="text-white font-medium">{selectedTrade.lotSize || '0.01'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Account Type:</span>
                      <span className="text-white font-medium">{selectedTrade.accountType || 'STANDARD'}</span>
                    </div>
                  </div>
                </div>

                {/* Price Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Price Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Entry Price:</span>
                      <span className="text-white font-medium">${selectedTrade.entry || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Exit Price:</span>
                      <span className="text-white font-medium">${selectedTrade.exit || 'N/A'}</span>
                    </div>
                    {selectedTrade.entry && selectedTrade.exit && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price Movement:</span>
                        <span className={`font-medium ${selectedTrade.exit > selectedTrade.entry ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedTrade.exit > selectedTrade.entry ? '+' : ''}{(selectedTrade.exit - selectedTrade.entry).toFixed(5)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Risk Management */}
              {selectedTrade.riskAmount && selectedTrade.riskAmount > 0 && (
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2 mb-4">Risk Management</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">${selectedTrade.riskAmount}</div>
                      <div className="text-sm text-gray-400">Risk Amount</div>
                    </div>
                    {selectedTrade.profit && selectedTrade.riskAmount && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {(Math.abs(selectedTrade.profit) / selectedTrade.riskAmount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">Risk/Reward Ratio</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${selectedTrade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedTrade.profit >= 0 ? 'WIN' : 'LOSS'}
                      </div>
                      <div className="text-sm text-gray-400">Trade Result</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date and Time Information */}
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2 mb-4">Date & Time</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Trade Date</div>
                    <div className="text-white font-medium">
                      {formatDateInTimezone(selectedTrade.createdAt || selectedTrade.date, userTimezone, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Trade Time</div>
                    <div className="text-white font-medium">
                      {formatDateInTimezone(selectedTrade.createdAt || selectedTrade.date, userTimezone, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Timezone</div>
                    <div className="text-white font-medium">
                      {getTimezoneDisplayName(userTimezone)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Data Source</div>
                    <div className="text-white font-medium">
                      {selectedTrade.isMetricData ? 'Auto-saved Metrics' : 'Regular Trade'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedTrade.notes && (
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2 mb-4">Trade Notes</h3>
                  <div className="text-gray-300 whitespace-pre-wrap">{selectedTrade.notes}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
                <button
                  onClick={handleCloseTradeDetail}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCloseTradeDetail();
                    handleDeleteClick(selectedTrade);
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Delete Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// MetricCard Component
function MetricCard({ title, value, icon, color = "blue" }) {
  const colorClasses = {
    green: "text-green-400 bg-green-500/20 border-green-500/30",
    red: "text-red-400 bg-red-500/20 border-red-500/30",
    blue: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    purple: "text-purple-400 bg-purple-500/20 border-purple-500/30",
    yellow: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`w-2 h-2 rounded-full ${colorClasses[color].split(' ')[0].replace('text-', 'bg-')}`}></div>
      </div>
      <div className="text-xs text-gray-400 mb-1">{title}</div>
      <div className={`text-sm font-bold ${colorClasses[color].split(' ')[0]}`}>
        {value}
      </div>
    </div>
  );
}

