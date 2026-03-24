import React from 'react';
import Card from './common/Card';
import { FEATURES } from '../utils/constants';

const FeatureCards = () => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why Choose Learn English?</h2>
          <p className="text-gray-600 text-lg">Comprehensive features designed for teachers and schools</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Card
              key={feature.id}
              hover
              className="flex flex-col items-start gap-4"
            >
              <div className="text-5xl">{feature.icon}</div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-blue-50 rounded-xl">
            <p className="text-3xl font-bold text-blue-900">10</p>
            <p className="text-gray-600 text-sm mt-1">Chapters</p>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-xl">
            <p className="text-3xl font-bold text-purple-900">60</p>
            <p className="text-gray-600 text-sm mt-1">Lessons</p>
          </div>
          <div className="text-center p-6 bg-orange-50 rounded-xl">
            <p className="text-3xl font-bold text-orange-900">100%</p>
            <p className="text-gray-600 text-sm mt-1">Curriculum Aligned</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <p className="text-3xl font-bold text-green-900">AI</p>
            <p className="text-gray-600 text-sm mt-1">Powered by Claude</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
