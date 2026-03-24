import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GenerationProvider } from './context/GenerationContext';
import Header from './components/Header';
import Home from './pages/Home';
import Generator from './pages/Generator';
import LessonView from './pages/LessonView';
import GeneratedLessons from './pages/GeneratedLessons';
import HowItWorks from './pages/HowItWorks';
import TextbookView from './pages/TextbookView';
import History from './pages/History';
import Presentation from './pages/Presentation';

/* Pages that have their own full navbar — hide global Header there */
const NO_HEADER_ROUTES = ['/lesson-view', '/textbook-view', '/presentation'];

function AppInner() {
  const location = useLocation();
  const showHeader = !NO_HEADER_ROUTES.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {showHeader && <Header />}
      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/lesson-view" element={<LessonView />} />
          <Route path="/generated-lessons" element={<GeneratedLessons />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/textbook-view" element={<TextbookView />} />
          <Route path="/history" element={<History />} />
          <Route path="/presentation" element={<Presentation />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router basename="/py-content">
      <GenerationProvider>
        <AppInner />
      </GenerationProvider>
    </Router>
  );
}

export default App;
