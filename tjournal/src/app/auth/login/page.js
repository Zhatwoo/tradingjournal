'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, signInWithEmailAndPassword } from "../../lib/firebase";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Incorrect email or password."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-['Roboto']">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-blue-600">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2 drop-shadow-lg">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your trading account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-600 text-white px-4 py-2 rounded mb-4 text-center shadow-md">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-95 transition text-white py-3 rounded-lg font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          New user?{" "}
          <Link href="/auth/register" className="text-red-500 hover:text-red-400 font-medium">
            Create an account
          </Link>
        </div>

        <div className="mt-2 text-center text-gray-400 text-sm">
          <Link href="#" className="text-blue-400 hover:text-blue-300">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
