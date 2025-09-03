'use client';

import { useEffect, useState } from "react";
import { auth, db, storage } from "../lib/firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/Sidebar";
import AddTradeModal from '../components/AddTrade';
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
    profit: "",
    notes: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);

  const [startingBalance, setStartingBalance] = useState(12000);

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
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
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
        profit: Number(formData.profit),
        notes: formData.notes,
        image: imageUrl,
        date: new Date().toISOString(),
      });

      setFormData({ symbol: "", entry: "", exit: "", profit: "", notes: "", image: null });
      setImagePreview(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error adding trade:", error);
    }
  };

  // -----------------------------
  // CALCULATED VARIABLES
  // -----------------------------
  const dailyPnL = recentTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0);
  const currentBalance = startingBalance + dailyPnL;

  const metrics = [
    { label: "Starting Balance", value: startingBalance, color: "text-white", editable: true },
    { label: "Current Balance", value: currentBalance, color: currentBalance >= 0 ? "text-green-400" : "text-red-500", prefix: "$" },
    { label: "Today's P&L", value: dailyPnL, color: dailyPnL >= 0 ? "text-green-400" : "text-red-500", prefix: "$" },
    { label: "Trades", value: recentTrades.length, color: "text-white" },
    { label: "Winning %", value: recentTrades.length > 0
        ? ((recentTrades.filter(t => t.profit > 0).length / recentTrades.length) * 100).toFixed(1)
        : 0,
      color: "text-green-400", suffix: "%" },
  ];

  const chartData = {
    labels: recentTrades.map((t) => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: "Portfolio Value",
        data: recentTrades.reduce((acc, t, i) => {
          const last = acc[i - 1] || startingBalance;
          return [...acc, last + (t.profit || 0)];
        }, []),
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#6366F1",
        tension: 0.3,
        pointBackgroundColor: "#6366F1",
        pointBorderColor: "#fff",
      },
    ],
  };

  const chartOptions = { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false };

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
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
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
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? 'md:ml-64' : 'md:ml-16'} ml-0 p-3 sm:p-4 md:p-5 lg:p-6`}>

          {/* Header + Add Trade */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <DashboardHeader
              username={user?.email || "Trader"}
              balance={currentBalance}
              dailyPnL={dailyPnL}
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            />
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-xl shadow-lg font-semibold hover:scale-105 transition transform duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Trade
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {metrics.map((m, i) => (
              <div key={i} className="bg-gray-800/70 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-gray-700/50 hover:shadow-xl transition-all duration-300">
                <p className="text-gray-400 text-sm mb-1">{m.label}</p>
                {m.editable ? (
                  <input
                    type="number"
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(Number(e.target.value))}
                    className="text-2xl font-bold text-white bg-gray-900/50 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <p className={`text-2xl font-bold ${m.color}`}>
                    {m.prefix || ""}{m.value.toLocaleString()}{m.suffix || ""}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Chart + Calendar + Trade History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Portfolio Chart */}
            <div className="bg-gray-800/70 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-gray-700/50 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                Portfolio Performance
              </h2>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Monthly P&L Calendar */}
            <div className="bg-gray-800/70 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Daily P&L Calendar
              </h2>

              {/* Month & Year Navigation */}
              <div className="flex justify-between mb-4 items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (selectedMonth === 0) {
                        setSelectedMonth(11);
                        setSelectedYear(prev => prev - 1);
                      } else setSelectedMonth(prev => prev - 1);
                    }}
                    className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <span className="font-semibold px-2 py-1 bg-gray-700/50 rounded-lg">
                    {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}
                  </span>

                  <button
                    onClick={() => {
                      if (selectedMonth === 11) {
                        setSelectedMonth(0);
                        setSelectedYear(prev => prev + 1);
                      } else setSelectedMonth(prev => prev + 1);
                    }}
                    className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-gray-700/50 text-white px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-400 p-1">{day}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={idx} className="h-12"></div>; // empty slot

                  const dayTrades = tradesInMonth.filter(trade => new Date(trade.date).getDate() === day);
                  const dayPnL = dayTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
                  const isToday = day === todayDate && selectedMonth === todayMonth && selectedYear === todayYear;

                  return (
                    <div
                      key={day}
                      className={`h-12 flex flex-col items-center justify-center text-xs font-semibold rounded cursor-pointer transition-all duration-200 hover:scale-105 border ${
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
                      <span className="font-bold">{day}</span>
                      <span className="text-[10px]">{dayPnL >= 0 ? "+" : ""}{dayPnL}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trade History Table */}
            <div className="bg-gray-800/70 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-gray-700/50 overflow-x-auto">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Trade History
              </h2>
              {recentTrades.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No trades yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700/50">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm text-gray-400 font-medium">Symbol</th>
                        <th className="px-4 py-2 text-left text-sm text-gray-400 font-medium">Entry</th>
                        <th className="px-4 py-2 text-left text-sm text-gray-400 font-medium">Exit</th>
                        <th className="px-4 py-2 text-left text-sm text-gray-400 font-medium">Profit</th>
                        <th className="px-4 py-2 text-left text-sm text-gray-400 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                      {recentTrades.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                          <td className="px-4 py-3 font-medium">{t.symbol}</td>
                          <td className="px-4 py-3">${t.entry}</td>
                          <td className="px-4 py-3">${t.exit}</td>
                          <td className={`px-4 py-3 font-semibold ${t.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {t.profit >= 0 ? "+" : ""}${t.profit}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{t.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Day Trades Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Trades for Day {selectedDay}</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-gray-400">Symbol</th>
                        <th className="px-4 py-2 text-gray-400">Entry</th>
                        <th className="px-4 py-2 text-gray-400">Exit</th>
                        <th className="px-4 py-2 text-gray-400">Profit</th>
                        <th className="px-4 py-2 text-gray-400">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDayTrades.map((t) => (
                        <tr key={t.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="px-4 py-3 font-medium">{t.symbol}</td>
                          <td className="px-4 py-3">${t.entry}</td>
                          <td className="px-4 py-3">${t.exit}</td>
                          <td className={`px-4 py-3 font-semibold ${t.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {t.profit >= 0 ? "+" : ""}${t.profit}
                          </td>
                          <td className="px-4 py-3 text-gray-400">{t.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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
      `}</style>
    </div>
  );
}