'use client';

import { useRouter } from "next/navigation";
import { User, Settings, Lightbulb, PlusCircle } from "lucide-react";

export default function DashboardHeader({ username = "Trader", balance = 12500, dailyPnL = 320 }) {
  const router = useRouter();

  const handleProfile = () => router.push("/profile");
  const handleSettings = () => router.push("/settings");
  const handleSuggestions = () => router.push("/suggestions");
  const handleAddTrade = () => router.push("/dashboard/add-trade");

  return (
    <header className="bg-gray-900 text-white border-b border-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-2 px-4 sm:px-6 gap-4">

        {/* Profile Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base">
            {username[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{username}</span>
            <span className="text-gray-400 text-xs">Trader</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-gray-400 text-xs block uppercase">Balance</span>
            <span className="font-semibold text-sm">${balance.toLocaleString()}</span>
          </div>
          <div className="text-center">
            <span className="text-gray-400 text-xs block uppercase">P&L</span>
            <span className={`font-semibold text-sm ${dailyPnL >= 0 ? "text-green-400" : "text-red-500"}`}>
              ${dailyPnL.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleAddTrade}
            className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 hover:bg-green-500 transition text-xs"
          >
            <PlusCircle size={16} /> Add
          </button>
          <button
            onClick={handleProfile}
            className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 transition text-xs"
          >
            <User size={16} />
          </button>
          <button
            onClick={handleSettings}
            className="flex items-center gap-1 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 transition text-xs"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={handleSuggestions}
            className="flex items-center gap-1 px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-500 transition text-xs"
          >
            <Lightbulb size={16} />
          </button>
        </div>

      </div>
    </header>
  );
}
