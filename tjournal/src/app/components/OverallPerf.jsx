"use client";
// Modern Trading Performance Dashboard - Redesigned for better UX and insights

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../lib/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import CoachAi from "./CoachAi";
import { safeGetFromLocalStorage } from "../utils/safeJsonParse";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Scale as RiskIcon, 
  PieChart as PieIcon, 
  BarChart3, 
  Calendar, 
  Filter,
  DollarSign,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Brain,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Users,
  Settings
} from "lucide-react";

// ---------------------------------------------
// 📊 REAL DATA INTEGRATION
// ---------------------------------------------
// Now using real Firebase data instead of sample data

// Helper functions
const groupBy = (arr, key) => arr.reduce((acc, item) => {
  const k = item[key];
  acc[k] = acc[k] || [];
  acc[k].push(item);
  return acc;
}, {});

// Dynamic currency formatter based on user settings
const formatCurrency = (n, currency = 'USD') => {
  const currencyMap = {
    'USD': { locale: 'en-US', currency: 'USD' },
    'EUR': { locale: 'en-EU', currency: 'EUR' },
    'GBP': { locale: 'en-GB', currency: 'GBP' },
    'JPY': { locale: 'ja-JP', currency: 'JPY' }
  };
  
  const config = currencyMap[currency] || currencyMap['USD'];
  return n.toLocaleString(config.locale, { 
    style: "currency", 
    currency: config.currency, 
    maximumFractionDigits: currency === 'JPY' ? 0 : 2 
  });
};

const pct = (n) => `${(n * 100).toFixed(1)}%`;
const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Dashboard Color Scheme - Matching your dark theme
const colors = {
  primary: "#8B5CF6",      // purple-500
  success: "#10B981",      // emerald-500 (green-400 equivalent)
  danger: "#EF4444",       // red-500
  warning: "#F59E0B",      // amber-500
  info: "#3B82F6",         // blue-500
  accent: "#6366F1",       // indigo-500
  neutral: "#6B7280",      // gray-500
  background: "#1F2937",   // gray-800
  surface: "#374151",      // gray-700
  text: "#F9FAFB",         // gray-50
  textSecondary: "#9CA3AF" // gray-400
};

const chartColors = ["#8B5CF6", "#10B981", "#EF4444", "#F59E0B", "#3B82F6", "#EC4899", "#06B6D4", "#84CC16"];

// -----------------------
// 📄 Main Performance Dashboard
// -----------------------
export default function PerformancePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState(null);
  
  // Helper function to format currency with user's preferred currency
  const formatMoney = (amount) => {
    const currency = userSettings?.display?.currency || 'USD';
    return formatCurrency(amount, currency);
  };
  
  const [strategy, setStrategy] = useState("ALL");
  const [session, setSession] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  
  // Set default date range to current month
  const getDefaultDateRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start: startOfMonth.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  };
  
  const defaultRange = getDefaultDateRange();
  const [start, setStart] = useState(defaultRange.start);
  const [end, setEnd] = useState(defaultRange.end);

  // Load user settings
  const loadUserSettings = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserSettings(userData.settings || { display: { currency: 'USD' } });
      } else {
        setUserSettings({ display: { currency: 'USD' } });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      setUserSettings({ display: { currency: 'USD' } });
    }
  };

  // Load user and trades data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUserSettings(currentUser.uid);
        loadTrades(currentUser.uid);
      } else {
        router.push('/auth/login');
      }
    });
    return unsubscribe;
  }, [router]);

  const loadTrades = (userId) => {
    const q = query(
      collection(db, "trades1"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tradesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load metrics data from localStorage and merge with trades
      const metricsData = safeGetFromLocalStorage('tradingMetricsForPerformance', []);
      
      // Convert metrics data to trade format and merge
      const metricsAsTrades = metricsData.map(metric => ({
        id: `metric_${metric.id}`,
        userId: userId,
        symbol: metric.symbol,
        profit: metric.profit,
        riskAmount: metric.riskAmount,
        entry: metric.entry,
        exit: metric.exit,
        lotSize: metric.lotSize,
        notes: metric.notes,
        tradeDirection: metric.tradeDirection,
        accountType: metric.accountType,
        date: new Date(metric.timestamp).toISOString(),
        deviceTimeTimestamp: metric.deviceTimeTimestamp,
        userTimezone: metric.userTimezone,
        isMetricData: true // Flag to identify metrics data
      }));
      
      // Combine trades and metrics data, sort by date
      const allData = [...tradesData, ...metricsAsTrades].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setTrades(allData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading trades:", error);
      setLoading(false);
    });

    return unsubscribe;
  };

  // Transform real trade data to match expected format
  const transformedTrades = useMemo(() => {
    return trades.map(trade => ({
      id: trade.id,
      date: trade.date ? new Date(trade.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      symbol: trade.symbol || 'Unknown',
      side: trade.tradeDirection || 'LONG',
      r: trade.profit && trade.stopLossPips ? (trade.profit / (trade.stopLossPips * 10)) : 0, // Approximate R-multiple
      pnl: trade.profit || 0,
      strategy: trade.notes ? 'Custom' : 'Unknown', // You might want to add a strategy field to your trade form
      session: 'ALL', // You might want to add a session field to your trade form
      duration: 60, // Default duration - you might want to add this field
      confidence: 7, // Default confidence - you might want to add this field
      notes: trade.notes || ''
    }));
  }, [trades]);

  const filtered = useMemo(() => {
    return transformedTrades.filter((t) => {
      const inDate = (!start || t.date >= start) && (!end || t.date <= end);
      const inStrat = strategy === "ALL" || t.strategy === strategy;
      const inSession = session === "ALL" || t.session === session;
      const inYear = selectedYear === "ALL" || new Date(t.date).getFullYear() === selectedYear;
      return inDate && inStrat && inSession && inYear;
    });
  }, [transformedTrades, strategy, session, start, end, selectedYear]);

  // -----------------
  // 🧮 ENHANCED KPI CALCULATIONS
  // -----------------
  const kpis = useMemo(() => {
    if (!filtered.length) return {};

    const totalPnL = filtered.reduce((a, b) => a + b.pnl, 0);
    const wins = filtered.filter((t) => t.pnl > 0);
    const losses = filtered.filter((t) => t.pnl <= 0);
    const winRate = filtered.length ? wins.length / filtered.length : 0;
    const avgWin = wins.length ? wins.reduce((a, b) => a + b.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((a, b) => a + b.pnl, 0) / losses.length) : 0;
    const profitFactor = avgLoss === 0 ? (wins.length ? Infinity : 0) : (wins.reduce((a, b) => a + b.pnl, 0) / Math.abs(losses.reduce((a, b) => a + b.pnl, 0)));

    // Enhanced metrics
    const totalTrades = filtered.length;
    const avgDuration = filtered.reduce((a, b) => a + b.duration, 0) / totalTrades;
    const avgConfidence = filtered.reduce((a, b) => a + b.confidence, 0) / totalTrades;
    const bestTrade = Math.max(...filtered.map(t => t.pnl));
    const worstTrade = Math.min(...filtered.map(t => t.pnl));
    const consecutiveWins = calculateConsecutiveWins(filtered);
    const consecutiveLosses = calculateConsecutiveLosses(filtered);

    // Equity Curve + Max Drawdown
    let equity = 0;
    let peak = 0;
    let maxDD = 0;
    let maxDDDuration = 0;
    let currentDDDuration = 0;
    const equitySeries = filtered
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((t) => {
        equity += t.pnl;
        if (equity > peak) {
          peak = equity;
          currentDDDuration = 0;
        } else {
          currentDDDuration++;
          maxDDDuration = Math.max(maxDDDuration, currentDDDuration);
        }
        const dd = peak ? (equity - peak) / peak : 0;
        if (dd < maxDD) maxDD = dd;
        return { date: t.date, equity, drawdown: dd };
      });

    // Risk metrics
    const byDay = groupBy(filtered, "date");
    const daily = Object.keys(byDay).sort().map((d) => byDay[d].reduce((a, b) => a + b.pnl, 0));
    const mean = daily.length ? daily.reduce((a, b) => a + b, 0) / daily.length : 0;
    const variance = daily.length ? daily.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / daily.length : 0;
    const std = Math.sqrt(variance);
    const sharpe = std === 0 ? 0 : mean / std;
    const sortino = calculateSortino(daily);
    const calmar = Math.abs(maxDD) === 0 ? 0 : totalPnL / Math.abs(maxDD);

    return {
      totalPnL,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      maxDD: Math.abs(maxDD),
      sharpe,
      sortino,
      calmar,
      totalTrades,
      avgDuration,
      avgConfidence,
      bestTrade,
      worstTrade,
      consecutiveWins,
      consecutiveLosses,
      maxDDDuration,
      equitySeries,
    };
  }, [filtered]);

  // Helper functions for advanced metrics
  function calculateConsecutiveWins(trades) {
    let max = 0, current = 0;
    trades.forEach(t => {
      if (t.pnl > 0) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    });
    return max;
  }

  function calculateConsecutiveLosses(trades) {
    let max = 0, current = 0;
    trades.forEach(t => {
      if (t.pnl <= 0) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    });
    return max;
  }

  function calculateSortino(dailyReturns) {
    const negativeReturns = dailyReturns.filter(r => r < 0);
    if (negativeReturns.length === 0) return 0;
    const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const downsideVariance = negativeReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / negativeReturns.length;
    const downsideStd = Math.sqrt(downsideVariance);
    return downsideStd === 0 ? 0 : mean / downsideStd;
  }


  // -----------------
  // 🤖 AI-POWERED INSIGHTS ANALYSIS
  // -----------------
  const aiInsights = useMemo(() => {
    if (filtered.length === 0) return [];

    const totalTrades = filtered.length;
    const winRate = (filtered.filter(t => t.pnl > 0).length / totalTrades) * 100;
    const avgWin = filtered.filter(t => t.pnl > 0).reduce((a, b) => a + b.pnl, 0) / filtered.filter(t => t.pnl > 0).length || 0;
    const avgLoss = Math.abs(filtered.filter(t => t.pnl <= 0).reduce((a, b) => a + b.pnl, 0) / filtered.filter(t => t.pnl <= 0).length || 0);
    const profitFactor = avgWin / avgLoss || 0;
    const avgConfidence = filtered.reduce((a, b) => a + b.confidence, 0) / totalTrades;

    // AI Analysis Functions
    const analyzeTradingPatterns = () => {
      const patterns = [];
      
      // Time-based analysis
      const hourlyPerformance = {};
      const dailyPerformance = {};
      
      filtered.forEach(trade => {
        const hour = new Date(trade.date).getHours();
        const day = new Date(trade.date).getDay();
        
        if (!hourlyPerformance[hour]) hourlyPerformance[hour] = { wins: 0, total: 0, pnl: 0 };
        if (!dailyPerformance[day]) dailyPerformance[day] = { wins: 0, total: 0, pnl: 0 };
        
        hourlyPerformance[hour].total++;
        dailyPerformance[day].total++;
        
        if (trade.pnl > 0) {
          hourlyPerformance[hour].wins++;
          dailyPerformance[day].wins++;
        }
        
        hourlyPerformance[hour].pnl += trade.pnl;
        dailyPerformance[day].pnl += trade.pnl;
      });

      // Find best trading hours
      const bestHour = Object.entries(hourlyPerformance)
        .filter(([_, data]) => data.total >= 3)
        .sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total))[0];
      
      if (bestHour && (bestHour[1].wins / bestHour[1].total) > 0.6) {
        patterns.push({
          type: 'success',
          title: 'Optimal Trading Time',
          message: `You perform best during ${bestHour[0]}:00-${parseInt(bestHour[0]) + 1}:00 with ${((bestHour[1].wins / bestHour[1].total) * 100).toFixed(1)}% win rate`,
          action: 'Consider focusing your trading during these hours',
          confidence: 85
        });
      }

      // Strategy performance analysis
      const strategyPerformance = {};
      filtered.forEach(trade => {
        if (!strategyPerformance[trade.strategy]) {
          strategyPerformance[trade.strategy] = { wins: 0, total: 0, pnl: 0 };
        }
        strategyPerformance[trade.strategy].total++;
        if (trade.pnl > 0) strategyPerformance[trade.strategy].wins++;
        strategyPerformance[trade.strategy].pnl += trade.pnl;
      });

      const bestStrategy = Object.entries(strategyPerformance)
        .filter(([_, data]) => data.total >= 5)
        .sort((a, b) => (b[1].pnl / b[1].total) - (a[1].pnl / a[1].total))[0];

      if (bestStrategy && (bestStrategy[1].pnl / bestStrategy[1].total) > 50) {
        patterns.push({
          type: 'success',
          title: 'Top Performing Strategy',
          message: `"${bestStrategy[0]}" generates ${formatMoney(bestStrategy[1].pnl / bestStrategy[1].total)} average profit per trade`,
          action: 'Consider increasing allocation to this strategy',
          confidence: 90
        });
      }

      return patterns;
    };

    const analyzeRiskManagement = () => {
      const riskInsights = [];
      
      // Position sizing analysis
      const positionSizes = filtered.map(t => Math.abs(t.pnl));
      const avgPositionSize = positionSizes.reduce((a, b) => a + b, 0) / positionSizes.length;
      const maxPositionSize = Math.max(...positionSizes);
      const positionSizeVariation = (maxPositionSize - Math.min(...positionSizes)) / avgPositionSize;

      if (positionSizeVariation > 3) {
        riskInsights.push({
          type: 'warning',
          title: 'Inconsistent Position Sizing',
          message: `Your position sizes vary by ${(positionSizeVariation * 100).toFixed(0)}% - this increases risk`,
          action: 'Implement fixed percentage risk per trade (1-2% of account)',
          confidence: 80
        });
      }

      // Risk-reward analysis
      const riskRewardRatios = filtered.map(trade => {
        if (trade.pnl <= 0) return 0;
        const risk = Math.abs(trade.pnl) * 0.5; // Estimate risk as half of potential loss
        return trade.pnl / risk;
      }).filter(rr => rr > 0);

      const avgRR = riskRewardRatios.reduce((a, b) => a + b, 0) / riskRewardRatios.length;
      
      if (avgRR < 1.5) {
        riskInsights.push({
          type: 'warning',
          title: 'Poor Risk-Reward Ratio',
          message: `Average R/R ratio of ${avgRR.toFixed(2)} is below optimal (target: 1:2+)`,
          action: 'Wait for better setups with higher reward potential',
          confidence: 85
        });
      }

      return riskInsights;
    };

    const analyzeEmotionalTrading = () => {
      const emotionalInsights = [];
      
      // Consecutive loss analysis
      const consecutiveLosses = calculateConsecutiveLosses(filtered);
      if (consecutiveLosses > 3) {
        emotionalInsights.push({
          type: 'error',
          title: 'Emotional Trading Detected',
          message: `${consecutiveLosses} consecutive losses suggest revenge trading or emotional decisions`,
          action: 'Take a break, review your rules, and return with a clear mind',
          confidence: 95
        });
      }

      // Overtrading analysis
      const tradesPerDay = totalTrades / Math.max(1, (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
      if (tradesPerDay > 3) {
        emotionalInsights.push({
          type: 'warning',
          title: 'Potential Overtrading',
          message: `Averaging ${tradesPerDay.toFixed(1)} trades per day may indicate FOMO or overtrading`,
          action: 'Focus on quality over quantity - wait for high-probability setups',
          confidence: 75
        });
      }

      // Confidence vs Performance correlation
      const highConfidenceTrades = filtered.filter(t => t.confidence >= 8);
      const highConfWinRate = highConfidenceTrades.length > 0 ? 
        (highConfidenceTrades.filter(t => t.pnl > 0).length / highConfidenceTrades.length) * 100 : 0;
      
      if (highConfWinRate > winRate + 10) {
        emotionalInsights.push({
          type: 'success',
          title: 'Confidence Correlates with Success',
          message: `High-confidence trades (8+/10) have ${highConfWinRate.toFixed(1)}% win rate vs ${winRate.toFixed(1)}% overall`,
          action: 'Trust your instincts - only trade when you feel confident',
          confidence: 88
        });
      }

      return emotionalInsights;
    };

    const generatePredictiveInsights = () => {
      const predictions = [];
      
      // Trend analysis
      const recentTrades = filtered.slice(-10);
      const recentWinRate = (recentTrades.filter(t => t.pnl > 0).length / recentTrades.length) * 100;
      const recentPnL = recentTrades.reduce((a, b) => a + b.pnl, 0);
      
      if (recentWinRate > winRate + 15) {
        predictions.push({
          type: 'success',
          title: 'Performance Improving',
          message: `Recent 10 trades show ${recentWinRate.toFixed(1)}% win rate - you're getting better!`,
          action: 'Continue your current approach, consider slightly increasing position size',
          confidence: 82
        });
      } else if (recentWinRate < winRate - 15) {
        predictions.push({
          type: 'warning',
          title: 'Performance Declining',
          message: `Recent performance (${recentWinRate.toFixed(1)}%) is below your average`,
          action: 'Review recent trades for patterns, consider taking a break',
          confidence: 78
        });
      }

      // Monthly performance prediction
      const monthlyPnL = recentPnL * 3; // Extrapolate recent performance
      if (monthlyPnL > 1000) {
        predictions.push({
          type: 'success',
          title: 'Positive Monthly Outlook',
          message: `Based on recent performance, you could generate ${formatMoney(monthlyPnL)} this month`,
          action: 'Maintain current strategy, but don\'t increase risk too quickly',
          confidence: 70
        });
      }

      return predictions;
    };

    // Combine all AI insights
    const allInsights = [
      ...analyzeTradingPatterns(),
      ...analyzeRiskManagement(),
      ...analyzeEmotionalTrading(),
      ...generatePredictiveInsights()
    ];

    // Sort by confidence and limit to top insights
    return allInsights
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);
  }, [filtered, start, end]);

  // -----------------
  // 📊 ENHANCED CHART DATA
  // -----------------
  const monthlyPerf = useMemo(() => {
    const byMonth = groupBy(filtered, "date");
    const monthMap = {};
    Object.keys(byMonth).forEach((d) => {
      const month = d.slice(0, 7);
      monthMap[month] = (monthMap[month] || 0) + byMonth[d].reduce((a, b) => a + b.pnl, 0);
    });
    return Object.keys(monthMap)
      .sort()
      .map((m) => ({ month: m, pnl: monthMap[m] }));
  }, [filtered]);

  const rDist = useMemo(() => {
    const buckets = {
      "<= -2R": 0,
      "-2R to -1R": 0,
      "-1R to 0R": 0,
      "0R to +1R": 0,
      "+1R to +2R": 0,
      ">= +2R": 0,
    };
    filtered.forEach((t) => {
      if (t.r <= -2) buckets["<= -2R"]++;
      else if (t.r <= -1) buckets["-2R to -1R"]++;
      else if (t.r < 0) buckets["-1R to 0R"]++;
      else if (t.r <= 1) buckets["0R to +1R"]++;
      else if (t.r <= 2) buckets["+1R to +2R"]++;
      else buckets[">= +2R"]++;
    });
    return Object.keys(buckets).map((k) => ({ bucket: k, count: buckets[k] }));
  }, [filtered]);

  const winLossPie = useMemo(() => {
    const wins = filtered.filter((t) => t.pnl > 0).length;
    const losses = filtered.filter((t) => t.pnl <= 0).length;
    return [
      { name: "Wins", value: wins, color: colors.success },
      { name: "Losses", value: losses, color: colors.danger },
    ];
  }, [filtered]);

  const bySymbol = useMemo(() => {
    const g = groupBy(filtered, "symbol");
    const rows = Object.keys(g).map((sym) => {
      const trades = g[sym];
      const pnl = trades.reduce((a, b) => a + b.pnl, 0);
      const winRate = trades.filter((t) => t.pnl > 0).length / trades.length;
      const avgR = trades.reduce((a, b) => a + b.r, 0) / trades.length;
      const avgDuration = trades.reduce((a, b) => a + b.duration, 0) / trades.length;
      return { symbol: sym, trades: trades.length, pnl, winRate, avgR, avgDuration };
    });
    return rows.sort((a, b) => b.pnl - a.pnl).slice(0, 8);
  }, [filtered]);

  const byStrategy = useMemo(() => {
    const g = groupBy(filtered, "strategy");
    return Object.keys(g).map((s) => {
      const trades = g[s];
      return {
      strategy: s,
        trades: trades.length,
        pnl: trades.reduce((a, b) => a + b.pnl, 0),
        winRate: trades.filter((t) => t.pnl > 0).length / trades.length,
        avgR: trades.reduce((a, b) => a + b.r, 0) / trades.length,
        avgConfidence: trades.reduce((a, b) => a + b.confidence, 0) / trades.length,
      };
    }).sort((a, b) => b.pnl - a.pnl);
  }, [filtered]);

  const bySession = useMemo(() => {
    const g = groupBy(filtered, "session");
    return Object.keys(g).map((s) => {
      const trades = g[s];
      return {
        session: s,
        trades: trades.length,
        pnl: trades.reduce((a, b) => a + b.pnl, 0),
        winRate: trades.filter((t) => t.pnl > 0).length / trades.length,
        avgDuration: trades.reduce((a, b) => a + b.duration, 0) / trades.length,
      };
    }).sort((a, b) => b.pnl - a.pnl);
  }, [filtered]);

  const confidenceVsPerformance = useMemo(() => {
    const buckets = {};
    filtered.forEach(t => {
      const bucket = Math.floor(t.confidence / 2) * 2; // Group by 2s
      if (!buckets[bucket]) buckets[bucket] = { confidence: bucket, trades: 0, pnl: 0, wins: 0 };
      buckets[bucket].trades++;
      buckets[bucket].pnl += t.pnl;
      if (t.pnl > 0) buckets[bucket].wins++;
    });
    return Object.values(buckets).map(b => ({
      ...b,
      winRate: b.wins / b.trades,
      avgPnL: b.pnl / b.trades
    }));
  }, [filtered]);

  const strategies = useMemo(() => {
    const uniqueStrategies = Array.from(new Set(transformedTrades.map((t) => t.strategy).filter(Boolean)));
    // Remove "ALL" from uniqueStrategies if it exists to avoid duplicates
    const filteredStrategies = uniqueStrategies.filter(s => s !== "ALL");
    return ["ALL", ...filteredStrategies];
  }, [transformedTrades]);
  
  const sessions = useMemo(() => {
    const uniqueSessions = Array.from(new Set(transformedTrades.map((t) => t.session).filter(Boolean)));
    // Remove "ALL" from uniqueSessions if it exists to avoid duplicates
    const filteredSessions = uniqueSessions.filter(s => s !== "ALL");
    return ["ALL", ...filteredSessions];
  }, [transformedTrades]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading performance data...</p>
        </div>
      </div>
    );
  }

  // No trades state
  if (trades.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Trading Data</h2>
          <p className="text-gray-400 mb-6">Start adding trades to see your performance analytics</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Animated background elements - matching dashboard */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-purple-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-blue-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* PROFESSIONAL HEADER */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-gray-700/60 shadow-lg relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Main Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 sm:py-4 lg:py-5 gap-3 sm:gap-4">
            {/* Professional Title Section */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1 w-full sm:w-auto">
              <div className="relative flex-shrink-0">
                <div className="p-2.5 sm:p-3 lg:p-3.5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xl">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white truncate">Trading Performance Analytics</h1>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full w-fit">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-medium">LIVE</span>
                  </div>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-0">
                  Professional-grade trading analytics & performance insights
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-400">
                  <span className="hidden sm:inline">Last updated: {new Date().toLocaleTimeString()}</span>
                  <span className="text-xs sm:text-xs">Portfolio ID: {user?.uid?.slice(-8) || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Trading Tools & Quick Actions */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => router.push('/addtrade')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl flex-1 sm:flex-none"
                  title="Add New Trade"
                >
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold">+</span>
                  </div>
                  <span className="text-xs sm:text-sm">Add Trade</span>
                </button>
                
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-700/60 text-gray-300 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-600/60 hover:text-white transition-all duration-200 border border-gray-600/40 flex-1 sm:flex-none"
                  title="Go to Dashboard"
                >
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Dashboard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Professional Filters Section */}
          <div className="pb-3 sm:pb-4 lg:pb-5">
            <div className="bg-gray-800/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 rounded-lg bg-purple-500/20">
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-white">Advanced Filters</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-600/50 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                {/* Date Range Filter */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-300 font-semibold">Date Range</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="date"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      className="bg-gray-700/60 border border-gray-600/60 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0 transition-all"
                    />
                    <span className="text-gray-400 text-xs sm:text-sm font-medium text-center sm:hidden">to</span>
                    <span className="text-gray-400 text-xs sm:text-sm font-medium hidden sm:inline">to</span>
                    <input
                      type="date"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      className="bg-gray-700/60 border border-gray-600/60 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0 transition-all"
                    />
                  </div>
                </div>

                {/* Year Filter */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-300 font-semibold">Year</span>
                  </div>
                  <div className="space-y-2">
                    {/* All Years Button */}
                    <button
                      onClick={() => setSelectedYear("ALL")}
                      className={`w-full px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                        selectedYear === "ALL"
                          ? "bg-purple-500 text-white shadow-md ring-2 ring-purple-400/50"
                          : "bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:text-white border border-gray-600/60"
                      }`}
                    >
                      All Years
                    </button>
                    {/* Year Buttons Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-2 gap-1 sm:gap-1.5">
                      {Array.from({ length: 6 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        const isSelected = selectedYear === year;
                        return (
                          <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-1.5 sm:px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                              isSelected
                                ? "bg-purple-500 text-white shadow-md ring-2 ring-purple-400/50"
                                : "bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:text-white border border-gray-600/60"
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Strategy Filter */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-300 font-semibold">Trading Strategy</span>
                  </div>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full bg-gray-700/60 border border-gray-600/60 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  >
                    {strategies.map((s, index) => (
                      <option key={`strategy-${index}-${s}`} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Session Filter */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-300 font-semibold">Trading Session</span>
                  </div>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full bg-gray-700/60 border border-gray-600/60 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  >
                    {sessions.map((s, index) => (
                      <option key={`session-${index}-${s}`} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Quick Actions & Export */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-300 font-semibold">Quick Actions</span>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const data = filtered.map(t => ({
                          date: t.date,
                          symbol: t.symbol,
                          pnl: t.pnl,
                          strategy: t.strategy,
                          session: t.session
                        }));
                        const csv = [
                          Object.keys(data[0] || {}).join(','),
                          ...data.map(row => Object.values(row).join(','))
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `trades-${start}-to-${end}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg sm:rounded-xl text-xs font-semibold transition-all duration-200 border border-blue-500/30"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      <span className="text-xs">Export CSV</span>
                    </button>
                    <button
                      onClick={() => {
                        setStart(defaultRange.start);
                        setEnd(defaultRange.end);
                        setStrategy("ALL");
                        setSession("ALL");
                        setSelectedYear("ALL");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg sm:rounded-xl text-xs font-semibold transition-all duration-200 border border-gray-600/30"
                    >
                      <Settings className="w-3 h-3" />
                      <span className="text-xs">Reset Filters</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 relative z-10">
        {/* PROFESSIONAL KPI DASHBOARD */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Performance Metrics</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-600/50 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            <ProfessionalKPICard
              title="Total P&L"
              value={formatMoney(kpis.totalPnL || 0)}
              icon={kpis.totalPnL >= 0 ? TrendingUp : TrendingDown}
              subtitle={kpis.totalPnL >= 0 ? "Net Profit" : "Net Loss"}
              trend={kpis.totalPnL >= 0 ? "positive" : "negative"}
              color={kpis.totalPnL >= 0 ? colors.success : colors.danger}
              change={kpis.totalPnL >= 0 ? "+" : ""}
              description="Cumulative profit/loss from all trades"
            />
            <ProfessionalKPICard
              title="Win Rate"
              value={pct(kpis.winRate || 0)}
              icon={Target}
              subtitle={`${filtered.filter(t => t.pnl > 0).length}/${filtered.length} trades`}
              trend={kpis.winRate > 0.5 ? "positive" : "negative"}
              color={kpis.winRate > 0.5 ? colors.success : colors.danger}
              change={kpis.winRate > 0.5 ? "+" : ""}
              description="Percentage of profitable trades"
            />
            <ProfessionalKPICard
              title="Profit Factor"
              value={Number.isFinite(kpis.profitFactor) ? kpis.profitFactor.toFixed(2) : "∞"}
              icon={RiskIcon}
              subtitle="Risk/Reward Ratio"
              trend={kpis.profitFactor > 1 ? "positive" : "negative"}
              color={kpis.profitFactor > 1 ? colors.success : colors.danger}
              change={kpis.profitFactor > 1 ? "+" : ""}
              description="Gross profit vs gross loss ratio"
            />
            <ProfessionalKPICard
              title="Max Drawdown"
              value={pct(kpis.maxDD || 0)}
              icon={TrendingDown}
              subtitle="Peak-to-Trough"
              trend={kpis.maxDD < 0.2 ? "positive" : "negative"}
              color={kpis.maxDD < 0.2 ? colors.success : colors.danger}
              change={kpis.maxDD < 0.2 ? "+" : ""}
              description="Largest peak-to-trough decline"
            />
            <ProfessionalKPICard
              title="Sharpe Ratio"
              value={kpis.sharpe ? kpis.sharpe.toFixed(2) : "0.00"}
              icon={Award}
              subtitle="Risk-Adjusted Return"
              trend={kpis.sharpe > 1 ? "positive" : "negative"}
              color={kpis.sharpe > 1 ? colors.success : colors.danger}
              change={kpis.sharpe > 1 ? "+" : ""}
              description="Return per unit of risk"
            />
            <ProfessionalKPICard
              title="Total Trades"
              value={kpis.totalTrades || 0}
              icon={Activity}
              subtitle={`Avg: ${formatDuration(kpis.avgDuration || 0)}`}
              trend="neutral"
              color={colors.primary}
              change=""
              description="Total number of executed trades"
            />
          </div>
        </div>

        {/* PROFESSIONAL INSIGHTS DASHBOARD */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Trading Insights</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-600/50 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {/* Best Trade */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-green-500/20">
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">Best Trade</h3>
                  <p className="text-xs text-gray-500">Highest profit trade</p>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">{formatMoney(kpis.bestTrade || 0)}</div>
              <div className="text-xs text-gray-400">Peak performance</div>
            </div>

            {/* Worst Trade */}
            <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-500/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-500/20">
                  <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">Worst Trade</h3>
                  <p className="text-xs text-gray-500">Largest loss trade</p>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-red-400 mb-1">{formatMoney(kpis.worstTrade || 0)}</div>
              <div className="text-xs text-gray-400">Maximum drawdown</div>
            </div>

            {/* Average Confidence */}
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-500/20">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">Avg Confidence</h3>
                  <p className="text-xs text-gray-500">Trade confidence level</p>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">{(kpis.avgConfidence || 0).toFixed(1)}/10</div>
              <div className="text-xs text-gray-400">Decision quality</div>
            </div>

            {/* Consecutive Wins */}
            <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-purple-500/20">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">Max Streak</h3>
                  <p className="text-xs text-gray-500">Consecutive wins</p>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-purple-400 mb-1">{kpis.consecutiveWins || 0}</div>
              <div className="text-xs text-gray-400">Winning streak</div>
            </div>
          </div>
        </div>

        {/* PROFESSIONAL CHARTS SECTION */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Analytics & Visualizations</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-600/50 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Equity Curve with Drawdown */}
          <EnhancedChartCard 
            title="Equity Curve" 
            description="Cumulative P&L with drawdown visualization"
            icon={TrendingUp}
          >
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={kpis.equitySeries} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis yAxisId="equity" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis yAxisId="drawdown" orientation="right" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'equity' ? formatMoney(Number(value)) : pct(Number(value)),
                    name === 'equity' ? 'Equity' : 'Drawdown'
                  ]}
                  labelStyle={{ color: '#F9FAFB' }}
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Area 
                  yAxisId="equity"
                  type="monotone" 
                  dataKey="equity" 
                  fill="url(#equityGradient)" 
                  stroke={colors.primary}
                  strokeWidth={2}
                />
                <Area 
                  yAxisId="drawdown"
                  type="monotone" 
                  dataKey="drawdown" 
                  fill="url(#drawdownGradient)" 
                  stroke={colors.danger}
                  strokeWidth={1}
                />
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.danger} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.danger} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </EnhancedChartCard>

          {/* Monthly Performance */}
          <EnhancedChartCard 
            title="Monthly Performance" 
            description="P&L breakdown by month"
            icon={Calendar}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyPerf} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  formatter={(value) => [formatMoney(Number(value)), 'P&L']}
                  labelStyle={{ color: '#F9FAFB' }}
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar 
                  dataKey="pnl" 
                  radius={[4, 4, 0, 0]}
                >
                  {monthlyPerf.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? colors.primary : colors.danger} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </EnhancedChartCard>

          {/* Win/Loss Distribution */}
          <EnhancedChartCard 
            title="Win/Loss Distribution" 
            description="Trade outcome breakdown"
            icon={PieIcon}
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={winLossPie} 
                  dataKey="value" 
                  nameKey="name" 
                  outerRadius={100}
                  innerRadius={40}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {winLossPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </EnhancedChartCard>
          </div>
        </div>

        {/* ADVANCED ANALYTICS */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Advanced Analytics</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-600/50 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* R-Multiple Distribution */}
          <EnhancedChartCard 
            title="R-Multiple Distribution" 
            description="Risk/reward outcome analysis"
            icon={Target}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rDist} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill={colors.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </EnhancedChartCard>

          {/* Strategy Performance */}
          <EnhancedChartCard 
            title="Strategy Performance" 
            description="P&L and win rate by strategy"
            icon={Brain}
          >
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={byStrategy} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="strategy" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === "pnl" ? formatMoney(Number(value)) : pct(Number(value)),
                    name === "pnl" ? "P&L" : "Win Rate"
                  ]}
                  labelStyle={{ color: '#F9FAFB' }}
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="pnl" name="P&L" fill={colors.primary} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="winRate" name="Win Rate" stroke={colors.success} strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </EnhancedChartCard>
          </div>
        </div>

        {/* SESSION & CONFIDENCE ANALYSIS */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Session & Confidence Analysis</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-600/50 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Session Performance */}
          <EnhancedChartCard 
            title="Session Performance" 
            description="Trading performance by session"
            icon={Clock}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bySession} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="session" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === "pnl" ? formatMoney(Number(value)) : pct(Number(value)),
                    name === "pnl" ? "P&L" : "Win Rate"
                  ]}
                  labelStyle={{ color: '#F9FAFB' }}
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="pnl" fill={colors.info} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </EnhancedChartCard>

          {/* Confidence vs Performance */}
          <EnhancedChartCard 
            title="Confidence vs Performance" 
            description="How confidence correlates with results"
            icon={Star}
          >
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart data={confidenceVsPerformance} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="confidence" name="Confidence" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis dataKey="avgPnL" name="Avg P&L" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === "avgPnL" ? formatMoney(Number(value)) : value,
                    name === "avgPnL" ? "Avg P&L" : "Confidence"
                  ]}
                  labelStyle={{ color: '#F9FAFB' }}
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Scatter dataKey="avgPnL" fill={colors.warning} />
              </ScatterChart>
            </ResponsiveContainer>
          </EnhancedChartCard>
          </div>
        </div>

        {/* PROFESSIONAL TABLES SECTION */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-rose-500/20 to-pink-500/20">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Performance Tables</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-600/50 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Top Symbols Table */}
          <EnhancedTableCard 
            title="Top Symbols" 
            description="Best performing instruments"
            icon={TrendingUp}
          >
            <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-600/30">
                    <th className="py-2 sm:py-3 px-1 sm:px-2 font-medium">Symbol</th>
                    <th className="py-2 sm:py-3 px-1 sm:px-2 font-medium">Trades</th>
                    <th className="py-2 sm:py-3 px-1 sm:px-2 font-medium">P&L</th>
                    <th className="py-2 sm:py-3 px-1 sm:px-2 font-medium">Win Rate</th>
                    <th className="py-2 sm:py-3 px-1 sm:px-2 font-medium">Avg R</th>
                </tr>
              </thead>
              <tbody>
                  {bySymbol.map((row, index) => (
                    <tr key={row.symbol} className="border-b border-gray-600/30 hover:bg-gray-700/30 transition-colors">
                      <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium text-white text-xs sm:text-sm">{row.symbol}</td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">{row.trades}</td>
                      <td className={`py-2 sm:py-3 px-1 sm:px-2 font-medium text-xs sm:text-sm ${row.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatMoney(row.pnl)}
                      </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${row.winRate > 0.5 ? 'bg-green-400' : 'bg-red-400'}`} />
                          <span className="text-xs sm:text-sm">{pct(row.winRate)}</span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">{row.avgR.toFixed(2)}R</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </EnhancedTableCard>

          {/* Worst Trades Table */}
          <EnhancedTableCard 
            title="Worst Trades" 
            description="Trades requiring review"
            icon={AlertTriangle}
          >
            <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-600/30">
                    <th className="py-2 sm:py-3 px-1 sm:px-2 font-medium">Date</th>
                    <th className="py-2 sm:py-3 px-1 sm:px-2 font-medium">Symbol</th>
                    <th className="py-2 sm:py-3 px-1 sm:px-2 font-medium">R</th>
                    <th className="py-2 sm:py-3 px-1 sm:px-2 font-medium">P&L</th>
                    <th className="py-2 sm:py-3 px-1 sm:px-2 font-medium">Strategy</th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .slice()
                  .sort((a, b) => a.pnl - b.pnl)
                  .slice(0, 5)
                  .map((t) => (
                      <tr key={t.id} className="border-b border-gray-600/30 hover:bg-gray-700/30 transition-colors">
                        <td className="py-2 sm:py-3 px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">{t.date}</td>
                        <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium text-white text-xs sm:text-sm">{t.symbol}</td>
                        <td className="py-2 sm:py-3 px-1 sm:px-2">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                            t.r >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {t.r.toFixed(2)}R
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium text-red-400 text-xs sm:text-sm">{formatMoney(t.pnl)}</td>
                        <td className="py-2 sm:py-3 px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">{t.strategy}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            </div>
          </EnhancedTableCard>
        </div>


          {/* AI Trading Coach Component */}
          <CoachAi kpis={kpis} filtered={filtered} currencyFormatter={formatMoney} />
        </div>
      </main>
    </div>
  );
}

// -----------------------
// 🧩 ENHANCED UI COMPONENTS
// -----------------------
function ProfessionalKPICard({ title, value, subtitle, icon: Icon, trend, color, change, description }) {
  const getTrendIcon = () => {
    if (trend === "positive") return <ArrowUpRight className="w-4 h-4 text-green-400" />;
    if (trend === "negative") return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return null;
  };

  return (
    <motion.div
      className="group relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="relative">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
            </div>
            {change && (
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{change}</span>
              </div>
            )}
          </div>
          {getTrendIcon()}
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">{title}</div>
            <div className="text-xs text-gray-500 bg-gray-700/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              {trend === "positive" ? "Good" : trend === "negative" ? "Poor" : "Neutral"}
            </div>
          </div>
          
          <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white mb-1">{value}</div>
          
          <div className="text-xs sm:text-sm text-gray-400 font-medium">{subtitle}</div>
          
          <div className="text-xs text-gray-500 leading-relaxed hidden sm:block">{description}</div>
        </div>
      </div>
    </motion.div>
  );
}

function EnhancedKPICard({ title, value, subtitle, icon: Icon, trend, color }) {
  const getTrendIcon = () => {
    if (trend === "positive") return <ArrowUpRight className="w-4 h-4 text-green-400" />;
    if (trend === "negative") return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return null;
  };

  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {getTrendIcon()}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-400 mb-1">{title}</div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
    </motion.div>
  );
}

function EnhancedChartCard({ title, description, icon: Icon, children }) {
  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/20">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm sm:text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <div className="h-[250px]">{children}</div>
    </motion.div>
  );
}

function EnhancedTableCard({ title, description, icon: Icon, children }) {
  return (
    <motion.div
      className="bg-gray-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/20">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-sm sm:text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}
