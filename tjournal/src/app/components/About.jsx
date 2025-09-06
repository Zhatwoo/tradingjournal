'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { 
  User, 
  Mail, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Award, 
  Clock,
  DollarSign,
  Activity,
  ArrowLeft,
  Edit3,
  Star,
  TrendingDown,
  Minus
} from 'lucide-react';

export default function About() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    winRate: 0,
    averageWin: 0,
    averageLoss: 0,
    bestTrade: 0,
    worstTrade: 0,
    totalDays: 0,
    tradingStreak: 0
  });

  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        setSidebarOpen(!mobile);
      }
    };
    checkScreenSize();
    
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 150);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedResize);
      return () => {
        window.removeEventListener('resize', debouncedResize);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUserData(currentUser.uid);
        loadTrades(currentUser.uid);
      } else {
        router.push('/auth/login');
      }
    });
    return unsubscribe;
  }, [router]);

  const loadUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadTrades = async (userId) => {
    try {
      const q = query(
        collection(db, 'trades1'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const tradesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrades(tradesData);
      calculateStats(tradesData);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tradesData) => {
    if (tradesData.length === 0) return;

    const totalTrades = tradesData.length;
    const winningTrades = tradesData.filter(trade => trade.profit > 0);
    const losingTrades = tradesData.filter(trade => trade.profit < 0);
    const totalProfit = tradesData.reduce((sum, trade) => sum + (trade.profit || 0), 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const averageWin = winningTrades.length > 0 ? 
      winningTrades.reduce((sum, trade) => sum + trade.profit, 0) / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? 
      losingTrades.reduce((sum, trade) => sum + trade.profit, 0) / losingTrades.length : 0;
    const bestTrade = Math.max(...tradesData.map(trade => trade.profit || 0));
    const worstTrade = Math.min(...tradesData.map(trade => trade.profit || 0));

    // Calculate trading days and streak
    const tradingDates = [...new Set(tradesData.map(trade => 
      new Date(trade.date).toDateString()
    ))];
    const totalDays = tradingDates.length;

    // Calculate current streak
    const sortedDates = tradingDates.sort((a, b) => new Date(b) - new Date(a));
    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
      currentStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i - 1]);
        const previousDate = new Date(sortedDates[i]);
        const diffTime = currentDate - previousDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    setStats({
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalProfit,
      winRate,
      averageWin,
      averageLoss,
      bestTrade,
      worstTrade,
      totalDays,
      tradingStreak: currentStreak
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-purple-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-blue-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <Sidebar
          username={user?.email || "Trader"}
          active="About"
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-16'} ml-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-h-screen`}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Trading Profile</h1>
                <p className="text-gray-400 text-sm sm:text-base">Your comprehensive trading overview</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'T'}
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {user.displayName || 'Trader'}
                </h2>
                <p className="text-gray-400 text-sm mb-4">{user.email}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                  <Calendar size={16} />
                  <span>Member since {formatDate(user.metadata?.creationTime || new Date())}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-400" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Trades</span>
                  <span className="font-semibold">{stats.totalTrades}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Win Rate</span>
                  <span className={`font-semibold ${stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total P&L</span>
                  <span className={`font-semibold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(stats.totalProfit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Trading Days</span>
                  <span className="font-semibold">{stats.totalDays}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Overview */}
            <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-400" />
                Performance Overview
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-green-400" />
                    <span className="text-sm text-gray-400">Winning Trades</span>
                  </div>
                  <p className="text-xl font-bold text-green-400">{stats.winningTrades}</p>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown size={16} className="text-red-400" />
                    <span className="text-sm text-gray-400">Losing Trades</span>
                  </div>
                  <p className="text-xl font-bold text-red-400">{stats.losingTrades}</p>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={16} className="text-blue-400" />
                    <span className="text-sm text-gray-400">Avg Win</span>
                  </div>
                  <p className="text-xl font-bold text-green-400">{formatCurrency(stats.averageWin)}</p>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Minus size={16} className="text-red-400" />
                    <span className="text-sm text-gray-400">Avg Loss</span>
                  </div>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(stats.averageLoss)}</p>
                </div>
              </div>
            </div>

            {/* Trading Records */}
            <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Award size={20} className="text-yellow-400" />
                Trading Records
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div>
                      <p className="text-sm text-gray-400">Best Trade</p>
                      <p className="text-lg font-bold text-green-400">{formatCurrency(stats.bestTrade)}</p>
                    </div>
                    <Star size={24} className="text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div>
                      <p className="text-sm text-gray-400">Current Streak</p>
                      <p className="text-lg font-bold text-blue-400">{stats.tradingStreak} days</p>
                    </div>
                    <Activity size={24} className="text-blue-400" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div>
                      <p className="text-sm text-gray-400">Worst Trade</p>
                      <p className="text-lg font-bold text-red-400">{formatCurrency(stats.worstTrade)}</p>
                    </div>
                    <TrendingDown size={24} className="text-red-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div>
                      <p className="text-sm text-gray-400">Total Days</p>
                      <p className="text-lg font-bold text-purple-400">{stats.totalDays} days</p>
                    </div>
                    <Clock size={24} className="text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity size={20} className="text-purple-400" />
                Recent Trading Activity
              </h3>
              
              {trades.length > 0 ? (
                <div className="space-y-3">
                  {trades.slice(0, 5).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${trade.profit >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <div>
                          <p className="font-medium">{trade.symbol}</p>
                          <p className="text-sm text-gray-400">{formatDate(trade.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                        </p>
                        <p className="text-sm text-gray-400">Lot: {trade.lotSize}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No trading activity yet</p>
                  <p className="text-sm text-gray-500">Start trading to see your activity here</p>
                </div>
              )}
            </div>

            {/* Settings Summary */}
            {userData?.settings && (
              <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Edit3 size={20} className="text-blue-400" />
                  Trading Preferences
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Default Lot Size</span>
                      <span className="font-medium">{userData.settings.trading?.defaultLotSize || '0.01'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Percentage</span>
                      <span className="font-medium">{userData.settings.trading?.riskPercentage || '2'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Currency</span>
                      <span className="font-medium">{userData.settings.display?.currency || 'USD'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timezone</span>
                      <span className="font-medium">{userData.settings.display?.timezone || 'UTC'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date Format</span>
                      <span className="font-medium">{userData.settings.display?.dateFormat || 'MM/DD/YYYY'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Auto-calculate</span>
                      <span className="font-medium">{userData.settings.trading?.autoCalculate ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
        </div>
      </div>

      <Footer 
        sidebarOpen={sidebarOpen} 
        isMobile={isMobile} 
      />

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
