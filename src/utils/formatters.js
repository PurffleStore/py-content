export const formatCost = (cost) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cost);
};

export const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatWordCount = (count) => {
  if (count < 1000) {
    return `${count} words`;
  }
  return `${(count / 1000).toFixed(1)}K words`;
};

export const calculateEstimatedTime = (step) => {
  // Estimated times for each generation step
  const times = {
    0: 0,
    1: 60, // 1 minute for theory
    2: 90, // 1.5 minutes for exercises
    3: 30, // 30 seconds for document
  };
  return times[step] || 0;
};

export const getTimeRemaining = (currentStep, elapsed) => {
  const totalTime = 180; // Total estimated time in seconds
  const remaining = totalTime - elapsed;
  return Math.max(0, remaining);
};
