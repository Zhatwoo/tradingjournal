'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Sidebar from '../components/Sidebar';
import AddTradeModal from '../components/AddTrade';
import { ArrowLeft } from 'lucide-react';
import { calculateTradeProfitLoss } from '../utils/forexCalculations';

export default function AddTradePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(true); // Auto-open modal
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    symbol: "",
    entry: "",
    exit: "",
    lotSize: "",
    profit: "",
    notes: "",
    image: null,
    accountType: "STANDARD",
    tradeDirection: "BUY",
    stopLossPips: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

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
      else setUser(currentUser);
    });
    return unsubscribe;
  }, [router]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files[0]) {
      setFormData({ ...formData, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Calculate profit using forex formulas when entry, exit, symbol, lotSize, or tradeDirection changes
    if (name === "entry" || name === "exit" || name === "symbol" || name === "lotSize" || name === "tradeDirection") {
      const entry = name === "entry" ? Number(value) : Number(formData.entry);
      const exit = name === "exit" ? Number(value) : Number(formData.exit);
      const symbol = name === "symbol" ? value : formData.symbol;
      const lotSize = name === "lotSize" ? Number(value) : Number(formData.lotSize);
      const tradeDirection = name === "tradeDirection" ? value : formData.tradeDirection;
      const accountType = formData.accountType || "STANDARD";
      
      if (!isNaN(entry) && !isNaN(exit) && entry > 0 && exit > 0 && symbol && lotSize > 0) {
        try {
          const calculatedProfit = calculateTradeProfitLoss(symbol, entry, exit, lotSize, accountType, tradeDirection);
          setFormData((prev) => ({ ...prev, profit: calculatedProfit.toFixed(2) }));
        } catch (error) {
          console.warn("Error calculating profit:", error);
          // Fallback to simple calculation if forex calculation fails
          const simpleProfit = exit - entry;
          setFormData((prev) => ({ ...prev, profit: simpleProfit.toFixed(2) }));
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
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
        lotSize: Number(formData.lotSize),
        profit: Number(formData.profit),
        notes: formData.notes,
        image: imageUrl,
        date: new Date().toISOString(),
      });

      setFormData({ symbol: "", entry: "", exit: "", lotSize: "", profit: "", notes: "", image: null, accountType: "STANDARD", tradeDirection: "BUY", stopLossPips: "" });
      setImagePreview(null);
      setShowModal(false);
      setMessage({ type: 'success', text: 'Trade added successfully!' });
      
      // Redirect to dashboard after successful trade addition
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error("Error adding trade:", error);
      setMessage({ type: 'error', text: 'Failed to add trade. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/dashboard');
  };

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
          active="Add Trade"
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
                <h1 className="text-2xl sm:text-3xl font-bold">Add New Trade</h1>
                <p className="text-gray-400 text-sm sm:text-base">Record your trading activity</p>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/10 text-green-300 border-green-500/20' 
                : 'bg-red-500/10 text-red-300 border-red-500/20'
            }`}>
              {message.text}
            </div>
          )}

          {/* Add Trade Modal */}
          <AddTradeModal
            showModal={showModal}
            setShowModal={handleCloseModal}
            handleSubmit={handleSubmit}
            formData={formData}
            handleChange={handleChange}
            imagePreview={imagePreview}
            loading={loading}
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
