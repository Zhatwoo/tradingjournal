'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ContactPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useState(() => {
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white relative overflow-hidden">
      {/* Professional geometric background */}
      <div className="absolute inset-0 opacity-10">
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"></div>
        
        {/* Subtle lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent"></div>
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <Sidebar
          username="User"
          active="Contact"
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-16'} ml-0 p-4 sm:p-6 lg:p-8`}>
          
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="group p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 mb-6 border border-gray-700/50 hover:border-blue-500/30"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            </button>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-300">Get In Touch</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent bg-300% animate-gradient">
                  Contact Us
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Have questions, feedback, or suggestions? We're here to help improve your trading journal experience.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="max-w-5xl mx-auto flex-1 flex items-center">
            <div className="w-full">
              {/* Main Email Card */}
              <div className="relative group mb-12">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50 text-center hover:bg-gray-900/90 transition-all duration-500">
                  <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="text-blue-400 group-hover:text-blue-300" size={40} />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-4">Send us an email</h2>
                    <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border-2 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group/email">
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-300 mb-1">Email us at:</div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover/email:from-blue-300 group-hover/email:to-purple-300 transition-all duration-300">
                          Tjournalph@gmail.com
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* Feature 1 */}
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 text-center">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">💡</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Feature Requests</h3>
                    <p className="text-gray-400 text-sm">Suggest new features and improvements</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 text-center">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">🐛</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Bug Reports</h3>
                    <p className="text-gray-400 text-sm">Report technical issues and bugs</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 text-center">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">📈</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Trading Questions</h3>
                    <p className="text-gray-400 text-sm">Get help with trading strategies</p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 text-center">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Partnerships</h3>
                    <p className="text-gray-400 text-sm">Business and collaboration opportunities</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer 
        sidebarOpen={sidebarOpen} 
        isMobile={isMobile}
        hasSidebar={true}
      />
    </div>
  );
}
