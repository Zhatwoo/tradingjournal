'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, Mail, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-2 sm:p-4 font-['Inter'] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-orange-600 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-red-600 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative bg-gradient-to-br from-gray-900/70 via-gray-900/80 to-gray-900/70 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 lg:p-8 border border-gray-800 backdrop-blur-md">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg blur opacity-20"></div>
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg border border-gray-700">
                <TrendingUp size={20} className="sm:w-6 sm:h-6 text-orange-400" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
              TJournal
            </h1>
          </div>
        </div>
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Reset Password</h1>
          <p className="text-sm sm:text-base text-gray-400">
            {success 
              ? "Check your email for reset instructions" 
              : "Enter your email address and we'll send you a link to reset your password"
            }
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 text-green-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-center border border-green-500/20 text-sm sm:text-base">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={18} className="sm:w-5 sm:h-5" />
              <span>Password reset email sent successfully!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-center border border-red-500/20 text-sm sm:text-base">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle size={18} className="sm:w-5 sm:h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 rounded-xl bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all placeholder-gray-500 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 transition-all duration-300 text-white py-3 sm:py-3.5 rounded-xl font-medium shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px] text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                  Sending reset email...
                </div>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Send Reset Email
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Mail className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">Check Your Email</h3>
              <p className="text-blue-300 text-sm">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>

            <button
              onClick={() => {
                setSuccess(false);
                setEmail("");
                setError("");
              }}
              className="w-full bg-gray-800/60 hover:bg-gray-700/60 transition-all duration-300 text-gray-300 py-3 sm:py-3.5 rounded-xl font-medium border border-gray-700"
            >
              Try Different Email
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="relative flex items-center my-6 sm:my-8">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-3 sm:mx-4 text-gray-500 text-xs sm:text-sm">or</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        {/* Back to Login */}
        <div className="space-y-3">
          <Link 
            href="/auth/login"
            className="inline-flex items-center justify-center w-full bg-gray-800/60 hover:bg-gray-700/60 transition-all duration-300 text-gray-300 py-3 px-6 rounded-xl font-medium border border-gray-700 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
          
          <Link 
            href="/auth/register"
            className="inline-flex items-center justify-center w-full text-orange-400 hover:text-orange-300 transition-colors duration-200 text-sm font-medium"
          >
            Don't have an account? Create one here
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs mt-6 sm:mt-8">
          <p>Need help? Contact our <a href="/contact" className="text-orange-400 hover:text-orange-300">support team</a></p>
        </div>
      </div>
    </div>
  );
}
