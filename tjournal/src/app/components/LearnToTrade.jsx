'use client';

import { useState } from "react";
import { ArrowLeft, BookOpen, Play, Users, Award, TrendingUp, Target, Shield, Clock, Star } from "lucide-react";
import Link from "next/link";
import Footer from './Footer';

export default function LearnToTrade() {
  const [selectedCategory, setSelectedCategory] = useState('basics');

  const categories = [
    { id: 'basics', name: 'Trading Basics', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'analysis', name: 'Technical Analysis', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'psychology', name: 'Trading Psychology', icon: <Target className="w-5 h-5" /> },
    { id: 'risk', name: 'Risk Management', icon: <Shield className="w-5 h-5" /> },
  ];

  const courses = {
    basics: [
      {
        id: 1,
        title: "What is Trading?",
        description: "Learn the fundamentals of financial markets and trading concepts.",
        duration: "15 min",
        level: "Beginner",
        rating: 4.8,
        students: 1250,
        isCompleted: false,
        isLocked: false
      },
      {
        id: 2,
        title: "Market Types & Instruments",
        description: "Understand different markets: Forex, Stocks, Crypto, and more.",
        duration: "25 min",
        level: "Beginner",
        rating: 4.7,
        students: 980,
        isCompleted: false,
        isLocked: false
      },
      {
        id: 3,
        title: "Reading Price Charts",
        description: "Master the art of reading and interpreting price movements.",
        duration: "30 min",
        level: "Beginner",
        rating: 4.9,
        students: 2100,
        isCompleted: false,
        isLocked: false
      }
    ],
    analysis: [
      {
        id: 4,
        title: "Support & Resistance",
        description: "Identify key price levels that influence market movements.",
        duration: "20 min",
        level: "Intermediate",
        rating: 4.8,
        students: 1500,
        isCompleted: false,
        isLocked: false
      },
      {
        id: 5,
        title: "Moving Averages",
        description: "Learn how to use moving averages for trend analysis.",
        duration: "18 min",
        level: "Intermediate",
        rating: 4.6,
        students: 1200,
        isCompleted: false,
        isLocked: false
      },
      {
        id: 6,
        title: "Candlestick Patterns",
        description: "Master Japanese candlestick patterns for better entries.",
        duration: "35 min",
        level: "Intermediate",
        rating: 4.9,
        students: 1800,
        isCompleted: false,
        isLocked: false
      }
    ],
    psychology: [
      {
        id: 7,
        title: "Emotional Control",
        description: "Learn to manage emotions and maintain discipline in trading.",
        duration: "22 min",
        level: "All Levels",
        rating: 4.7,
        students: 1100,
        isCompleted: false,
        isLocked: false
      },
      {
        id: 8,
        title: "Building Confidence",
        description: "Develop the mental strength needed for consistent trading.",
        duration: "28 min",
        level: "All Levels",
        rating: 4.8,
        students: 950,
        isCompleted: false,
        isLocked: false
      }
    ],
    risk: [
      {
        id: 9,
        title: "Position Sizing",
        description: "Learn how to calculate proper position sizes for your trades.",
        duration: "20 min",
        level: "Intermediate",
        rating: 4.9,
        students: 1300,
        isCompleted: false,
        isLocked: false
      },
      {
        id: 10,
        title: "Stop Loss & Take Profit",
        description: "Master the art of setting proper exit points.",
        duration: "25 min",
        level: "Intermediate",
        rating: 4.8,
        students: 1600,
        isCompleted: false,
        isLocked: false
      }
    ]
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Trading School</h1>
                <p className="text-sm text-gray-400">Master the art of trading with our comprehensive courses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 px-6 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Learn to Trade Like a Pro
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
            From beginner basics to advanced strategies, our comprehensive trading courses will help you develop the skills and confidence needed to succeed in the markets.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl font-bold text-blue-400 mb-1">10+</div>
              <div className="text-gray-400 text-sm">Courses</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl font-bold text-green-400 mb-1">5,000+</div>
              <div className="text-gray-400 text-sm">Students</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl font-bold text-yellow-400 mb-1">4.8</div>
              <div className="text-gray-400 text-sm">Rating</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl font-bold text-purple-400 mb-1">Free</div>
              <div className="text-gray-400 text-sm">Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-6">Course Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-800/70'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {category.icon}
                  <span className="text-sm font-medium text-center">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-6">
            {categories.find(c => c.id === selectedCategory)?.name} Courses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses[selectedCategory]?.map((course) => (
              <div
                key={course.id}
                className={`bg-gray-800/50 rounded-xl p-6 border transition-all duration-200 hover:scale-105 ${
                  course.isLocked
                    ? 'border-gray-700/50 opacity-60'
                    : 'border-gray-700/50 hover:border-blue-500/50 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-2">{course.title}</h4>
                    <p className="text-gray-400 text-sm mb-3">{course.description}</p>
                  </div>
                  {course.isLocked && (
                    <div className="text-gray-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-300">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">{course.students.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  disabled={course.isLocked}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    course.isLocked
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : course.isCompleted
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {course.isLocked ? (
                    'Locked'
                  ) : course.isCompleted ? (
                    <div className="flex items-center justify-center gap-2">
                      <Award className="w-4 h-4" />
                      Completed
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      Start Course
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Your Trading Journey?</h3>
          <p className="text-gray-300 mb-6">
            Join thousands of traders who have improved their skills with our comprehensive trading courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-8 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-blue-500/20 transition-all">
              Start Learning Now
            </button>
            <Link
              href="/dashboard"
              className="bg-gray-800 hover:bg-gray-700 px-8 py-3 rounded-xl font-semibold text-white border border-gray-700 transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer hasSidebar={false} />
    </div>
  );
}
