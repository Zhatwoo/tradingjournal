'use client';

import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/Sidebar";
import { Line } from "react-chartjs-2";

// Chart.js imports
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

// Register Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Modal state
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

  // Check screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) router.push("/auth/login");
      else setUser(currentUser);
    });
    return unsubscribe;
  }, [router]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      setFormData({ ...formData, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Auto-calculate profit
    if (name === "entry" || name === "exit") {
      const entry = name === "entry" ? Number(value) : Number(formData.entry);
      const exit = name === "exit" ? Number(value) : Number(formData.exit);
      if (!isNaN(entry) && !isNaN(exit)) {
        setFormData((prev) => ({ ...prev, profit: exit - entry }));
      }
    }
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Trade added:", formData);
    setRecentTrades(prev => [...prev, { 
      symbol: formData.symbol, 
      entry: Number(formData.entry), 
      exit: Number(formData.exit), 
      profit: Number(formData.profit),
      notes: formData.notes,
      image: formData.image
    }]);
    setShowModal(false);
    setFormData({ symbol: "", entry: "", exit: "", profit: "", notes: "", image: null });
    setImagePreview(null);
  };

  // Metrics
  const dailyPnL = 320;
  const metrics = [
    { label: "Balance", value: 12500, color: "text-white", prefix: "$" },
    { label: "Today's P&L", value: dailyPnL, color: dailyPnL >= 0 ? "text-green-400" : "text-red-500", prefix: "$" },
    { label: "Open Trades", value: 4, color: "text-white" },
    { label: "Winning %", value: 75, color: "text-green-400", suffix: "%" },
  ];

  // Chart data
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Portfolio Value",
        data: [12000, 12300, 12500, 12400, 12700, 12900, 13100],
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#6366F1",
        tension: 0.3,
        pointBackgroundColor: "#6366F1",
        pointBorderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#d1d5db',
        bodyColor: '#d1d5db',
        borderColor: '#4b5563',
        borderWidth: 1,
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { 
        beginAtZero: false, 
        grid: { color: 'rgba(75, 85, 99, 0.3)' },
        ticks: { color: "#d1d5db", callback: val => '$' + val.toLocaleString() }
      },
      x: { grid: { color: 'rgba(75, 85, 99, 0.3)' }, ticks: { color: "#d1d5db" } },
    },
  };

  // Recent trades state
  const [recentTrades, setRecentTrades] = useState([
    { symbol: "BTC/USD", entry: 27000, exit: 27500, profit: 500 },
    { symbol: "ETH/USD", entry: 1800, exit: 1750, profit: -50 },
    { symbol: "SOL/USD", entry: 23, exit: 25, profit: 2 },
    { symbol: "AAPL", entry: 150, exit: 155, profit: 5 },
  ]);

  // Trade summary calculations
  const totalTrades = recentTrades.length;
  const totalPL = recentTrades.reduce((acc, trade) => acc + trade.profit, 0);
  const winningTrades = recentTrades.filter(trade => trade.profit > 0).length;
  const losingTrades = recentTrades.filter(trade => trade.profit < 0).length;
  const averageProfit = totalTrades ? (totalPL / totalTrades).toFixed(2) : 0;
  const winRate = totalTrades ? ((winningTrades / totalTrades) * 100).toFixed(1) : 0;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">

      {/* Sidebar */}
      <Sidebar
        username={user?.email || "Trader"}
        active="Dashboard"
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? 'md:ml-64' : 'md:ml-0'} ml-0 p-6`}>

        {/* Header + Add Trade Button */}
        <div className="flex justify-between items-center mb-6">
          <DashboardHeader
            username={user?.email || "Trader"}
            balance={metrics[0].value}
            dailyPnL={metrics[1].value}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow ml-4"
          >
            Add Trade
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow flex flex-col">
              <span className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">{metric.label}</span>
              <span className={`font-bold text-lg sm:text-xl md:text-2xl ${metric.color} mt-1`}>
                {metric.prefix || ""}{metric.value.toLocaleString()}{metric.suffix || ""}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Portfolio Chart */}
          <div className="bg-gray-800 p-4 rounded-lg shadow w-full lg:w-2/3">
            <h2 className="text-lg font-semibold mb-4">Portfolio Performance</h2>
            <div className="h-64 sm:h-72 md:h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-gray-800 p-4 rounded-lg shadow w-full lg:w-1/3">
            <h2 className="text-lg font-semibold mb-4">Recent Trades</h2>
            {recentTrades.length === 0 ? (
              <p className="text-gray-400">No trades yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentTrades.map((trade, i) => (
                  <div key={i} className="bg-gray-700 p-3 rounded-lg flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{trade.symbol}</span>
                      <span className={`text-sm font-bold ${trade.profit >= 0 ? "text-green-400" : "text-red-500"}`}>
                        {trade.profit >= 0 ? "+" : ""}${trade.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                      <div>Entry: ${trade.entry.toLocaleString()}</div>
                      <div>Exit: ${trade.exit.toLocaleString()}</div>
                    </div>
                    {trade.notes && <div className="text-gray-400 text-xs mt-1">Notes: {trade.notes}</div>}
                    {trade.image && <img src={URL.createObjectURL(trade.image)} alt="Trade" className="mt-1 h-20 object-contain rounded" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

{/* Trade History */}
<div className="bg-gray-800 p-4 rounded-lg shadow mt-6">
  <h2 className="text-lg font-semibold mb-4">Trade History</h2>
  {recentTrades.length === 0 ? (
    <p className="text-gray-400">No trades yet</p>
  ) : (
    <div className="overflow-x-auto max-h-96">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr className="text-left text-gray-400 text-xs sm:text-sm uppercase">
            <th className="px-3 py-2">Symbol</th>
            <th className="px-3 py-2">Entry</th>
            <th className="px-3 py-2">Exit</th>
            <th className="px-3 py-2">Profit</th>
            <th className="px-3 py-2">Notes</th>
            <th className="px-3 py-2">Image</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {recentTrades.map((trade, i) => (
            <tr key={i} className="text-sm text-gray-300">
              <td className="px-3 py-2 font-semibold">{trade.symbol}</td>
              <td className="px-3 py-2">${trade.entry.toLocaleString()}</td>
              <td className="px-3 py-2">${trade.exit.toLocaleString()}</td>
              <td className={`px-3 py-2 font-bold ${trade.profit >= 0 ? "text-green-400" : "text-red-500"}`}>
                {trade.profit >= 0 ? "+" : ""}${trade.profit.toLocaleString()}
              </td>
              <td className="px-3 py-2">{trade.notes || "-"}</td>
              <td className="px-3 py-2">
                {trade.image ? (
                  <img src={URL.createObjectURL(trade.image)} alt="Trade" className="h-10 w-10 object-contain rounded" />
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
        {/* Add Trade Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-gray-800 p-6 rounded-lg w-11/12 md:w-1/2 lg:w-1/3">
              <h2 className="text-lg font-semibold mb-4">Add Trade</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input type="text" name="symbol" placeholder="Symbol (e.g., BTC/USD)" value={formData.symbol} onChange={handleChange} className="p-2 rounded bg-gray-700 text-white" required />
                <input type="number" name="entry" placeholder="Entry Price" value={formData.entry} onChange={handleChange} className="p-2 rounded bg-gray-700 text-white" required />
                <input type="number" name="exit" placeholder="Exit Price" value={formData.exit} onChange={handleChange} className="p-2 rounded bg-gray-700 text-white" required />
                <input type="number" name="profit" placeholder="Profit / Loss" value={formData.profit} readOnly className="p-2 rounded bg-gray-600 text-white" />
                <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} className="p-2 rounded bg-gray-700 text-white" />
                <input type="file" name="image" accept="image/*" onChange={handleChange} className="text-gray-400" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full h-40 object-contain rounded" />}
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white">Add Trade</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
