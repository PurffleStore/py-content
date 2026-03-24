import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Button from './common/Button';
import Card from './common/Card';
import { useGeneration } from '../context/GenerationContext';

const GenerationControls = ({ onGenerate, isLoading = false }) => {
  const { advancedOptions, setAdvancedOptions } = useGeneration();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleReadingLevelChange = (level) => {
    setAdvancedOptions({ ...advancedOptions, readingLevel: level });
  };

  const handleToggle = (key) => {
    setAdvancedOptions({ ...advancedOptions, [key]: !advancedOptions[key] });
  };

  const handleExerciseCountChange = (count) => {
    setAdvancedOptions({ ...advancedOptions, exerciseCount: count });
  };

  const handleGenerateClick = () => {
    onGenerate(advancedOptions);
  };

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Generation Settings</h3>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleGenerateClick}
          disabled={isLoading}
          loading={isLoading}
        >
          {isLoading ? 'Generating...' : '🚀 Generate Lesson Now'}
        </Button>
      </div>

      {/* Basic Options (always visible) */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Reading Level</label>
          <div className="grid grid-cols-3 gap-2">
            {['Basic', 'Standard', 'Advanced'].map((level) => (
              <button
                key={level}
                onClick={() => handleReadingLevelChange(level.toLowerCase())}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  advancedOptions.readingLevel === level.toLowerCase()
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={advancedOptions.includeVocabulary}
              onChange={() => handleToggle('includeVocabulary')}
              className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Include Vocabulary Builder</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={advancedOptions.includeTamil}
              onChange={() => handleToggle('includeTamil')}
              className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Include Tamil Translations</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={advancedOptions.includeTeacherNotes}
              onChange={() => handleToggle('includeTeacherNotes')}
              className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Include Teacher Notes</span>
          </label>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="pt-2 border-t border-gray-200">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 w-full py-2 px-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Number of Exercise Problems ({advancedOptions.exerciseCount})
              </label>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={advancedOptions.exerciseCount}
                onChange={(e) => handleExerciseCountChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>5 problems</span>
                <span>25 problems</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                💡 <strong>Tip:</strong> More problems provide better practice but increase generation time.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GenerationControls;
