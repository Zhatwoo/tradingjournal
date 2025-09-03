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
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl shadow-lg font-semibold hover:scale-105 transition"
            >
              + Add Trade
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((m, i) => (
              <div key={i} className="bg-gray-800/70 p-4 rounded-xl shadow-lg">
                <p className="text-gray-400 text-sm">{m.label}</p>
                {m.editable ? (
                  <input
                    type="number"
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(Number(e.target.value))}
                    className="text-2xl font-bold text-white bg-gray-900 rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className={`text-2xl font-bold ${m.color}`}>
                    {m.prefix || ""}{m.value}{m.suffix || ""}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Chart + Calendar + Trade History */}
          <div className="grid grid-cols-1 gap-6 mb-6">

            {/* Portfolio Chart */}
            <div className="bg-gray-800/70 p-4 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Portfolio Performance</h2>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Monthly P&L Calendar */}
            <div className="bg-gray-800/70 p-4 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Daily P&L Calendar</h2>

              {/* Month & Year Navigation */}
              <div className="flex justify-between mb-3 items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (selectedMonth === 0) {
                        setSelectedMonth(11);
                        setSelectedYear(prev => prev - 1);
                      } else setSelectedMonth(prev => prev - 1);
                    }}
                    className="px-3 py-1 bg-gray-700 rounded"
                  >
                    Prev
                  </button>

                  <span className="font-semibold">
                    {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}
                  </span>

                  <button
                    onClick={() => {
                      if (selectedMonth === 11) {
                        setSelectedMonth(0);
                        setSelectedYear(prev => prev + 1);
                      } else setSelectedMonth(prev => prev + 1);
                    }}
                    className="px-3 py-1 bg-gray-700 rounded"
                  >
                    Next
                  </button>
                </div>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-2 mb-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-semibold">{day}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={idx}></div>; // empty slot

                  const dayTrades = tradesInMonth.filter(trade => new Date(trade.date).getDate() === day);
                  const dayPnL = dayTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
                  const isToday = day === todayDate && selectedMonth === todayMonth && selectedYear === todayYear;

                  return (
                    <div
                      key={day}
                      className={`h-12 flex flex-col items-center justify-center text-xs font-semibold rounded cursor-pointer transition hover:scale-105 border ${
                        dayPnL > 0 ? "bg-green-500/80 text-white" :
                        dayPnL < 0 ? "bg-red-500/80 text-white" :
                        "bg-gray-700 text-gray-300"
                      } ${isToday ? "border-yellow-400 border-2" : "border-transparent"}`}
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

            {/* Day Trades Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-96 max-h-[80vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">Trades for Day {selectedDay}</h3>
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Entry</th>
                        <th>Exit</th>
                        <th>Profit</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDayTrades.map((t) => (
                        <tr key={t.id} className="border-b border-gray-700">
                          <td>{t.symbol}</td>
                          <td>${t.entry}</td>
                          <td>${t.exit}</td>
                          <td className={`${t.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {t.profit >= 0 ? "+" : ""}${t.profit}
                          </td>
                          <td>{t.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    className="mt-4 bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Trade History Table */}
            <div className="bg-gray-800/70 p-4 rounded-xl shadow-lg overflow-x-auto max-h-96">
              <h2 className="text-lg font-semibold mb-4">Trade History</h2>
              {recentTrades.length === 0 ? (
                <p className="text-gray-400">No trades yet</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-sm text-gray-400">Symbol</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-400">Entry</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-400">Exit</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-400">Profit</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-400">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {recentTrades.map((t) => (
                      <tr key={t.id}>
                        <td className="px-3 py-2">{t.symbol}</td>
                        <td className="px-3 py-2">${t.entry}</td>
                        <td className="px-3 py-2">${t.exit}</td>
                        <td className={`px-3 py-2 ${t.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {t.profit >= 0 ? "+" : ""}${t.profit}
                        </td>
                        <td className="px-3 py-2">{t.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>

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
    </div>
  );
}
