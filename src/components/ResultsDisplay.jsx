import React, { useState } from 'react';
import { Download, ChevronDown, ChevronUp, Share2, CheckCircle2 } from 'lucide-react';
import Card from './common/Card';
import Button from './common/Button';
import { formatCost, formatTime } from '../utils/formatters';

const ResultsDisplay = ({ result, isVisible, onDownload, onGenerateAnother, onViewLesson, isDownloading = false }) => {
  const [expandedSections, setExpandedSections] = useState({
    content: true,
    exercises: false,
    vocabulary: false,
  });

  if (!isVisible || !result) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleShare = async (platform) => {
    const text = `I just generated "${result.title}" using Learn English Grade 3 Generator!`;

    if (platform === 'copy') {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(result.title)}&body=${encodeURIComponent(text)}`;
    }
  };

  return (
    <div className="space-y-6 animate-slideUp">
      {/* Success Message */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-green-800 mb-1">Generation Complete!</h3>
            <p className="text-green-700">Your lesson is ready to download and use in your classroom.</p>
          </div>
        </div>
      </Card>

      {/* Lesson Details Summary */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{result.title}</h2>
          <p className="text-gray-600 mt-1">Generated successfully</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-semibold uppercase">Word Count</p>
            <p className="text-2xl font-bold text-blue-900">{result.wordCount.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">words</p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 font-semibold uppercase">Problems</p>
            <p className="text-2xl font-bold text-purple-900">{result.exerciseCount}</p>
            <p className="text-xs text-purple-600 mt-1">exercises</p>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-600 font-semibold uppercase">Cost</p>
            <p className="text-2xl font-bold text-orange-900">{formatCost(result.cost)}</p>
            <p className="text-xs text-orange-600 mt-1">for lesson</p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 font-semibold uppercase">Time</p>
            <p className="text-2xl font-bold text-green-900">{formatTime(result.generationTime)}</p>
            <p className="text-xs text-green-600 mt-1">to generate</p>
          </div>
        </div>
      </Card>

      {/* Expandable Sections */}
      <Card className="space-y-2">
        {/* Content Section */}
        <div className="border-b border-gray-200 last:border-b-0">
          <button
            onClick={() => toggleSection('content')}
            className="w-full flex items-center justify-between py-3 px-0 text-left hover:text-orange-600 transition-colors"
          >
            <h4 className="font-semibold text-gray-800">📚 Lesson Content</h4>
            {expandedSections.content ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {expandedSections.content && (
            <div className="pb-4 pl-4 border-l-2 border-orange-400">
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-6">
                {result.content?.theory || 'Lesson content preview...'}
              </p>
              <p className="text-xs text-gray-500 mt-2">... (Full content included in download)</p>
            </div>
          )}
        </div>

        {/* Exercises Section */}
        <div className="border-b border-gray-200 last:border-b-0">
          <button
            onClick={() => toggleSection('exercises')}
            className="w-full flex items-center justify-between py-3 px-0 text-left hover:text-orange-600 transition-colors"
          >
            <h4 className="font-semibold text-gray-800">✏️ Practice Exercises</h4>
            {expandedSections.exercises ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {expandedSections.exercises && (
            <div className="pb-4 pl-4 border-l-2 border-orange-400">
              <p className="text-sm text-gray-700 mb-2">Three difficulty levels:</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>🟢 <strong>Basic:</strong> {Math.ceil(result.exerciseCount / 3)} problems for foundational learning</li>
                <li>🟡 <strong>Intermediate:</strong> {Math.ceil(result.exerciseCount / 3)} problems for practice</li>
                <li>🔴 <strong>Advanced:</strong> {Math.floor(result.exerciseCount / 3)} problems for challenge</li>
              </ul>
            </div>
          )}
        </div>

        {/* Vocabulary Section */}
        <div>
          <button
            onClick={() => toggleSection('vocabulary')}
            className="w-full flex items-center justify-between py-3 px-0 text-left hover:text-orange-600 transition-colors"
          >
            <h4 className="font-semibold text-gray-800">📖 Vocabulary List</h4>
            {expandedSections.vocabulary ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {expandedSections.vocabulary && (
            <div className="pb-4 pl-4 border-l-2 border-orange-400">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {result.content?.vocabulary?.slice(0, 8).map((word, idx) => (
                  <div key={idx} className="p-2 bg-blue-50 rounded">
                    <p className="font-semibold text-blue-900">{word}</p>
                  </div>
                )) || <p className="text-gray-600">Vocabulary included in download</p>}
              </div>
              {result.content?.vocabulary?.length > 8 && (
                <p className="text-xs text-gray-500 mt-2">... and {result.content.vocabulary.length - 8} more words</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* View Lesson Button */}
      {onViewLesson && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300">
          <button
            onClick={onViewLesson}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2 text-lg"
          >
            📖 View Lesson in Book Format
          </button>
        </Card>
      )}

      {/* Download Section */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 space-y-3">
        <h4 className="font-bold text-gray-800">Download Your Lesson</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="success"
            size="lg"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => onDownload('docx')}
            loading={isDownloading}
            disabled={isDownloading}
          >
            <Download className="w-5 h-5" />
            Word Document (.docx)
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => onDownload('pdf')}
            loading={isDownloading}
            disabled={isDownloading}
          >
            <Download className="w-5 h-5" />
            PDF File (.pdf)
          </Button>
        </div>
      </Card>

      {/* Share Section */}
      <Card className="space-y-3">
        <h4 className="font-bold text-gray-800 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share This Generation
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => handleShare('copy')}
          >
            📋 Copy Link
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => handleShare('whatsapp')}
          >
            💬 WhatsApp
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => handleShare('email')}
          >
            ✉️ Email
          </Button>
        </div>
      </Card>

      {/* Next Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onGenerateAnother}
        >
          Generate Another Lesson
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
        >
          View All Chapters
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
