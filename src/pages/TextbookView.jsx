import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../utils/api';
import { downloadTextbookDocx } from '../utils/downloadDocx';
import logo from '../assets/images/py-logo.png';
import './TextbookView.css';

/* ══════════════════════════════════════════════════════════
   DATA HELPERS
══════════════════════════════════════════════════════════ */
const toArr = v => (Array.isArray(v) ? v : v ? [v] : []);

function asObjectives(raw) {
  return toArr(raw)
    .map(o => (typeof o === 'string' ? o : o.text || o.objective || ''))
    .filter(Boolean);
}

function isPoetry(ld) {
  const hint = `${ld.title || ''} ${toArr(ld.keyTopics).join(' ')}`;
  if (/poem|rhyme|poetry|rhythm|verse/i.test(hint)) return true;
  return toArr(ld.workedExamples).some(e => typeof e === 'string' && /^POEM\s*\d*/i.test(e.trimStart()));
}

function asExamples(raw) {
  return toArr(raw).map(item => {
    if (typeof item === 'string') return { type: 'text', label: '', text: item };
    if (item.question && (item.answer || item.solution))
      return { type: 'qa', label: item.label || '', q: item.question, a: item.answer || item.solution };
    return { type: 'text', label: item.label || '', text: item.text || item.content || '' };
  });
}

function parsePoems(examples) {
  const poems = [];
  for (const ex of examples) {
    const n = poems.length + 1;
    const raw = (ex.type === 'text' ? ex.text : ex.type === 'qa' ? ex.a : '') || '';
    const cleaned = raw.replace(/\\n/g, '\n');
    const hdrA = cleaned.match(/^POEM\s*\d*\s*[—\-\u2013:]\s*(.+?)\n/i);
    if (hdrA) {
      const title = hdrA[1].replace(/:$/, '').trim();
      const lines = cleaned.slice(hdrA[0].length).split('\n').map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
      if (lines.length >= 2) { poems.push({ title, lines }); continue; }
    }
    const allLines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
    if (allLines.length >= 3) {
      const maybeTitle = allLines[0];
      if (maybeTitle.length < 60 && !/^\d/.test(maybeTitle)) {
        poems.push({ title: maybeTitle, lines: allLines.slice(1) }); continue;
      }
    }
    if (allLines.length >= 2) poems.push({ title: ex.label || `Poem ${n}`, lines: allLines });
  }
  return poems;
}

/* ══════════════════════════════════════════════════════════
   RHYME ANALYSIS
══════════════════════════════════════════════════════════ */
function getLastWord(line) {
  const words = line.trim().split(/\s+/);
  return (words[words.length - 1] || '').toLowerCase().replace(/[^a-z]/g, '');
}

function detectRhymeScheme(lines) {
  const sounds = lines.map(l => getLastWord(l).slice(-4));
  const map = {}; let code = 65;
  return sounds.map(s => {
    if (!s) return '?';
    if (!(s in map)) map[s] = String.fromCharCode(code++);
    return map[s];
  }).join('');
}

function findRhymingGroups(lines) {
  /* group lines by their ending sound; return groups of ≥2 end-words */
  const soundMap = {};
  lines.forEach((line, i) => {
    const word = getLastWord(line);
    if (!word) return;
    const sound = word.slice(-4);
    if (!soundMap[sound]) soundMap[sound] = [];
    if (!soundMap[sound].includes(word)) soundMap[sound].push(word);
  });
  return Object.values(soundMap).filter(g => g.length > 1);
}

/* ══════════════════════════════════════════════════════════
   DYNAMIC "ABOUT THIS POEM" — clean English fallback
   Used ONLY when backend poemSummaries is unavailable.
══════════════════════════════════════════════════════════ */
function buildPoemAbout(poem) {
  const { title, lines } = poem;

  // Capitalize first letter of a string safely
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  // Clean a line: remove trailing punctuation, trim
  const clean = line => (line || '').replace(/[.!?,;:]+$/, '').trim();

  const first = clean(lines[0]);
  const last  = clean(lines[lines.length - 1]);

  // Sentence 1: what the poem is about (from title)
  let about = `This poem is called "${title}" and tells a short, delightful story.`;

  // Sentence 2: use the first line naturally as a quote
  if (first) {
    about += ` It begins with the words: "${cap(first.toLowerCase())}".`;
  }

  // Sentence 3: use the last line if it differs from the first
  if (last && last.toLowerCase() !== first.toLowerCase()) {
    about += ` By the end, we read: "${cap(last.toLowerCase())}".`;
  }

  // Sentence 4: mood / reading tip
  about += ` Read it aloud to enjoy the cheerful mood and energy of every line!`;

  return about;
}

/* ══════════════════════════════════════════════════════════
   DYNAMIC QUIZ — built entirely from the poem's own lines
══════════════════════════════════════════════════════════ */
function seededShuffle(arr, seed) {
  /* Deterministic shuffle so options don't re-order on every render */
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FILLER_WORDS = ['tree', 'sky', 'moon', 'star', 'rain', 'sun', 'bird', 'fish', 'book', 'door'];

function buildPoemQuiz(poem) {
  const { title, lines } = poem;
  const questions = [];
  const rhyming   = findRhymingGroups(lines);
  const endWords  = lines.map(getLastWord).filter(Boolean);
  let seed = title.length * 37 + lines.length * 13;

  /* Helper: pick 3 distractors not equal to correct */
  const distractors = (correct, pool, extra) => {
    const candidates = [...pool, ...extra]
      .map(w => w.toLowerCase().replace(/[^a-z]/g, ''))
      .filter(w => w && w !== correct && w.length > 1);
    const unique = [...new Set(candidates)];
    while (unique.length < 3) unique.push(FILLER_WORDS[unique.length % FILLER_WORDS.length]);
    return unique.slice(0, 3);
  };

  /* Q1 – Rhyming pair from POEM'S OWN words */
  if (rhyming.length > 0) {
    const group = rhyming[0];
    const correct = group[1] || group[0];
    const asked   = group[0];
    const wrong   = distractors(correct, endWords.filter(w => w !== asked), FILLER_WORDS);
    const options  = seededShuffle([correct, ...wrong], seed);
    questions.push({
      question: `Which word from the poem rhymes with "${asked}"?`,
      options,
      correct,
    });
    seed += 7;
  }

  /* Q2 – Complete the first line */
  if (lines[0]) {
    const words = lines[0].trim().split(/\s+/);
    if (words.length >= 4) {
      const split  = Math.ceil(words.length / 2);
      const prompt = words.slice(0, split).join(' ');
      const correct = words.slice(split).join(' ');
      // distractors: second halves of other lines
      const pool = lines.slice(1).map(l => {
        const w = l.trim().split(/\s+/);
        return w.slice(Math.ceil(w.length / 2)).join(' ');
      }).filter(h => h && h !== correct);
      while (pool.length < 3) pool.push(FILLER_WORDS[(seed + pool.length) % FILLER_WORDS.length]);
      const options = seededShuffle([correct, ...pool.slice(0, 3)], seed);
      questions.push({
        question: `Complete the line: "${prompt} ___"`,
        options,
        correct,
      });
      seed += 11;
    }
  }

  /* Q3 – How many lines */
  const lc = lines.length;
  const lcOpts = seededShuffle(
    [...new Set([lc, lc - 1 > 0 ? lc - 1 : lc + 2, lc + 1, lc + 2])].slice(0, 4).map(String),
    seed,
  );
  questions.push({
    question: `How many lines does the poem "${title}" have?`,
    options: lcOpts,
    correct: String(lc),
  });
  seed += 5;

  /* Q4 – Second rhyming pair (if available) */
  if (rhyming.length > 1) {
    const group   = rhyming[1];
    const correct = group[1] || group[0];
    const asked   = group[0];
    const wrong   = distractors(correct, endWords.filter(w => w !== asked), FILLER_WORDS);
    const options  = seededShuffle([correct, ...wrong], seed);
    questions.push({
      question: `Which word rhymes with "${asked}" in this poem?`,
      options,
      correct,
    });
    seed += 3;
  }

  /* Q5 – Line content: "What is the first/last line of the poem?" */
  if (lines.length >= 3) {
    const correct = lines[0];
    const wrong   = lines.slice(1, 4);
    while (wrong.length < 3) wrong.push('(no more lines)');
    const options = seededShuffle([correct, ...wrong.slice(0, 3)], seed);
    questions.push({
      question: `Which line comes FIRST in the poem "${title}"?`,
      options,
      correct,
    });
  }

  return questions;
}

/* ══════════════════════════════════════════════════════════
   QUIZ ITEM
══════════════════════════════════════════════════════════ */
function QuizItem({ q, index }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;

  const isCorrectOpt = (opt, oi) =>
    opt === q.correct ||
    oi === q.correct ||
    String(oi) === String(q.correct) ||
    String(oi + 1) === String(q.correct);

  return (
    <div className="tbv2-quiz-item">
      <div className="tbv2-quiz-q">{index + 1}. {q.question}</div>
      <div className="tbv2-quiz-opts">
        {q.options.map((opt, oi) => {
          const isCorrect  = isCorrectOpt(opt, oi);
          const isSelected = selected === oi;
          let cls = 'tbv2-quiz-opt';
          if (answered) {
            if (isCorrect)            cls += ' correct';
            else if (isSelected)      cls += ' wrong';
            else                      cls += ' dim';
          }
          return (
            <button key={oi} className={cls} disabled={answered} onClick={() => setSelected(oi)}>
              <span className="tbv2-opt-letter">{String.fromCharCode(65 + oi)}</span>
              <span>{opt}</span>
              {answered && isCorrect  && <span className="tbv2-opt-check">✓</span>}
              {answered && isSelected && !isCorrect && <span className="tbv2-opt-x">✗</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`tbv2-quiz-feedback ${isCorrectOpt(q.options[selected], selected) ? 'ok' : 'err'}`}>
          {isCorrectOpt(q.options[selected], selected)
            ? '✓ Correct! Well done.'
            : `✗ The answer is: "${q.correct}"`}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   POEM ARTICLE
══════════════════════════════════════════════════════════ */
function PoemArticle({ poem, index, total, poemImage, backendSummary }) {
  const scheme   = detectRhymeScheme(poem.lines);
  const rhyming  = findRhymingGroups(poem.lines);
  /* Use AI-generated summary from backend if available, otherwise compute locally */
  const about    = (backendSummary && backendSummary.trim().length > 20)
    ? backendSummary
    : buildPoemAbout(poem);
  const quiz     = useMemo(() => buildPoemQuiz(poem), [poem.title, poem.lines.join('|')]);

  const schemeMap = { AAAA: 'Monorhyme', AABB: 'Couplet', ABAB: 'Alternating', ABBA: 'Envelope' };
  const schemeLabel = schemeMap[scheme] || `Scheme: ${scheme}`;

  return (
    <div className="tbv2-poem-article">

      {/* ── Full-width Hero Image (or styled fallback banner) ── */}
      {poemImage
        ? (
          <div className="tbv2-poem-hero">
            <img src={poemImage} alt={poem.title} className="tbv2-poem-hero-img"
              onError={e => { e.target.style.display = 'none'; e.target.parentElement.classList.add('tbv2-poem-hero-no-img'); }} />
          </div>
        ) : (
          <div className="tbv2-poem-banner-fallback">
            <div className="tbv2-poem-banner-overlay" />
            <div className="tbv2-poem-banner-content">
              <div className="tbv2-poem-banner-tag">🎵 POEM {index + 1}{total > 1 ? ` of ${total}` : ''}</div>
              <div className="tbv2-poem-banner-title">{poem.title}</div>
              {poem.lines.slice(0, 2).map((line, li) => (
                <div key={li} className="tbv2-poem-banner-line">"{line}"</div>
              ))}
            </div>
          </div>
        )
      }

      {/* ── Poem Header ── */}
      <div className="tbv2-poem-article-header">
        <div className="tbv2-poem-num-tag">🎵 POEM {index + 1}{total > 1 ? ` of ${total}` : ''}</div>
        <h2 className="tbv2-poem-headline">{poem.title}</h2>
        <div className="tbv2-poem-rule" />
      </div>

      {/* ── Full Poem Lines ── */}
      <div className="tbv2-poem-content">
        {poem.lines.map((line, li) => (
          <p key={li} className="tbv2-poem-line-text">{line || '\u00A0'}</p>
        ))}
      </div>

      <div className="tbv2-section-rule" />

      {/* ── About This Poem (generated from actual lines) ── */}
      <div className="tbv2-poem-explanation">
        <div className="tbv2-expl-label">📖 About This Poem</div>
        <p className="tbv2-expl-text">{about}</p>
      </div>

      {/* ── Rhyming Words (from actual poem end-words) ── */}
      {rhyming.length > 0 && (
        <div className="tbv2-rhyme-block">
          <div className="tbv2-rhyme-block-label">🔤 Rhyming Words in This Poem</div>
          <div className="tbv2-rhyme-pairs">
            {rhyming.map((group, gi) => (
              <div key={gi} className="tbv2-rhyme-pair-chip">
                {group.join(' · ')}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tbv2-section-rule" />

      {/* ── Quiz from actual poem content ── */}
      {quiz.length > 0 && (
        <div className="tbv2-poem-quiz-section">
          <h3 className="tbv2-sec-h">Check Your Understanding</h3>
          <div className="tbv2-quiz-list">
            {quiz.map((q, qi) => <QuizItem key={qi} q={q} index={qi} />)}
          </div>
        </div>
      )}

    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STORY ARTICLE — full reading view
══════════════════════════════════════════════════════════ */
function StoryArticle({ lesson, coverImg, goToLessonView }) {
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (i) =>
    setRevealedAnswers(prev => ({ ...prev, [i]: !prev[i] }));

  const paragraphs   = toArr(lesson.paragraphs);
  const characters   = toArr(lesson.characters);
  const questions    = toArr(lesson.storyQuestions);
  const vocab        = toArr(lesson.keyVocabulary);

  return (
    <div className="tbv2-story-article">

      {/* ── Hero Banner ── */}
      {coverImg ? (
        <div className="tbv2-story-hero">
          <img src={coverImg} alt={lesson.title} className="tbv2-story-hero-img"
            onError={e => { e.target.style.display = 'none'; e.target.parentElement.classList.add('tbv2-story-hero-no-img'); }} />
        </div>
      ) : (
        <div className="tbv2-story-banner-fallback">
          <div className="tbv2-story-banner-content">
            <div className="tbv2-story-banner-tag">📖 STORY</div>
            <div className="tbv2-story-banner-title">{lesson.title}</div>
            {lesson.setting && <div className="tbv2-story-banner-setting">📍 {lesson.setting}</div>}
          </div>
        </div>
      )}

      {/* ── Story Header ── */}
      <div className="tbv2-poem-article-header">
        <div className="tbv2-poem-num-tag" style={{ color: '#1a4fc4' }}>📖 STORY</div>
        <h2 className="tbv2-poem-headline">{lesson.title}</h2>
        {(characters.length > 0 || lesson.setting) && (
          <div className="tbv2-story-meta-row">
            {characters.length > 0 && (
              <span className="tbv2-story-meta-chip">👤 {characters.join(', ')}</span>
            )}
            {lesson.setting && (
              <span className="tbv2-story-meta-chip">📍 {lesson.setting}</span>
            )}
          </div>
        )}
        <div className="tbv2-poem-rule" />
      </div>

      {/* ── Story Paragraphs ── */}
      <div className="tbv2-story-body">
        {paragraphs.map((para, pi) => (
          <p key={pi} className="tbv2-story-para">{para}</p>
        ))}
      </div>

      {/* ── Moral ── */}
      {lesson.moral && (
        <div className="tbv2-story-moral">
          <div className="tbv2-story-moral-label">⭐ Moral of the Story</div>
          <p className="tbv2-story-moral-text">{lesson.moral}</p>
        </div>
      )}

      <div className="tbv2-section-rule" />

      {/* ── Vocabulary from Story ── */}
      {vocab.length > 0 && (
        <div className="tbv2-story-vocab-section">
          <h3 className="tbv2-sec-h">📚 Key Words from the Story</h3>
          <div className="tbv2-story-vocab-grid">
            {vocab.map((v, vi) => (
              <div key={vi} className="tbv2-story-vocab-card">
                <div className="tbv2-story-vocab-word">{v.word}</div>
                <div className="tbv2-story-vocab-def">{v.definition}</div>
                {v.usedInStory && (
                  <div className="tbv2-story-vocab-usage">"{v.usedInStory}"</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tbv2-section-rule" />

      {/* ── Questions & Answers ── */}
      {questions.length > 0 && (
        <div className="tbv2-story-qa-section">
          <h3 className="tbv2-sec-h">💬 Story Questions</h3>
          <div className="tbv2-story-qa-list">
            {questions.map((qa, qi) => (
              <div key={qi} className="tbv2-story-qa-item">
                <div className="tbv2-story-qa-q">
                  <span className="tbv2-story-qa-num">Q{qi + 1}</span>
                  {qa.question}
                </div>
                <button
                  className="tbv2-story-qa-reveal"
                  onClick={() => toggleAnswer(qi)}
                >
                  {revealedAnswers[qi] ? 'Hide Answer ▲' : 'Show Answer ▼'}
                </button>
                {revealedAnswers[qi] && (
                  <div className="tbv2-story-qa-a">
                    <span style={{ fontWeight: 700, color: '#1a4fc4' }}>A: </span>{qa.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NON-POETRY QUIZ ITEM (uses backend quiz data)
══════════════════════════════════════════════════════════ */
function asQuiz(raw) {
  return toArr(raw)
    .map(item =>
      typeof item === 'string'
        ? { question: item, options: [], correct: null }
        : { question: item.question || '', options: toArr(item.options), correct: item.correct ?? item.answer ?? null }
    )
    .filter(q => q.question);
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const TextbookView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lesson, fromBatch, jobId, poemIndex } = location.state || {};
  const [downloading, setDownloading] = useState(false);

  if (!lesson) {
    return (
      <div className="tbv2-empty">
        <div className="tbv2-empty-inner">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
          <h2 style={{ fontFamily: '"Playfair Display", serif', marginBottom: 12 }}>No lesson selected</h2>
          <p style={{ color: '#767676', marginBottom: 24 }}>Please generate a lesson first.</p>
          <button className="tbv2-btn-primary" onClick={() => navigate('/generator')}>← Back to Generator</button>
        </div>
      </div>
    );
  }

  const grade    = lesson.grade || '3';
  const subject  = lesson.subject || 'English';
  const level    = lesson.level || lesson.difficulty || 'Medium';
  const duration = lesson.duration || '45 min';

  const isStory = lesson.contentType === 'story' ||
    /story|fiction|narrative/i.test(`${lesson.title || ''} ${toArr(lesson.keyTopics).join(' ')}`);
  const poetry      = !isStory && isPoetry(lesson);
  const allPoems    = poetry ? parsePoems(asExamples(toArr(lesson.workedExamples))) : [];
  const poemImages  = lesson.images?.poems || [];

  /* Single poem vs all poems */
  const isSinglePoem  = poemIndex !== undefined && allPoems[poemIndex];
  const displayPoems  = isSinglePoem ? [allPoems[poemIndex]] : allPoems;
  const displayImages = isSinglePoem ? [poemImages[poemIndex]] : poemImages;

  const pageTitle = isSinglePoem ? allPoems[poemIndex].title : (lesson.title || 'Untitled Lesson');
  const coverImg  = isSinglePoem
    ? (poemImages[poemIndex] ? `${BACKEND_URL}${poemImages[poemIndex]}` : null)
    : (lesson.images?.cover ? `${BACKEND_URL}${lesson.images.cover}` : null);

  const objectives = asObjectives(lesson.objectives || lesson.learningObjectives);
  const quiz       = asQuiz(lesson.assessment?.questions || lesson.quiz || lesson.assessmentQuestions);

  /* Category */
  const hint = `${lesson.title || ''} ${toArr(lesson.keyTopics).join(' ')}`.toLowerCase();
  let catLabel = 'LESSON', catEmoji = '📚', catColor = '#7c3aed';
  if (isStory)                                   { catLabel = 'STORY';                catEmoji = '📖'; catColor = '#1a4fc4'; }
  else if (isSinglePoem)                         { catLabel = `POEM ${poemIndex + 1}`; catEmoji = '🎵'; catColor = '#c41a1a'; }
  else if (/poem|rhyme|poetry|verse/.test(hint)) { catLabel = 'POETRY LESSON';       catEmoji = '🎵'; catColor = '#c41a1a'; }
  else if (/grammar|writing/.test(hint))         { catLabel = 'GRAMMAR';              catEmoji = '✏️'; catColor = '#1a7f3c'; }

  const goToLessonView = () =>
    navigate('/lesson-view', { state: { lesson, fromBatch, jobId, poemIndex } });
  const goBack = () => {
    if (jobId) navigate(`/generated-lessons?jobId=${jobId}`);
    else navigate(-1);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}${path}`;
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadTextbookDocx({
        lesson,
        isStory,
        isPoetry: poetry,
        poems: displayPoems,
        poemImages: displayImages.map(getImageUrl),
        coverUrl: coverImg,
        pageTitle,
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="tbv2-root">

      {/* ══════ STICKY TOP NAV ══════ */}
      <header className="tbv2-navbar">

        {/* Logo — identical to LessonView / Header.jsx */}
        <div className="tbv2-nav-logo" onClick={() => navigate('/')}>
          <img src={logo} alt="Py-Content" className="tbv2-nav-logo-img" />
          <span className="tbv2-nav-logo-text">
            <span className="tbv2-nav-logo-dark">Py-</span>
            <span className="tbv2-nav-logo-blue">Content</span>
          </span>
        </div>

        {/* Breadcrumb */}
        <nav className="tbv2-nav-crumb">
          <button className="tbv2-crumb-btn" onClick={goBack}>Generated Lessons</button>
          <span className="tbv2-crumb-sep">›</span>
          <span className="tbv2-crumb-cur">{pageTitle}</span>
        </nav>

        {/* Actions */}
        <div className="tbv2-nav-actions">
          <button className="tbv2-nav-btn tbv2-nav-btn-ghost" onClick={goBack}>← Back</button>
          <button
            className="tbv2-nav-btn tbv2-nav-btn-ghost"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? '⏳ …' : '📄 Word'}
          </button>
          <button className="tbv2-nav-btn tbv2-nav-btn-primary" onClick={goToLessonView}>
            📖 Open Lesson View
          </button>
        </div>

      </header>

      {/* ══════ FULL-WIDTH COVER HERO (non-poetry, non-story only) ══════ */}
      {!poetry && !isStory && coverImg && (
        <div className="tbv2-cover-hero">
          <img src={coverImg} alt={pageTitle} className="tbv2-cover-hero-img"
            onError={e => { e.target.style.display = 'none'; }} />
        </div>
      )}

      {/* ══════ ARTICLE BODY ══════ */}
      <div className={`tbv2-article-wrap${isStory ? ' tbv2-story-wrap' : ''}`}>
        <article className="tbv2-article">

          {/* ══════ STORY MODE ══════ */}
          {isStory && (
            <>
              <StoryArticle lesson={lesson} coverImg={coverImg} goToLessonView={goToLessonView} />
              <div className="tbv2-cta-block">
                <div className="tbv2-section-rule" />
                <div className="tbv2-cta-row">
                  <div>
                    <div className="tbv2-cta-title">Ready to Learn from This Story?</div>
                    <p className="tbv2-cta-desc">
                      Open the interactive lesson view for story analysis, vocabulary exercises, comprehension quiz, and teacher guides.
                    </p>
                  </div>
                  <button className="tbv2-cta-btn" onClick={goToLessonView}>
                    📚 Open Lesson View →
                  </button>
                </div>
              </div>
              <div className="tbv2-tags">
                {[`Grade ${grade}`, subject, level, ...(lesson.keyTopics || []).slice(0, 4)].map((tag, i) => (
                  <span key={i} className="tbv2-tag">{tag}</span>
                ))}
              </div>
            </>
          )}

          {/* ── Non-poetry, non-story: header + objectives ── */}
          {!poetry && !isStory && (
            <>
              <header className="tbv2-art-header">
                <div className="tbv2-cat-tag" style={{ color: catColor }}>{catEmoji} {catLabel}</div>
                <h1 className="tbv2-title">{pageTitle}</h1>
                <div className="tbv2-byline">
                  <span>Grade {grade}</span><span className="tbv2-dot">·</span>
                  <span>{subject}</span><span className="tbv2-dot">·</span>
                  <span>{level} Level</span><span className="tbv2-dot">·</span>
                  <span>⏱ {duration}</span>
                </div>
                <hr className="tbv2-divider" />
              </header>
              {lesson.description && <p className="tbv2-lead">{lesson.description}</p>}
              {objectives.length > 0 && (
                <section className="tbv2-section">
                  <h2 className="tbv2-sec-h">Learning Objectives</h2>
                  <ul className="tbv2-obj-list">
                    {objectives.map((obj, i) => (
                      <li key={i} className="tbv2-obj-item">
                        <span className="tbv2-obj-bullet" />{obj}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {quiz.length > 0 && (
                <section className="tbv2-section">
                  <div className="tbv2-section-rule" />
                  <h2 className="tbv2-sec-h">Check Your Understanding</h2>
                  <div className="tbv2-quiz-list">
                    {quiz.map((q, i) => <QuizItem key={i} q={q} index={i} />)}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ── Poetry: collection header (when showing all poems) ── */}
          {!isStory && poetry && !isSinglePoem && allPoems.length > 1 && (
            <header className="tbv2-collection-header">
              <div className="tbv2-cat-tag" style={{ color: '#c41a1a' }}>
                🎵 POETRY · {subject.toUpperCase()} · GRADE {grade}
              </div>
              <h1 className="tbv2-title">{lesson.title}</h1>
              <div className="tbv2-byline">
                <span>A collection of {allPoems.length} poems</span>
                <span className="tbv2-dot">·</span>
                <span>Grade {grade}</span>
                <span className="tbv2-dot">·</span>
                <span>{level} Level</span>
              </div>
              <hr className="tbv2-divider" />
            </header>
          )}

          {/* ══════ POEM ARTICLES — each poem fully self-contained ══════ */}
          {!isStory && poetry && displayPoems.map((poem, i) => {
            /* poemSummaries[i] is the backend-generated story summary for this poem */
            const realIndex = isSinglePoem ? poemIndex : i;
            const backendSummary = (lesson.poemSummaries || [])[realIndex] || '';
            return (
              <PoemArticle
                key={poem.title + i}
                poem={poem}
                index={realIndex}
                total={isSinglePoem ? 1 : allPoems.length}
                poemImage={getImageUrl(displayImages[i])}
                backendSummary={backendSummary}
              />
            );
          })}

          {/* ══════ BOTTOM CTA (poem / generic lesson) ══════ */}
          {!isStory && (
            <>
              <div className="tbv2-cta-block">
                <div className="tbv2-section-rule" />
                <div className="tbv2-cta-row">
                  <div>
                    <div className="tbv2-cta-title">Ready to Practice?</div>
                    <p className="tbv2-cta-desc">
                      Open the interactive lesson view for exercises, vocabulary drills, full quiz, and more.
                    </p>
                  </div>
                  <button className="tbv2-cta-btn" onClick={goToLessonView}>
                    📚 Interactive Lesson View →
                  </button>
                </div>
              </div>
              {/* Tags */}
              <div className="tbv2-tags">
                {[`Grade ${grade}`, subject, level, ...(lesson.keyTopics || []).slice(0, 5)].map((tag, i) => (
                  <span key={i} className="tbv2-tag">{tag}</span>
                ))}
              </div>
            </>
          )}

        </article>
      </div>
    </div>
  );
};

export default TextbookView;
