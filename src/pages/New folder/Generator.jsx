import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Eye,
  Mic,
  Plus,
  Rocket,
  RotateCcw,
  Square,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useGeneration } from '../context/GenerationContext';
import { generateLesson, startBatchGeneration } from '../utils/api';

import worksheetsImg from '../assets/images/worksheets.JPG';
import teacherGuideImg from '../assets/images/teacher-guide.JPG';
import practiceExercisesImg from '../assets/images/practice-excer.JPG';
import gradingRubricImg from '../assets/images/grading-rubric.JPG';
import multiMediaImg from '../assets/images/multi-media.JPG';
import resourceWorksheetImg from '../assets/images/resource-worksheet.JPG';
import './Generator.css';

const Generator = () => {
  const navigate = useNavigate();
  const {
    isGenerating,
    generationResult,
    progress,
    error,
    completeGeneration,
    setGenerationStep,
    setGenerationError,
    startBatchGeneration: startBatchCtx,
  } = useGeneration();

  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    chapter: '',
    level: '',
    resources: [],
  });

  const [generationPrompt, setGenerationPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedLesson, setSelectedLesson] = useState(1);

  const subjects = [
    { value: 'english',  label: 'English',     disabled: false },
    { value: 'math',     label: 'Mathematics', disabled: true  },
    { value: 'science',  label: 'Science',      disabled: true  },
  ];

  const grades = [
    { value: '1', label: 'Grade 1' },
    { value: '2', label: 'Grade 2' },
    { value: '3', label: 'Grade 3' },
    { value: '4', label: 'Grade 4' },
    { value: '5', label: 'Grade 5' },
    { value: '6', label: 'Grade 6' },
  ];

  const chaptersBySubject = {
    english: [
      { id: 1, label: 'Stories and Narratives' },
      { id: 2, label: 'Grammar Fundamentals' },
      { id: 3, label: 'Vocabulary Development' },
      { id: 4, label: 'Reading Comprehension' },
      { id: 5, label: 'Writing Skills' },
      { id: 6, label: 'Poetry and Literature' },
      { id: 7, label: 'Communication' },
      { id: 8, label: 'Critical Thinking' },
    ],
    math: [
      { id: 1, label: 'Numbers and Operations' },
      { id: 2, label: 'Addition and Subtraction' },
      { id: 3, label: 'Multiplication and Division' },
      { id: 4, label: 'Fractions' },
      { id: 5, label: 'Geometry' },
      { id: 6, label: 'Measurement' },
      { id: 7, label: 'Data and Statistics' },
      { id: 8, label: 'Problem Solving' },
    ],
    science: [
      { id: 1, label: 'Living Things' },
      { id: 2, label: 'Plants and Animals' },
      { id: 3, label: 'Human Body' },
      { id: 4, label: 'Earth and Space' },
      { id: 5, label: 'Weather and Climate' },
      { id: 6, label: 'Matter and Materials' },
      { id: 7, label: 'Forces and Motion' },
      { id: 8, label: 'Energy' },
    ],
  };

  const chapters = chaptersBySubject[formData.subject] || [];

  const levels = [
    { value: 'basic', label: 'Beginner' },
    { value: 'medium', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const resources = [
    { id: 'videos', label: 'Educational Videos', image: worksheetsImg },
    { id: 'guide', label: 'Teaching Aids', image: teacherGuideImg },
    { id: 'exercises', label: 'Printable Activities', image: practiceExercisesImg },
    { id: 'assessment', label: 'Research Articles', image: gradingRubricImg },
    { id: 'multimedia', label: 'Multimedia Content', image: multiMediaImg },
    { id: 'worksheet', label: 'Worksheets Pack', image: resourceWorksheetImg },
  ];

  useEffect(() => {
    if (!isGenerating) return;

    const generateLessonContent = async () => {
      try {
        setGenerationStep(1, 25);
        const startTime = Date.now();
        const response = await generateLesson(selectedChapter, selectedLesson, {
          grade: formData.grade,
          subject: formData.subject,
          level: formData.level,
          contentType: 'lessons',
          prompt: generationPrompt,
          resources: formData.resources,
        });
        setGenerationStep(1, 50);
        const endTime = Date.now();
        const generationTime = endTime - startTime;
        const { data } = response;
        const fullText = data.content?.fullContent || '';
        const wordCount = fullText.split(/\s+/).filter((w) => w.length > 0).length;
        const exerciseCount = (data.content?.exercises || '').split(/\n/).filter((l) => l.trim()).length || 15;
        const vocabularyList = (data.content?.vocabulary || '').split(/\n/).filter((l) => l.trim()) || [];
        setGenerationStep(2, 75);
        const result = {
          title: `${data.chapter}, Lesson ${data.lesson}`,
          chapter: data.chapter,
          lesson: data.lesson,
          objectives: data.objectives,
          estimatedTime: data.estimatedTime,
          wordCount: wordCount > 0 ? wordCount : 750,
          exerciseCount: exerciseCount > 0 ? exerciseCount : 15,
          vocabularyCount: vocabularyList.length > 0 ? vocabularyList.length : 20,
          cost: 0.04,
          generationTime,
          rawData: data,
          selectedResources: formData.resources,
          formData,
          content: {
            theory: data.content?.introduction || data.content?.mainConcept || 'Lesson content',
            fullContent: data.content?.fullContent || '',
            mainConcept: data.content?.mainConcept || '',
            examples: data.content?.examples || '',
            activities: data.content?.activities || '',
            exercises: data.content?.exercises || '',
            vocabulary: vocabularyList,
            assessment: data.content?.assessment || '',
          },
        };
        setGenerationStep(3, 90);
        completeGeneration(result);
      } catch (err) {
        console.error('Generation error:', err);
        setGenerationError(err.message || 'Generation failed. Please try again.');
      }
    };

    generateLessonContent();
  }, [completeGeneration, formData, generationPrompt, isGenerating, selectedChapter, selectedLesson, setGenerationError, setGenerationStep]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const handleGenerate = async () => {
    if (!formData.subject || !formData.grade || !formData.chapter || !formData.level) {
      setGenerationError('Please select subject, grade, chapter and level');
      return;
    }

    const chapterObj = chapters.find((c) => String(c.id) === String(formData.chapter));
    const chapterName = chapterObj ? chapterObj.label : `Chapter ${formData.chapter}`;

    try {
      const result = await startBatchGeneration({
        subject: formData.subject,
        grade: formData.grade,
        level: formData.level,
        chapter: chapterName,
        resources: formData.resources,
        prompt: generationPrompt.trim(),
      });

      if (result.success && result.jobId) {
        startBatchCtx(result.jobId, {
          subject: formData.subject,
          grade: formData.grade,
          level: formData.level,
          chapter: chapterName,
          resources: formData.resources,
          prompt: generationPrompt.trim(),
        });
        navigate(`/generated-lessons?jobId=${result.jobId}`);
      }
    } catch (err) {
      setGenerationError(err.message || 'Failed to start generation');
    }
  };

  const toggleResource = (resourceLabel) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.includes(resourceLabel)
        ? prev.resources.filter((label) => label !== resourceLabel)
        : [...prev.resources, resourceLabel],
    }));
  };

  const handleViewLesson = () => {
    if (generationResult) navigate('/lesson-view', { state: { lesson: generationResult } });
  };

  const handleDownload = () => {
    try {
      if (!generationResult) return;
      const fullContent = generationResult.content?.fullContent || generationResult.content?.theory || '';
      const content = `${generationResult.title}\n${'='.repeat(generationResult.title.length)}\n\nChapter: ${generationResult.chapter}\nLesson: ${generationResult.lesson}\nEstimated Time: ${generationResult.estimatedTime}\n\nLearning Objectives:\n${(generationResult.objectives || []).map((obj) => `- ${obj}`).join('\n')}\n\n${fullContent}\n\nGenerated at: ${new Date().toLocaleString()}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lesson-${selectedChapter}-${selectedLesson}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setGenerationError('Download failed');
    }
  };

  const handleReloadPage = () => window.location.reload();

  const handlePickFiles = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setAttachedFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}-${file.size}`));
      return [...prev, ...files.filter((file) => !existing.has(`${file.name}-${file.size}`))];
    });
    event.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleMicToggle = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setGenerationError('Voice input is not supported in this browser.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) transcript += event.results[i][0].transcript;
      setGenerationPrompt(transcript.trim());
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const hasResult = Boolean(generationResult);
  const selectedResourceCount = formData.resources.length;
  const hasPrompt = generationPrompt.trim().length > 0;
  const progressValue = Number(progress) || 0;

  const actionButtons = [
    {
      icon: <Eye size={18} />,
      label: 'View content',
      onClick: handleViewLesson,
      disabled: !hasResult,
    },
    {
      icon: <Download size={18} />,
      label: 'Download file',
      onClick: handleDownload,
      disabled: !hasResult,
    },
    {
      icon: <RotateCcw size={18} />,
      label: 'Reset form',
      onClick: handleReloadPage,
      disabled: false,
    },
  ];

  return (
    <div className="generator-page">
      <main className="generator-shell">
        <section className="generator-hero">
          <div>
            <p className="generator-kicker">Lesson Generator</p>
            <h1>Create polished, curriculum-ready lessons with a cleaner global product experience.</h1>
            <p className="generator-subtext">
              Configure the lesson, add optional guidance, select resource outputs, and launch a structured
              generation flow designed for schools, teachers, and international classroom teams.
            </p>
          </div>
          <div className="generator-hero-card">
            <div className="generator-hero-stat">
              <span>Workflow</span>
              <strong>4-lesson batch generation</strong>
            </div>
            <div className="generator-hero-stat">
              <span>Outputs</span>
              <strong>Lesson pages, resources, worksheets</strong>
            </div>
            <div className="generator-hero-stat">
              <span>Status</span>
              <strong>{isGenerating ? 'Generation in progress' : 'Ready to start'}</strong>
            </div>
          </div>
        </section>

        {error && <div className="generator-alert">{error}</div>}

        <div className="generator-layout">
          <section className="generator-main-card">
            <div className="generator-card-head">
              <div>
                <p className="generator-section-label">Configuration</p>
                <h2>Build your lesson brief</h2>
                <p className="generator-card-subtitle">Set the core teaching parameters before you generate.</p>
              </div>
              <div className="generator-badge">International-ready workflow</div>
            </div>

            <div className="generator-form-grid">
              <label className="generator-field">
                <span>Subject</span>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value, chapter: '' })}
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.value} value={subject.value} disabled={subject.disabled}>
                      {subject.label}{subject.disabled ? ' (coming soon)' : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="generator-field">
                <span>Grade</span>
                <select value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })}>
                  <option value="">Select grade</option>
                  {grades.map((grade) => (
                    <option key={grade.value} value={grade.value}>{grade.label}</option>
                  ))}
                </select>
              </label>

              <label className="generator-field">
                <span>Chapter</span>
                <select
                  value={formData.chapter}
                  disabled={!formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, chapter: e.target.value });
                    setSelectedChapter(Number(e.target.value) || 1);
                  }}
                >
                  <option value="">
                    {formData.subject ? 'Select chapter' : 'Select a subject first'}
                  </option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>{chapter.label}</option>
                  ))}
                </select>
              </label>

              <label className="generator-field">
                <span>Level</span>
                <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
                  <option value="">Select level</option>
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="generator-divider" />

            <div className="generator-card-head generator-card-head-tight">
              <div>
                <p className="generator-section-label">Custom Guidance</p>
                <h2>Refine the brief</h2>
                <p className="generator-card-subtitle">Add instructions, upload files, or dictate a prompt.</p>
              </div>
              {hasPrompt && <div className="generator-status-pill">Prompt active</div>}
            </div>

            <div className="generator-prompt-shell">
              <textarea
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                placeholder="Describe the tone, learning objectives, teaching method, cultural context, or classroom outcomes you want the lesson to follow."
                className="generator-prompt"
              />

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <div className="generator-prompt-toolbar">
                <div className="generator-prompt-actions">
                  <button type="button" className="generator-icon-btn" onClick={handlePickFiles} title="Attach files">
                    <Plus size={16} />
                  </button>
                  <button
                    type="button"
                    className={`generator-icon-btn ${isListening ? 'is-active' : ''}`}
                    onClick={handleMicToggle}
                    title={isListening ? 'Stop recording' : 'Use microphone'}
                  >
                    {isListening ? <Square size={15} /> : <Mic size={16} />}
                  </button>
                </div>

                <button type="button" className="generator-inline-generate" onClick={handleGenerate}>
                  <Rocket size={16} />
                  Generate now
                </button>
              </div>
            </div>

            {attachedFiles.length > 0 && (
              <div className="generator-chip-row">
                {attachedFiles.map((file, index) => (
                  <button
                    key={`${file.name}-${file.size}-${index}`}
                    type="button"
                    className="generator-chip"
                    onClick={() => removeAttachment(index)}
                    title="Remove attachment"
                  >
                    {file.name} x
                  </button>
                ))}
              </div>
            )}

            <div className="generator-divider" />

            <div className="generator-card-head generator-card-head-tight">
              <div>
                <p className="generator-section-label">Resources</p>
                <h2>Select supporting outputs</h2>
                <p className="generator-card-subtitle">Choose the supporting materials you want bundled with the lesson.</p>
              </div>
              <div className="generator-resource-count">{selectedResourceCount} selected</div>
            </div>

            <div className="generator-resource-grid">
              {resources.map((resource) => {
                const isSelected = formData.resources.includes(resource.label);
                return (
                  <button
                    key={resource.id}
                    type="button"
                    className={`generator-resource-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleResource(resource.label)}
                  >
                    <img src={resource.image} alt={resource.label} />
                    <div className="generator-resource-body">
                      <span>{resource.label}</span>
                      {isSelected && <CheckCircle2 size={16} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="generator-sidebar">
            <section className="generator-side-card generator-progress-card">
              <p className="generator-section-label">Generation State</p>
              <h3>{isGenerating ? 'Generating content' : 'Ready to generate'}</h3>
              <p>
                {isGenerating
                  ? 'Your request is moving through the writing and formatting pipeline.'
                  : 'Complete the lesson brief, then launch generation when you are ready.'}
              </p>
              <div className="generator-progress-track">
                <div className="generator-progress-fill" style={{ width: `${Math.min(progressValue, 100)}%` }} />
              </div>
              <div className="generator-progress-meta">
                <span>{Math.min(progressValue, 100)}%</span>
                <span>{hasResult ? 'Last result available' : 'No result yet'}</span>
              </div>
            </section>

            <section className="generator-side-card">
              <p className="generator-section-label">Action Center</p>
              <h3>Post-generation tools</h3>
              <div className="generator-action-list">
                {actionButtons.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="generator-action-btn"
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="generator-side-card generator-summary-card">
              <p className="generator-section-label">Selection Summary</p>
              <ul>
                <li><span>Subject</span><strong>{formData.subject || 'Not selected'}</strong></li>
                <li><span>Grade</span><strong>{formData.grade ? `Grade ${formData.grade}` : 'Not selected'}</strong></li>
                <li><span>Chapter</span><strong>{chapters.find((item) => String(item.id) === String(formData.chapter))?.label || 'Not selected'}</strong></li>
                <li><span>Level</span><strong>{levels.find((item) => item.value === formData.level)?.label || 'Not selected'}</strong></li>
                <li><span>Resources</span><strong>{selectedResourceCount || 0}</strong></li>
                <li><span>Prompt</span><strong>{hasPrompt ? 'Included' : 'Not added'}</strong></li>
              </ul>
            </section>
          </aside>
        </div>

        <section className="generator-footer-bar">
          <div>
            <p className="generator-section-label">Launch</p>
            <h2>Generate the lesson package</h2>
            <p className="generator-card-subtitle">This starts the 4-lesson batch process with your current configuration.</p>
          </div>
          <button type="button" className="generator-primary-cta" onClick={handleGenerate}>
            <Sparkles size={18} />
            {hasPrompt ? 'Generate with custom prompt' : 'Generate lesson package'}
          </button>
        </section>
      </main>
    </div>
  );
};

export default Generator;
