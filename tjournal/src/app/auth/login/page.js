'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Incorrect email or password. Please try again."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-2 sm:p-4 font-['Inter'] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-600 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-blue-600 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative bg-gradient-to-br from-gray-900/70 via-gray-900/80 to-gray-900/70 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 lg:p-8 border border-gray-800 backdrop-blur-md">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20"></div>
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg border border-gray-700">
                <TrendingUp size={20} className="sm:w-6 sm:h-6 text-blue-400" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              TJournal
            </h1>
          </div>
        </div>
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Welcome Back</h1>
          <p className="text-sm sm:text-base text-gray-400">Sign in to continue your trading journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-center border border-red-500/20 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all placeholder-gray-500 text-sm sm:text-base"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all placeholder-gray-500 pr-10 sm:pr-12 text-sm sm:text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 p-1 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-xs sm:text-sm">
            <label className="flex items-center text-gray-400">
              <input type="checkbox" className="rounded bg-gray-800/60 border-gray-700 text-blue-500 focus:ring-blue-500/50 mr-2" />
              Remember me
            </label>
            <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 text-white py-3 sm:py-3.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px] text-sm sm:text-base"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              <>
                Log in
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center my-6 sm:my-8">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-3 sm:mx-4 text-gray-500 text-xs sm:text-sm">or</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        {/* Demo Account Suggestion */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <p className="text-blue-300 text-xs sm:text-sm text-center">
            New to TJournal?{" "}
            <Link href="/auth/register" className="text-white font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs mt-6 sm:mt-8">
          <p>By signing in, you agree to our <a href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</a> and <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a></p>
        </div>
      </div>
    </div>
  );
}