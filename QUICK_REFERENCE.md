# Quick Reference Guide

## Starting the Project

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

Server runs at: **http://localhost:5173**

---

## Project Structure at a Glance

```
src/
├── components/
│  ├── common/              # Reusable components
│  │  ├── Button.jsx
│  │  ├── Card.jsx
│  │  └── LoadingSpinner.jsx
│  ├── Header.jsx           # Top navigation
│  ├── Hero.jsx             # Landing section
│  ├── CurriculumSelector.jsx
│  ├── GenerationControls.jsx
│  ├── ProgressBar.jsx
│  ├── ResultsDisplay.jsx
│  ├── FeatureCards.jsx
│  └── Footer.jsx
├── pages/
│  ├── Home.jsx             # Main dashboard
│  ├── HowItWorks.jsx
│  ├── About.jsx
│  └── Contact.jsx
├── context/
│  └── GenerationContext.jsx
├── utils/
│  ├── constants.js         # Curriculum data
│  ├── api.js              # API client
│  └── formatters.js       # Formatting functions
├── App.jsx                # Router setup
└── index.css              # Tailwind + animations
```

---

## Key Files to Edit

### Add a New Page
1. Create `src/pages/NewPage.jsx`
2. Add route in `App.jsx`:
```javascript
<Route path="/new-page" element={<NewPage />} />
```
3. Add nav link in `Header.jsx`

### Add a Component
Create component file in `src/components/`
```javascript
import React from 'react';

export default function MyComponent() {
  return <div>Content</div>;
}
```

### Update Curriculum Data
Edit `src/utils/constants.js`:
```javascript
export const CHAPTERS = [ /* ... */ ]
```

### Connect to Real API
Update API_BASE_URL in `src/utils/api.js`:
```javascript
const API_BASE_URL = 'https://your-api.com/api';
```

---

## Common Tasks

### Add a Button
```jsx
import Button from './common/Button';

<Button
  variant="primary"    // primary, secondary, success, ghost, danger
  size="lg"           // sm, md, lg
  onClick={() => {}}
>
  Click me
</Button>
```

### Add a Card
```jsx
import Card from './common/Card';

<Card hover>
  Content here
</Card>
```

### Use Generation State
```jsx
import { useGeneration } from '../context/GenerationContext';

function MyComponent() {
  const {
    selectedChapter,
    isGenerating,
    startGeneration
  } = useGeneration();

  return <div>{selectedChapter}</div>;
}
```

### Show Loading Spinner
```jsx
import LoadingSpinner from './common/LoadingSpinner';

<LoadingSpinner size="md" label="Generating..." />
```

---

## Styling Patterns

### Using Tailwind Classes
```jsx
<div className="bg-orange-600 text-white rounded-lg p-4 shadow-md hover:shadow-lg">
  Styled div
</div>
```

### Common Classes
```
Colors:      bg-orange-600, text-blue-900, border-green-500
Spacing:     px-4 py-2, m-4, gap-2
Size:        w-full, h-12, text-lg
Alignment:   flex, items-center, justify-between
Border:      border-2, rounded-lg, shadow-md
Responsive:  md:grid-cols-2, lg:flex
```

### Responsive Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items here */}
</div>
```

---

## Useful Code Snippets

### Fetch Curriculum Data
```javascript
import { getCurriculumData } from '../utils/api';

const data = await getCurriculumData();
```

### Format Numbers
```javascript
import { formatCost, formatTime } from '../utils/formatters';

formatCost(0.04)        // "$0.04"
formatTime(120)         // "2m"
```

### Loop Through Chapters
```javascript
import { CHAPTERS } from '../utils/constants';

{CHAPTERS.map(chapter => (
  <div key={chapter.id}>{chapter.title}</div>
))}
```

### Show Success Message
```jsx
{result && (
  <div className="p-4 bg-green-100 text-green-800 rounded">
    ✓ Success!
  </div>
)}
```

### Show Error Message
```jsx
{error && (
  <div className="p-4 bg-red-100 text-red-800 rounded">
    ❌ {error}
  </div>
)}
```

---

## Navigation Routes

```
/               → Home (Main dashboard)
/how-it-works   → How It Works (Process explanation)
/about          → About page
/contact        → Contact page
```

Add new routes in `App.jsx`:
```javascript
<Route path="/new-path" element={<Component />} />
```

---

## Environment Variables

Create `.env.local`:
```
VITE_API_BASE_URL=https://your-api.com/api
VITE_APP_NAME=Learn English
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## Color Palette

```css
/* Primary */
--primary: #FF6B35 (orange-600)

/* Secondary */
--secondary: #2E5090 (blue-900)

/* Accent */
--accent: #4CAF50 (green-500)

/* Status Colors */
--success: #10B981 (green-500)
--warning: #F59E0B (yellow-500)
--error: #EF4444 (red-500)
--info: #3B82F6 (blue-500)
```

Use in Tailwind:
```jsx
<div className="bg-orange-600">Primary</div>
<div className="bg-blue-900">Secondary</div>
<div className="bg-green-500">Accent</div>
```

---

## Typography

```css
/* Headers */
font-family: 'Poppins', sans-serif
font-weight: 700

/* Body */
font-family: 'Inter', sans-serif
font-weight: 400-700
```

Classes:
```jsx
<h1 className="text-5xl font-bold">H1</h1>
<h2 className="text-3xl font-bold">H2</h2>
<p className="text-base">Body text</p>
<small className="text-sm">Small text</small>
```

---

## Debugging Tips

### View Console Errors
Open browser DevTools (F12) → Console tab

### Check Network Requests
DevTools → Network tab → See API calls

### Inspect Elements
DevTools → Elements tab → Right-click element

### Debug State
```javascript
import { useGeneration } from '../context/GenerationContext';

console.log(useGeneration());  // See all state
```

---

## Performance Tips

1. **Lazy load pages**: See NEXT_STEPS.md
2. **Optimize images**: Use WebP format
3. **Cache API calls**: See NEXT_STEPS.md
4. **Minimize CSS**: Tailwind v4 handles this
5. **Code splitting**: Vite does this automatically

---

## Testing

### Test in Mobile
```bash
# Use --host flag to access from phone
npm run dev -- --host

# Then visit: http://YOUR_IP:5173
```

### Test Different Viewport
DevTools → Device Toolbar (Ctrl+Shift+M)

### Test Accessibility
Install axe DevTools browser extension

### Test Performance
Lighthouse in DevTools → Run audit

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 5173 in use | `npm run dev -- --port 3000` |
| Module not found | `npm install` to ensure dependencies |
| Styling not applied | Check Tailwind class spelling |
| State not updating | Verify useGeneration is in component |
| API calls fail | Check API_BASE_URL in .env.local |
| Build is slow | Clear dist folder: `rm -rf dist` |

---

## Useful VS Code Extensions

- **ES7+ React/Redux/React-Native snippets** (dsznajder)
- **Tailwind CSS IntelliSense** (bradlc)
- **Prettier** (esbenp) - Code formatter
- **ESLint** (microsoft) - Linting

---

## Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Description of changes"

# Push
git push

# Pull latest
git pull

# View history
git log --oneline
```

---

## Deployment Checklist

- [ ] Update API_BASE_URL for production
- [ ] Run build: `npm run build`
- [ ] Test build: `npm run preview`
- [ ] Check Lighthouse score
- [ ] Test on mobile
- [ ] Verify all links work
- [ ] Enable HTTPS
- [ ] Set up CDN (optional)
- [ ] Configure error logging
- [ ] Set up analytics

---

## Helpful Commands

```bash
# Install a new package
npm install package-name

# Install as dev dependency
npm install -D package-name

# Update all packages
npm update

# Check for security issues
npm audit

# Run build
npm run build

# Preview production build locally
npm run preview

# Clear all cache
npm cache clean --force
```

---

## Resources

- React: https://react.dev
- Vite: https://vite.dev
- Tailwind: https://tailwindcss.com
- React Router: https://reactrouter.com
- Lucide Icons: https://lucide.dev

---

**Last Updated**: February 27, 2025
**For Quick Help**: See SETUP_GUIDE.md and COMPONENTS.md
