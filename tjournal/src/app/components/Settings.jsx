'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../lib/firebase';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff, Save, User, Shield, Bell, Palette, BarChart3, CreditCard, LogOut, ArrowLeft } from 'lucide-react';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  
  // Settings states
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: {
      email: true,
      push: true,
      tradeAlerts: true,
      weeklyReports: false
    },
    trading: {
      defaultLotSize: 0.01,
      riskPercentage: 2,
      autoCalculate: true,
      showPips: true
    },
    display: {
      currency: 'USD',
      timezone: 'auto', // 'auto' for device timezone, or specific timezone
      dateFormat: 'MM/DD/YYYY',
      decimalPlaces: 5
    }
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        loadUserSettings(currentUser.uid);
      } else {
        router.push('/auth/login');
      }
    });
    return unsubscribe;
  }, [router]);


  const loadUserSettings = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.settings) {
          setSettings(prev => ({ ...prev, ...userData.settings }));
        }
        // Load display name from Firestore if available
        if (userData.displayName) {
          setDisplayName(userData.displayName);
        }
      } else {
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', userId), {
          settings: settings,
          displayName: displayName,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings. Please refresh the page.' });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName });
      
      // Update Firestore user document
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName,
        lastUpdated: new Date().toISOString()
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Current password is incorrect.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-save function
  const autoSaveSettings = useCallback(async () => {
    if (!user || !autoSaveEnabled) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        settings: settings,
        lastUpdated: new Date().toISOString(),
        displayName: displayName
      });
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [user, settings, displayName, autoSaveEnabled]);

  // Auto-save effect
  useEffect(() => {
    if (!user) return;
    
    const timeoutId = setTimeout(() => {
      autoSaveSettings();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [settings, displayName, autoSaveSettings]);

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        settings: settings,
        lastUpdated: new Date().toISOString(),
        displayName: displayName
      });
      setLastSaved(new Date().toISOString());
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-8 sm:pb-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage your account and preferences</p>
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

        {/* Auto-save Status */}
        {lastSaved && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Settings auto-saved</span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(lastSaved).toLocaleTimeString()}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Profile Settings */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <User size={20} className="text-blue-400" />
                <h2 className="text-lg sm:text-xl font-semibold">Profile Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter display name"
                  />
                </div>
                
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[40px]"
                >
                  <Save size={16} />
                  Save Profile
                </button>
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={20} className="text-green-400" />
                <h2 className="text-lg sm:text-xl font-semibold">Change Password</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 p-1"
                    >
                      {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[40px]"
                >
                  <Shield size={16} />
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="space-y-6">
            {/* Trading Preferences */}
            <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 size={20} className="text-purple-400" />
                <h2 className="text-lg sm:text-xl font-semibold">Trading Preferences</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Default Lot Size</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={settings.trading.defaultLotSize}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      trading: { ...prev.trading, defaultLotSize: parseFloat(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Risk Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={settings.trading.riskPercentage}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      trading: { ...prev.trading, riskPercentage: parseFloat(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoCalculate"
                    checked={settings.trading.autoCalculate}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      trading: { ...prev.trading, autoCalculate: e.target.checked }
                    }))}
                    className="rounded bg-gray-700/70 border-gray-600 text-blue-500 focus:ring-blue-500/50"
                  />
                  <label htmlFor="autoCalculate" className="text-sm text-gray-300">
                    Auto-calculate profit/loss
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showPips"
                    checked={settings.trading.showPips}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      trading: { ...prev.trading, showPips: e.target.checked }
                    }))}
                    className="rounded bg-gray-700/70 border-gray-600 text-blue-500 focus:ring-blue-500/50"
                  />
                  <label htmlFor="showPips" className="text-sm text-gray-300">
                    Show pips in trade details
                  </label>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Palette size={20} className="text-yellow-400" />
                <h2 className="text-lg sm:text-xl font-semibold">Display Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                  <select
                    value={settings.display.currency}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      display: { ...prev.display, currency: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                  <select
                    value={settings.display.timezone}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      display: { ...prev.display, timezone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="auto">Auto (Device Timezone)</option>
                    <optgroup label="Americas">
                      <option value="America/New_York">Eastern Time (EST/EDT)</option>
                      <option value="America/Chicago">Central Time (CST/CDT)</option>
                      <option value="America/Denver">Mountain Time (MST/MDT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                      <option value="America/Toronto">Toronto (EST/EDT)</option>
                      <option value="America/Vancouver">Vancouver (PST/PDT)</option>
                      <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                    </optgroup>
                    <optgroup label="Europe">
                      <option value="Europe/London">London (GMT/BST)</option>
                      <option value="Europe/Paris">Paris (CET/CEST)</option>
                      <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                      <option value="Europe/Rome">Rome (CET/CEST)</option>
                      <option value="Europe/Madrid">Madrid (CET/CEST)</option>
                      <option value="Europe/Moscow">Moscow (MSK)</option>
                    </optgroup>
                    <optgroup label="Philippines">
                      <option value="Asia/Manila">Manila (PST/PDT)</option>
                      <option value="UTC+8">UTC+8 (Philippine Standard Time)</option>
                    </optgroup>
                    <optgroup label="Asia">
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Asia/Shanghai">Shanghai (CST)</option>
                      <option value="Asia/Hong_Kong">Hong Kong (HKT)</option>
                      <option value="Asia/Singapore">Singapore (SGT)</option>
                      <option value="Asia/Kolkata">Mumbai (IST)</option>
                      <option value="Asia/Dubai">Dubai (GST)</option>
                      <option value="Asia/Seoul">Seoul (KST)</option>
                    </optgroup>
                    <optgroup label="Oceania">
                      <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                      <option value="Australia/Melbourne">Melbourne (AEST/AEDT)</option>
                      <option value="Pacific/Auckland">Auckland (NZST/NZDT)</option>
                    </optgroup>
                    <optgroup label="UTC Offsets">
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="UTC+1">UTC+1</option>
                      <option value="UTC+2">UTC+2</option>
                      <option value="UTC+3">UTC+3</option>
                      <option value="UTC+4">UTC+4</option>
                      <option value="UTC+5">UTC+5</option>
                      <option value="UTC+6">UTC+6</option>
                      <option value="UTC+7">UTC+7</option>
                      <option value="UTC+8">UTC+8</option>
                      <option value="UTC+9">UTC+9</option>
                      <option value="UTC+10">UTC+10</option>
                      <option value="UTC+11">UTC+11</option>
                      <option value="UTC+12">UTC+12</option>
                      <option value="UTC-1">UTC-1</option>
                      <option value="UTC-2">UTC-2</option>
                      <option value="UTC-3">UTC-3</option>
                      <option value="UTC-4">UTC-4</option>
                      <option value="UTC-5">UTC-5</option>
                      <option value="UTC-6">UTC-6</option>
                      <option value="UTC-7">UTC-7</option>
                      <option value="UTC-8">UTC-8</option>
                      <option value="UTC-9">UTC-9</option>
                      <option value="UTC-10">UTC-10</option>
                      <option value="UTC-11">UTC-11</option>
                      <option value="UTC-12">UTC-12</option>
                    </optgroup>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Current device timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Note: UTC offset options (UTC+8, UTC-5, etc.) are supported for simple timezone adjustments.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date Format</label>
                  <select
                    value={settings.display.dateFormat}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      display: { ...prev.display, dateFormat: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700/70 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-gray-800/50 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Bell size={20} className="text-red-400" />
                <h2 className="text-lg sm:text-xl font-semibold">Notifications</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: e.target.checked }
                    }))}
                    className="rounded bg-gray-700/70 border-gray-600 text-blue-500 focus:ring-blue-500/50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: e.target.checked }
                    }))}
                    className="rounded bg-gray-700/70 border-gray-600 text-blue-500 focus:ring-blue-500/50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Trade Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.tradeAlerts}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, tradeAlerts: e.target.checked }
                    }))}
                    className="rounded bg-gray-700/70 border-gray-600 text-blue-500 focus:ring-blue-500/50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Weekly Reports</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.weeklyReports}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, weeklyReports: e.target.checked }
                    }))}
                    className="rounded bg-gray-700/70 border-gray-600 text-blue-500 focus:ring-blue-500/50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Auto-save Settings</span>
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="rounded bg-gray-700/70 border-gray-600 text-blue-500 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px] text-sm sm:text-base"
          >
            <Save size={18} />
            Save All Settings
          </button>

          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 min-h-[48px] text-sm sm:text-base"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
        </div>
    </div>
  );
}
