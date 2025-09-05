'use client';

import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

export default function CreatorsSection() {
  return (
    <section id="about" className="py-24 px-6 sm:px-10 bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-6 backdrop-blur-sm">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-300">Meet the Creator</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-white">Built by a</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ml-3">Trader, for Traders</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Created with passion and expertise to help fellow traders grow and succeed in their trading journey.
          </p>
        </div>

        {/* Creator Card */}
        <div className="max-w-4xl mx-auto">
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-700/50">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full p-1">
                      <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700 overflow-hidden">
                        <img 
                          src="/neo.jpg" 
                          alt="Neo Dela Torre" 
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            console.log('Image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={() => console.log('Image loaded successfully')}
                        />
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                          <span className="text-2xl md:text-3xl font-bold text-white">ND</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Neo Dela Torre</h3>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                      <span className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium border border-blue-500/20">
                        Computer Engineer
                      </span>
                      <span className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-medium border border-purple-500/20">
                        Forex Trader
                      </span>
                    </div>
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                      Hi, I'm Neo Dela Torre, a Computer Engineer and Forex Trader. I created this platform to provide value to traders and help them grow in their trading journey. I hope you enjoy using it and find it helpful for your trading success. Thank you very much!
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <a 
                      href="#" 
                      className="p-3 bg-gray-800/50 hover:bg-blue-500/20 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group"
                      title="GitHub"
                    >
                      <Github className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                    </a>
                    <a 
                      href="#" 
                      className="p-3 bg-gray-800/50 hover:bg-blue-600/20 rounded-xl border border-gray-700/50 hover:border-blue-600/50 transition-all duration-300 group"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                    </a>
                    <a 
                      href="#" 
                      className="p-3 bg-gray-800/50 hover:bg-purple-500/20 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group"
                      title="Email"
                    >
                      <Mail className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
                    </a>
                    <a 
                      href="#" 
                      className="p-3 bg-gray-800/50 hover:bg-green-500/20 rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 group"
                      title="Portfolio"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors duration-300" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Quote Section */}
              <div className="mt-8 pt-8 border-t border-gray-700/50">
                <div className="text-center">
                  <blockquote className="text-xl md:text-2xl font-medium text-gray-300 italic mb-4">
                    "Building tools that empower traders to make better decisions and achieve their financial goals."
                  </blockquote>
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-sm">Mission Statement</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
