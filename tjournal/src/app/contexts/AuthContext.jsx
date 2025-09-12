'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Check if user is trying to access protected routes without authentication
      const isAuthPage = pathname.startsWith('/auth/');
      const isPublicPage = pathname === '/' || pathname === '/about' || pathname === '/contact' || pathname === '/privacy' || pathname === '/terms';
      
      if (!user && !isAuthPage && !isPublicPage) {
        // Redirect to login if not authenticated and trying to access protected route
        router.push('/auth/login');
      } else if (user && isAuthPage) {
        // Redirect to dashboard if authenticated and trying to access auth pages
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
