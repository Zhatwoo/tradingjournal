"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, ClipboardList, BarChart3, TrendingUp } from "lucide-react";

const sampleData = [
  { date: "Mon", pnl: 200 },
  { date: "Tue", pnl: -50 },
  { date: "Wed", pnl: 100 },
  { date: "Thu", pnl: 300 },
  { date: "Fri", pnl: -120 },
];

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-white">📊 Trading Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total PnL */}
        <div className="bg-slate-900/90 border border-blue-600 p-6 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <TrendingUp className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Total PnL</p>
            <p className="text-xl font-bold text-blue-400">+$430</p>
          </div>
        </div>

        {/* Trades Taken */}
        <div className="bg-slate-900/90 border border-white/30 p-6 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <ClipboardList className="text-white w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Trades Taken</p>
            <p className="text-xl font-bold text-white">24</p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900/90 border border-blue-600 p-6 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <BarChart3 className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Win Rate</p>
            <p className="text-xl font-bold text-blue-400">62%</p>
          </div>
        </div>

        {/* Loss Streak */}
        <div className="bg-slate-900/90 border border-red-600 p-6 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="p-3 bg-red-600/20 rounded-lg">
            <ArrowDownRight className="text-red-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Loss Streak</p>
            <p className="text-xl font-bold text-red-400">-3</p>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-slate-900/90 border border-white/10 p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4">Performance Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampleData}>
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                color: "#fff",
              }}
            />
            <Line type="monotone" dataKey="pnl" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: "#EF4444" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Trades */}
      <div className="bg-slate-900/90 border border-white/10 p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Trades</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-lg border border-blue-600/40">
            <span className="text-gray-200">EUR/USD Long</span>
            <span className="text-blue-400 flex items-center gap-1">
              +$120 <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-lg border border-red-600/40">
            <span className="text-gray-200">GBP/USD Short</span>
            <span className="text-red-400 flex items-center gap-1">
              -$50 <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-lg border border-blue-600/40">
            <span className="text-gray-200">XAU/USD Long</span>
            <span className="text-blue-400 flex items-center gap-1">
              +$300 <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
