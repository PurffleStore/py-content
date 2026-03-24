import React from 'react';
import lessonImage from '../assets/images/lesson.png';
import poemsImage from '../assets/images/poems.png';
import essaysImage from '../assets/images/essays.png';
import grammarImage from '../assets/images/grammar.png';
import storiesImage from '../assets/images/stories.png';
import worksheetsImage from '../assets/images/worksheet.png';

const LESSON_CARDS = [
  { id: 1, label: 'Stories', chapterId: 1, image: storiesImage },        // Chapter 1: Stories and Characters
  { id: 2, label: 'Grammar', chapterId: 2, image: grammarImage },        // Chapter 2: Grammar Basics
  { id: 3, label: 'Vocabulary', chapterId: 3, image: lessonImage },      // Chapter 3: Vocabulary Development
  { id: 4, label: 'Reading', chapterId: 4, image: worksheetsImage },     // Chapter 4: Reading Comprehension
  { id: 5, label: 'Writing', chapterId: 5, image: essaysImage },         // Chapter 5: Writing Skills
  { id: 6, label: 'Phonics', chapterId: 7, image: lessonImage },         // Chapter 7: Phonics and Spelling
  { id: 7, label: 'Poems', chapterId: 8, image: poemsImage },            // Chapter 8: Poetry and Creative Expression
  { id: 8, label: 'Non-fiction', chapterId: 9, image: worksheetsImage }, // Chapter 9: Non-fiction and Information
];

const CurriculumSelector = ({ onSelect, selectedChapterId = 1 }) => {
  const selectedCard = LESSON_CARDS.find((card) => card.chapterId === selectedChapterId) ?? LESSON_CARDS[0];

  const handleCardSelect = (card) => {
    const firstLessonId = 1;
    onSelect(card.chapterId, firstLessonId);
  };

  return (
    <div className="w-full space-y-8">
      <div className="max-w-md space-y-3">
        <h2 className="text-3xl font-bold text-gray-800 leading-tight">Select Curriculum</h2>
        <p className="text-gray-600 text-lg leading-relaxed">Choose a lesson category to open Lesson 1 content.</p>
      </div>

      <div className="flex justify-center">
        <div className="grid w-full max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LESSON_CARDS.map((card) => {
            const isActive = card.chapterId === selectedCard.chapterId;

            return (
              <button
                key={card.id}
                onClick={() => handleCardSelect(card)}
                className={`text-left bg-white rounded-xl border overflow-hidden shadow-sm transition-all duration-200 ${
                  isActive
                    ? 'border-orange-500 ring-2 ring-orange-200 shadow-md'
                    : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                }`}
              >
                <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                  <img src={card.image} alt={card.label} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-xl font-semibold text-gray-800 leading-snug text-center">{card.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CurriculumSelector;
