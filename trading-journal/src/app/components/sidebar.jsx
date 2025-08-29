"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  BarChart3,
  TrendingUp,
  Menu,
  BookOpen,
} from "lucide-react";
import Sidebar from "../components/Sidebar"; // adjust path

// 🔹 Sample Data
const equityData = [
  { day: "Mon", balance: 1000 },
  { day: "Tue", balance: 1200 },
  { day: "Wed", balance: 1150 },
  { day: "Thu", balance: 1450 },
  { day: "Fri", balance: 1600 },
];

const monthlyData = [
  { month: "Jan", pnl: 200 },
  { month: "Feb", pnl: -100 },
  { month: "Mar", pnl: 400 },
  { month: "Apr", pnl: 250 },
];

const distributionData = [
  { name: "Long", value: 60 },
  { name: "Short", value: 40 },
];

const COLORS = ["#3B82F6", "#EF4444"]; // blue & red

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-red-950 p-6 space-y-8 text-white">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Hamburger button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white">Trading Journal Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-900/80 p-6 rounded-2xl shadow-md flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <TrendingUp className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Total PnL</p>
            <p className="text-lg font-bold text-green-400">+$1,230</p>
          </div>
        </div>

        <div className="bg-red-900/80 p-6 rounded-2xl shadow-md flex items-center gap-4">
          <div className="p-3 bg-red-600/20 rounded-lg">
            <ClipboardList className="text-red-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Trades Taken</p>
            <p className="text-lg font-bold text-white">54</p>
          </div>
        </div>

        <div className="bg-blue-900/80 p-6 rounded-2xl shadow-md flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <BarChart3 className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Win Rate</p>
            <p className="text-lg font-bold text-yellow-400">64%</p>
          </div>
        </div>

        <div className="bg-red-900/80 p-6 rounded-2xl shadow-md flex items-center gap-4">
          <div className="p-3 bg-red-600/20 rounded-lg">
            <ArrowDownRight className="text-red-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Loss Streak</p>
            <p className="text-lg font-bold text-red-400">-3</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        <div className="bg-blue-900/80 p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Equity Curve</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={equityData}>
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Performance */}
        <div className="bg-red-900/80 p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Monthly Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Bar dataKey="pnl" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution + Journal Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Distribution */}
        <div className="bg-blue-900/80 p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Trade Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={distributionData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Journal Notes */}
        <div className="bg-white/5 p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-400" /> Journal Notes
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-slate-900/60 rounded-lg">
              <p className="text-gray-300 text-sm">
                📝 Learned to be patient on EUR/USD, waited for confirmation.
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg">
              <p className="text-gray-300 text-sm">
                📌 Overtraded GBP/JPY today, need to stick to plan.
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg">
              <p className="text-gray-300 text-sm">
                ✅ Gold breakout worked perfectly, followed rules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
