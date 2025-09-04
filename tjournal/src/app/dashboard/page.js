'use client';

import { useEffect, useState, useMemo } from "react";
import { auth, db, storage } from "../lib/firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/Sidebar";
import AddTradeModal from '../components/AddTrade';
import TradeHistory from '../components/TradeHistory';
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();

  // -----------------------------
  // STATE VARIABLES
  // -----------------------------
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    entry: "",
    exit: "",
    lotSize: "",
    profit: "",
    notes: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);

  const [startingBalance, setStartingBalance] = useState(12000);
  const [lastResetDate, setLastResetDate] = useState(new Date().toISOString());

  // -----------------------------
  // Modal for daily trades
  // -----------------------------
  const [selectedDayTrades, setSelectedDayTrades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // -----------------------------
  // Month & Year for Calendar
  // -----------------------------
  const now = new Date();
  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(todayMonth);
  const [selectedYear, setSelectedYear] = useState(todayYear);

  // -----------------------------
  // EFFECTS
  // -----------------------------
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // Changed from 768 to 1024 for better tablet support
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkScreenSize();
    
    // Debounce resize events for better performance
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 150);
    };
    
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) router.push("/auth/login");
      else setUser(currentUser);
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "trades1"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTrades = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentTrades(fetchedTrades);
    });
    return () => unsubscribe();
  }, [user]);

  // -----------------------------
  // HANDLERS
  // -----------------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files[0]) {
      setFormData({ ...formData, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === "entry" || name === "exit") {
      const entry = name === "entry" ? Number(value) : Number(formData.entry);
      const exit = name === "exit" ? Number(value) : Number(formData.exit);
      if (!isNaN(entry) && !isNaN(exit)) {
        setFormData((prev) => ({ ...prev, profit: (exit - entry).toFixed(2) }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      let imageUrl = null;
      if (formData.image) {
        const storageRef = ref(storage, `trades1/${user.uid}/${Date.now()}_${formData.image.name}`);
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "trades1"), {
        userId: user.uid,
        symbol: formData.symbol,
        entry: Number(formData.entry),
        exit: Number(formData.exit),
        lotSize: Number(formData.lotSize),
        profit: Number(formData.profit),
        notes: formData.notes,
        image: imageUrl,
        date: new Date().toISOString(),
      });

      setFormData({ symbol: "", entry: "", exit: "", lotSize: "", profit: "", notes: "", image: null });
      setImagePreview(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error adding trade:", error);
    }
  };

  // Add delete handler function
  const handleDeleteTrade = async (tradeId) => {
    if (!user) return;
    
    try {
      // Confirm deletion
      if (window.confirm("Are you sure you want to delete this trade?")) {
        await deleteDoc(doc(db, "trades1", tradeId));
        console.log("Trade deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting trade:", error);
      alert("Error deleting trade. Please try again.");
    }
  };

  // Reset starting balance to current balance for new period tracking
  const handleResetBalance = () => {
    if (window.confirm("Reset starting balance to current balance? This will start tracking a new growth period.")) {
      setStartingBalance(currentBalance);
      setLastResetDate(new Date().toISOString());
    }
  };

  // -----------------------------
  // CALCULATED VARIABLES
  // -----------------------------
  const dailyPnL = recentTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0);
  const currentBalance = startingBalance + dailyPnL;
  
  // Calculate equity curve starting from zero to show growth
  // Sort trades by date (oldest first) for proper equity curve calculation
  const sortedTrades = [...recentTrades].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Enhanced growth metrics
  const totalGrowth = currentBalance - startingBalance;
  const growthPercentage = startingBalance > 0 ? (totalGrowth / startingBalance) * 100 : 0;
  const periodGrowth = totalGrowth; // Growth since last reset
  
  // Calculate best and worst days
  const dailyPnLs = recentTrades.reduce((acc, trade) => {
    const date = new Date(trade.date).toLocaleDateString();
    if (!acc[date]) acc[date] = 0;
    acc[date] += trade.profit || 0;
    return acc;
  }, {});
  
  const bestDay = Object.entries(dailyPnLs).reduce((best, [date, pnl]) => 
    pnl > best.pnl ? { date, pnl } : best, { date: '', pnl: -Infinity }
  );
  
  const worstDay = Object.entries(dailyPnLs).reduce((worst, [date, pnl]) => 
    pnl < worst.pnl ? { date, pnl } : worst, { date: '', pnl: Infinity }
  );
  
  // Calculate drawdown (maximum loss from peak)
  const runningBalances = sortedTrades.reduce((acc, t, i) => {
    const previousBalance = acc[i - 1] || startingBalance;
    const newBalance = previousBalance + (t.profit || 0);
    return [...acc, newBalance];
  }, []);
  
  const peakBalance = Math.max(...runningBalances, startingBalance);
  const currentDrawdown = peakBalance - currentBalance;
  const maxDrawdown = Math.max(...runningBalances.map(balance => peakBalance - balance), 0);

  const metrics = [
    { label: "Starting Balance", value: startingBalance, color: "text-white", editable: true },
    { label: "Current Balance", value: currentBalance, color: currentBalance >= 0 ? "text-green-400" : "text-red-500", prefix: "$" },
    { label: "Period Growth", value: periodGrowth, color: periodGrowth >= 0 ? "text-green-400" : "text-red-500", prefix: "$" },
    { label: "Growth %", value: growthPercentage, color: growthPercentage >= 0 ? "text-green-400" : "text-red-500", suffix: "%" },
    { label: "Trades", value: recentTrades.length, color: "text-white" },
  ];

  const equityCurve = sortedTrades.reduce((acc, t, i) => {
    const previousEquity = acc[i - 1] || 0;
    const newEquity = previousEquity + (t.profit || 0);
    return [...acc, newEquity];
  }, []);

  const chartData = {
    labels: sortedTrades.map((t) => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: "Equity Growth",
        data: equityCurve,
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#6366F1",
        tension: 0.3,
        pointBackgroundColor: "#6366F1",
        pointBorderColor: "#fff",
      },
    ],
  };

     const chartOptions = useMemo(() => ({ 
     plugins: { 
       legend: { 
         display: true,
         labels: {
           color: '#ffffff',
           font: {
             size: window.innerWidth < 768 ? 10 : 12
           }
         }
       } 
     }, 
     responsive: true, 
     maintainAspectRatio: false,
     interaction: {
       intersect: false,
       mode: 'index'
     },
     scales: {
       y: {
         beginAtZero: true,
         ticks: {
           color: '#ffffff',
           font: {
             size: window.innerWidth < 768 ? 10 : 12
           },
           maxTicksLimit: window.innerWidth < 768 ? 5 : 8,
           callback: function(value) {
             return '$' + value.toLocaleString();
           }
         },
         grid: {
           color: 'rgba(255, 255, 255, 0.1)'
         }
       },
       x: {
         ticks: {
           color: '#ffffff',
           font: {
             size: window.innerWidth < 768 ? 10 : 12
           },
           maxTicksLimit: window.innerWidth < 768 ? 6 : 10
         },
         grid: {
           color: 'rgba(255, 255, 255, 0.1)'
         }
       }
     }
   }), [isMobile]);

  // -----------------------------
  // Monthly P&L Calendar
  // -----------------------------
  const tradesInMonth = recentTrades.filter(trade => {
    const date = new Date(trade.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay(); // 0=Sun ... 6=Sat
  const calendarDays = Array.from({ length: firstDayOfMonth }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const availableYears = Array.from(new Set(recentTrades.map(t => new Date(t.date).getFullYear()))).sort((a, b) => b - a);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // -----------------------------
  // RENDER
  // -----------------------------
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
          active="Dashboard"
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />

                 {/* Main content */}
         <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-16'} ml-0 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 overflow-x-hidden`}>

          {/* ========================================
               HEADER SECTION
          ========================================= */}
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <DashboardHeader
                username={user?.email || "Trader"}
                balance={currentBalance}
                dailyPnL={dailyPnL}
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              />
              <div className="flex justify-center sm:justify-end">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-3 rounded-xl shadow-lg font-semibold hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-xl text-sm sm:text-base min-h-[44px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Add New Trade</span>
                  <span className="sm:hidden">Add Trade</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================
               KEY METRICS SECTION
          ========================================= */}
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Key Performance Metrics
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {metrics.map((m, i) => (
                <div key={i} className="bg-gray-800/80 backdrop-blur-lg p-3 sm:p-4 lg:p-5 rounded-xl shadow-lg border border-gray-700/50 hover:shadow-xl transition-all duration-300 group min-h-[100px] sm:min-h-[120px]">
                  <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 font-medium leading-tight">{m.label}</p>
                  {m.editable ? (
                    <input
                      type="number"
                      value={startingBalance}
                      onChange={(e) => setStartingBalance(Number(e.target.value))}
                      className="text-base sm:text-lg lg:text-xl font-bold text-white bg-gray-900/70 rounded-lg px-2 sm:px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 min-h-[40px]"
                    />
                  ) : (
                    <p className={`text-base sm:text-lg lg:text-xl xl:text-2xl font-bold ${m.color} group-hover:scale-105 transition-transform duration-200 leading-tight`}>
                      {m.prefix || ""}{m.value.toLocaleString()}{m.suffix || ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ========================================
               PERFORMANCE INSIGHTS SECTION
          ========================================= */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              Performance Insights
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
                  {recentTrades.length > 0
                    ? ((recentTrades.filter(t => t.profit > 0).length / recentTrades.length) * 100).toFixed(1)
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
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Period Reset</p>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-400"></div>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3 leading-tight">
                  {new Date(lastResetDate).toLocaleDateString()}
                </p>
                <button
                  onClick={handleResetBalance}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 min-h-[36px]"
                >
                  Reset Period
                </button>
              </div>
            </div>
          </div>

          {/* ========================================
               EQUITY CURVE CHART SECTION
          ========================================= */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              Account Growth Equity Curve
            </h2>
            
            <div className="bg-gray-800/80 backdrop-blur-lg p-2 sm:p-3 lg:p-4 xl:p-6 rounded-xl shadow-lg border border-gray-700/50">
              <div className="h-48 sm:h-60 md:h-72 lg:h-80 xl:h-96">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* ========================================
               TRADING ACTIVITY SECTION
          ========================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            
            {/* Monthly P&L Calendar */}
            <div className="bg-gray-800/80 backdrop-blur-lg p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg border border-gray-700/50">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Daily P&L Calendar
              </h2>

              {/* Month & Year Navigation */}
              <div className="flex flex-col sm:flex-row justify-between mb-3 sm:mb-4 items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
                  <button
                    onClick={() => {
                      if (selectedMonth === 0) {
                        setSelectedMonth(11);
                        setSelectedYear(prev => prev - 1);
                      } else setSelectedMonth(prev => prev - 1);
                    }}
                    className="px-3 py-2 bg-gray-700/70 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center justify-center min-h-[40px] min-w-[40px]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <span className="font-semibold px-3 py-2 bg-gray-700/70 rounded-lg text-white text-sm sm:text-base flex items-center justify-center min-h-[40px] flex-1 sm:flex-none">
                    {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}
                  </span>

                  <button
                    onClick={() => {
                      if (selectedMonth === 11) {
                        setSelectedMonth(0);
                        setSelectedYear(prev => prev + 1);
                      } else setSelectedMonth(prev => prev + 1);
                    }}
                    className="px-3 py-2 bg-gray-700/70 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center justify-center min-h-[40px] min-w-[40px]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-gray-700/70 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 text-sm sm:text-base min-h-[40px] w-full sm:w-auto"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-400 p-1 sm:p-2 truncate min-h-[32px] sm:min-h-[36px] flex items-center justify-center">{day}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={idx} className="h-8 sm:h-10 md:h-12 lg:h-14"></div>; // empty slot

                  const dayTrades = tradesInMonth.filter(trade => new Date(trade.date).getDate() === day);
                  const dayPnL = dayTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
                  const isToday = day === todayDate && selectedMonth === todayMonth && selectedYear === todayYear;

                  return (
                    <div
                      key={day}
                      className={`h-8 sm:h-10 md:h-12 lg:h-14 flex flex-col items-center justify-center text-xs font-semibold rounded cursor-pointer transition-all duration-200 hover:scale-105 border ${
                        dayPnL > 0 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        dayPnL < 0 ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        "bg-gray-700/30 text-gray-300 border-gray-600/30"
                      } ${isToday ? "border-yellow-400 border-2" : ""}`}
                      title={`Day ${day}\nTotal P&L: ${dayPnL >= 0 ? "+" : ""}${dayPnL}\nTrades: ${dayTrades.length}`}
                      onClick={() => {
                        if (dayTrades.length === 0) return;
                        setSelectedDayTrades(dayTrades);
                        setSelectedDay(day);
                        setIsModalOpen(true);
                      }}
                    >
                      <span className="font-bold text-xs sm:text-sm leading-none">{day}</span>
                      <span className="text-[8px] sm:text-[10px] leading-none">{dayPnL >= 0 ? "+" : ""}{dayPnL}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================
               TRADE HISTORY SECTION
          ========================================= */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <TradeHistory 
              trades={recentTrades} 
              onDeleteTrade={handleDeleteTrade}
            />
          </div>

          {/* ========================================
               MODALS
          ========================================= */}
          
                     {/* Day Trades Modal */}
           {isModalOpen && (
             <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
               <div className="bg-gray-800/95 backdrop-blur-md p-3 sm:p-4 lg:p-6 rounded-xl shadow-2xl border border-gray-700/50 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-3 sm:mb-4">
                   <h3 className="text-base sm:text-lg font-semibold text-white">Trades for Day {selectedDay}</h3>
                   <button
                     onClick={() => setIsModalOpen(false)}
                     className="text-gray-400 hover:text-white transition-colors duration-200 p-1 min-h-[40px] min-w-[40px] flex items-center justify-center"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
                 <div className="overflow-x-auto -mx-2 sm:mx-0">
                   <table className="w-full text-xs sm:text-sm text-left min-w-[500px] sm:min-w-[600px]">
                     <thead>
                       <tr className="border-b border-gray-700">
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Symbol</th>
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Lot Size</th>
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Entry</th>
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Exit</th>
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Profit</th>
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Notes</th>
                       </tr>
                     </thead>
                     <tbody>
                       {selectedDayTrades.map((t) => (
                         <tr key={t.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-200">
                           <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-white">{t.symbol}</td>
                           <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                             <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs sm:text-sm font-medium">
                               {t.lotSize || "0.01"}
                             </span>
                           </td>
                           <td className="px-2 sm:px-4 py-2 sm:py-3 text-white">${t.entry}</td>
                           <td className="px-2 sm:px-4 py-2 sm:py-3 text-white">${t.exit}</td>
                           <td className={`px-2 sm:px-4 py-2 sm:py-3 font-semibold ${t.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                             {t.profit >= 0 ? "+" : ""}${t.profit}
                           </td>
                           <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 max-w-[150px] truncate">{t.notes || "-"}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
                 <button
                   className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base min-h-[44px]"
                   onClick={() => setIsModalOpen(false)}
                 >
                   Close
                 </button>
               </div>
             </div>
           )}

          {/* Add Trade Modal */}
          <AddTradeModal
            showModal={showModal}
            setShowModal={setShowModal}
            handleSubmit={handleSubmit}
            formData={formData}
            handleChange={handleChange}
            imagePreview={imagePreview}
          />
        </div>
      </div>

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
         
         /* Optimize for very small screens */
         @media (max-width: 374px) {
           .text-\\[8px\\] {
             font-size: 8px;
           }
         }
         
         /* Improve touch targets for mobile */
         @media (max-width: 768px) {
           button, [role="button"] {
             min-height: 44px;
             min-width: 44px;
           }
           
           /* Better spacing for very small screens */
           .grid-cols-1 {
             gap: 0.5rem;
           }
           
           /* Improve calendar readability on small screens */
           .calendar-day {
             min-height: 32px;
             font-size: 10px;
           }
         }
         
         /* Extra small screens optimization */
         @media (max-width: 374px) {
           .text-xs {
             font-size: 10px;
           }
           
           .p-2 {
             padding: 0.25rem;
           }
         }
       `}</style>
    </div>
  );
}

