# Next Steps - Phase 2 & 3 Implementation Guide

## Phase 2: Backend Integration

### 1. Connect Real API Endpoints

**File**: `src/pages/Home.jsx` (lines ~50-100)

**Current Simulation:**
```javascript
// Replace this simulated generation with real API call
useEffect(() => {
  if (!isGenerating) return;

  const intervals = [
    setTimeout(() => setGenerationStep(1, 25), 1000),
    // ... simulated steps
    setTimeout(() => completeGeneration(...), 6000),
  ];
}, [isGenerating]);
```

**Replace With:**
```javascript
useEffect(() => {
  if (!isGenerating) return;

  const generateContent = async () => {
    try {
      // Start generation
      const result = await generateLesson(
        selectedChapter,
        selectedLesson,
        advancedOptions
      );

      // Poll for progress
      const pollProgress = async () => {
        const status = await checkGenerationStatus(result.lessonId);

        if (status.progress < 100) {
          setGenerationStep(status.step, status.progress);
          setTimeout(pollProgress, 1000); // Poll every second
        } else {
          completeGeneration(status.result);
        }
      };

      pollProgress();
    } catch (error) {
      setGenerationError(error.message);
    }
  };

  generateContent();
}, [isGenerating]);
```

### 2. Implement WebSocket Support (Optional)

For real-time progress updates without polling:

```javascript
// src/hooks/useWebSocket.js
import { useEffect, useState } from 'react';

export const useWebSocket = (url, onMessage) => {
  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    return () => ws.close();
  }, [url, onMessage]);
};
```

### 3. Add Toast Notifications

Install:
```bash
npm install react-toastify
```

**Usage**:
```javascript
import { toast } from 'react-toastify';

try {
  await generateLesson(...);
  toast.success('Lesson generated successfully!');
} catch (error) {
  toast.error('Failed to generate lesson');
}
```

### 4. Implement Download Handling

**Update `ResultsDisplay.jsx`:**
```javascript
const handleDownload = async (format) => {
  setIsDownloading(true);
  try {
    // Call real download endpoint
    const blob = await downloadLesson(result.lessonId, format);

    // Trigger file download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${result.title}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Download started!');
  } catch (error) {
    toast.error('Download failed');
  } finally {
    setIsDownloading(false);
  }
};
```

---

## Phase 2: Additional Features

### 1. Download History Page

**Create**: `src/pages/Downloads.jsx`

```javascript
import { useEffect, useState } from 'react';
import { getDownloadHistory } from '../utils/api';

export default function Downloads() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getDownloadHistory();
        setHistory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Downloads</h1>

        {loading ? (
          <LoadingSpinner />
        ) : history.length === 0 ? (
          <Card>
            <p className="text-gray-600 text-center">No downloads yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{formatDate(item.createdAt)}</p>
                </div>
                <Button variant="primary" onClick={() => window.location.href = item.downloadUrl}>
                  Download
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Add to router in App.jsx:**
```javascript
<Route path="/downloads" element={<Downloads />} />
```

### 2. User Authentication

Install:
```bash
npm install @auth0/auth0-react
# or
npm install next-auth
```

**Create**: `src/context/AuthContext.jsx`

```javascript
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 3. Share Functionality

**Enhance `ResultsDisplay.jsx`:**

```javascript
const handleShare = async (platform) => {
  const shareUrl = `${window.location.origin}/lesson/${result.lessonId}`;
  const text = `I generated "${result.title}" using Learn English Grade 3 Generator!`;

  if (platform === 'copy') {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  } else if (platform === 'whatsapp') {
    const encodedText = encodeURIComponent(text + '\n' + shareUrl);
    window.open(`https://wa.me/?text=${encodedText}`);
  } else if (platform === 'email') {
    window.location.href = `mailto:?subject=${encodeURIComponent(result.title)}&body=${encodeURIComponent(text + '\n' + shareUrl)}`;
  } else if (platform === 'twitter') {
    const encodedText = encodeURIComponent(text + ' ' + shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`);
  }
};
```

---

## Phase 3: Polish & Optimization

### 1. Dark Mode Toggle

**Create**: `src/context/ThemeContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

**Update Tailwind config for dark mode:**
```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1a1a',
          surface: '#2d2d2d',
          text: '#f5f5f5'
        }
      }
    }
  }
}
```

### 2. Advanced Analytics

Track user behavior:

```javascript
// src/utils/analytics.js
export const trackEvent = (eventName, properties = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }
};

// Usage:
trackEvent('lesson_generated', {
  chapter: selectedChapter,
  lesson: selectedLesson,
  cost: result.cost
});
```

### 3. Payment Integration

Install Stripe:
```bash
npm install @stripe/react-stripe-js @stripe/js
```

**Create checkout component:**
```javascript
import { loadStripe } from '@stripe/js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_your_key');

export function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { token } = await stripe.createToken(
      elements.getElement(CardElement)
    );

    // Send token to backend
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.id, amount: 100 })
    });

    // Handle response
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay</button>
    </form>
  );
}
```

### 4. Performance Optimizations

**Code Splitting:**
```javascript
// Lazy load pages
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

// Use in router:
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</Suspense>
```

**Image Optimization:**
```javascript
// Use webp with fallback
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <source srcSet="/image.jpg" type="image/jpeg" />
  <img src="/image.jpg" alt="Description" />
</picture>
```

**Caching Strategy:**
```javascript
// Cache API responses
const cache = new Map();

const getCachedData = async (key, fetcher) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = await fetcher();
  cache.set(key, data);
  return data;
};
```

---

## Phase 3: Enterprise Features

### 1. Multi-language Support

Install i18next:
```bash
npm install i18next react-i18next
```

**Create**: `src/localization/en.json`
```json
{
  "home": {
    "title": "Generate Grade 3 English Lessons in Minutes",
    "subtitle": "AI-powered textbook generation"
  }
}
```

**Usage:**
```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('home.title')}</h1>;
}
```

### 2. Role-Based Access Control

```javascript
// src/utils/permissions.js
export const ROLES = {
  TEACHER: 'teacher',
  ADMIN: 'admin',
  SCHOOL: 'school'
};

export const can = (user, action) => {
  if (user.role === ROLES.ADMIN) return true;

  const permissions = {
    teacher: ['generate', 'download'],
    school: ['generate', 'download', 'view_reports'],
    admin: ['generate', 'download', 'manage_users', 'view_reports']
  };

  return permissions[user.role]?.includes(action);
};
```

### 3. Cloud Storage Integration

```javascript
// src/services/storage.js
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

export const uploadToS3 = (file, key) => {
  const params = {
    Bucket: 'learn-english-lessons',
    Key: key,
    Body: file
  };

  return s3.upload(params).promise();
};
```

---

## Deployment Checklist

- [ ] Connect to production API
- [ ] Set environment variables
- [ ] Configure CORS headers
- [ ] Enable SSL/TLS
- [ ] Set up error logging (Sentry)
- [ ] Configure CDN for static assets
- [ ] Set up database backups
- [ ] Configure monitoring alerts
- [ ] Implement rate limiting
- [ ] Add authentication tokens
- [ ] Test on production domain
- [ ] Enable analytics tracking
- [ ] Set up automated deployments
- [ ] Create disaster recovery plan

---

## Performance Targets

- [ ] Lighthouse Score: 95+
- [ ] Page Load Time: <2s
- [ ] Time to Interactive: <1.5s
- [ ] Core Web Vitals: All Green
- [ ] Mobile Performance: 90+
- [ ] Bundle Size: <100KB (gzipped)

---

## Testing Roadmap

### Unit Tests
```bash
npm install -D vitest @testing-library/react
```

### E2E Tests
```bash
npm install -D playwright
```

### Load Testing
```bash
npm install -D artillery
```

---

## Timeline Estimate

**Phase 2**: 2-3 weeks
- Backend integration: 1 week
- Additional features: 1 week
- Testing & refinement: 1 week

**Phase 3**: 3-4 weeks
- Dark mode & UI polish: 1 week
- Analytics & payments: 1 week
- Enterprise features: 1 week
- Optimization & testing: 1 week

---

## Questions & Support

For implementation questions:
1. Check existing code structure
2. Review component documentation
3. Test with mock data first
4. Use TypeScript for new features
5. Write unit tests alongside code

---

**Last Updated**: February 27, 2025
**Version**: 1.0.0
**Status**: Ready for Phase 2
