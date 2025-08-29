"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar"; // adjust path if needed

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Hamburger button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-blue-600 text-white rounded-lg shadow-md"
        >
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="text-2xl font-bold mt-6">Trading Journal Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome! Here’s your main dashboard content.
        </p>
      </div>
    </div>
  );
}
