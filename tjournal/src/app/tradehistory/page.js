'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc, getDoc } from 'firebase/firestore';
import TradeHistory from "../components/TradeHistory";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { ArrowLeft } from 'lucide-react';

export default function TradeHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Load user preferences (currency, etc.) from users collection
  const loadUserPreferences = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserSettings(userData.settings || { display: { currency: 'USD' } });
      } else {
        setUserSettings({ display: { currency: 'USD' } });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setUserSettings({ display: { currency: 'USD' } });
    }
  };

  // Dynamic currency formatter based on user settings
  const formatCurrency = (n, currency = 'USD') => {
    const currencyMap = {
      'USD': { locale: 'en-US', currency: 'USD' },
      'EUR': { locale: 'en-EU', currency: 'EUR' },
      'GBP': { locale: 'en-GB', currency: 'GBP' },
      'JPY': { locale: 'ja-JP', currency: 'JPY' }
    };
    
    const config = currencyMap[currency] || currencyMap['USD'];
    return n.toLocaleString(config.locale, { 
      style: "currency", 
      currency: config.currency, 
      maximumFractionDigits: currency === 'JPY' ? 0 : 2 
    });
  };

  // Helper function to format currency with user's preferred currency
  const formatMoney = (amount) => {
    const currency = userSettings?.display?.currency || 'USD';
    return formatCurrency(amount, currency);
  };

  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        setSidebarOpen(!mobile);
      }
    };
    checkScreenSize();
    
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 150);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedResize);
      return () => {
        window.removeEventListener('resize', debouncedResize);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) router.push("/auth/login");
      else {
        setUser(currentUser);
        loadUserPreferences();
      }
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
      setTrades(fetchedTrades);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDeleteClick = (trade) => {
    setTradeToDelete(trade);
    setDeleteModalOpen(true);
  };

  const handleDeleteTrade = async (tradeId) => {
    if (!user) return;
    
    // Find the trade to delete
    const trade = trades.find(t => t.id === tradeId);
    if (trade) {
      setTradeToDelete(trade);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tradeToDelete || !user) return;
    
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "trades1", tradeToDelete.id));
      setDeleteModalOpen(false);
      setTradeToDelete(null);
    } catch (error) {
      console.error("Error deleting trade:", error);
      alert("Error deleting trade. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setTradeToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trade history...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

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
          active="Trade History"
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-16'} ml-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-h-screen`}>
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Trade History</h1>
                <p className="text-gray-400 text-sm sm:text-base">View and manage all your trading records</p>
              </div>
            </div>
          </div>

          {/* Trade History Component */}
          <TradeHistory 
            trades={trades} 
            onDeleteTrade={handleDeleteTrade}
            currencyFormatter={formatMoney}
            deleteModalOpen={deleteModalOpen}
            deleteLoading={deleteLoading}
            onDeleteClick={handleDeleteClick}
            onDeleteCancel={handleDeleteCancel}
          />
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Trade"
        message="Are you sure you want to delete this trade? This action cannot be undone."
        itemName={tradeToDelete ? `${tradeToDelete.symbol} - ${tradeToDelete.profit >= 0 ? 'Profit' : 'Loss'} $${Math.abs(tradeToDelete.profit).toFixed(2)}` : ''}
        itemType="trade"
        loading={deleteLoading}
        destructive={true}
      />
    </div>
  );
}
