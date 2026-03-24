import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from './common/Button';
import bannerImage from '../assets/images/teacher.png';

const Hero = ({ onGetStarted }) => {
  return (
    <section
      className="text-white relative overflow-hidden flex w-full justify-center items-center"
      style={{
        backgroundImage: `url(${bannerImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
        backgroundPosition: 'top center',
        width: '100%',
        height: '100vh',
        position: 'relative',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        {/* Decorative Curly Ribbons - Top Right */}
        <svg className="absolute top-20 right-32 w-40 h-40 opacity-30 animate-pulse" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 20 50 Q 50 20, 80 50 T 140 50" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 30 80 Q 60 50, 90 80 T 150 80" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 40 110 Q 70 80, 100 110 T 160 110" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
        </svg>

        {/* Decorative Curly Ribbons - Middle Right */}
        <svg className="absolute top-1/2 -right-20 w-48 h-48 opacity-25 animate-pulse" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 20 40 Q 50 60, 80 40 T 140 40" stroke="rgba(255,200,124,0.5)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 10 80 Q 50 100, 90 80 T 170 80" stroke="rgba(255,200,124,0.4)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 30 120 Q 70 140, 110 120 T 190 120" stroke="rgba(255,200,124,0.3)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Decorative Curly Ribbons - Bottom Right */}
        <svg className="absolute bottom-32 right-16 w-44 h-44 opacity-20 animate-pulse" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 10 60 Q 40 40, 70 60 T 130 60" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 20 100 Q 50 80, 80 100 T 140 100" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 30 140 Q 60 120, 90 140 T 150 140" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10 w-full">
        <div className="max-w-2xl">
          {/* Left Side - Text Content */}
          <div className="space-y-8 text-left animate-slideUp ml-4 md:ml-6 lg:ml-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white" style={{ fontSize: '3vw', paddingBottom: '1vw' }}>
              Generate Intelligent Lessons in Minutes
            </h1>

            <p className="text-lg md:text-xl text-purple-100 leading-relaxed">
              Generate dynamic lessons, worksheets, activities, and assessments instantly. Powered by intelligent multi-agent AI, delivering fresh, curriculum-aligned content every time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-12">
              <Button
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 flex items-center justify-center gap-2 shadow-lg"
                onClick={onGetStarted}
                style={{ marginTop: '2vw', padding: '0.8vw' }}
              >
                Start Generating Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
