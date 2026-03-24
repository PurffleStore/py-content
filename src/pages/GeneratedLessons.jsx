import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGeneration } from '../context/GenerationContext';
import { subscribeBatchProgress, getBatchJobResult, getHistory, getHistoryLesson, BACKEND_URL } from '../utils/api';
import { RefreshCw, Loader2 } from 'lucide-react';

/* ══════ HELPERS ══════ */
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

const catTag = (lesson) => {
  const hint = `${lesson.title || ''} ${(lesson.keyTopics || []).join(' ')}`.toLowerCase();
  if (/poem|rhyme|poetry|verse/.test(hint)) return { label: 'POETRY', emoji: '🎵', color: '#c41a1a' };
  if (/story|fiction|narrative/.test(hint)) return { label: 'FICTION', emoji: '📖', color: '#1a4fc4' };
  if (/grammar|writing/.test(hint)) return { label: 'GRAMMAR', emoji: '✏️', color: '#1a7f3c' };
  return { label: 'LESSON', emoji: '📚', color: '#7c3aed' };
};

const excerpt = (lesson) => {
  const obj = (lesson.objectives || lesson.learningObjectives || [])[0];
  if (typeof obj === 'string' && obj.length > 10) return obj;
  if (typeof obj === 'object' && obj?.text) return obj.text;
  return lesson.description || `Explore ${lesson.title || 'this lesson'} with engaging activities, poetry, and practice exercises.`;
};

/* ══════ POEM HELPERS ══════ */
const isPoetryLesson = (lesson) => {
  const hint = `${lesson.title || ''} ${(lesson.keyTopics || []).join(' ')}`.toLowerCase();
  return /poem|rhyme|poetry|rhythm|verse/.test(hint);
};

/* ══════ STORY HELPERS ══════ */
const isStoryLesson = (lesson) =>
  lesson.contentType === 'story' ||
  /story|fiction|narrative/i.test(`${lesson.title || ''} ${(lesson.keyTopics || []).join(' ')}`);

const storyExcerpt = (lesson) =>
  lesson.storySummary ||
  (lesson.paragraphs && lesson.paragraphs[0]
    ? lesson.paragraphs[0].substring(0, 160) + '…'
    : lesson.description || `An engaging story: ${lesson.title}`);

const parsePoemsFromLesson = (lesson) => {
  const examples = [].concat(lesson.workedExamples || []);
  const poems = [];
  for (const ex of examples) {
    const raw = typeof ex === 'string' ? ex : (ex?.text || ex?.answer || '');
    const cleaned = raw.replace(/\\n/g, '\n');
    const hdrMatch = cleaned.match(/^POEM\s*\d*\s*[—\-–:]\s*(.+?)\n([\s\S]+)/i);
    if (hdrMatch) {
      const title = hdrMatch[1].replace(/:$/, '').trim();
      const lines = hdrMatch[2].split('\n').map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
      if (lines.length >= 2) { poems.push({ title, lines, excerpt: lines.slice(0, 2).join(' / ') }); continue; }
    }
    const allLines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
    if (allLines.length >= 3) {
      const maybeTitle = allLines[0];
      if (maybeTitle.length < 60 && !/^\d/.test(maybeTitle)) {
        poems.push({ title: maybeTitle, lines: allLines.slice(1), excerpt: allLines.slice(1, 3).join(' / ') });
      }
    }
  }
  return poems;
};

const STAGE_LABELS = {
  starting: 'Initializing', planner: 'Planning', content: 'Writing Content',
  images: 'Generating Images', qa: 'Quality Check', formatter: 'Formatting',
  complete: 'Complete!', error: 'Error',
};
const STAGE_ORDER = ['planner', 'content', 'images', 'qa', 'formatter'];

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
const GeneratedLessons = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const sseRef = useRef(null);

  const {
    batchLessons, batchProgress, batchParams,
    updateBatchProgress, completeBatchGeneration, setGenerationError, error,
  } = useGeneration();

  const [lessons, setLessons] = useState(batchLessons || []);
  const [isLoading, setIsLoading] = useState(!batchLessons);
  const [hoveredCard, setHoveredCard] = useState(null);

  const loadFromHistoryFallback = async () => {
    const historyData = await getHistory();
    const records = Array.isArray(historyData?.lessons) ? [...historyData.lessons] : [];
    if (!records.length) throw new Error('No saved lessons were found in history.');

    const sortedRecords = records.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const normalizedSubject = String(batchParams?.subject || '').toLowerCase();
    const normalizedGrade   = String(batchParams?.grade   || '').toLowerCase();
    const normalizedChapter = String(batchParams?.chapter || '').toLowerCase();
    const normalizedLevel   = String(batchParams?.level   || '').toLowerCase();
    const now = Date.now();

    const matchingRecord = sortedRecords.find((record) => {
      const createdAt = new Date(record.createdAt || 0).getTime();
      const isRecent        = Number.isFinite(createdAt) ? now - createdAt < 30 * 60 * 1000 : true;
      const subjectMatches  = !normalizedSubject || String(record.subject || '').toLowerCase() === normalizedSubject;
      const gradeMatches    = !normalizedGrade   || String(record.grade   || '').toLowerCase() === normalizedGrade;
      const chapterMatches  = !normalizedChapter || String(record.chapter || '').toLowerCase() === normalizedChapter;
      const levelMatches    = !normalizedLevel   || String(record.level   || '').toLowerCase() === normalizedLevel;
      return isRecent && subjectMatches && gradeMatches && chapterMatches && levelMatches;
    }) || sortedRecords[0];

    const fullRecord = await getHistoryLesson(matchingRecord.id);
    const fallbackLessons = fullRecord?.record?.lessons || [];
    if (!fallbackLessons.length) throw new Error('The latest saved lesson pack could not be loaded from history.');

    setLessons(fallbackLessons);
    completeBatchGeneration(fallbackLessons);
    setIsLoading(false);
    return true;
  };

  const applyJobResult = (result) => {
    updateBatchProgress({
      stage:    result?.stage    || 'starting',
      progress: result?.progress || 0,
      message:  result?.message  || 'Preparing AI pipeline...',
    });

    if (result?.status === 'failed') {
      setGenerationError(result.error || result.message || 'Generation failed');
      setIsLoading(false);
      return 'failed';
    }

    if (result?.success && Array.isArray(result.lessons) && result.lessons.length > 0) {
      setLessons(result.lessons);
      completeBatchGeneration(result.lessons);
      setIsLoading(false);
      return 'complete';
    }

    if (result?.status === 'complete') return 'waiting_for_lessons';
    return 'pending';
  };

  const pollForResults = () => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const result = await getBatchJobResult(jobId);
        const state  = applyJobResult(result);
        if (state === 'complete' || state === 'failed') clearInterval(interval);
      } catch (err) {
        if (err?.status === 404) {
          try { await loadFromHistoryFallback(); }
          catch (fallbackError) { setGenerationError(fallbackError.message || err.message); setIsLoading(false); }
          clearInterval(interval);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  };

  /* Bootstrap: snapshot → SSE → polling, with history fallback on 404 */
  useEffect(() => {
    if (!jobId || batchLessons) return;

    let isMounted  = true;
    let stopPolling = null;

    const connectProgress = () => {
      if (!isMounted) return;
      const sse = subscribeBatchProgress(jobId, (data) => {
        updateBatchProgress(data);
        if (data.stage === 'complete') {
          getBatchJobResult(jobId).then((result) => {
            if (!isMounted) return;
            const state = applyJobResult(result);
            if (state === 'waiting_for_lessons') stopPolling = pollForResults();
          }).catch(async (err) => {
            if (!isMounted) return;
            if (err?.status === 404) {
              try { await loadFromHistoryFallback(); }
              catch (fe) { setGenerationError(fe.message || err.message); setIsLoading(false); }
              return;
            }
            stopPolling = pollForResults();
          });
        }
        if (data.stage === 'error') { setGenerationError(data.message); setIsLoading(false); }
      }, () => { stopPolling = pollForResults(); });
      sseRef.current = sse;
    };

    const bootstrap = async () => {
      try {
        const result = await getBatchJobResult(jobId);
        if (!isMounted) return;
        const state = applyJobResult(result);
        if (state === 'complete' || state === 'failed') return;
        if (state === 'waiting_for_lessons') { stopPolling = pollForResults(); return; }
        connectProgress();
      } catch (err) {
        if (err?.status === 404) {
          try { await loadFromHistoryFallback(); }
          catch (fe) { setGenerationError(fe.message || err.message); setIsLoading(false); }
          return;
        }
        connectProgress();
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
      if (sseRef.current) sseRef.current.close();
      if (typeof stopPolling === 'function') stopPolling();
    };
  }, [jobId, batchLessons, updateBatchProgress, completeBatchGeneration, setGenerationError]);

  useEffect(() => {
    if (batchLessons?.length > 0) { setLessons(batchLessons); setIsLoading(false); }
  }, [batchLessons]);

  /* Navigate to textbook-view with optional poemIndex */
  const openLesson = (lesson, poemIndex) =>
    navigate('/textbook-view', { state: { lesson, fromBatch: true, jobId, poemIndex } });

  const grade = batchParams?.grade || '3';
  const subject = batchParams?.subject || 'English';
  const level = batchParams?.level || 'Medium';
  const lessonCount = batchParams?.lessonCount || 1;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Build flat cards list — poetry lessons expand to individual poem cards, stories get their own card
  const allCards = lessons.flatMap(lesson => {
    if (isStoryLesson(lesson)) {
      return [{ type: 'story', lesson }];
    }
    if (isPoetryLesson(lesson)) {
      const poems = parsePoemsFromLesson(lesson);
      const imgs  = (lesson.images?.poems || []).map(p => getImageUrl(p));
      if (poems.length > 0) {
        return poems.map((poem, pi) => ({
          type: 'poem', poem, lesson,
          poemIndex: pi,
          poemImage: imgs[pi] || null,
          totalPoems: poems.length,
        }));
      }
    }
    return [{ type: 'lesson', lesson }];
  });

  const featuredCard = allCards[0];
  const gridCards    = allCards.slice(1);

  return (
    <div style={S.page}>

      {/* ══════ MASTHEAD ══════ */}
      <div style={S.masthead}>
        <div style={S.mastheadInner}>
          <div style={S.rule} />
          <div style={S.mastheadRow}>
            <button onClick={() => navigate('/generator')} style={S.backBtn}>← Back to Generator</button>
            <div style={S.brand}>📚 Content Studio</div>
            <div style={S.mastheadMeta}>{today}</div>
          </div>
          <div style={S.rule} />
        </div>
      </div>

      {/* ══════ LOADING ══════ */}
      {isLoading && (
        <div style={S.loadingWrap}>
          <div style={S.loadingCard}>
            <div style={S.loaderTop}>
              <div style={S.loaderSpinner}>
                <Loader2 size={26} style={{ animation: 'gl-spin 1s linear infinite', color: '#c41a1a' }} />
              </div>
              <div>
                <div style={S.loaderTitle}>{STAGE_LABELS[batchProgress?.stage] || 'Starting...'}</div>
                <div style={S.loaderMsg}>{batchProgress?.message || 'Preparing AI pipeline...'}</div>
              </div>
            </div>
            <div style={S.progOuter}><div style={{ ...S.progInner, width: `${Math.max(batchProgress?.progress || 0, 2)}%` }} /></div>
            <div style={S.progMeta}><span>{batchProgress?.progress || 0}%</span><span>Generating {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}…</span></div>
            <div style={S.stageRow}>
              {STAGE_ORDER.map((st, i) => {
                const cur = STAGE_ORDER.indexOf(batchProgress?.stage);
                return (
                  <React.Fragment key={st}>
                    <div style={{ ...S.stageDot, ...(cur > i ? S.stageDone : {}), ...(cur === i ? S.stageActive : {}) }}>
                      {cur > i ? '✓' : i + 1}
                    </div>
                    {i < STAGE_ORDER.length - 1 && <div style={{ ...S.stageLine, ...(cur > i ? S.stageLineDone : {}) }} />}
                  </React.Fragment>
                );
              })}
            </div>
            <div style={S.stageLabels}>
              {STAGE_ORDER.map((st) => <span key={st} style={S.stageLabel}>{STAGE_LABELS[st]}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* ══════ ERROR ══════ */}
      {error && !isLoading && (
        <div style={S.errWrap}>
          <div style={S.errCard}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <div style={S.errTitle}>Generation Failed</div>
            <div style={S.errText}>{error}</div>
            <button onClick={() => navigate('/generator')} style={S.btnRed}><RefreshCw size={14} /> Try Again</button>
          </div>
        </div>
      )}

      {/* ══════ CONTENT ══════ */}
      {!isLoading && lessons.length > 0 && (
        <div style={S.container}>

          {/* Section Header */}
          <div style={S.sectionHead}>
            <div style={S.sectionTag}>
              📚 {subject.toUpperCase()} · GRADE {grade.toString().toUpperCase()}
            </div>
            <h1 style={S.sectionTitle}>
              {allCards.length === 1 && featuredCard?.type === 'lesson'
                ? featuredCard.lesson.title
                : `${allCards.length} ${subject} Works`}
            </h1>
            <p style={S.sectionMeta}>
              {level} Level · Generated {today} · {allCards.length} {allCards.length === 1 ? 'piece' : 'pieces'}
            </p>
            <div style={S.rule} />
          </div>

          {/* ══════ FEATURED CARD ══════ */}
          {featuredCard && (
            <FeaturedCard
              card={featuredCard}
              hovered={hoveredCard}
              setHovered={setHoveredCard}
              openLesson={openLesson}
              grade={grade} subject={subject} level={level}
            />
          )}

          {/* ══════ GRID (remaining cards) ══════ */}
          {gridCards.length > 0 && (
            <>
              <div style={{ ...S.rule, margin: '36px 0' }} />
              <div style={S.gridLabel}>
                {gridCards.some(c => c.type === 'poem') ? 'More Poems in This Collection' : `More ${subject} Works`}
              </div>
              <div style={{
                ...S.grid,
                gridTemplateColumns: gridCards.every(c => c.type === 'poem')
                  ? '1fr'
                  : gridCards.length === 1 ? '1fr 1fr' : gridCards.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)',
              }}>
                {gridCards.map((card, i) => (
                  <GridCard
                    key={i} card={card} cardKey={`gc-${i}`}
                    hovered={hoveredCard} setHovered={setHoveredCard}
                    openLesson={openLesson}
                    grade={grade} subject={subject} level={level}
                  />
                ))}
              </div>
            </>
          )}

          {/* Footer */}
          <div style={{ ...S.rule, margin: '48px 0 24px' }} />
          <div style={S.footerRow}>
            <span style={S.footerMeta}>{lessons.length} work{lessons.length !== 1 ? 's' : ''} · Content Studio · Grade {grade} {subject}</span>
            <button onClick={() => navigate('/generator')} style={S.btnOutline}>
              <RefreshCw size={13} /> Regenerate
            </button>
          </div>

        </div>
      )}

      <style>{`
        @keyframes gl-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

/* ══════ FEATURED CARD ══════ */
const FeaturedCard = ({ card, hovered, setHovered, openLesson, grade, subject, level }) => {
  const key = 'feat';
  const isHov = hovered === key;

  if (card.type === 'story') {
    const { lesson } = card;
    const imgUrl = getImageUrl(lesson.images?.cover);
    return (
      <div
        style={{ ...S.featured, ...(isHov ? S.featuredHover : {}) }}
        onClick={() => openLesson(lesson)}
        onMouseEnter={() => setHovered(key)}
        onMouseLeave={() => setHovered(null)}
      >
        <div style={S.featImg}>
          {imgUrl
            ? <img src={imgUrl} alt={lesson.title} style={S.featImgEl} onError={e => { e.target.style.display = 'none'; }} />
            : <StoryPlaceholder />}
        </div>
        <div style={S.featContent}>
          <div style={{ ...S.poetryTag, color: '#1a4fc4' }}>📖 STORY · {lesson.setting || 'Fiction'}</div>
          <h2 style={{ ...S.featTitle, textDecorationLine: isHov ? 'underline' : 'none', textDecorationColor: '#1a1a1a', textDecorationThickness: '2px' }}>
            {lesson.title}
          </h2>
          <div style={S.featByline}>
            Grade {grade} · {subject} · {level} Level · {lesson.duration || '40 min'}
            {lesson.characters?.length > 0 && ` · ${lesson.characters.slice(0, 2).join(', ')}`}
          </div>
          <p style={S.featExcerpt}>{storyExcerpt(lesson)}</p>
          {lesson.moral && (
            <div style={S.storyMoralPrev}>
              <span style={{ fontWeight: 700 }}>Moral: </span>{lesson.moral}
            </div>
          )}
          <div style={S.readMore}>Read Story <span style={{ fontSize: 18 }}>→</span></div>
        </div>
      </div>
    );
  }

  if (card.type === 'poem') {
    const { poem, lesson, poemIndex, poemImage } = card;
    return (
      <div
        style={{ ...S.featured, ...(isHov ? S.featuredHover : {}) }}
        onClick={() => openLesson(lesson, poemIndex)}
        onMouseEnter={() => setHovered(key)}
        onMouseLeave={() => setHovered(null)}
      >
        <div style={S.featImg}>
          {poemImage
            ? <img src={poemImage} alt={poem.title} style={S.featImgEl} onError={e => { e.target.style.display = 'none'; }} />
            : <PoemPlaceholder index={poemIndex} />}
        </div>
        <div style={S.featContent}>
          <div style={{ ...S.poetryTag, color: '#c41a1a' }}>🎵 POEM {poemIndex + 1}</div>
          <h2 style={{ ...S.featTitle, textDecorationLine: isHov ? 'underline' : 'none', textDecorationColor: '#1a1a1a', textDecorationThickness: '2px' }}>
            {poem.title}
          </h2>
          <div style={S.featByline}>Grade {grade} · {subject} · {level} Level · {poem.lines.length} lines</div>
          <div style={S.poemLines}>
            {poem.lines.slice(0, 4).map((line, li) => (
              <div key={li} style={S.poemLineRow}>
                <span style={S.poemLineNum}>{li + 1}</span>
                <span style={S.poemLineText}>{line}</span>
              </div>
            ))}
            {poem.lines.length > 4 && <div style={S.poemMore}>…{poem.lines.length - 4} more lines</div>}
          </div>
          <div style={S.readMore}>Read Full Poem <span style={{ fontSize: 18 }}>→</span></div>
        </div>
      </div>
    );
  }

  /* Regular lesson */
  const { lesson } = card;
  const imgUrl = getImageUrl(lesson.images?.cover);
  return (
    <div
      style={{ ...S.featured, ...(isHov ? S.featuredHover : {}) }}
      onClick={() => openLesson(lesson)}
      onMouseEnter={() => setHovered(key)}
      onMouseLeave={() => setHovered(null)}
    >
      <div style={S.featImg}>
        {imgUrl
          ? <img src={imgUrl} alt={lesson.title} style={S.featImgEl} onError={e => { e.target.style.display = 'none'; }} />
          : <FeatPlaceholder lesson={lesson} />}
      </div>
      <div style={S.featContent}>
        <CategoryTag lesson={lesson} />
        <h2 style={{ ...S.featTitle, textDecorationLine: isHov ? 'underline' : 'none', textDecorationColor: '#1a1a1a', textDecorationThickness: '2px' }}>
          {lesson.title}
        </h2>
        <div style={S.featByline}>Grade {grade} · {subject} · {level} Level · {lesson.duration || '45 min'}</div>
        <p style={S.featExcerpt}>{excerpt(lesson)}</p>
        <div style={S.readMore}>Read Article <span style={{ fontSize: 18 }}>→</span></div>
      </div>
    </div>
  );
};

/* ══════ GRID CARD ══════ */
const GridCard = ({ card, cardKey, hovered, setHovered, openLesson, grade, subject, level }) => {
  const isHov = hovered === cardKey;

  if (card.type === 'story') {
    const { lesson } = card;
    const imgUrl = getImageUrl(lesson.images?.cover);
    return (
      <div
        style={{ ...S.card, ...(isHov ? S.cardHovered : {}) }}
        onClick={() => openLesson(lesson)}
        onMouseEnter={() => setHovered(cardKey)}
        onMouseLeave={() => setHovered(null)}
      >
        <div style={S.cardImg}>
          {imgUrl
            ? <img src={imgUrl} alt={lesson.title} style={S.cardImgEl} onError={e => { e.target.style.display = 'none'; }} />
            : <StoryPlaceholder />}
        </div>
        <div style={S.cardBody}>
          <div style={{ ...S.poetryTag, color: '#1a4fc4', fontSize: 10 }}>📖 STORY</div>
          <h3 style={{ ...S.cardTitle, textDecorationLine: isHov ? 'underline' : 'none', textDecorationColor: '#1a1a1a', textDecorationThickness: '1.5px' }}>
            {lesson.title}
          </h3>
          <div style={S.cardByline}>Grade {grade} · {subject} · {lesson.duration || '40 min'}</div>
          <p style={S.cardExcerpt}>{storyExcerpt(lesson)}</p>
          <div style={S.cardReadMore}>Read Story →</div>
        </div>
      </div>
    );
  }

  if (card.type === 'poem') {
    const { poem, lesson, poemIndex, poemImage } = card;
    return (
      <div
        style={{ ...S.featured, ...(isHov ? S.featuredHover : {}), gridColumn: '1 / -1' }}
        onClick={() => openLesson(lesson, poemIndex)}
        onMouseEnter={() => setHovered(cardKey)}
        onMouseLeave={() => setHovered(null)}
      >
        <div style={S.featImg}>
          {poemImage
            ? <img src={poemImage} alt={poem.title} style={S.featImgEl} onError={e => { e.target.style.display = 'none'; }} />
            : <PoemPlaceholder index={poemIndex} />}
        </div>
        <div style={S.featContent}>
          <div style={{ ...S.poetryTag, color: '#c41a1a' }}>🎵 POEM {poemIndex + 1}</div>
          <h2 style={{ ...S.featTitle, textDecorationLine: isHov ? 'underline' : 'none', textDecorationColor: '#1a1a1a', textDecorationThickness: '2px' }}>
            {poem.title}
          </h2>
          <div style={S.featByline}>Grade {grade} · {subject} · {level} Level · {poem.lines.length} lines</div>
          <div style={S.poemLines}>
            {poem.lines.slice(0, 4).map((line, li) => (
              <div key={li} style={S.poemLineRow}>
                <span style={S.poemLineNum}>{li + 1}</span>
                <span style={S.poemLineText}>{line}</span>
              </div>
            ))}
            {poem.lines.length > 4 && <div style={S.poemMore}>…{poem.lines.length - 4} more lines</div>}
          </div>
          <div style={S.readMore}>Read Full Poem <span style={{ fontSize: 18 }}>→</span></div>
        </div>
      </div>
    );
  }

  const { lesson } = card;
  const tag = catTag(lesson);
  const imgUrl = getImageUrl(lesson.images?.cover);
  return (
    <div
      style={{ ...S.card, ...(isHov ? S.cardHovered : {}) }}
      onClick={() => openLesson(lesson)}
      onMouseEnter={() => setHovered(cardKey)}
      onMouseLeave={() => setHovered(null)}
    >
      <div style={S.cardImg}>
        {imgUrl
          ? <img src={imgUrl} alt={lesson.title} style={S.cardImgEl} onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = tag.color; }} />
          : <CardPlaceholder lesson={lesson} color={tag.color} />}
      </div>
      <div style={S.cardBody}>
        <CategoryTag lesson={lesson} small />
        <h3 style={{ ...S.cardTitle, textDecorationLine: isHov ? 'underline' : 'none', textDecorationColor: '#1a1a1a', textDecorationThickness: '1.5px' }}>
          {lesson.title}
        </h3>
        <div style={S.cardByline}>Grade {grade} · {subject} · {lesson.duration || '45 min'}</div>
        <p style={S.cardExcerpt}>{excerpt(lesson)}</p>
        <div style={S.cardReadMore}>Read →</div>
      </div>
    </div>
  );
};

/* ── Sub-components ── */
const CategoryTag = ({ lesson, small }) => {
  const tag = catTag(lesson);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: small ? 10 : 11, fontWeight: 700, letterSpacing: '0.08em',
      color: tag.color, marginBottom: small ? 6 : 10,
      fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'uppercase',
    }}>
      {tag.emoji} {tag.label}
    </div>
  );
};

const StoryPlaceholder = () => (
  <div style={{
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(160deg, #1a3a8bcc 0%, #1a4fc4ff 100%)',
  }}>
    <div style={{ fontSize: 52, marginBottom: 8 }}>📖</div>
    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
      Story
    </div>
  </div>
);

const POEM_COLORS = ['#8b1a1a', '#1a3a8b', '#0f5c2e', '#5c1a6b', '#8b4c1a', '#1a5c5c'];
const POEM_EMOJIS = ['🌸', '🌙', '⭐', '🌊', '🦋', '🌿'];

const PoemPlaceholder = ({ index }) => {
  const color = POEM_COLORS[index % POEM_COLORS.length];
  const emoji = POEM_EMOJIS[index % POEM_EMOJIS.length];
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(160deg, ${color}cc 0%, ${color}ff 100%)`,
    }}>
      <div style={{ fontSize: 52, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
        Poem {index + 1}
      </div>
    </div>
  );
};

const FeatPlaceholder = ({ lesson }) => {
  const tag = catTag(lesson);
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(160deg, ${tag.color}22 0%, ${tag.color}44 100%)`,
      borderRight: `4px solid ${tag.color}33`,
    }}>
      <div style={{ fontSize: 64, marginBottom: 12, opacity: 0.85 }}>{tag.emoji}</div>
      <div style={{ fontSize: 13, color: tag.color, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
        {tag.label}
      </div>
    </div>
  );
};

const CardPlaceholder = ({ lesson, color }) => (
  <div style={{
    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `linear-gradient(135deg, ${color}22, ${color}44)`,
  }}>
    <span style={{ fontSize: 48, opacity: 0.8 }}>{catTag(lesson).emoji}</span>
  </div>
);

/* ══════ STYLES ══════ */
const S = {
  page: {
    minHeight: '100vh', background: '#FFF0F5',
    fontFamily: 'Inter, -apple-system, system-ui, sans-serif', color: '#1a1a1a',
  },
  masthead: { padding: '0 0', background: '#EFF6FF' },
  mastheadInner: { maxWidth: 1080, margin: '0 auto', padding: '16px 24px 0' },
  mastheadRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' },
  brand: { fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: '"Playfair Display", Georgia, serif', color: '#1a1a1a' },
  mastheadMeta: { fontSize: 12, color: '#767676', fontWeight: 500 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#767676', fontWeight: 500, padding: '4px 0', fontFamily: 'inherit', transition: 'color 0.15s' },
  rule: { width: '100%', height: 1, background: '#1a1a1a' },

  loadingWrap: { display: 'flex', justifyContent: 'center', padding: '60px 24px' },
  loadingCard: { background: '#fff', border: '1px solid #e8e8e8', borderRadius: 4, padding: '36px 40px', width: '100%', maxWidth: 560, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  loaderTop: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  loaderSpinner: { width: 44, height: 44, borderRadius: 4, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fecaca', flexShrink: 0 },
  loaderTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 2, fontFamily: '"Playfair Display", serif' },
  loaderMsg: { fontSize: 13, color: '#767676' },
  progOuter: { width: '100%', height: 3, background: '#f0f0f0', marginBottom: 8 },
  progInner: { height: '100%', background: '#c41a1a', transition: 'width 500ms ease' },
  progMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginBottom: 24 },
  stageRow: { display: 'flex', alignItems: 'center', gap: 0 },
  stageDot: { width: 24, height: 24, borderRadius: '50%', border: '1.5px solid #d4d4d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#aaa', background: '#fff', flexShrink: 0 },
  stageDone: { background: '#1a7f3c', border: '1.5px solid #1a7f3c', color: '#fff' },
  stageActive: { background: '#fff5f5', border: '1.5px solid #c41a1a', color: '#c41a1a' },
  stageLine: { flex: 1, height: 1.5, background: '#e0e0e0' },
  stageLineDone: { background: '#1a7f3c' },
  stageLabels: { display: 'flex', justifyContent: 'space-between', marginTop: 6 },
  stageLabel: { fontSize: 10, color: '#999', textAlign: 'center', flex: 1 },

  errWrap: { display: 'flex', justifyContent: 'center', padding: '60px 24px' },
  errCard: { background: '#fff', border: '1px solid #fecaca', borderRadius: 4, padding: 40, textAlign: 'center', maxWidth: 440 },
  errTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8, fontFamily: '"Playfair Display", serif' },
  errText: { fontSize: 14, color: '#767676', marginBottom: 20, lineHeight: 1.6 },

  container: { maxWidth: 1080, margin: '0 auto', padding: '32px 24px 72px' },
  sectionHead: { marginBottom: 32 },
  sectionTag: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#c41a1a', marginBottom: 10, textTransform: 'uppercase' },
  sectionTitle: { fontSize: '2.6rem', fontWeight: 700, lineHeight: 1.15, margin: '0 0 8px', fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '-0.02em' },
  sectionMeta: { fontSize: 13, color: '#767676', margin: '0 0 20px', fontWeight: 400 },

  featured: { display: 'grid', gridTemplateColumns: '55% 1fr', cursor: 'pointer', gap: 0, border: '1px solid #e8e8e8', transition: 'box-shadow 0.2s' },
  featuredHover: { boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
  featImg: { width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: '#f5f5f5', position: 'relative' },
  featImgEl: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  featContent: { padding: '32px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff' },
  featTitle: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2, margin: '0 0 10px', fontFamily: '"Playfair Display", Georgia, serif', color: '#1a1a1a', cursor: 'pointer', transition: 'text-decoration 0.15s' },
  featByline: { fontSize: 12, color: '#767676', marginBottom: 14, letterSpacing: '0.03em' },
  featExcerpt: { fontSize: 14, color: '#3d3d3d', lineHeight: 1.7, margin: '0 0 20px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  readMore: { fontSize: 13, fontWeight: 700, color: '#c41a1a', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' },

  gridLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#767676', textTransform: 'uppercase', marginBottom: 20 },
  grid: { display: 'grid', gap: 1, background: '#e8e8e8' },

  card: { background: '#fff', cursor: 'pointer', overflow: 'hidden', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column' },
  cardHovered: { boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 1, position: 'relative' },
  cardImg: { width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#f5f5f5' },
  cardImgEl: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardBody: { padding: '18px 20px 22px', flex: 1 },
  cardTitle: { fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3, margin: '0 0 8px', fontFamily: '"Playfair Display", Georgia, serif', color: '#1a1a1a' },
  cardByline: { fontSize: 11, color: '#999', marginBottom: 10, letterSpacing: '0.03em' },
  cardExcerpt: { fontSize: 13, color: '#4d4d4d', lineHeight: 1.65, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardReadMore: { fontSize: 12, fontWeight: 700, color: '#c41a1a', letterSpacing: '0.04em', textTransform: 'uppercase' },

  storyMoralPrev: { fontSize: 12, color: '#1a4fc4', lineHeight: 1.5, margin: '0 0 16px', fontStyle: 'italic', borderLeft: '3px solid #1a4fc4', paddingLeft: 10 },
  poetryTag: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'Inter, system-ui, sans-serif' },
  poemLines: { margin: '12px 0 18px', borderLeft: '3px solid #c41a1a', paddingLeft: 14 },
  poemLineRow: { display: 'flex', gap: 10, marginBottom: 5 },
  poemLineNum: { fontSize: 11, color: '#c41a1a', fontWeight: 700, minWidth: 18, paddingTop: 2 },
  poemLineText: { fontSize: 14, fontStyle: 'italic', fontFamily: 'Georgia, serif', color: '#2d2d2d', lineHeight: 1.65 },
  poemMore: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: 4 },

  footerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  footerMeta: { fontSize: 12, color: '#999' },
  btnRed: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: 'none', background: '#c41a1a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnOutline: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1.5px solid #1a1a1a', background: '#fff', color: '#1a1a1a', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em', textTransform: 'uppercase' },
};

export default GeneratedLessons;
