import React from 'react';
import { ArrowRight, Sparkles, BookOpen, Users, Zap } from 'lucide-react';
import Button from './common/Button';

const Hero = ({ onGetStarted }) => {
  return (
    <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-black text-white min-h-screen relative overflow-hidden flex w-full justify-center items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8 text-left animate-slideUp ml-4 md:ml-6 lg:ml-8">
            <div className="inline-block bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm font-semibold mb-2 border border-white/20">
              <Sparkles className="w-4 h-4 inline mr-2" />
              AI-Powered Education Platform
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">
              Generate Professional English Lessons in Minutes
            </h1>

            <p className="text-lg md:text-xl text-purple-100 leading-relaxed">
              Create comprehensive Grade 3 lessons, practice exercises, and assessments aligned with Tamil Nadu curriculum. Powered by Claude AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 flex items-center justify-center gap-2 shadow-lg"
                onClick={onGetStarted}
              >
                Start Generating Now
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 backdrop-blur-sm"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 md:pt-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/30 transition">
                <p className="text-3xl md:text-4xl font-bold">10</p>
                <p className="text-purple-200 text-sm mt-2">Chapters</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/30 transition">
                <p className="text-3xl md:text-4xl font-bold">60</p>
                <p className="text-purple-200 text-sm mt-2">Lessons</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/30 transition">
                <p className="text-3xl md:text-4xl font-bold">$24</p>
                <p className="text-purple-200 text-sm mt-2">Full Access</p>
              </div>
            </div>
          </div>

          {/* Right Side - Network Visualization */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-lg h-96">
              {/* Center circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl z-10">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Orbiting elements */}
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 300 300">
                {/* Orbital circles */}
                <circle cx="150" cy="150" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </svg>

              {/* Orbiting items - positioned around the center */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl border-2 border-purple-300 flex items-center justify-center shadow-xl transform hover:scale-110 transition">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="absolute right-0 top-1/2 transform translate-x-4 -translate-y-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl border-2 border-blue-300 flex items-center justify-center shadow-xl transform hover:scale-110 transition">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl border-2 border-pink-300 flex items-center justify-center shadow-xl transform hover:scale-110 transition">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="absolute left-0 top-1/2 transform -translate-x-4 -translate-y-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl border-2 border-green-300 flex items-center justify-center shadow-xl transform hover:scale-110 transition">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* 4 corner elements */}
              <div className="absolute top-12 left-12">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl border border-orange-300 flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
              </div>

              <div className="absolute top-12 right-12">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl border border-purple-300 flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                  <span className="text-white font-bold text-sm">📚</span>
                </div>
              </div>

              <div className="absolute bottom-12 left-12">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl border border-cyan-300 flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
              </div>

              <div className="absolute bottom-12 right-12">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl border border-yellow-300 flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                  <span className="text-white font-bold text-sm">💡</span>
                </div>
              </div>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <p className="text-2xl font-bold text-white">60+</p>
                <p className="text-sm text-purple-200">Lessons Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
