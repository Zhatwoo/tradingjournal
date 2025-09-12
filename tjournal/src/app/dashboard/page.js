'use client';

import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from "react";
import { auth, db, storage } from "../lib/firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, deleteDoc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/Sidebar";
import AddTradeModal from '../components/AddTrade';
import TradeHistory from '../components/TradeHistory';
// Lazy load the TradingCalendar component for better performance
const TradingCalendar = lazy(() => import('../components/TradingCalendar'));
import EquityCurve from '../components/EquityCurve';
import PerInsights from '../components/PerInsights';
import Footer from '../components/Footer';
import { Line } from "react-chartjs-2";
import { useTimezone } from '../contexts/TimezoneContext';
import { getDateStringInTimezone, createDateTimeFromDeviceTime } from '../utils/timezoneUtils';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { safeGetFromLocalStorage, safeSetToLocalStorage } from '../utils/safeJsonParse';
import ProtectedRoute from '../components/ProtectedRoute';

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
  
  // Get timezone from context
  const { userTimezone } = useTimezone();

  // -----------------------------
  // STATE VARIABLES
  // -----------------------------
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [userDisplayName, setUserDisplayName] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    entry: "",
    exit: "",
    lotSize: "",
    profit: "",
    riskAmount: "",
    notes: "",
    image: null,
    accountType: "STANDARD",
    tradeDirection: "BUY",
    stopLossPips: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);

  const [startingBalance, setStartingBalance] = useState(12000);
  
  // Smart date range defaults - start from beginning of current month, end today
  const getDefaultDateRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start: startOfMonth.toISOString(),
      end: now.toISOString()
    };
  };
  
  const defaultRange = getDefaultDateRange();
  const [metricsStartDate, setMetricsStartDate] = useState(defaultRange.start);
  const [metricsEndDate, setMetricsEndDate] = useState(defaultRange.end);
  const [selectedDuration, setSelectedDuration] = useState('30D'); // Default to last 30 days

  // -----------------------------
  // Modal for daily trades - with persistence
  // -----------------------------
  const [selectedDayTrades, setSelectedDayTrades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isDayOptionsModalOpen, setIsDayOptionsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // Will be set on client
  const [isClient, setIsClient] = useState(false);

  // Edit trade functionality
  const [editingTrade, setEditingTrade] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Metrics modal functionality
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  
  
  // Trade addition feedback
  const [tradeAdditionMessage, setTradeAdditionMessage] = useState(null);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  // -----------------------------
  // EFFECTS
  // -----------------------------
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const mobile = width < 1024; // Changed from 768 to 1024 for better tablet support
        setWindowWidth(width);
        setIsMobile(mobile);
        setSidebarOpen(!mobile);
      }
    };
    checkScreenSize();
    
    // Debounce resize events for better performance
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
        // Load user settings when user logs in
        loadUserSettings();
        loadUserPreferences();
      }
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!user) return;
    // Query trades sorted by upload date/time (most recent first)
    const q = query(
      collection(db, "trades1"),
      where("userId", "==", user.uid),
      orderBy("date", "desc") // Most recent trades first
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

  // Save user settings when they change
  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        saveUserSettings();
      }, 1000); // Debounce saving by 1 second
      
      return () => clearTimeout(timeoutId);
    }
  }, [startingBalance, metricsStartDate, metricsEndDate, selectedDuration, user]);

  // Initialize client-side state and persist selected date
  useEffect(() => {
    setIsClient(true);
    // Initialize with today's date for better UX
    const saved = safeGetFromLocalStorage('trading-calendar-selected-date', null);
    setSelectedDate(saved ? new Date(saved) : new Date());
  }, []);

  // Persist selected date to localStorage
  useEffect(() => {
    if (selectedDate && isClient) {
      safeSetToLocalStorage('trading-calendar-selected-date', selectedDate.toISOString());
    }
  }, [selectedDate, isClient]);

  // Auto-adjust date range when trades are loaded (only if no custom range is set)
  useEffect(() => {
    if (recentTrades.length > 0 && selectedDuration !== 'CUSTOM') {
      // Only auto-adjust if user hasn't set a custom range
      const smartRange = getSmartDateRange();
      const currentStart = new Date(metricsStartDate);
      const currentEnd = new Date(metricsEndDate);
      const smartStart = new Date(smartRange.start);
      const smartEnd = new Date(smartRange.end);
      
      // Check if current range is significantly different from smart range
      const startDiff = Math.abs(currentStart - smartStart) / (1000 * 60 * 60 * 24);
      const endDiff = Math.abs(currentEnd - smartEnd) / (1000 * 60 * 60 * 24);
      
      // Only update if difference is more than 1 day
      if (startDiff > 1 || endDiff > 1) {
        setMetricsStartDate(smartRange.start);
        setMetricsEndDate(smartRange.end);
      }
    }
  }, [recentTrades, selectedDuration]);

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
      // Use custom formData from modal if available, otherwise use state
      const dataToSubmit = e.target?.formData || formData;
      
      // Validate required fields
      if (!dataToSubmit.symbol) {
        console.error("Symbol is required");
        return;
      }
      
      let imageUrl = null;
      if (dataToSubmit.image) {
        const storageRef = ref(storage, `trades1/${user.uid}/${Date.now()}_${dataToSubmit.image.name}`);
        await uploadBytes(storageRef, dataToSubmit.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const tradeData = {
        userId: user.uid,
        symbol: dataToSubmit.symbol,
        entry: Number(dataToSubmit.entry) || 0,
        exit: Number(dataToSubmit.exit) || 0,
        lotSize: Number(dataToSubmit.lotSize) || 0,
        profit: Number(dataToSubmit.profit) || 0,
        notes: dataToSubmit.notes || "",
        image: imageUrl,
        accountType: dataToSubmit.accountType || "STANDARD",
        tradeDirection: dataToSubmit.tradeDirection || "BUY",
        stopLossPips: dataToSubmit.stopLossPips ? Number(dataToSubmit.stopLossPips) : null,
        date: dataToSubmit.deviceTimeTimestamp || createDateTimeFromDeviceTime(new Date()), // Use device time with current date
      };

      await addDoc(collection(db, "trades1"), tradeData);

      // Show success message
      setTradeAdditionMessage({ type: 'success', text: 'Trade added successfully!' });
      setTimeout(() => setTradeAdditionMessage(null), 3000);

      // Clear form data and close modal
      setFormData({ symbol: "", entry: "", exit: "", lotSize: "", profit: "", riskAmount: "", notes: "", image: null, accountType: "STANDARD", tradeDirection: "BUY", stopLossPips: "" });
      setImagePreview(null);
      setShowModal(false);
      
    } catch (error) {
      console.error("Error adding trade:", error);
      alert("Error adding trade. Please try again.");
    }
  };

  const handleSubmitForDate = async (e) => {
    e.preventDefault();
    if (!user || !selectedDate) return;

    try {
      // Use custom formData from modal if available, otherwise use state
      const dataToSubmit = e.target?.formData || formData;
      
      // Validate required fields
      if (!dataToSubmit.symbol) {
        console.error("Symbol is required");
        return;
      }
      
      let imageUrl = null;
      if (dataToSubmit.image) {
        const storageRef = ref(storage, `trades1/${user.uid}/${Date.now()}_${dataToSubmit.image.name}`);
        await uploadBytes(storageRef, dataToSubmit.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const tradeData = {
        userId: user.uid,
        symbol: dataToSubmit.symbol,
        entry: Number(dataToSubmit.entry) || 0,
        exit: Number(dataToSubmit.exit) || 0,
        lotSize: Number(dataToSubmit.lotSize) || 0,
        profit: Number(dataToSubmit.profit) || 0,
        notes: dataToSubmit.notes || "",
        image: imageUrl,
        accountType: dataToSubmit.accountType || "STANDARD",
        tradeDirection: dataToSubmit.tradeDirection || "BUY",
        stopLossPips: dataToSubmit.stopLossPips ? Number(dataToSubmit.stopLossPips) : null,
        date: dataToSubmit.deviceTimeTimestamp || createDateTimeFromDeviceTime(selectedDate), // Use device time with selected date from calendar
      };

      await addDoc(collection(db, "trades1"), tradeData);

      // Show success message
      setTradeAdditionMessage({ type: 'success', text: 'Trade added successfully!' });
      setTimeout(() => setTradeAdditionMessage(null), 3000);

      // Clear form data and close modals
      setFormData({ symbol: "", entry: "", exit: "", lotSize: "", profit: "", riskAmount: "", notes: "", image: null, accountType: "STANDARD", tradeDirection: "BUY", stopLossPips: "" });
      setImagePreview(null);
      setIsDayOptionsModalOpen(false);
      setShowModal(false);
      
    } catch (error) {
      console.error("Error adding trade:", error);
      alert("Error adding trade. Please try again.");
    }
  };

  // Add delete handler function
  const handleDeleteClick = (trade) => {
    setTradeToDelete(trade);
    setDeleteModalOpen(true);
  };

  const handleDeleteTrade = async (tradeId) => {
    if (!user) return;
    
    // Find the trade to delete
    const trade = filteredTrades.find(t => t.id === tradeId);
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

  // Edit trade functionality
  const handleEditTrade = (trade) => {
    setEditingTrade(trade);
    setFormData({
      symbol: trade.symbol,
      entry: trade.entry.toString(),
      exit: trade.exit.toString(),
      lotSize: trade.lotSize.toString(),
      profit: trade.profit.toString(),
      riskAmount: trade.riskAmount ? trade.riskAmount.toString() : "",
      notes: trade.notes || "",
      image: null,
      accountType: trade.accountType || "STANDARD",
      tradeDirection: trade.tradeDirection || "BUY",
      stopLossPips: trade.stopLossPips ? trade.stopLossPips.toString() : "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTrade = async (e) => {
    e.preventDefault();
    if (!user || !editingTrade) return;

    try {
      let imageUrl = editingTrade.image; // Keep existing image if no new one uploaded
      
      if (formData.image) {
        const storageRef = ref(storage, `trades1/${user.uid}/${Date.now()}_${formData.image.name}`);
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, "trades1", editingTrade.id), {
        symbol: formData.symbol,
        entry: Number(formData.entry),
        exit: Number(formData.exit),
        lotSize: Number(formData.lotSize),
        profit: Number(formData.profit),
        notes: formData.notes,
        image: imageUrl,
        accountType: formData.accountType,
        tradeDirection: formData.tradeDirection,
        stopLossPips: formData.stopLossPips ? Number(formData.stopLossPips) : null,
      });

      setFormData({ symbol: "", entry: "", exit: "", lotSize: "", profit: "", riskAmount: "", notes: "", image: null, accountType: "STANDARD", tradeDirection: "BUY", stopLossPips: "" });
      setImagePreview(null);
      setEditingTrade(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating trade:", error);
    }
  };

  // Save user settings to Firebase
  const saveUserSettings = async () => {
    if (!user) return;
    
    try {
      const userSettings = {
        startingBalance,
        metricsStartDate,
        metricsEndDate,
        selectedDuration,
        lastUpdated: new Date().toISOString(),
      };
      
      await setDoc(doc(db, "userSettings", user.uid), userSettings);
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  };

  // Load user settings from Firebase with smart defaults
  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      const userSettingsDoc = await getDoc(doc(db, "userSettings", user.uid));
      if (userSettingsDoc.exists()) {
        const settings = userSettingsDoc.data();
        setStartingBalance(settings.startingBalance || 12000);
        setMetricsStartDate(settings.metricsStartDate || getDefaultDateRange().start);
        setMetricsEndDate(settings.metricsEndDate || getDefaultDateRange().end);
        setSelectedDuration(settings.selectedDuration || '30D');
      } else {
        // No settings exist, use smart defaults
        const smartRange = getSmartDateRange();
        setMetricsStartDate(smartRange.start);
        setMetricsEndDate(smartRange.end);
        setSelectedDuration('30D');
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
      // Fallback to smart defaults on error
      const smartRange = getSmartDateRange();
      setMetricsStartDate(smartRange.start);
      setMetricsEndDate(smartRange.end);
      setSelectedDuration('30D');
    }
  };

  // Load user preferences (currency, etc.) from users collection
  const loadUserPreferences = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserSettings(userData.settings || { display: { currency: 'USD' } });
        // Load display name if available
        setUserDisplayName(userData.displayName || null);
      } else {
        setUserSettings({ display: { currency: 'USD' } });
        setUserDisplayName(null);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setUserSettings({ display: { currency: 'USD' } });
      setUserDisplayName(null);
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

  // Optimize handlers with useCallback
  const showMetricsDetails = useCallback((metric) => {
    setSelectedMetric(metric);
    setIsMetricsModalOpen(true);
  }, []);

  // Optimize calendar handlers with better state management
  const handleCalendarDateSelect = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleCalendarDayTrades = useCallback((trades) => {
    setSelectedDayTrades(trades);
  }, []);

  const handleCalendarDaySelect = useCallback((day) => {
    setSelectedDay(day);
  }, []);

  const handleCalendarModalOpen = useCallback((isOpen) => {
    setIsModalOpen(isOpen);
    // Clear selected date when closing modal to prevent stale state
    if (!isOpen) {
      setSelectedDate(null);
    }
  }, []);

  const handleCalendarDayOptionsModal = useCallback((isOpen) => {
    setIsDayOptionsModalOpen(isOpen);
    // Clear selected day trades when closing modal
    if (!isOpen) {
      setSelectedDayTrades([]);
      setSelectedDay(null);
    }
  }, []);

  // Smart date range detection based on trade data
  const getSmartDateRange = () => {
    if (recentTrades.length === 0) {
      return getDefaultDateRange();
    }
    
    // Get the date range of all trades
    const tradeDates = recentTrades.map(trade => new Date(trade.date));
    const earliestTrade = new Date(Math.min(...tradeDates));
    const latestTrade = new Date(Math.max(...tradeDates));
    
    // If trades are within 30 days, use that range
    const daysDiff = (latestTrade - earliestTrade) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 30) {
      return {
        start: earliestTrade.toISOString(),
        end: latestTrade.toISOString()
      };
    }
    
    // Otherwise, use last 30 days from latest trade
    const endDate = new Date(latestTrade);
    const startDate = new Date(latestTrade);
    startDate.setDate(startDate.getDate() - 30);
    
    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  };


  // Duration options for metrics
  const durationOptions = [
    { value: '7D', label: 'Last 7 Days', days: 7, description: 'Past week' },
    { value: '30D', label: 'Last 30 Days', days: 30, description: 'Past month' },
    { value: '90D', label: 'Last 90 Days', days: 90, description: 'Past quarter' },
    { value: '1Y', label: 'Last Year', days: 365, description: 'Past year' },
    { value: 'ALL', label: 'All Time', days: null, description: 'All trades' },
    { value: 'CUSTOM', label: 'Custom Range', days: null, description: 'Pick dates' }
  ];

  // Handle duration change with smart defaults
  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
    
    if (duration === 'CUSTOM') {
      // Keep current custom dates - don't change them
      return;
    }
    
    const option = durationOptions.find(opt => opt.value === duration);
    if (option && option.days) {
      // Calculate smart start date
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - option.days);
      
      // Set to start of day for better UX
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      setMetricsStartDate(startDate.toISOString());
      setMetricsEndDate(endDate.toISOString());
    } else if (duration === 'ALL') {
      // Set to include all possible trades
      const startDate = new Date('2020-01-01');
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      setMetricsStartDate(startDate.toISOString());
      setMetricsEndDate(endDate.toISOString());
    }
  };

  // Handle custom start date change
  const handleCustomStartDateChange = (dateString) => {
    const startDate = new Date(dateString);
    startDate.setHours(0, 0, 0, 0);
    setMetricsStartDate(startDate.toISOString());
    setSelectedDuration('CUSTOM');
  };

  // Handle custom end date change
  const handleCustomEndDateChange = (dateString) => {
    const endDate = new Date(dateString);
    endDate.setHours(23, 59, 59, 999);
    setMetricsEndDate(endDate.toISOString());
    setSelectedDuration('CUSTOM');
  };

  // -----------------------------
  // CALCULATED VARIABLES
  // -----------------------------
  // Optimize trade filtering with useMemo to prevent unnecessary recalculations
  const filteredTrades = useMemo(() => {
    if (!recentTrades || !Array.isArray(recentTrades)) return [];
    
    return recentTrades
      .filter(trade => {
        if (!trade || !trade.date) return false;
        const tradeDate = new Date(trade.date);
        const startDate = new Date(metricsStartDate);
        const endDate = new Date(metricsEndDate);
        return tradeDate >= startDate && tradeDate <= endDate;
      })
      .sort((a, b) => {
        // Ensure trades are always sorted by upload time (newest first)
        // Uses createdAt (upload time) if available, otherwise falls back to date
        const aTime = new Date(a?.createdAt || a?.date || 0).getTime();
        const bTime = new Date(b?.createdAt || b?.date || 0).getTime();
        return bTime - aTime; // Newest first
      });
  }, [recentTrades, metricsStartDate, metricsEndDate]);
  
  // Optimize calculations with useMemo
  const dailyPnL = useMemo(() => 
    filteredTrades.reduce((acc, trade) => acc + (trade.profit || 0), 0), 
    [filteredTrades]
  );
  
  const currentBalance = useMemo(() => 
    startingBalance + dailyPnL, 
    [startingBalance, dailyPnL]
  );
  
  // Calculate equity curve starting from zero to show growth
  // Sort trades by date (oldest first) for proper equity curve calculation
  const sortedTrades = useMemo(() => 
    [...filteredTrades].sort((a, b) => new Date(a.date) - new Date(b.date)), 
    [filteredTrades]
  );
  
  // Enhanced growth metrics - optimized with useMemo
  const totalGrowth = useMemo(() => 
    currentBalance - startingBalance, 
    [currentBalance, startingBalance]
  );
  
  const growthPercentage = useMemo(() => 
    startingBalance > 0 ? (totalGrowth / startingBalance) * 100 : 0, 
    [totalGrowth, startingBalance]
  );
  
  const periodGrowth = totalGrowth; // Growth since last reset
  
  // Calculate best and worst days (using filtered trades) - optimized
  const { bestDay, worstDay } = useMemo(() => {
    if (!filteredTrades || filteredTrades.length === 0) {
      return { bestDay: { date: '', pnl: 0 }, worstDay: { date: '', pnl: 0 } };
    }
    
    const dailyPnLs = filteredTrades.reduce((acc, trade) => {
      if (!trade || !trade.date) return acc;
      const date = new Date(trade.date).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date] += trade.profit || 0;
      return acc;
    }, {});
    
    const entries = Object.entries(dailyPnLs);
    if (entries.length === 0) {
      return { bestDay: { date: '', pnl: 0 }, worstDay: { date: '', pnl: 0 } };
    }
    
    const best = entries.reduce((best, [date, pnl]) => 
      pnl > best.pnl ? { date, pnl } : best, { date: '', pnl: -Infinity }
    );
    
    const worst = entries.reduce((worst, [date, pnl]) => 
      pnl < worst.pnl ? { date, pnl } : worst, { date: '', pnl: Infinity }
    );
    
    return { bestDay: best, worstDay: worst };
  }, [filteredTrades]);
  
  // Calculate drawdown (maximum loss from peak) - optimized
  const { peakBalance, currentDrawdown, maxDrawdown } = useMemo(() => {
    if (!sortedTrades || sortedTrades.length === 0) {
      return { peakBalance: startingBalance, currentDrawdown: 0, maxDrawdown: 0 };
    }
    
    const runningBalances = sortedTrades.reduce((acc, t, i) => {
      if (!t) return acc;
      const previousBalance = acc[i - 1] || startingBalance;
      const newBalance = previousBalance + (t.profit || 0);
      return [...acc, newBalance];
    }, []);
    
    if (runningBalances.length === 0) {
      return { peakBalance: startingBalance, currentDrawdown: 0, maxDrawdown: 0 };
    }
    
    const peak = Math.max(...runningBalances, startingBalance);
    const current = peak - currentBalance;
    const max = Math.max(...runningBalances.map(balance => peak - balance), 0);
    
    return { 
      peakBalance: peak, 
      currentDrawdown: current, 
      maxDrawdown: max 
    };
  }, [sortedTrades, startingBalance, currentBalance]);

  // Calculate date-based trade metrics (User's Preferred Timezone)
  const dateBasedMetrics = useMemo(() => {
    const now = new Date();
    
    const today = getDateStringInTimezone(now, userTimezone); // YYYY-MM-DD format in user's preferred timezone
    const yesterday = getDateStringInTimezone(new Date(now.getTime() - 24 * 60 * 60 * 1000), userTimezone);
    
    const todayTrades = filteredTrades.filter(trade => getDateStringInTimezone(new Date(trade.date), userTimezone) === today);
    const yesterdayTrades = filteredTrades.filter(trade => getDateStringInTimezone(new Date(trade.date), userTimezone) === yesterday);
    
    return {
      today: todayTrades.length,
      yesterday: yesterdayTrades.length
    };
  }, [filteredTrades]);

  // Optimize metrics array with useMemo
  const metrics = useMemo(() => [
    { label: "Starting Balance", value: startingBalance, color: "text-white", editable: true },
    { label: "Current Balance", value: currentBalance, color: currentBalance >= 0 ? "text-green-400" : "text-red-500", prefix: "$" },
    { label: "Period Growth", value: periodGrowth, color: periodGrowth >= 0 ? "text-green-400" : "text-red-500", prefix: "$" },
    { label: "Growth %", value: growthPercentage, color: growthPercentage >= 0 ? "text-green-400" : "text-red-500", suffix: "%" },
    { label: "Total Trades", value: filteredTrades.length, color: "text-white" },
    { label: "Today", value: dateBasedMetrics.today, color: "text-green-400", subtitle: "Trades Today" },
  ], [startingBalance, currentBalance, periodGrowth, growthPercentage, filteredTrades.length, dateBasedMetrics]);



  // -----------------------------
  // RENDER
  // -----------------------------
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
          active="Dashboard"
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />

                 {/* Main content */}
         <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-16'} ml-0 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 overflow-x-hidden min-h-screen`}>

          {/* ========================================
               HEADER SECTION
          ========================================= */}
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <DashboardHeader
                username={user?.email || "Trader"}
                displayName={userDisplayName}
                balance={currentBalance}
                dailyPnL={dailyPnL}
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              />
              
              {/* Success Message */}
              {tradeAdditionMessage && (
                <div className={`p-3 rounded-lg border ${
                  tradeAdditionMessage.type === 'success' 
                    ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                    : 'bg-red-500/20 border-red-500/30 text-red-400'
                }`}>
                  <div className="flex items-center gap-2">
                    {tradeAdditionMessage.type === 'success' ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="font-medium">{tradeAdditionMessage.text}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center sm:justify-end">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-3 rounded-xl shadow-lg font-semibold hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-xl text-sm sm:text-base min-h-[44px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Add New Trade</span>
                  <span className="sm:hidden">Add Trade</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================
               KEY METRICS SECTION
          ========================================= */}
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Key Performance Metrics
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {metrics.map((m, i) => (
                <div 
                  key={i} 
                  className="bg-gray-800/80 backdrop-blur-lg p-3 sm:p-4 lg:p-5 rounded-xl shadow-lg border border-gray-700/50 hover:shadow-xl transition-all duration-300 group min-h-[100px] sm:min-h-[120px] cursor-pointer hover:scale-105"
                  onClick={() => {
                    if (m.label === "Trades") {
                      // Scroll to trade history section
                      document.getElementById('trade-history-section')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      // Show detailed metrics modal
                      showMetricsDetails(m);
                    }
                  }}
                  title={`Click to view details for ${m.label}`}
                >
                  <p className="text-gray-400 text-xs sm:text-sm mb-1 font-medium leading-tight">{m.label}</p>
                  {m.subtitle && (
                    <p className="text-gray-500 text-xs mb-2 sm:mb-3 leading-tight">{m.subtitle}</p>
                  )}
                  {m.editable ? (
                    <input
                      type="number"
                      value={startingBalance}
                      onChange={(e) => {
                        setStartingBalance(Number(e.target.value));
                        // Save settings immediately when starting balance changes
                        if (user) {
                          setTimeout(() => saveUserSettings(), 500);
                        }
                      }}
                      className="text-base sm:text-lg lg:text-xl font-bold text-white bg-gray-900/70 rounded-lg px-2 sm:px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 min-h-[40px]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className={`text-base sm:text-lg lg:text-xl xl:text-2xl font-bold ${m.color} group-hover:scale-105 transition-transform duration-200 leading-tight`}>
                      {m.prefix || ""}{m.value.toLocaleString()}{m.suffix || ""}
                    </p>
                  )}
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-xs text-gray-500">Click for details</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================
               PERFORMANCE INSIGHTS SECTION
          ========================================= */}
          <PerInsights
            filteredTrades={filteredTrades}
            dailyPnL={dailyPnL}
            maxDrawdown={maxDrawdown}
            selectedDuration={selectedDuration}
            handleDurationChange={handleDurationChange}
            durationOptions={durationOptions}
            metricsStartDate={metricsStartDate}
            metricsEndDate={metricsEndDate}
            handleCustomStartDateChange={handleCustomStartDateChange}
            handleCustomEndDateChange={handleCustomEndDateChange}
          />

          {/* ========================================
               EQUITY CURVE CHART SECTION
          ========================================= */}
          <EquityCurve 
            sortedTrades={sortedTrades} 
            windowWidth={windowWidth} 
          />

          {/* ========================================
               TRADING ACTIVITY SECTION
          ========================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            
            {/* Trading Calendar - Optimized with lazy loading and memoized handlers */}
            <Suspense fallback={
              <div className="bg-white/5 backdrop-blur-lg p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 animate-pulse">
                <div className="h-8 bg-white/10 rounded mb-4"></div>
                <div className="h-6 bg-white/10 rounded mb-4"></div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-12 sm:h-16 lg:h-20 bg-white/10 rounded"></div>
                  ))}
                </div>
              </div>
            }>
              <TradingCalendar
                filteredTrades={filteredTrades}
                selectedDate={selectedDate}
                setSelectedDate={handleCalendarDateSelect}
                setSelectedDayTrades={handleCalendarDayTrades}
                setSelectedDay={handleCalendarDaySelect}
                setIsModalOpen={handleCalendarModalOpen}
                setIsDayOptionsModalOpen={handleCalendarDayOptionsModal}
              />
            </Suspense>
          </div>

          {/* ========================================
               RECENT TRADES SECTION - Last 5 Trades
          ========================================= */}
          <div id="trade-history-section" className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Recent Trades (Last 5)
              </h2>
              <button
                onClick={() => router.push('/tradehistory')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors duration-200"
              >
                View All Trades
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            
            {filteredTrades.length > 0 ? (
              <TradeHistory 
                trades={filteredTrades.slice(0, 5)} 
                onDeleteTrade={handleDeleteTrade}
                onEditTrade={handleEditTrade}
                isDashboardView={true}
                currencyFormatter={formatMoney}
                deleteModalOpen={deleteModalOpen}
                deleteLoading={deleteLoading}
                onDeleteClick={handleDeleteClick}
                onDeleteCancel={handleDeleteCancel}
              />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-base font-medium">No recent trades</p>
                <p className="text-sm text-gray-500">Start by adding your first trade</p>
              </div>
            )}
          </div>

          {/* ========================================
               MODALS
          ========================================= */}
          
                     {/* Day Trades Modal */}
           {isModalOpen && (
             <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
               <div className="bg-gray-800/95 backdrop-blur-md p-3 sm:p-4 lg:p-6 rounded-xl shadow-2xl border border-gray-700/50 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-3 sm:mb-4">
                   <h3 className="text-base sm:text-lg font-semibold text-white">Trades for Day {selectedDay}</h3>
                   <button
                     onClick={() => setIsModalOpen(false)}
                     className="text-gray-400 hover:text-white transition-colors duration-200 p-1 min-h-[40px] min-w-[40px] flex items-center justify-center"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
                 <div className="overflow-x-auto -mx-2 sm:mx-0">
                   <table className="w-full text-xs sm:text-sm text-left min-w-[500px] sm:min-w-[600px]">
                     <thead>
                       <tr className="border-b border-gray-700">
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Symbol</th>
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Lot Size</th>
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Entry</th>
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Exit</th>
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Profit</th>
                         <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 font-medium">Notes</th>
                       </tr>
                     </thead>
                     <tbody>
                       {selectedDayTrades.map((t) => (
                         <tr key={t.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-200">
                           <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-white">{t.symbol}</td>
                           <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                             <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs sm:text-sm font-medium">
                               {t.lotSize || "0.01"}
                             </span>
                           </td>
                           <td className="px-2 sm:px-4 py-2 sm:py-3 text-white">${t.entry}</td>
                           <td className="px-2 sm:px-4 py-2 sm:py-3 text-white">${t.exit}</td>
                           <td className={`px-2 sm:px-4 py-2 sm:py-3 font-semibold ${t.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                             {t.profit >= 0 ? "+" : ""}${t.profit}
                           </td>
                           <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400 max-w-[150px] truncate">{t.notes || "-"}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
                 <button
                   className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base min-h-[44px]"
                   onClick={() => setIsModalOpen(false)}
                 >
                   Close
                 </button>
               </div>
             </div>
           )}

          {/* Day Options Modal */}
          {isDayOptionsModalOpen && selectedDate && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-gray-800/95 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700/50 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedDayTrades.length > 0 ? 'Manage Trades for' : 'Add Trade for'} {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <button
                    onClick={() => {
                      setIsDayOptionsModalOpen(false);
                      setSelectedDayTrades([]);
                      setSelectedDay(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedDayTrades.length > 0 ? (
                    <>
                      <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
                        <p className="text-gray-300 text-sm mb-2">
                          This day has <span className="font-semibold text-white">{selectedDayTrades.length}</span> trade{selectedDayTrades.length > 1 ? 's' : ''}:
                        </p>
                        <div className="text-xs text-gray-400 space-y-1">
                          {selectedDayTrades.map((trade, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{trade.symbol}</span>
                              <span className={trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {trade.profit >= 0 ? '+' : ''}${trade.profit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        What would you like to do?
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-300 text-sm">
                      This day has no trades yet. Would you like to add a trade for this date?
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    {selectedDayTrades.length > 0 && (
                      <button
                        onClick={() => {
                          setIsDayOptionsModalOpen(false);
                          setIsModalOpen(true);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        View Existing Trades
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setIsDayOptionsModalOpen(false);
                        setShowModal(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      {selectedDayTrades.length > 0 ? 'Add Another Trade' : 'Add Trade'}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsDayOptionsModalOpen(false);
                      setSelectedDayTrades([]);
                      setSelectedDay(null);
                    }}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Trade Modal */}
          <AddTradeModal
            showModal={showModal}
            setShowModal={setShowModal}
            handleSubmit={selectedDate ? handleSubmitForDate : handleSubmit}
            formData={formData}
            handleChange={handleChange}
            imagePreview={imagePreview}
            selectedDate={selectedDate}
          />

          {/* Edit Trade Modal */}
          <AddTradeModal
            showModal={isEditModalOpen}
            setShowModal={setIsEditModalOpen}
            handleSubmit={handleUpdateTrade}
            formData={formData}
            handleChange={handleChange}
            imagePreview={imagePreview}
            selectedDate={null}
            editingTrade={editingTrade}
          />

          {/* Metrics Details Modal */}
          {isMetricsModalOpen && selectedMetric && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-gray-800/95 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl shadow-2xl border border-gray-700/50 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white">{selectedMetric.label} Details</h3>
                  <button
                    onClick={() => setIsMetricsModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 p-1 min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Main Value */}
                  <div className="text-center">
                    <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${selectedMetric.color} mb-2`}>
                      {selectedMetric.prefix || ""}{selectedMetric.value.toLocaleString()}{selectedMetric.suffix || ""}
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base">{selectedMetric.label}</p>
                  </div>

                  {/* Detailed Information */}
                  <div className="bg-gray-700/30 rounded-lg p-4 sm:p-6">
                    {selectedMetric.label === "Current Balance" && (
                      <div className="space-y-3">
                        <h4 className="text-white font-semibold mb-3">Balance Breakdown</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-gray-600/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Starting Balance</p>
                            <p className="text-white font-semibold">${startingBalance.toLocaleString()}</p>
                          </div>
                          <div className="bg-gray-600/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Total Growth</p>
                            <p className={`font-semibold ${(selectedMetric.value - startingBalance) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${(selectedMetric.value - startingBalance).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <p className="text-blue-400 text-sm">
                            <strong>Formula:</strong> Starting Balance + Total P&L from Trades
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedMetric.label === "Period Growth" && (
                      <div className="space-y-3">
                        <h4 className="text-white font-semibold mb-3">Growth Analysis</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-gray-600/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Growth Amount</p>
                            <p className={`font-semibold ${selectedMetric.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${selectedMetric.value.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-600/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Growth Percentage</p>
                            <p className={`font-semibold ${growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {growthPercentage.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <p className="text-purple-400 text-sm">
                            <strong>Period:</strong> {new Date(metricsStartDate).toLocaleDateString()} - {new Date(metricsEndDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedMetric.label === "Growth %" && (
                      <div className="space-y-3">
                        <h4 className="text-white font-semibold mb-3">Percentage Analysis</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-gray-600/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Growth Percentage</p>
                            <p className={`font-semibold ${selectedMetric.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {selectedMetric.value.toFixed(2)}%
                            </p>
                          </div>
                          <div className="bg-gray-600/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Total Growth</p>
                            <p className={`font-semibold ${(currentBalance - startingBalance) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${(currentBalance - startingBalance).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <p className="text-green-400 text-sm">
                            <strong>Calculation:</strong> (Current Balance - Starting Balance) / Starting Balance × 100
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-600/20 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Total Trades</p>
                      <p className="text-white font-semibold">{filteredTrades.length}</p>
                    </div>
                    <div className="bg-gray-600/20 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Winning Trades</p>
                      <p className="text-green-400 font-semibold">{filteredTrades.filter(t => t.profit > 0).length}</p>
                    </div>
                    <div className="bg-gray-600/20 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Losing Trades</p>
                      <p className="text-red-400 font-semibold">{filteredTrades.filter(t => t.profit < 0).length}</p>
                    </div>
                    <div className="bg-gray-600/20 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Win Rate</p>
                      <p className="text-blue-400 font-semibold">
                        {filteredTrades.length > 0 ? ((filteredTrades.filter(t => t.profit > 0).length / filteredTrades.length) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
         
         /* Optimize for very small screens */
         @media (max-width: 374px) {
           .text-\\[8px\\] {
             font-size: 8px;
           }
         }
         
         /* Improve touch targets for mobile */
         @media (max-width: 768px) {
           button, [role="button"] {
             min-height: 44px;
             min-width: 44px;
           }
           
           /* Better spacing for very small screens */
           .grid-cols-1 {
             gap: 0.5rem;
           }
           
           /* Improve calendar readability on small screens */
           .calendar-day {
             min-height: 32px;
             font-size: 10px;
           }
         }
         
         /* Extra small screens optimization */
         @media (max-width: 374px) {
           .text-xs {
             font-size: 10px;
           }
           
           .p-2 {
             padding: 0.25rem;
           }
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
    </ProtectedRoute>
  );
}

