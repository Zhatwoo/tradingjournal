'use client';

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import OverallPerf from "../components/OverallPerf";
import Footer from "../components/Footer";
import ProtectedRoute from '../components/ProtectedRoute';

export default function OverallPerfPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const mobile = width < 1024;
        setIsMobile(mobile);
        setSidebarOpen(!mobile);
      }
    };
    checkScreenSize();
    
    const handleResize = () => {
      checkScreenSize();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Auth check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
      } else {
        setUser(currentUser);
      }
    });
    return unsubscribe;
  }, [router]);

  // Load trades
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
      
      // Transform trades to match OverallPerf expected format
      const transformedTrades = fetchedTrades.map(trade => ({
        id: trade.id,
        date: trade.date,
        symbol: trade.symbol,
        side: trade.tradeDirection,
        r: trade.profit / 1000, // Convert to R-multiple (assuming 1000 as risk unit)
        pnl: trade.profit,
        strategy: trade.notes || "General", // Use notes as strategy or default
        session: "General" // Default session
      }));
      
      setTrades(transformedTrades);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
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
          active="Overall Performance"
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-16'} ml-0 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 overflow-x-hidden min-h-screen`}>
          <OverallPerf trades={trades} startingBalance={12000} />
        </div>
      </div>

      <Footer 
        sidebarOpen={sidebarOpen} 
        isMobile={isMobile}
        hasSidebar={true}
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
    </ProtectedRoute>
  );
}
