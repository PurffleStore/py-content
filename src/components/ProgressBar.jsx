import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import Card from './common/Card';
import { GENERATION_STEPS } from '../utils/constants';
import { formatTime } from '../utils/formatters';

const ProgressBar = ({ isVisible, currentStep = 0, progress = 0, onCancel }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const seconds = Math.floor((now - startTime) / 1000);
      setElapsedTime(seconds);
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, startTime]);

  if (!isVisible) return null;

  const totalEstimatedTime = 180; // 3 minutes
  const estimatedRemaining = Math.max(0, totalEstimatedTime - elapsedTime);
  const currentStepData = GENERATION_STEPS[currentStep] || GENERATION_STEPS[0];

  return (
    <Card className="space-y-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-800">Generation in Progress</h3>
        <p className="text-gray-600">{currentStepData.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-orange-600">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase">Steps</p>
        <div className="grid grid-cols-4 gap-2">
          {GENERATION_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 ${
                index <= currentStep
                  ? 'bg-white shadow-md'
                  : 'bg-gray-100 opacity-50'
              }`}
            >
              <div className="relative">
                {index < currentStep ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : index === currentStep ? (
                  <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full spinner"></div>
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <p className="text-xs font-semibold text-center text-gray-700 line-clamp-2">{step.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Time Information */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-lg">
        <div>
          <p className="text-xs text-gray-600 font-semibold">Elapsed Time</p>
          <p className="text-lg font-bold text-gray-800">{formatTime(elapsedTime)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-semibold">Estimated Remaining</p>
          <p className="text-lg font-bold text-orange-600">{formatTime(estimatedRemaining)}</p>
        </div>
      </div>

      {/* Current Step Detail */}
      <div className="p-3 bg-white border-l-4 border-l-orange-600 rounded">
        <p className="text-xs text-gray-600 font-semibold">Current Step</p>
        <p className="text-base font-bold text-gray-800">{currentStepData.label}</p>
        <p className="text-sm text-gray-600 mt-1">{currentStepData.description}</p>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors duration-200"
        >
          Cancel Generation
        </button>
      )}
    </Card>
  );
};

export default ProgressBar;
