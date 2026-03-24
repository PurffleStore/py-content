import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes
});

export const generateLesson = async (chapterId, lessonId, options = {}) => {
  try {
    const response = await apiClient.post('/lessons/generate', {
      chapter: chapterId,
      lesson: lessonId,
      grade: options.grade || '3',
      subject: options.subject || 'english',
      level: options.level || 'medium',
      resources: options.resources || [], // Include selected resources
      options: {
        style: options.style || 'formal',
        language: options.language || 'simple',
      },
    });

    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // Handle specific error codes
    if (status === 429 || status === 529) {
      throw new Error('API is temporarily overloaded. The system is retrying... Please wait.');
    } else if (status === 500) {
      throw new Error(message || 'Server error. Please try again.');
    } else if (status === 400) {
      throw new Error(message || 'Invalid request. Please check your selection.');
    } else if (error.message === 'Network Error') {
      throw new Error('Unable to connect to the server. Make sure the backend is running on port 3001.');
    }

    throw new Error(message || 'Failed to generate lesson. Please try again.');
  }
};

export const checkGenerationStatus = async (lessonId) => {
  try {
    const response = await apiClient.get(`/status/${lessonId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to check status');
  }
};

export const downloadLesson = async (lessonId, format = 'docx') => {
  try {
    const response = await apiClient.get(`/download/${lessonId}`, {
      params: { format },
      responseType: 'blob',
    });

    // Create blob URL and download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lesson-${lessonId}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.parentElement.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to download lesson');
  }
};

export const getCurriculumData = async () => {
  try {
    const response = await apiClient.get('/curriculum');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load curriculum');
  }
};

export const getDownloadHistory = async () => {
  try {
    const response = await apiClient.get('/history');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load history');
  }
};

// ─── Batch Lesson Generation ───

export const startBatchGeneration = async ({ subject, grade, level, chapter, resources, prompt, lessonCount = 1, poemCount = 3, vocabCount = 6, storyDepth = 1, promptCount = 3, contentType = 'lesson' }) => {
  try {
    const response = await apiClient.post('/lessons/batch/generate', {
      subject, grade, level, chapter, resources,
      prompt: prompt || '',
      lessonCount:  Math.min(Math.max(1, parseInt(lessonCount)  || 1), 4),
      poemCount:    Math.min(Math.max(1, parseInt(poemCount)    || 2), 6),
      vocabCount:   Math.min(Math.max(4, parseInt(vocabCount)   || 6), 12),
      storyDepth:   Math.min(Math.max(1, parseInt(storyDepth)   || 1), 3),
      promptCount:  Math.min(Math.max(2, parseInt(promptCount)  || 3), 5),
      contentType,
    });
    return response.data; // { success: true, jobId: '...' }
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    if (status === 400) throw new Error(message || 'Invalid request.');
    if (error.message === 'Network Error') throw new Error('Unable to connect to the server.');
    throw new Error(message || 'Failed to start batch generation.');
  }
};

export const getBatchJobResult = async (jobId) => {
  try {
    const response = await apiClient.get(`/lessons/batch/${jobId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get job result');
  }
};

/**
 * Connect to SSE progress stream for a batch job.
 * @returns {{ close: () => void }} - Call close() to disconnect
 */
export const subscribeBatchProgress = (jobId, onProgress, onError) => {
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  const url = `${baseUrl}/api/lessons/batch/progress/${jobId}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onProgress(data);
    } catch {}
  };

  eventSource.onerror = () => {
    if (onError) onError(new Error('SSE connection error'));
    eventSource.close();
  };

  return { close: () => eventSource.close() };
};

// ─── Textbook Content Generation ───

export const startTextbookGeneration = async (lessonData) => {
  try {
    const response = await apiClient.post('/textbook/generate', { lessonData });
    return response.data; // { success: true, jobId: '...' }
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    if (status === 400) throw new Error(message || 'Invalid lesson data.');
    if (error.message === 'Network Error') throw new Error('Unable to connect to the server.');
    throw new Error(message || 'Failed to start textbook generation.');
  }
};

export const getTextbookResult = async (jobId) => {
  try {
    const response = await apiClient.get(`/textbook/${jobId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get textbook result');
  }
};

/**
 * Connect to SSE progress stream for textbook generation.
 * Receives: progress updates, outline, individual sections, summary, complete/error.
 * @returns {{ close: () => void }}
 */
export const subscribeTextbookProgress = (jobId, onMessage, onError) => {
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  const url = `${baseUrl}/api/textbook/progress/${jobId}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {}
  };

  eventSource.onerror = () => {
    if (onError) onError(new Error('SSE connection error'));
    eventSource.close();
  };

  return { close: () => eventSource.close() };
};

export const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');

// ── Presentation Generation ────────────────────────────────────────────────

/**
 * Generate a presentation from topic/prompt/file.
 * @param {FormData} formData - topic, grade, subject, slideCount, style, extraText, file
 */
export const generatePresentation = async (formData) => {
  try {
    const response = await apiClient.post('/presentation/generate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 360000, // 6 min — includes image generation for all slides
    });
    return response.data; // { success, presentation }
  } catch (error) {
    const status  = error.response?.status;
    const message = error.response?.data?.error;
    if (status === 400) throw new Error(message || 'Invalid request.');
    if (error.message === 'Network Error') throw new Error('Unable to connect to the server.');
    throw new Error(message || 'Failed to generate presentation.');
  }
};

// ── History API ──────────────────────────────────────────────────────────────

/** List all saved lessons (summaries) */
export const getHistory = async () => {
  const { data } = await apiClient.get('/history');
  return data; // { success, lessons, total }
};

/** Get a single saved lesson's full data */
export const getHistoryLesson = async (id) => {
  const { data } = await apiClient.get(`/history/${id}`);
  return data; // { success, record }
};

/** Delete a saved lesson by id */
export const deleteHistoryLesson = async (id) => {
  const { data } = await apiClient.delete(`/history/${id}`);
  return data; // { success, message }
};

export default apiClient;
