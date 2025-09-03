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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
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

  // Check screen size
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

  // Auth redirect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) router.push("/auth/login");
      else setUser(currentUser);
    });
    return unsubscribe;
  }, [router]);

  // Fetch trades from "trades1"
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

  // Handle form change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files[0]) {
      setFormData({ ...formData, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Auto-calc profit
    if (name === "entry" || name === "exit") {
      const entry = name === "entry" ? Number(value) : Number(formData.entry);
      const exit = name === "exit" ? Number(value) : Number(formData.exit);
      if (!isNaN(entry) && !isNaN(exit)) {
        setFormData((prev) => ({ ...prev, profit: (exit - entry).toFixed(2) }));
      }
    }
  };

  // Submit trade
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

  const dailyPnL = recentTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0);
  const metrics = [
    { label: "Balance", value: 12500, color: "text-white", prefix: "$" },
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
          const last = acc[i - 1] || 12000;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="flex min-h-screen relative z-10">
        <Sidebar
          username={user?.email || "Trader"}
          active="Dashboard"
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? 'md:ml-64' : 'md:ml-16'} ml-0 p-3 sm:p-4 md:p-5 lg:p-6`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <DashboardHeader
              username={user?.email || "Trader"}
              balance={metrics[0].value}
              dailyPnL={metrics[1].value}
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
                <p className={`text-2xl font-bold ${m.color}`}>
                  {m.prefix || ""}{m.value}{m.suffix || ""}
                </p>
              </div>
            ))}
          </div>

          {/* Chart + Trade History Table */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Portfolio Chart */}
            <div className="bg-gray-800/70 p-4 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Portfolio Performance</h2>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

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
                      <th className="px-3 py-2 text-left text-sm text-gray-400">Date</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-400">Notes</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {recentTrades.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-700/40">
                        <td className="px-3 py-2">{t.symbol}</td>
                        <td className="px-3 py-2">${t.entry}</td>
                        <td className="px-3 py-2">${t.exit}</td>
                        <td className={`px-3 py-2 ${t.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {t.profit >= 0 ? "+" : ""}${t.profit}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-400">{new Date(t.date).toLocaleString()}</td>
                        <td className="px-3 py-2 text-sm">{t.notes || "-"}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this trade?")) {
                                try {
                                  await deleteDoc(doc(db, "trades1", t.id));
                                } catch (error) {
                                  console.error("Failed to delete trade:", error);
                                }
                              }
                            }}
                            className="text-red-500 hover:text-red-400 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
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
