import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const GenerationContext = createContext();

/* ── localStorage helpers ── */
const LS_KEY = 'cs_generation_state';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveToStorage(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}

function clearStorage() {
  try { localStorage.removeItem(LS_KEY); } catch {}
}

export const GenerationProvider = ({ children }) => {
  // Restore persisted state on first load
  const persisted = loadFromStorage();

  const [selectedChapter, setSelectedChapter] = useState(persisted?.selectedChapter ?? 1);
  const [selectedLesson,  setSelectedLesson]  = useState(persisted?.selectedLesson  ?? 1);
  const [isGenerating,    setIsGenerating]    = useState(false);
  const [currentStep,     setCurrentStep]     = useState(0);
  const [progress,        setProgress]        = useState(0);
  const [generationResult,setGenerationResult]= useState(null);
  const [error,           setError]           = useState(null);
  const [advancedOptions, setAdvancedOptions] = useState({
    readingLevel:        'standard',
    includeVocabulary:   true,
    includeTamil:        true,
    exerciseCount:       15,
    includeTeacherNotes: true,
  });

  // Batch generation state — restored from localStorage if available
  const [batchJobId,       setBatchJobId]       = useState(persisted?.batchJobId   || null);
  const [batchLessons,     setBatchLessons]     = useState(persisted?.batchLessons || null);
  const [batchProgress,    setBatchProgress]    = useState({ stage: '', progress: 0, message: '' });
  const [isBatchGenerating,setIsBatchGenerating]= useState(false);
  const [batchParams,      setBatchParams]      = useState(persisted?.batchParams  || null);

  // Persist key state whenever it changes
  useEffect(() => {
    if (batchLessons || batchJobId) {
      saveToStorage({ batchJobId, batchLessons, batchParams, selectedChapter, selectedLesson });
    }
  }, [batchJobId, batchLessons, batchParams, selectedChapter, selectedLesson]);

  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setCurrentStep(0);
    setProgress(0);
    setGenerationResult(null);
    setError(null);
  }, []);

  const startGeneration = useCallback((chapterId, lessonId) => {
    setSelectedChapter(chapterId);
    setSelectedLesson(lessonId);
    setIsGenerating(true);
    setCurrentStep(1);
    setProgress(0);
    setError(null);
  }, []);

  const setGenerationStep = useCallback((step, progressValue = null) => {
    setCurrentStep(step);
    if (progressValue !== null) setProgress(progressValue);
  }, []);

  const completeGeneration = useCallback((result) => {
    setGenerationResult(result);
    setIsGenerating(false);
    setCurrentStep(3);
    setProgress(100);
  }, []);

  const setGenerationError = useCallback((errorMessage) => {
    setError(errorMessage);
    setIsGenerating(false);
    setIsBatchGenerating(false);
  }, []);

  // Batch generation methods
  const startBatchGeneration = useCallback((jobId, params) => {
    setBatchJobId(jobId);
    setBatchParams(params);
    setIsBatchGenerating(true);
    setBatchLessons(null);
    setBatchProgress({ stage: 'starting', progress: 0, message: 'Starting...' });
    setError(null);
  }, []);

  const updateBatchProgress = useCallback((progressData) => {
    setBatchProgress(progressData);
  }, []);

  const completeBatchGeneration = useCallback((lessons) => {
    setBatchLessons(lessons);
    setIsBatchGenerating(false);
    setBatchProgress({ stage: 'complete', progress: 100, message: 'All lessons ready!' });
  }, []);

  const resetBatchGeneration = useCallback(() => {
    setBatchJobId(null);
    setBatchLessons(null);
    setBatchProgress({ stage: '', progress: 0, message: '' });
    setIsBatchGenerating(false);
    setBatchParams(null);
    setError(null);
    clearStorage();
  }, []);

  const value = {
    // Selection state
    selectedChapter,
    selectedLesson,
    setSelectedChapter,
    setSelectedLesson,

    // Single generation state
    isGenerating,
    currentStep,
    progress,
    generationResult,
    error,

    // Advanced options
    advancedOptions,
    setAdvancedOptions,

    // Single generation methods
    startGeneration,
    setGenerationStep,
    completeGeneration,
    setGenerationError,
    resetGeneration,

    // Batch generation state
    batchJobId,
    batchLessons,
    batchProgress,
    isBatchGenerating,
    batchParams,

    // Batch generation methods
    startBatchGeneration,
    updateBatchProgress,
    completeBatchGeneration,
    resetBatchGeneration,
  };

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  );
};

export const useGeneration = () => {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGeneration must be used within GenerationProvider');
  }
  return context;
};
