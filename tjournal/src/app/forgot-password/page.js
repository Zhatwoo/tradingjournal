'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      setMessage({ 
        type: 'success', 
        text: 'Password reset email sent! Check your inbox and follow the instructions.' 
      });
    } catch (error) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            {emailSent ? 'Check Your Email' : 'Reset Password'}
          </h1>
          <p className="text-gray-400">
            {emailSent 
              ? 'We\'ve sent you a password reset link' 
              : 'Enter your email address and we\'ll send you a link to reset your password'
            }
          </p>
        </div>

        {/* Form */}
        {!emailSent ? (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              {message.text && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">Email Sent!</h3>
            <p className="text-gray-400 mb-6">
              We've sent a password reset link to <strong className="text-white">{email}</strong>
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200"
              >
                Back to Login
              </button>
              
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setMessage({ type: '', text: '' });
                }}
                className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 py-3 px-6 rounded-lg font-medium transition-all duration-200"
              >
                Try Different Email
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-6">
          <p>Remember your password? <button onClick={() => router.push('/auth/login')} className="text-blue-400 hover:text-blue-300 transition-colors">Sign in</button></p>
        </div>
      </div>
    </div>
  );
}
