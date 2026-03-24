import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../utils/api';
import logo from '../assets/images/py-logo.png';
import html2pdf from 'html2pdf.js';
import './LessonView.css';

/* ══════════════════════════════════════════════════════════════════════
   DATA HELPERS
══════════════════════════════════════════════════════════════════════ */

const toArr = v => (Array.isArray(v) ? v : v ? [v] : []);

function asObjectives(raw) {
  return toArr(raw)
    .map(o => (typeof o === 'string' ? o : o.text || o.objective || ''))
    .filter(Boolean);
}

function asVocab(raw) {
  return toArr(raw)
    .map(v =>
      typeof v === 'string'
        ? { word: v, definition: '', pos: '' }
        : { word: v.word || v.term || '', definition: v.definition || v.meaning || '', pos: v.partOfSpeech || v.type || '' }
    )
    .filter(v => v.word);
}

function asExamples(raw) {
  return toArr(raw).map(item => {
    if (typeof item === 'string') return { type: 'text', label: '', text: item };
    if (item.question && (item.answer || item.solution))
      return { type: 'qa', label: item.label || item.title || '', q: item.question, a: item.answer || item.solution };
    return { type: 'text', label: item.label || item.title || '', text: item.text || item.content || '' };
  });
}

function asExercises(ex) {
  const norm = arr =>
    toArr(arr)
      .map(item =>
        typeof item === 'string'
          ? { question: item, hint: '', answer: '' }
          : { question: item.question || item.text || '', hint: item.hint || '', answer: item.answer || '' }
      )
      .filter(e => e.question);
  if (!ex) return { easy: [], medium: [], challenge: [] };
  if (Array.isArray(ex)) return { easy: norm(ex), medium: [], challenge: [] };
  return {
    easy: norm(ex.easy || ex.beginner || []),
    medium: norm(ex.medium || ex.intermediate || []),
    challenge: norm(ex.challenge || ex.advanced || ex.hard || []),
  };
}

function asQuiz(raw) {
  return toArr(raw)
    .map(item =>
      typeof item === 'string'
        ? { question: item, options: [], correct: null }
        : { question: item.question || '', options: toArr(item.options), correct: item.correct ?? item.answer ?? null }
    )
    .filter(q => q.question);
}

function asResources(ld) {
  const s = ld.resourceSections || {};
  const rows = [];
  if (s.teacherGuide)
    rows.push({ icon: '📋', color: 'blue', name: s.teacherGuide.title || 'Teacher Guide', desc: s.teacherGuide.overview || '' });
  toArr(s.educationalVideos).forEach((v, i) =>
    rows.push({ icon: '🎬', color: 'red', name: v.title || `Video ${i + 1}`, desc: v.description || v.source || '' })
  );
  toArr(s.teachingAids).forEach((a, i) =>
    rows.push({ icon: '🖼️', color: 'purple', name: a.title || `Teaching Aid ${i + 1}`, desc: a.description || '' })
  );
  toArr(s.printableActivities).forEach((a, i) =>
    rows.push({ icon: '📄', color: 'green', name: a.title || `Printable ${i + 1}`, desc: a.description || '' })
  );
  toArr(s.researchArticles).forEach((a, i) =>
    rows.push({ icon: '🔗', color: 'teal', name: a.title || `Resource ${i + 1}`, desc: a.description || a.source || '' })
  );
  if (!rows.length && ld.additionalResources)
    rows.push({ icon: '📚', color: 'navy', name: 'Additional Resources', desc: String(ld.additionalResources).slice(0, 200) });
  return rows;
}

function asImagePrompts(ld) {
  if (Array.isArray(ld.imagePrompts) && ld.imagePrompts.length)
    return ld.imagePrompts.map(p => (typeof p === 'string' ? p : p.prompt || p.description || ''));
  return toArr(ld.images?.content).filter(img => typeof img === 'string' && !img.startsWith('/') && !img.startsWith('http'));
}

function isPoetry(ld) {
  const hint = `${ld.title || ''} ${toArr(ld.keyTopics).join(' ')}`;
  if (/poem|rhyme|poetry|rhythm|verse/i.test(hint)) return true;
  // Also detect if workedExamples contain POEM-formatted strings
  const examples = toArr(ld.workedExamples);
  return examples.some(e => typeof e === 'string' && /^POEM\s*\d*/i.test(e.trimStart()));
}

function paras(text) {
  return String(text || '').split(/\n{2,}|\n/).map(p => p.trim()).filter(Boolean);
}

/* ── Poem parsing — handles multiple AI output formats ── */
function parsePoems(examples) {
  const poems = [];

  const addPoem = (title, bodyText, fallbackN) => {
    const lines = bodyText
      .replace(/\\n/g, '\n')          // handle literal \n from JSON stringification
      .split('\n')
      .map(l => l.replace(/^\d+\.\s*/, '').trim())  // strip "1. " prefixes if present
      .filter(Boolean);
    if (lines.length >= 2) {
      poems.push({ title: title || `Poem ${fallbackN}`, lines });
      return true;
    }
    return false;
  };

  for (const ex of examples) {
    const n = poems.length + 1;

    if (ex.type === 'text') {
      const raw = (ex.text || '').replace(/\\n/g, '\n');

      // Format A: "POEM 1 — Title:\nlines..."  OR  "POEM 1 — Title\nlines..."
      const hdrA = raw.match(/^POEM\s*\d*\s*[—\-–:]\s*(.+?)\n/i);
      if (hdrA) {
        const title = hdrA[1].replace(/:$/, '').trim();
        const body  = raw.slice(hdrA[0].length).trim();
        addPoem(title, body, n);
        continue;
      }

      // Format B: First line is plain title (short, no line-break chars)
      const allLines = raw.split('\n').map(l => l.trim()).filter(Boolean);
      if (allLines.length >= 3) {
        const maybeTitle = allLines[0];
        const restIsPoem = allLines.slice(1).every(l => l.split(' ').length <= 12);
        if (maybeTitle.length < 60 && restIsPoem && !/^\d/.test(maybeTitle)) {
          addPoem(maybeTitle, allLines.slice(1).join('\n'), n);
          continue;
        }
      }

      // Format C: Just poem body with no explicit title
      if (allLines.length >= 2) {
        addPoem(ex.label || `Poem ${n}`, raw, n);
      }

    } else if (ex.type === 'qa') {
      // QA format: question = title, answer = body
      const title = ex.label || ex.q || `Poem ${n}`;
      addPoem(title, ex.a || '', n);
    }
  }
  return poems;
}

/* ── Rhyme analysis helpers ── */
function getLastWordSound(line) {
  const words = line.trim().split(/\s+/);
  return (words[words.length - 1] || '').toLowerCase().replace(/[^a-z]/g, '').slice(-4);
}

function detectRhymeScheme(lines) {
  const sounds = lines.map(getLastWordSound);
  const map = {};
  let code = 65;
  return sounds.map(s => {
    if (!s) return '?';
    if (!(s in map)) map[s] = String.fromCharCode(code++);
    return map[s];
  }).join('');
}

function findRhymingWords(lines) {
  const groups = {};
  lines.forEach(l => {
    const words = l.trim().split(/\s+/);
    const last = (words[words.length - 1] || '').replace(/[^a-zA-Z]/g, '');
    if (!last) return;
    const key = last.toLowerCase().slice(-3);
    if (!groups[key]) groups[key] = new Set();
    groups[key].add(last);
  });
  return Object.values(groups)
    .filter(g => g.size >= 2)
    .map(g => [...g].join(' • '));
}

/* ══════════════════════════════════════════════════════════════════════
   BUILD POEM-SPECIFIC LESSON CONTENT
   When a single poem is selected, all sections are derived from its text.
══════════════════════════════════════════════════════════════════════ */
function buildPoemLesson(poem) {
  const { title, lines } = poem;

  // ── Helpers ──────────────────────────────────────────────────────────
  const cap   = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  const clean = l => (l || '').replace(/[.!?,;:]+$/, '').trim();
  const q     = s => `"${s}"`;          // wrap in quotes
  const ital  = s => `"${s}"`;          // same — readable quotes

  // ── End-words (last word of each line, for rhyme detection) ──────────
  const endWords = lines.map(l =>
    l.trim().split(/\s+/).pop()?.replace(/[^a-zA-Z]/g, '') || ''
  ).filter(Boolean);

  // ── Rhyming pairs (share last 3+ chars) ──────────────────────────────
  const rhymeGroups = {};
  endWords.forEach(w => {
    const key = w.toLowerCase().slice(-3);
    if (!rhymeGroups[key]) rhymeGroups[key] = [];
    if (!rhymeGroups[key].includes(w.toLowerCase())) rhymeGroups[key].push(w.toLowerCase());
  });
  const rhymePairs = Object.values(rhymeGroups).filter(g => g.length >= 2);
  const pairList   = rhymePairs.map(g => g.join(' / '));

  // ── Content-word → source-line map ───────────────────────────────────
  // Expanded stop list so vocab only surfaces real content words
  const STOP = new Set([
    'the','and','for','are','but','not','you','all','can','her','was','one','our',
    'out','has','him','his','how','its','let','did','get','may','now','old','own',
    'say','she','too','use','way','who','any','said','same','made','make','take',
    'have','that','this','with','from','they','them','their','there','when','where',
    'what','will','been','into','some','also','just','each','like','more','than',
    'then','very','upon','about','could','would','should','little','loves','likes',
    'come','does','know','long','look','most','move','much','name','need','only',
    'over','part','seem','show','small','still','such','tell','think','those',
    'through','turn','were','went','give','live','every','after','here','once',
    'even','ever','found','good','great','back','both','call','came','down','face',
    'fast','felt','full','game','gave','glad','goes','gone','grew','grow','hand',
    'hard','held','help','hold','hope','hurt','knew','laid','land','last','late',
    'lead','lean','life','lost','loud','love','near','nice','none','open','path',
    'poor','pull','puts','read','real','rest','ride','rise','road','rock','room',
    'runs','safe','sang','seen','self','sent','sets','side','sign','sing','sink',
    'sits','slow','soft','song','soon','step','stop','sure','swim','tale','tall',
    'tick','tied','till','told','tone','took','town','tree','true','used','wait',
    'walk','warm','wash','wide','wild','wind','wish','woke','word','wore','your',
    'time','play','days','plus','into','onto','over','also','else','mine','ours',
  ]);

  // Build word → first line it appears in
  const wordLineMap = {};
  lines.forEach(line => {
    line.split(/\s+/).forEach(raw => {
      const w = raw.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (w.length >= 4 && !STOP.has(w) && !wordLineMap[w]) {
        wordLineMap[w] = clean(line);
      }
    });
  });

  // Sort by word length desc (longer = more specific / interesting)
  const contentWords = Object.keys(wordLineMap).sort((a, b) => b.length - a.length);

  // ── Learning Objectives ───────────────────────────────────────────────
  const rhymeHint = rhymePairs.length > 0 ? ` (${pairList.slice(0, 2).join(', ')})` : '';
  const objectives = [
    `Read the poem ${q(title)} aloud with clear pronunciation and expression`,
    `Identify the rhyming words in ${q(title)}${rhymeHint} and explain what makes them rhyme`,
    `Describe in your own words what happens in the poem ${q(title)}`,
  ];

  // ── Key Vocabulary — each word shown with its actual poem line ────────
  const vocabWords = contentWords.slice(0, 6);
  // Pad with end-words if not enough content words
  endWords.forEach(w => {
    if (vocabWords.length < 6 && !vocabWords.includes(w.toLowerCase())) {
      vocabWords.push(w.toLowerCase());
    }
  });
  const vocab = vocabWords.slice(0, 6).map(w => {
    const srcLine = wordLineMap[w] ||
      clean(lines.find(l => l.toLowerCase().includes(w)) || lines[0]);
    return {
      word: w,
      definition: `Used in the poem: ${ital(srcLine)}`,
      pos: '',
    };
  });

  // ── Warm-Up — fully poem-driven questions using actual lines ────────
  const line0 = clean(lines[0] || '');
  const line1 = clean(lines[1] || '');
  const rw1   = endWords[0] || '';
  const rw2   = endWords[lines.length > 2 ? 2 : 1] || '';

  // Build a subject hint from the title (e.g. "My Happy Day" → "a happy day")
  const titleWords  = title.toLowerCase().replace(/^(a|an|the|my|our|the)\s+/i, '');
  const subjectHint = titleWords;

  // Pick the most "interesting" line from the middle for Q3 + explanation
  const midIdx   = Math.floor(lines.length / 2);
  const midLine  = clean(lines[midIdx] || '');
  const lastLine = clean(lines[lines.length - 1] || '');

  const warmUp =
    `We are going to read the poem ${q(title)}. Let's explore it together before reading!\n\n` +
    // Q1 — first line: what is happening?
    (line0
      ? `👉 Look at the first line:\n${ital(line0)}\nWhat is happening here? Who is in this poem and what are they doing?\n\n`
      : '') +
    // Q2 — rhyming end-words
    (rw1 && rw2
      ? `👉 Look at the last word of the first line — ${q(rw1)}. Now look at the last word of the third line — ${q(rw2)}. Do they rhyme? ` +
        `Read the whole poem aloud and find ALL the pairs of rhyming words!\n\n`
      : '') +
    // Q3 — meaning question tied to poem subject
    (midLine
      ? `👉 Listen to this line from the middle of the poem:\n${ital(midLine)}\nWhat feeling does this give you? What do you think makes ${subjectHint} so special in this poem?`
      : `👉 What do you think makes ${subjectHint} so special? Share your ideas with a partner!`);

  // ── Main Explanation — weaves in actual quoted lines ─────────────────
  let explanation =
    `Today we are reading a poem called ${q(title)}. ` +
    (line0 ? `It opens with the line: ${ital(line0)}. ` : '') +
    `As you read each line, the poem tells a little story about ${title}. `;
  if (midLine && midLine.toLowerCase() !== line0.toLowerCase()) {
    explanation += `In the middle of the poem we read: ${ital(midLine)}. `;
  }
  if (lastLine && lastLine.toLowerCase() !== line0.toLowerCase()) {
    explanation += `And it ends with: ${ital(lastLine)}. `;
  }
  if (pairList.length > 0) {
    explanation += `Listen carefully to the last word of each line — the rhyming pairs (${pairList.slice(0, 3).join(', ')}) are what give the poem its rhythm and make it fun to read aloud!`;
  }

  // ── Practice Exercises — all tied to specific lines ──────────────────
  // Build fill-in-blank helpers: split each line at its last word
  const makeFill = (lineStr) => {
    const words = lineStr.trim().split(/\s+/);
    if (words.length < 2) return { stem: lineStr, answer: '' };
    const answer = words[words.length - 1].replace(/[^a-zA-Z]/g, '');
    const stem   = words.slice(0, -1).join(' ');
    return { stem, answer };
  };

  const fill0 = makeFill(clean(lines[0] || ''));
  const fill1 = makeFill(clean(lines[lines.length > 1 ? 1 : 0] || ''));
  const fill2 = makeFill(clean(lines[lines.length > 2 ? 2 : 0] || ''));

  // Easy exercises — literal recall from the poem
  const easyEx = [
    {
      question: `What is the title of the poem we are reading today?`,
      type: 'short-answer',
      hint: `It is written at the top of the poem.`,
    },
    {
      question: `Complete this line from ${q(title)}: ${ital(fill0.stem)} ___`,
      type: 'fill-in-blank',
      hint: `Look at the first line of the poem.`,
    },
    {
      question: lines[lines.length > 1 ? 1 : 0]
        ? `Complete this line from ${q(title)}: ${ital(fill1.stem)} ___`
        : `How many lines does the poem ${q(title)} have?`,
      type: 'fill-in-blank',
      hint: lines[lines.length > 1 ? 1 : 0]
        ? `Look at line 2 of the poem.`
        : `Count the lines carefully.`,
    },
  ];

  // Medium exercises — comprehension + rhyme from specific lines
  const pair0 = rhymePairs[0] || [];
  const pair1 = rhymePairs[1] || rhymePairs[0] || [];
  const medEx = [
    {
      question: lines.length > 2
        ? `Complete this line from ${q(title)}: ${ital(fill2.stem)} ___`
        : `Write the two words from ${q(title)} that rhyme with each other.`,
      type: 'fill-in-blank',
      hint: lines.length > 2
        ? `Look at line 3 of the poem.`
        : `Look at the last word of each line.`,
    },
    {
      question: pair0.length >= 2
        ? `The words ${q(pair0[0])} and ${q(pair0[1])} both appear in ${q(title)}. Write a sentence using one of them.`
        : `Write two words from ${q(title)} that rhyme with each other.`,
      type: 'short-answer',
      hint: pair0.length >= 2
        ? `${q(pair0[0])} and ${q(pair0[1])} are rhyming words from the poem.`
        : `Look at the last word of each line.`,
    },
    {
      question: `In your own words, what is the poem ${q(title)} about? Use at least one word from the poem.`,
      type: 'short-answer',
      hint: `Think about the story the poem tells from the first line to the last.`,
    },
  ];

  // Challenge exercises — creative + analytical, referencing actual content
  const chalEx = [
    {
      question: pair1.length >= 2
        ? `Write a new line for ${q(title)} that rhymes with ${q(pair1[pair1.length - 1])}. Use words that fit the poem's world.`
        : `Write a new line for ${q(title)} using a rhyming word from the poem.`,
      type: 'short-answer',
      hint: pair1.length >= 2
        ? `Your line should end with a word that sounds like ${q(pair1[pair1.length - 1])}.`
        : `Use a word that sounds like the end-words in the poem.`,
    },
    {
      question: lastLine
        ? `The last line of ${q(title)} is: ${ital(lastLine)}. What feeling does this give you? Use words from the poem to explain.`
        : `What feeling does the poem ${q(title)} give you? Use words from the poem to explain.`,
      type: 'short-answer',
      hint: `Think about the mood — is it happy, calm, playful, or exciting?`,
    },
  ];

  const exercises = { easy: easyEx, medium: medEx, challenge: chalEx };

  // ── Quiz — each question tied to specific poem content ────────────────
  const quiz = [];

  // Q1: First line recall
  if (lines[0]) {
    const distractors = [
      lines[Math.floor(lines.length / 2)],
      lines[lines.length - 1],
      lines[1] || lines[lines.length - 1],
    ].map(l => clean(l || lines[0]));
    quiz.push({
      question: `Which is the FIRST line of the poem ${q(title)}?`,
      options: [clean(lines[0]), ...distractors.slice(0, 3)],
      correct: 0,
      explanation: `The poem opens with: ${ital(clean(lines[0]))}`,
    });
  }

  // Q2: Rhyme pair (specific to the poem)
  if (rhymePairs.length > 0) {
    const pair = rhymePairs[0];
    quiz.push({
      question: `Which two words from ${q(title)} rhyme with each other?`,
      options: [
        `${pair[0]} and ${pair[1]}`,
        `book and flower`,
        `sun and cloud`,
        `tree and fish`,
      ],
      correct: 0,
      explanation: `${q(pair[0])} and ${q(pair[1])} are rhyming end-words from the poem.`,
    });
  }

  // Q3: Specific content — what/who/where from actual lines
  if (contentWords.length > 0) {
    const keyWord = contentWords[0];
    const srcLine = wordLineMap[keyWord] || clean(lines[0]);
    quiz.push({
      question: `In the poem ${q(title)}, which line contains the word ${q(keyWord)}?`,
      options: [
        srcLine,
        clean(lines[lines.length > 1 ? 1 : 0] || lines[0]),
        clean(lines[lines.length > 2 ? 2 : 0] || lines[0]),
        `This word is not in the poem`,
      ].map((o, i, arr) => (arr.indexOf(o) !== i ? `${o} (alt)` : o)), // deduplicate
      correct: 0,
      explanation: `The word ${q(keyWord)} appears in the line: ${ital(srcLine)}`,
    });
  }

  // Q4: Last line recall
  if (lines.length > 1) {
    const lastL = clean(lines[lines.length - 1]);
    quiz.push({
      question: `Which is the LAST line of the poem ${q(title)}?`,
      options: [
        lastL,
        clean(lines[0]),
        clean(lines[Math.floor(lines.length / 2)] || lines[0]),
        clean(lines[lines.length > 2 ? lines.length - 2 : 0] || lines[0]),
      ],
      correct: 0,
      explanation: `The poem ends with: ${ital(lastL)}`,
    });
  }

  // ── Teacher Notes — specific characters, actions, rhyme pairs ────────
  const allLineQuotes = lines.slice(0, 3).map(l => ital(clean(l))).join(', ');
  const teacherNotes =
    `Use ${q(title)} as the centrepiece of this lesson. ` +
    `Read it aloud slowly and clearly — first lines: ${allLineQuotes}. ` +
    `Then invite the class to echo-read line by line. ` +
    (pairList.length > 0
      ? `Draw attention to the rhyming pairs: ${pairList.join(', ')} — clap or tap on the rhyming word each time. `
      : '') +
    `Ask: "What is happening in this poem?" and "Which line is your favourite?" ` +
    `Have students draw a scene from the poem, then share and compare. ` +
    `For extension, challenge students to write one more line using a rhyming word from the poem.`;

  return { objectives, vocab, warmUp, explanation, exercises, quiz, teacherNotes };
}

/* ══════════════════════════════════════════════════════════════════════
   buildStoryLesson — derive structured lesson from backend story data
   Used when contentType === 'story'.  Returns same shape as poemLesson.
══════════════════════════════════════════════════════════════════════ */
function buildStoryLesson(lesson) {
  const title      = lesson.title || 'Untitled Story';
  const paragraphs = (lesson.paragraphs || []);
  const characters = (lesson.characters || []);
  const setting    = lesson.setting || '';
  const moral      = lesson.moral || '';
  const rawVocab   = (lesson.keyVocabulary || []);
  const rawQA      = (lesson.storyQuestions || []);
  const teacherRaw = lesson.teacherNotes || '';

  // ── 1. Objectives (story-specific)
  const objectives = [
    `Understand what happens in the story "${title}"`,
    'Identify the main character and their actions',
    characters.length > 1 ? `Describe the relationship between ${characters.slice(0,2).join(' and ')}` : 'Describe how the main character solves a problem',
    moral ? `Explain the moral: "${moral}"` : 'Explain the lesson learned in the story',
    'Improve reading comprehension and vocabulary',
  ];

  // ── 2. Vocabulary (directly from story)
  const vocab = rawVocab.map(v => ({
    word: v.word,
    definition: v.definition,
    pos: '',
  }));

  // ── 3. Warm-Up (story-driven — directly tied to characters & content)
  const charHint  = characters.length > 0 ? characters[0] : 'the main character';
  const char2Hint = characters.length > 1 ? characters[1] : null;
  const warmUp =
    `We are going to read a story called "${title}"! Let's think before we start.\n\n` +
    `👉 Who is ${charHint}? What kind of person do you think they are?\n\n` +
    (char2Hint ? `👉 There is also a character called ${char2Hint}. What role do you think ${char2Hint} plays?\n\n` : '') +
    (setting ? `👉 The story takes place in ${setting}. Have you ever been somewhere like that?\n\n` : '') +
    `👉 Do you think the story will be funny, sad, or exciting? Why?\n\n` +
    `👉 What do you already know about the topic of this story? Share your ideas with a partner!`;

  // ── 4. Explanation (story structure breakdown)
  const firstPara  = paragraphs[0] || '';
  const midPara    = paragraphs[Math.floor(paragraphs.length / 2)] || '';
  const lastPara   = paragraphs[paragraphs.length - 1] || '';

  let explanation =
    `In this story, we follow ${charHint}${setting ? ` in ${setting}` : ''}. ` +
    (firstPara ? `The story begins: "${firstPara.substring(0, 80)}…" ` : '') +
    `As the story unfolds, ${charHint} faces a challenge and must make important decisions. ` +
    (midPara && midPara !== firstPara ? `In the middle of the story: "${midPara.substring(0, 80)}…" ` : '') +
    (lastPara && lastPara !== firstPara ? `By the end, we see how everything is resolved. ` : '') +
    (moral ? `The story teaches us an important lesson: "${moral}"` : '');

  // ── 5. Exercises (story-based)
  // Easy: True/False from Q&A
  const easyEx = rawQA.slice(0, 2).map((qa, i) => ({
    type: 'fill',
    question: `True or False: ${qa.question.replace(/\?$/, '')}?`,
    answer: qa.answer,
    hint: 'Think about what happened in the story.',
  }));

  // Medium: Ordering / character-action matching
  const mediumEx = paragraphs.slice(0, 3).map((para, i) => ({
    type: 'fill',
    question: `What happens in paragraph ${i + 1}? Complete the sentence: "${para.split(' ').slice(0, 6).join(' ')} ___"`,
    answer: para.split(' ').slice(6, 12).join(' '),
    hint: 'Re-read the paragraph carefully.',
  }));

  // Challenge: comprehension / inference
  const challengeEx = rawQA.slice(2, 5).map((qa, i) => ({
    type: 'fill',
    question: qa.question,
    answer: qa.answer,
    hint: 'Use evidence from the story.',
  }));
  if (moral && challengeEx.length < 3) {
    challengeEx.push({
      type: 'fill',
      question: `In your own words, what is the moral of "${title}"?`,
      answer: moral,
      hint: 'Think about what lesson the story teaches.',
    });
  }

  const exercises = {
    easy:      easyEx.length      ? easyEx      : [{ type:'fill', question:'Who is the main character?', answer: charHint, hint:'' }],
    medium:    mediumEx.length    ? mediumEx    : [{ type:'fill', question:'What is the main problem in the story?', answer:'', hint:'' }],
    challenge: challengeEx.length ? challengeEx : [{ type:'fill', question:`What is the moral of "${title}"?`, answer: moral, hint:'' }],
  };

  // ── 6. Quiz (comprehension, 5 questions with SHORT clean options)
  // Shorten an answer to ≤5 words so options are clean MCQ-style
  const shorten = str => {
    if (!str) return str;
    const words = str.trim().split(/\s+/);
    return words.length <= 6 ? str.trim() : words.slice(0, 5).join(' ') + '…';
  };

  // Build a pool of short distractors: character names + setting words + generic fillers
  const charPool    = characters.map(c => c.trim());
  const settingWord = setting ? setting.split(/[\s,]+/)[0] : null;
  const fillerPool  = ['A talking animal', 'The teacher', 'A stranger', 'No one', 'Everyone'];
  const distPool    = [...new Set([...charPool, ...(settingWord ? [settingWord] : []), ...fillerPool])];

  const quiz = rawQA.slice(0, 5).map((qa, i) => {
    const correct = shorten(qa.answer);
    // Get 3 distractors: prefer short answers from other questions, then pool
    const otherShort = rawQA
      .filter((_, j) => j !== i)
      .map(q => shorten(q.answer))
      .filter(a => a && a !== correct && a.length < 60);
    const extras = distPool.filter(d => d !== correct && !otherShort.includes(d));
    const wrongOpts = [...otherShort, ...extras].slice(0, 3);
    while (wrongOpts.length < 3) wrongOpts.push(fillerPool[wrongOpts.length % fillerPool.length]);
    const all = [correct, ...wrongOpts.slice(0, 3)];
    // Deterministic shuffle
    all.sort((a, b) => (a.charCodeAt(0) + i * 3) - (b.charCodeAt(0) + i * 3));
    return { question: qa.question, options: all, correct };
  });

  if (moral && quiz.length < 5) {
    const moralShort = shorten(moral);
    quiz.push({
      question: `What is the moral of "${title}"?`,
      options: [moralShort, 'Be greedy always', 'Never help others', 'Run away from problems'],
      correct: moralShort,
    });
  }

  // ── 7. Worked Examples (story-based excerpts with explanation)
  const workedExamples = [];

  // Example 1: Story opening scene
  if (paragraphs[0]) {
    const excerpt = paragraphs[0].length > 120
      ? paragraphs[0].substring(0, 120) + '…'
      : paragraphs[0];
    workedExamples.push({
      type: 'qa',
      label: '📖 Story Opening',
      q: `Read this sentence from the story: "${excerpt}" — Who is doing something and what are they doing?`,
      a: `${charHint} is the main character. This is the beginning of the story where we learn about ${charHint} and the setting${setting ? ` (${setting})` : ''}.`,
    });
  }

  // Example 2: Character action example
  if (characters.length > 0 && paragraphs.length > 1) {
    const midParagraph = paragraphs[Math.floor(paragraphs.length / 2)] || paragraphs[1];
    const midExcerpt = midParagraph.length > 100 ? midParagraph.substring(0, 100) + '…' : midParagraph;
    workedExamples.push({
      type: 'qa',
      label: `👤 Character Action — ${charHint}`,
      q: `Example: "${midExcerpt}" — What problem or action does ${charHint} face here?`,
      a: `${charHint} faces a challenge in the story. Good readers ask: "What does the character want?" and "What is stopping them?"`,
    });
  }

  // Example 3: Moral / lesson example
  if (moral) {
    workedExamples.push({
      type: 'qa',
      label: '⭐ Story Moral Example',
      q: `The story ends with this lesson: "${moral}" — Can you think of a real-life situation where this lesson applies?`,
      a: `The moral "${moral}" teaches us that this lesson matters in everyday life too. For example, when we help a friend or share something, we are living this moral.`,
    });
  }

  // Example 4: Vocabulary in context
  if (rawVocab.length > 0) {
    const v = rawVocab[0];
    const inStory = v.usedInStory || `"${v.word}" is used in the story.`;
    workedExamples.push({
      type: 'qa',
      label: `🔤 Vocabulary in Context — "${v.word}"`,
      q: `The word "${v.word}" means: ${v.definition}. Find it in the story: ${inStory}`,
      a: `When we see "${v.word}" in the story, we know it means "${v.definition}". Using context clues helps us understand new words.`,
    });
  }

  // ── 8. Teacher Notes
  const teacherNotes = teacherRaw ||
    `Before reading, ask students: "What kind of story do you think this is?" ` +
    `During reading, pause after each paragraph and ask "What just happened?" ` +
    (moral ? `After reading, discuss the moral: "${moral}" — can students think of a real-life example? ` : '') +
    `For extension, ask students to rewrite the ending or draw their favourite scene from the story.`;

  return { objectives, vocab, warmUp, explanation, exercises, quiz, teacherNotes, workedExamples };
}

/* ══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════════════ */

/* Section header — gradient band (math2b style) */
function SecHeader({ n, icon, title, color }) {
  return (
    <div className={`lv2-sec-head lv2-sh-${color}`}>
      <div className="lv2-sh-inner">
        <div className="lv2-sh-num">{String(n).padStart(2, '0')}</div>
        <div className="lv2-sh-text">
          <span className="lv2-sh-tag">Section {n}</span>
          <h2 className="lv2-sh-title">
            <span className="lv2-sh-icon">{icon}</span>
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}

/* Poem card with analysis */
function PoemCard({ poem, index, total, poemImage }) {
  const scheme = detectRhymeScheme(poem.lines);
  const rhymes = findRhymingWords(poem.lines);

  return (
    <div className="lv2-poem-card">

      {/* ── Full-width poem image ── */}
      {poemImage && (
        <div className="lv2-poem-hero-img-wrap">
          <img
            src={poemImage}
            alt={poem.title}
            className="lv2-poem-hero-img"
            onError={e => { e.target.parentElement.style.display = 'none'; }}
          />
        </div>
      )}

      {/* ── Poem header ── */}
      <div className="lv2-poem-card-head">
        <div className="lv2-poem-badge">
          <span className="lv2-poem-n">Poem {index + 1} of {total}</span>
          <span className="lv2-poem-genre">🎵 Poetry</span>
        </div>
        <div className="lv2-poem-title-row">
          <span className="lv2-poem-quote">❝</span>
          <h3 className="lv2-poem-title">{poem.title}</h3>
          <span className="lv2-poem-quote">❞</span>
        </div>
      </div>

      {/* ── Poem lines ── */}
      <div className="lv2-poem-body">
        {poem.lines.map((line, i) => (
          <div key={i} className="lv2-poem-line">
            <span className="lv2-poem-lineno">{i + 1}</span>
            <span className="lv2-poem-linetext">{line}</span>
          </div>
        ))}
      </div>

      {/* ── Analysis ── */}
      <div className="lv2-poem-analysis">
        <div className="lv2-analysis-row">
          <span className="lv2-analysis-label">🔤 Rhyme scheme</span>
          <div className="lv2-scheme-chips">
            {scheme.split('').map((letter, i) => (
              <span key={i} className={`lv2-scheme-chip lv2-scheme-${letter.toLowerCase()}`}>{letter}</span>
            ))}
          </div>
        </div>
        {rhymes.length > 0 && (
          <div className="lv2-analysis-row">
            <span className="lv2-analysis-label">🔗 Rhyming words</span>
            <div className="lv2-rhyme-chips">
              {rhymes.map((r, i) => <span key={i} className="lv2-rhyme-chip">{r}</span>)}
            </div>
          </div>
        )}
        <div className="lv2-poem-tip">
          <span className="lv2-tip-icon">💡</span>
          <em>Read aloud and clap your hands on every rhyming word!</em>
        </div>
      </div>
    </div>
  );
}

/* General example card */
function ExampleCard({ ex, index }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className="lv2-example-card">
      <div className="lv2-example-badge">Ex. {String(index + 1).padStart(2, '0')}</div>
      <div className="lv2-example-content">
        {ex.label && <div className="lv2-example-label">{ex.label}</div>}
        {ex.type === 'qa' ? (
          <div className="lv2-qa-block">
            <div className="lv2-qa-q">
              <span className="lv2-qa-tag lv2-qa-qtag">Question</span>
              <span>{ex.q}</span>
            </div>
            <div className="lv2-qa-divider">↓</div>
            <div className="lv2-qa-a">
              <span className="lv2-qa-tag lv2-qa-atag">Answer</span>
              <span>{ex.a}</span>
            </div>
          </div>
        ) : (
          <div className="lv2-example-text">
            {paras(ex.text).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}
        <button className="lv2-tryit-btn" onClick={() => setShowTip(t => !t)}>
          ✏️ Try it yourself {showTip ? '▲' : '▼'}
        </button>
        {showTip && (
          <div className="lv2-tryit-box">
            {ex.type === 'qa'
              ? `Create a similar question and write your own answer in your notebook!`
              : `Read through this example carefully, then try to write a similar one in your own words.`}
          </div>
        )}
      </div>
    </div>
  );
}

/* Interactive quiz item */
function QuizItem({ q, index }) {
  const [selected, setSelected] = useState(null);
  const correct = q.correct !== null ? Number(q.correct) : null;

  return (
    <div className="lv2-quiz-item">
      <div className="lv2-quiz-num">Q{index + 1}</div>
      <div className="lv2-quiz-body">
        <div className="lv2-quiz-q">{q.question}</div>
        {q.options.length > 0 && (
          <div className="lv2-quiz-opts">
            {q.options.map((opt, j) => {
              const letter = String.fromCharCode(65 + j);
              const isSelected = selected === j;
              const revealed = selected !== null;
              const isCorrect = correct !== null && j === correct;
              const isWrong = revealed && isSelected && !isCorrect;
              return (
                <label
                  key={j}
                  className={`lv2-quiz-opt
                    ${isSelected ? 'selected' : ''}
                    ${revealed && isCorrect ? 'correct' : ''}
                    ${isWrong ? 'wrong' : ''}
                    ${revealed && !isSelected && !isCorrect ? 'dimmed' : ''}`}
                  onClick={() => !revealed && setSelected(j)}
                >
                  <span className="lv2-opt-letter">{letter}</span>
                  <span className="lv2-opt-text">{opt}</span>
                  {revealed && isCorrect && <span className="lv2-opt-mark lv2-opt-check">✓</span>}
                  {isWrong && <span className="lv2-opt-mark lv2-opt-cross">✗</span>}
                </label>
              );
            })}
          </div>
        )}
        {selected !== null && (
          <div className={`lv2-quiz-feedback ${selected === correct ? 'correct' : 'wrong'}`}>
            {selected === correct
              ? '🌟 Correct! Excellent work!'
              : `💡 The correct answer is ${correct !== null ? String.fromCharCode(65 + correct) : '—'}.`}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   NAVIGATION SECTIONS CONFIG
══════════════════════════════════════════════════════════════════════ */

const NAV = [
  { id: 'objectives', n: 1,  icon: '🎯', label: 'Learning Objectives', color: 'blue'   },
  { id: 'vocabulary', n: 2,  icon: '📖', label: 'Key Vocabulary',       color: 'purple' },
  { id: 'warmup',     n: 3,  icon: '🌱', label: 'Warm-Up Activity',     color: 'teal'   },
  { id: 'explanation',n: 4,  icon: '💡', label: 'Main Explanation',     color: 'gold'   },
  { id: 'examples',   n: 5,  icon: '✏️', label: 'Worked Examples',      color: 'green'  },
  { id: 'practice',   n: 6,  icon: '📝', label: 'Practice Exercises',   color: 'orange' },
  { id: 'quiz',       n: 7,  icon: '🧪', label: 'Quiz / Self-Check',    color: 'blue'   },
  { id: 'answers',    n: 8,  icon: '✅', label: 'Answer Key',           color: 'green'  },
  { id: 'teacher',    n: 9,  icon: '👩‍🏫', label: 'Teacher Notes',      color: 'purple' },
  { id: 'resources',  n: 10, icon: '📚', label: 'Additional Resources', color: 'teal'   },
  { id: 'images',     n: 11, icon: '🖼️', label: 'Image Blocks',        color: 'gold'   },
];

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */

export default function LessonView() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [lessonData,    setLessonData]    = useState(null);
  const [activeSection, setActiveSection] = useState('objectives');
  const [practiceTab,   setPracticeTab]   = useState('easy');
  const [showAnswers,   setShowAnswers]   = useState(false);
  const [exportingPDF,  setExportingPDF]  = useState(false);

  const fromBatch  = location.state?.fromBatch;
  const jobId      = location.state?.jobId;
  const poemIndex  = location.state?.poemIndex;
  const lessonState = location.state?.lesson;

  /* Load lesson */
  useEffect(() => {
    if (location.state?.lesson) {
      setLessonData(location.state.lesson);
    } else {
      navigate('/generator');
    }
  }, [location, navigate]);

  /* Scroll to the specific poem card when poemIndex is provided */
  useEffect(() => {
    if (poemIndex === undefined || !lessonData) return;
    const timer = setTimeout(() => {
      /* In single-poem mode the card is always rendered at slot 0 */
      const slotIndex = 0;
      const poemEl = document.getElementById(`lv-poem-${slotIndex}`);
      if (poemEl) {
        poemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        poemEl.classList.add('lv2-poem-highlight');
        setTimeout(() => poemEl.classList.remove('lv2-poem-highlight'), 2000);
      } else {
        document.getElementById('lv-examples')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [poemIndex, lessonData]);

  /* Scroll spy */
  useEffect(() => {
    if (!lessonData) return;
    const els = NAV.map(s => document.getElementById(`lv-${s.id}`)).filter(Boolean);
    if (!els.length) return;
    const ob = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id.replace('lv-', '')); }),
      { rootMargin: '-5% 0px -75% 0px' }
    );
    els.forEach(el => ob.observe(el));
    return () => ob.disconnect();
  }, [lessonData]);

  const scrollTo = id => document.getElementById(`lv-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleBack = () => {
    /* Always go back to textbook-view if we have the lesson (preserve poem context) */
    if (lessonState) {
      navigate('/textbook-view', { state: { lesson: lessonState, fromBatch, jobId, poemIndex } });
    } else if (fromBatch && jobId) {
      navigate(`/generated-lessons?jobId=${jobId}`);
    } else {
      navigate('/generator');
    }
  };

  /* ── Build clean HTML for PDF / Word export ── */
  const buildExportHTML = (ld) => {
    if (!ld) return '';
    const g     = ld.grade    || ld.formData?.grade    || '3';
    const subj  = ld.subject  || ld.formData?.subject  || 'English';
    const dur   = ld.duration || ld.estimatedTime      || '40 min';
    const chap  = ld.chapter  || ld.formData?.chapter  || '';
    const t     = ld.title    || 'Untitled Lesson';
    const objs  = asObjectives(ld.learningObjectives || ld.objectives);
    const voc   = asVocab(ld.keyVocabulary || ld.content?.vocabulary);
    const wu    = ld.warmUp || ld.content?.introduction || '';
    const expl  = ld.mainExplanation || ld.content?.mainConcept || '';
    const exs   = asExamples(ld.workedExamples);
    const exer  = asExercises(ld.practiceExercises);
    const qz    = asQuiz(ld.quiz);
    const ak    = ld.answerKey || '';
    const tn    = ld.teacherNotes || ld.teacherNarration || '';
    const poems = isPoetry(ld) ? parsePoems(exs) : [];

    const sec = (title, id, content) => `
      <div class="section" id="${id}">
        <h2>${title}</h2>
        ${content}
      </div>`;

    /* Learning Objectives */
    const objHtml = objs.length
      ? `<ul class="obj-list">${objs.map(o => `<li class="obj-item"><span class="obj-bullet">→</span><span>${o}</span></li>`).join('')}</ul>`
      : '<p>No objectives listed.</p>';

    /* Vocabulary */
    const vocHtml = voc.length
      ? `<div class="vocab-grid">${voc.map(v => `<div class="vocab-row"><div class="vocab-cell"><div class="vocab-word">${v.word}</div><div class="vocab-def">${v.definition}</div></div></div>`).join('')}</div>`
      : '<p>No vocabulary listed.</p>';

    /* Warm-up */
    const wuHtml = wu
      ? `<div class="warmup-box">${wu.split(/\n+/).map(p => `<p>${p}</p>`).join('')}</div>`
      : '';

    /* Main explanation */
    const explHtml = expl
      ? expl.split(/\n{2,}|\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${p}</p>`).join('')
      : '';

    /* Worked examples / poems */
    let examplesHtml = '';
    if (poems.length) {
      examplesHtml = poems.map((poem, i) => {
        const scheme = detectRhymeScheme(poem.lines);
        const rhymes = findRhymingWords(poem.lines);
        return `<div class="poem-block">
          <div class="poem-title">Poem ${i + 1}: ${poem.title}</div>
          ${poem.lines.map(l => `<span class="poem-line">${l}</span>`).join('\n')}
          <div class="poem-footer">Rhyme scheme: ${scheme}${rhymes.length ? ' · Rhyming words: ' + rhymes.join(', ') : ''}</div>
        </div>`;
      }).join('');
    } else {
      examplesHtml = exs.map((ex, i) => `<div class="example-box">
        <div class="ex-num">Example ${i + 1}${ex.label ? ': ' + ex.label : ''}</div>
        ${ex.type === 'qa'
          ? `<div class="qa-q">Q: ${ex.q}</div><div class="qa-a">A: ${ex.a}</div>`
          : ex.text.split(/\n+/).map(p => `<p>${p}</p>`).join('')}
      </div>`).join('');
    }

    /* Practice exercises */
    const exerciseHtml = ['easy','medium','challenge'].filter(lvl => exer[lvl]?.length).map(lvl => `
      <div class="exercise-group">
        <div class="exercise-level">${lvl === 'easy' ? '⭐ Beginner' : lvl === 'medium' ? '⭐⭐ Intermediate' : '⭐⭐⭐ Challenge'}</div>
        ${exer[lvl].map((e, i) => `<div class="exercise-item"><strong>Q${i+1}.</strong> ${e.question}${e.hint ? `<br><em style="color:#6b7280;font-size:9pt">Hint: ${e.hint}</em>` : ''}</div>`).join('')}
      </div>`).join('') || '<p>No exercises.</p>';

    /* Quiz */
    const quizHtml = qz.length
      ? qz.map((q, i) => `<div class="quiz-item">
          <div class="quiz-q">Q${i+1}. ${q.question}</div>
          ${q.options.map((opt, j) => `<span class="opt"><span class="opt-letter">${String.fromCharCode(65+j)}.</span>${opt}</span>`).join('')}
        </div>`).join('')
      : '<p>No quiz questions.</p>';

    /* Answer key */
    const akHtml = ak
      ? `<div class="answer-box">${String(ak).split(/\n+/).map(p => `<p>${p}</p>`).join('')}</div>`
      : '<p>No answer key available.</p>';

    /* Teacher notes */
    const tnHtml = tn
      ? `<div class="teacher-box">${String(tn).split(/\n+/).map(p => `<p>${p}</p>`).join('')}</div>`
      : '';

    return `
      <h1>${t}</h1>
      <div class="meta">
        <span class="pill">Grade ${g}</span>
        <span class="pill">${subj}</span>
        ${chap ? `<span class="pill">${chap}</span>` : ''}
        <span class="pill">⏱ ${dur}</span>
      </div>
      ${sec('🎯 Learning Objectives', 'obj', objHtml)}
      ${sec('📖 Key Vocabulary', 'voc', vocHtml)}
      ${wu ? sec('🌱 Warm-Up Activity', 'wu', wuHtml) : ''}
      ${expl ? sec('💡 Main Explanation', 'expl', explHtml) : ''}
      ${examplesHtml ? sec(poems.length ? '🎵 Poems' : '✏️ Worked Examples', 'ex', examplesHtml) : ''}
      ${sec('📝 Practice Exercises', 'prac', exerciseHtml)}
      ${sec('🧪 Quiz / Self-Check', 'quiz', quizHtml)}
      ${sec('✅ Answer Key', 'ak', akHtml)}
      ${tn ? sec('👩‍🏫 Teacher Notes', 'tn', tnHtml) : ''}
    `;
  };

  /* ── Export as PDF (downloads to local folder) ── */
  const handleExportPDF = async () => {
    if (!lessonData || exportingPDF) return;
    setExportingPDF(true);
    const titleSlug = (lessonData.title || 'lesson').replace(/[^a-z0-9]/gi, '_').toLowerCase();

    /* html2canvas only reads styles from document.head — inject CSS there temporarily */
    const PDF_STYLE_ID = '__pdf_export_styles__';
    const cssBlock = `
      #__pdf_export_wrap__{font-family:Georgia,'Times New Roman',serif;font-size:11pt;color:#111;line-height:1.75;background:#fff;padding:14mm 16mm;box-sizing:border-box}
      #__pdf_export_wrap__ *{box-sizing:border-box}
      #__pdf_export_wrap__ h1{font-size:22pt;color:#1a2e4a;margin:0 0 6px}
      #__pdf_export_wrap__ h2{font-size:14pt;color:#1a2e4a;margin:24px 0 9px;border-bottom:2px solid #1a2e4a;padding-bottom:4px}
      #__pdf_export_wrap__ h3{font-size:12pt;color:#1a2e4a;margin:12px 0 5px}
      #__pdf_export_wrap__ p{margin:0 0 7px}
      #__pdf_export_wrap__ ul{margin:5px 0 8px 18px}
      #__pdf_export_wrap__ li{margin:3px 0}
      #__pdf_export_wrap__ .meta{font-size:9pt;color:#666;margin-bottom:14px}
      #__pdf_export_wrap__ .pill{display:inline-block;border:1px solid #aaa;border-radius:12px;padding:1px 9px;font-size:9pt;margin:2px}
      #__pdf_export_wrap__ .section{margin-bottom:28px}
      #__pdf_export_wrap__ .obj-list{list-style:none;margin:0;padding:0}
      #__pdf_export_wrap__ .obj-item{display:flex;gap:6px;margin:5px 0;align-items:flex-start}
      #__pdf_export_wrap__ .obj-bullet{color:#2563eb;font-weight:bold;flex-shrink:0}
      #__pdf_export_wrap__ .vocab-grid{margin:8px 0}
      #__pdf_export_wrap__ .vocab-row{display:flex;gap:8px;margin:4px 0;flex-wrap:wrap}
      #__pdf_export_wrap__ .vocab-cell{flex:0 0 48%;border:1px solid #ddd;padding:5px 9px;border-radius:4px}
      #__pdf_export_wrap__ .vocab-word{font-weight:bold;color:#1a2e4a;font-size:12pt}
      #__pdf_export_wrap__ .vocab-def{font-size:9pt;color:#444;margin-top:2px}
      #__pdf_export_wrap__ .warmup-box{background:#f0fdfa;border-left:4px solid #0d9488;padding:10px 14px;border-radius:4px;margin:6px 0}
      #__pdf_export_wrap__ .poem-block{border-left:4px solid #059669;padding:12px 16px;background:#f0fdf4;margin:12px 0;border-radius:6px}
      #__pdf_export_wrap__ .poem-title{font-weight:bold;font-style:italic;color:#065F46;font-size:13pt;margin-bottom:8px}
      #__pdf_export_wrap__ .poem-line{font-style:italic;line-height:2.2;padding-left:8px;display:block}
      #__pdf_export_wrap__ .poem-footer{font-size:9pt;color:#555;margin-top:8px;border-top:1px solid #a7f3d0;padding-top:5px}
      #__pdf_export_wrap__ .example-box{border:1px solid #d1d5db;border-radius:5px;padding:10px 12px;margin:8px 0}
      #__pdf_export_wrap__ .ex-num{font-weight:bold;color:#2563eb;font-size:10pt;margin-bottom:5px}
      #__pdf_export_wrap__ .qa-q{font-weight:600;margin-bottom:3px}
      #__pdf_export_wrap__ .qa-a{color:#059669;padding-left:9px;border-left:3px solid #059669;margin-top:5px}
      #__pdf_export_wrap__ .exercise-group{margin:12px 0}
      #__pdf_export_wrap__ .exercise-level{font-weight:bold;color:#6d28d9;font-size:9pt;text-transform:uppercase;margin-bottom:6px}
      #__pdf_export_wrap__ .exercise-item{margin:8px 0;padding:8px 10px;border:1px solid #e5e7eb;border-radius:4px}
      #__pdf_export_wrap__ .quiz-item{margin:12px 0}
      #__pdf_export_wrap__ .quiz-q{font-weight:600;margin-bottom:5px}
      #__pdf_export_wrap__ .opt{display:block;padding:2px 0 2px 14px;font-size:10pt;color:#374151}
      #__pdf_export_wrap__ .opt-letter{font-weight:600;margin-right:5px}
      #__pdf_export_wrap__ .answer-box{background:#f0fdf4;border:1px solid #a7f3d0;border-radius:5px;padding:10px 14px;margin:8px 0}
      #__pdf_export_wrap__ .teacher-box{background:#faf5ff;border-left:4px solid #7c3aed;padding:10px 14px;border-radius:4px;margin:6px 0}
    `;

    /* 1 — Inject scoped styles into <head> so html2canvas can read them */
    let headStyle = document.getElementById(PDF_STYLE_ID);
    if (!headStyle) {
      headStyle = document.createElement('style');
      headStyle.id = PDF_STYLE_ID;
      document.head.appendChild(headStyle);
    }
    headStyle.textContent = cssBlock;

    /* 2 — Create off-screen container (absolute, not fixed, for html2canvas compat) */
    const container = document.createElement('div');
    container.id = '__pdf_export_wrap__';
    container.style.cssText = 'position:absolute;top:-99999px;left:0;width:794px;background:#fff;';
    container.innerHTML = buildExportHTML(lessonData);
    document.body.appendChild(container);

    /* 3 — Small delay so browser can apply the styles to the DOM */
    await new Promise(r => setTimeout(r, 150));

    const opt = {
      margin:      [8, 8, 8, 8],
      filename:    `${titleSlug}.pdf`,
      image:       { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale:           2,
        useCORS:         true,
        letterRendering: true,
        scrollX:         0,
        scrollY:         0,
        windowWidth:     794,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    try {
      await html2pdf().set(opt).from(container).save();
    } finally {
      document.body.removeChild(container);
      headStyle.textContent = '';   // clear injected styles
      setExportingPDF(false);
    }
  };

  /* ── Export as Word .doc (downloads to local folder) ── */
  const handleExportWord = () => {
    if (!lessonData) return;
    const titleSlug = (lessonData.title || 'lesson').replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const fullHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8"/>
  <meta name="ProgId" content="Word.Document"/>
  <meta name="Generator" content="Microsoft Word 15"/>
  <title>${lessonData.title || 'Lesson'}</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>90</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
  <style>
    @page{size:A4;margin:2cm 2.5cm}
    *{box-sizing:border-box}
    body{font-family:'Times New Roman',serif;font-size:12pt;color:#111;line-height:1.7}
    h1{font-size:20pt;color:#1a2e4a;margin:0 0 8px}
    h2{font-size:14pt;color:#1a2e4a;margin:24px 0 8px;border-bottom:1pt solid #1a2e4a;padding-bottom:4px}
    h3{font-size:12pt;color:#1a2e4a;margin:12px 0 5px}
    p{margin:0 0 6pt}
    ul{margin:6pt 0 8pt 20pt}li{margin:3pt 0}
    .meta{font-size:10pt;color:#555;margin-bottom:14pt}
    .pill{display:inline;border:1pt solid #999;padding:2pt 8pt;font-size:9pt;margin-right:6pt}
    .section{margin-bottom:24pt}
    .obj-list{list-style:none;margin:0;padding:0}
    .obj-item{margin:5pt 0}
    .obj-bullet{color:#2563eb;font-weight:bold;margin-right:5pt}
    .vocab-grid{width:100%;border-collapse:collapse;margin:8pt 0}
    .vocab-row{display:block}
    .vocab-cell{border:1pt solid #ddd;padding:5pt 8pt;display:inline-block;width:48%;vertical-align:top;margin:2pt}
    .vocab-word{font-weight:bold;color:#1a2e4a;font-size:12pt}
    .vocab-def{font-size:9pt;color:#444;margin-top:2pt}
    .warmup-box{background:#f0fdfa;border-left:4pt solid #0d9488;padding:10pt 14pt;margin:8pt 0}
    .poem-block{border-left:4pt solid #059669;padding:12pt 16pt;background:#f0fdf4;margin:12pt 0}
    .poem-title{font-weight:bold;font-style:italic;color:#065F46;font-size:13pt;margin-bottom:8pt}
    .poem-line{font-style:italic;line-height:2.2;display:block;padding-left:8pt}
    .poem-footer{font-size:9pt;color:#555;margin-top:8pt;padding-top:5pt;border-top:1pt solid #a7f3d0}
    .example-box{border:1pt solid #d1d5db;padding:10pt 12pt;margin:8pt 0}
    .ex-num{font-weight:bold;color:#2563eb;font-size:10pt;margin-bottom:5pt}
    .qa-q{font-weight:600;margin-bottom:3pt}
    .qa-a{color:#059669;padding-left:8pt;margin-top:5pt}
    .exercise-group{margin:12pt 0}
    .exercise-level{font-weight:bold;color:#6d28d9;font-size:10pt;margin-bottom:6pt}
    .exercise-item{margin:8pt 0;padding:8pt 10pt;border:1pt solid #e5e7eb}
    .quiz-item{margin:12pt 0}
    .quiz-q{font-weight:600;margin-bottom:5pt}
    .opt{display:block;padding:2pt 0 2pt 14pt;font-size:10pt}
    .opt-letter{font-weight:600;margin-right:5pt}
    .answer-box{background:#f0fdf4;border:1pt solid #a7f3d0;padding:10pt 14pt;margin:8pt 0}
    .teacher-box{background:#faf5ff;border-left:4pt solid #7c3aed;padding:10pt 14pt;margin:8pt 0}
  </style>
</head>
<body>${buildExportHTML(lessonData)}</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'application/msword;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${titleSlug}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ── Print (browser print dialog — for physical printing) ── */
  const handlePrint = () => {
    if (!lessonData) return;
    window.print();
  };

  if (!lessonData) {
    return (
      <div className="lv2-loading">
        <div className="lv2-loading-spinner" />
        <p>Loading lesson…</p>
      </div>
    );
  }

  /* ── Extract lesson data ── */
  const grade    = lessonData.grade    || lessonData.formData?.grade    || '3';
  const subject  = lessonData.subject  || lessonData.formData?.subject  || 'English';
  const level    = lessonData.level    || lessonData.formData?.level    || 'Medium';
  const duration = lessonData.duration || lessonData.estimatedTime      || '40 minutes';
  const chapter  = lessonData.chapter  || lessonData.formData?.chapter  || '';
  const title    = lessonData.title    || 'Untitled Lesson';
  const desc     = lessonData.description || '';

  const objectives   = asObjectives(lessonData.learningObjectives || lessonData.objectives);
  const vocab        = asVocab(lessonData.keyVocabulary || lessonData.content?.vocabulary);
  const warmUp       = lessonData.warmUp || lessonData.content?.introduction || '';
  const explanation  = lessonData.mainExplanation || lessonData.content?.mainConcept || '';
  const examples     = asExamples(lessonData.workedExamples);
  const exercises    = asExercises(lessonData.practiceExercises);
  const quiz         = asQuiz(lessonData.quiz);
  const answerKey    = lessonData.answerKey || '';
  const teacherNotes = lessonData.teacherNotes || lessonData.teacherNarration || '';
  const resources    = asResources(lessonData);
  const imagePrompts = asImagePrompts(lessonData);
  /* Hero image: for poetry use the selected poem's image (or first poem image), else use cover */
  const rawPoemImgs  = lessonData.images?.poems || [];
  const heroPoemImg  = poemIndex !== undefined && rawPoemImgs[poemIndex]
    ? `${BACKEND_URL}${rawPoemImgs[poemIndex]}`
    : rawPoemImgs[0] ? `${BACKEND_URL}${rawPoemImgs[0]}` : null;
  const coverUrl     = isPoetry(lessonData)
    ? (heroPoemImg || (lessonData.images?.cover ? `${BACKEND_URL}${lessonData.images.cover}` : null))
    : (lessonData.images?.cover ? `${BACKEND_URL}${lessonData.images.cover}` : null);

  /* Story detection */
  const isStory = lessonData.contentType === 'story' ||
    /story|fiction|narrative/i.test(`${title} ${(lessonData.keyTopics || []).join(' ')}`);

  const isPoem    = !isStory && isPoetry(lessonData);
  const allPoems  = isPoem ? parsePoems(examples) : [];
  const allPoemImgs = (lessonData.images?.poems || []).map(p => p ? `${BACKEND_URL}${p}` : null);

  /* When opened from a single poem card (poemIndex defined), show ONLY that poem */
  const isSinglePoem   = isPoem && poemIndex !== undefined && allPoems[poemIndex] !== undefined;
  const selectedPoem   = isSinglePoem ? allPoems[poemIndex] : null;
  const poems          = isSinglePoem ? [allPoems[poemIndex]]    : allPoems;
  const poemImgs       = isSinglePoem ? [allPoemImgs[poemIndex]] : allPoemImgs;
  /* When in single-poem mode, use that poem's title for hero and section context */
  const heroTitle      = isSinglePoem ? selectedPoem.title : title;

  /* Override all lesson sections with poem-specific content when in single-poem mode */
  const poemLesson   = isSinglePoem ? buildPoemLesson(selectedPoem) : null;
  /* Override all lesson sections with story-specific content when in story mode */
  const storyLesson  = isStory ? buildStoryLesson(lessonData) : null;
  /* Final values: story overrides > poem overrides > backend data */
  const activeLesson = storyLesson || poemLesson;
  const finalObjectives  = activeLesson?.objectives     || objectives;
  const finalVocab       = activeLesson?.vocab           || vocab;
  const finalWarmUp      = activeLesson?.warmUp          || warmUp;
  const finalExplanation = activeLesson?.explanation     || explanation;
  const finalExercises   = activeLesson?.exercises       || exercises;
  const finalQuiz        = activeLesson ? activeLesson.quiz : quiz;
  const finalTeacher     = activeLesson?.teacherNotes    || teacherNotes;
  const finalExamples    = activeLesson?.workedExamples
    ? activeLesson.workedExamples.map(ex => ({
        type: ex.type || 'qa',
        label: ex.label || '',
        q: ex.q || '',
        a: ex.a || '',
        text: ex.text || '',
      }))
    : examples;

  const hasTabs   = ['easy', 'medium', 'challenge'].filter(t => finalExercises[t]?.length > 0);
  const activeEx  = finalExercises[practiceTab] || [];

  /* ── Render ── */
  return (
    <div className="lv2-root">

      {/* ════════════ NAVBAR — same style as main Header ════════════ */}
      <header className="lv2-navbar">

        {/* Logo — identical to Header.jsx */}
        <div className="lv2-nav-logo" onClick={() => navigate('/')}>
          <img src={logo} alt="Py-Content" className="lv2-nav-logo-img" />
          <span className="lv2-nav-logo-text">
            <span className="lv2-nav-logo-dark">Py-</span>
            <span className="lv2-nav-logo-blue">Content</span>
          </span>
        </div>

        {/* Breadcrumb */}
        <nav className="lv2-nav-crumb">
          <button className="lv2-crumb-btn" onClick={handleBack}>Library</button>
          <span className="lv2-crumb-sep">›</span>
          <button className="lv2-crumb-btn" onClick={handleBack}>Grade {grade} {subject}</button>
          <span className="lv2-crumb-sep">›</span>
          <span className="lv2-crumb-cur">{title}</span>
        </nav>

        {/* Actions — single set, top-right only */}
        <div className="lv2-nav-actions">
          <button className="lv2-nav-btn lv2-nav-btn-ghost" onClick={handleBack}>← Back</button>
          <button className="lv2-nav-btn lv2-nav-btn-ghost" onClick={handlePrint}>🖨️ Print</button>
          <button className="lv2-nav-btn lv2-nav-btn-ghost" onClick={handleExportWord}>📄 Word</button>
          <button className="lv2-nav-btn lv2-nav-btn-primary" onClick={handleExportPDF} disabled={exportingPDF}>
            {exportingPDF ? '⏳ Generating…' : '⬇ PDF'}
          </button>
        </div>
      </header>

      {/* ════════════ 3-COLUMN LAYOUT ════════════ */}
      <div className="lv2-layout">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="lv2-sidebar">
          <div className="lv2-sidebar-label">Lesson Sections</div>
          <nav className="lv2-sidebar-nav">
            {NAV.map(s => (
              <button
                key={s.id}
                className={`lv2-navitem ${activeSection === s.id ? 'active' : ''} lv2-navitem-${s.color}`}
                onClick={() => scrollTo(s.id)}
              >
                <span className="lv2-navitem-num">{s.n}</span>
                <span className="lv2-navitem-label">{s.label}</span>
              </button>
            ))}
          </nav>

        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="lv2-main" id="lv-print-area">

          {/* ── Hero card ── */}
          <div className="lv2-hero">
            {coverUrl && <img src={coverUrl} alt={title} className="lv2-hero-img" />}
            {!coverUrl && (
              <div className={`lv2-hero-banner${isPoem ? ' lv2-hero-banner-poetry' : ''}`}>
                <div className="lv2-hero-banner-overlay" />
                <div className="lv2-hero-banner-dots" />
                <div className="lv2-hero-banner-content">
                  <span className="lv2-hero-banner-icon">{isPoem ? '🎵' : '📖'}</span>
                  <span className="lv2-hero-banner-grade">Grade {grade} · {subject}</span>
                  {chapter && <span className="lv2-hero-banner-chapter">{chapter}</span>}
                </div>
                <div className="lv2-hero-banner-stripe" />
              </div>
            )}
            <div className="lv2-hero-body">
              <div className="lv2-hero-pills">
                <span className="lv2-pill lv2-pill-grade">Grade {grade}</span>
                <span className="lv2-pill lv2-pill-sub">{subject}</span>
                <span className="lv2-pill lv2-pill-lvl">{level}</span>
                <span className="lv2-pill lv2-pill-dur">⏱ {duration}</span>
                {chapter && <span className="lv2-pill lv2-pill-chap">Chapter: {chapter}</span>}
              </div>
              <h1 className="lv2-hero-title">{heroTitle}</h1>
              {isStory && lessonData.storySummary && (
                <p className="lv2-hero-desc">{lessonData.storySummary}</p>
              )}
              {isStory && lessonData.moral && (
                <p className="lv2-hero-desc" style={{ fontStyle: 'italic', color: '#1e40af', marginTop: 6 }}>
                  ⭐ Moral: {lessonData.moral}
                </p>
              )}
              {isSinglePoem && selectedPoem && (
                <p className="lv2-hero-desc" style={{ fontStyle: 'italic', color: '#475569' }}>
                  {selectedPoem.lines.slice(0, 2).join(' / ')}
                </p>
              )}
              {!isSinglePoem && !isStory && desc && <p className="lv2-hero-desc">{desc}</p>}
              <div className="lv2-hero-badges">
                <span className="lv2-badge lv2-badge-green">✓ QA Passed</span>
                <span className="lv2-badge lv2-badge-blue">✓ Grade-Appropriate</span>
                <span className="lv2-badge lv2-badge-grey">📄 11 Sections</span>
                {isStory && <span className="lv2-badge lv2-badge-teal">📖 Story Lesson</span>}
                {isPoem && isSinglePoem && <span className="lv2-badge lv2-badge-teal">🎵 Poem {poemIndex + 1} of {allPoems.length}</span>}
                {isPoem && !isSinglePoem && <span className="lv2-badge lv2-badge-teal">🎵 Poetry Lesson</span>}
              </div>
            </div>
          </div>

          {/* ════════════════ SECTION 1: LEARNING OBJECTIVES ════════════════ */}
          <section className="lv2-section lv2-sec-blue" id="lv-objectives">
            <SecHeader n={1} icon="🎯" title="Learning Objectives" color="blue" />
            <div className="lv2-sec-content">
              {finalObjectives.length > 0 ? (
                <ul className="lv2-objectives-list">
                  {finalObjectives.map((obj, i) => (
                    <li key={i} className="lv2-obj-item">
                      <span className="lv2-obj-check">
                        <svg viewBox="0 0 12 10"><polyline points="1.5,5 4.5,8.5 10.5,1.5" /></svg>
                      </span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="lv2-empty">No objectives specified.</p>
              )}
            </div>
          </section>

          {/* ════════════════ SECTION 2: KEY VOCABULARY ════════════════ */}
          <section className="lv2-section lv2-sec-purple" id="lv-vocabulary">
            <SecHeader n={2} icon="📖" title="Key Vocabulary" color="purple" />
            <div className="lv2-sec-content">
              {finalVocab.length > 0 ? (
                <div className="lv2-vocab-grid">
                  {finalVocab.map((v, i) => (
                    <div key={i} className="lv2-vocab-card">
                      <div className="lv2-vocab-top">
                        <span className="lv2-vocab-word">{v.word}</span>
                        {v.pos && <span className="lv2-vocab-pos">{v.pos}</span>}
                      </div>
                      {v.definition && <div className="lv2-vocab-def">{v.definition}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="lv2-empty">No vocabulary specified.</p>
              )}
            </div>
          </section>

          {/* ════════════════ SECTION 3: WARM-UP ════════════════ */}
          <section className="lv2-section lv2-sec-teal" id="lv-warmup">
            <SecHeader n={3} icon="🌱" title="Warm-Up Activity" color="teal" />
            <div className="lv2-sec-content">
              {finalWarmUp ? (
                <div className="lv2-warmup-box">
                  <div className="lv2-warmup-icon-wrap">
                    <span className="lv2-warmup-icon">🌱</span>
                    <span className="lv2-warmup-badge">~5 minutes</span>
                  </div>
                  <div className="lv2-warmup-text">
                    {paras(finalWarmUp).map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                </div>
              ) : (
                <p className="lv2-empty">No warm-up specified.</p>
              )}
            </div>
          </section>

          {/* ════════════════ SECTION 4: MAIN EXPLANATION ════════════════ */}
          <section className="lv2-section lv2-sec-gold" id="lv-explanation">
            <SecHeader n={4} icon="💡" title="Main Explanation" color="gold" />
            <div className="lv2-sec-content">
              {finalExplanation ? (
                <div className="lv2-explanation">
                  {paras(finalExplanation).map((p, i) => <p key={i}>{p}</p>)}
                </div>
              ) : (
                <p className="lv2-empty">No explanation available.</p>
              )}
            </div>
          </section>

          {/* ════════════════ SECTION 5: WORKED EXAMPLES ════════════════ */}
          <section className="lv2-section lv2-sec-green" id="lv-examples">
            <SecHeader n={5} icon="✏️" title="Worked Examples" color="green" />
            <div className="lv2-sec-content">
              {isPoem && poems.length > 0 ? (
                <>
                  <div className="lv2-examples-intro">
                    <span className="lv2-examples-intro-icon">🎵</span>
                    <span>
                      {isSinglePoem
                        ? <>Viewing <strong>Poem {poemIndex + 1}</strong> of {allPoems.length}. Read it aloud with your class!</>
                        : <>Here are <strong>{poems.length} sample poem{poems.length > 1 ? 's' : ''}</strong> that show how rhyming words work. Read each poem aloud with your class!</>
                      }
                    </span>
                  </div>
                  <div className="lv2-poems-grid">
                    {poems.map((poem, i) => {
                      const realIndex = isSinglePoem ? poemIndex : i;
                      const realTotal = isSinglePoem ? allPoems.length : poems.length;
                      return (
                        <div key={i} id={`lv-poem-${i}`}>
                          <PoemCard
                            poem={poem}
                            index={realIndex}
                            total={realTotal}
                            poemImage={poemImgs[i] || null}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {finalExamples.filter(e => e.type === 'qa').length > 0 && (
                    <div className="lv2-extra-examples">
                      <div className="lv2-extra-examples-label">📌 Additional Examples</div>
                      {finalExamples.filter(e => e.type === 'qa').map((ex, i) => (
                        <ExampleCard key={i} ex={ex} index={i} />
                      ))}
                    </div>
                  )}
                </>
              ) : finalExamples.length > 0 ? (
                <div className="lv2-examples-list">
                  {finalExamples.map((ex, i) => <ExampleCard key={i} ex={ex} index={i} />)}
                </div>
              ) : (
                <p className="lv2-empty">No worked examples provided.</p>
              )}
            </div>
          </section>

          {/* ════════════════ SECTION 6: PRACTICE ════════════════ */}
          <section className="lv2-section lv2-sec-orange" id="lv-practice">
            <SecHeader n={6} icon="📝" title="Practice Exercises" color="orange" />
            <div className="lv2-sec-content">
              {hasTabs.length > 0 ? (
                <>
                  <div className="lv2-practice-tabs">
                    {hasTabs.map(tab => (
                      <button
                        key={tab}
                        className={`lv2-practice-tab lv2-ptab-${tab} ${practiceTab === tab ? 'active' : ''}`}
                        onClick={() => setPracticeTab(tab)}
                      >
                        {tab === 'easy' ? '🟢 Easy' : tab === 'medium' ? '🟡 Medium' : '🔴 Challenge'}
                      </button>
                    ))}
                  </div>
                  {activeEx.length > 0 ? (
                    <div className="lv2-exercise-list">
                      {activeEx.map((ex, i) => (
                        <div key={i} className="lv2-exercise-item">
                          <div className="lv2-exercise-num">
                            <span>{String(i + 1).padStart(2, '0')}</span>
                          </div>
                          <div className="lv2-exercise-body">
                            <div className="lv2-exercise-q">{ex.question}</div>
                            {ex.hint && (
                              <details className="lv2-exercise-hint">
                                <summary>💡 Show hint</summary>
                                <span>{ex.hint}</span>
                              </details>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="lv2-empty">No exercises for this level.</p>
                  )}
                </>
              ) : (
                <p className="lv2-empty">No practice exercises available.</p>
              )}
            </div>
          </section>

          {/* ════════════════ SECTION 7: QUIZ ════════════════ */}
          <section className="lv2-section lv2-sec-blue" id="lv-quiz">
            <SecHeader n={7} icon="🧪" title="Quiz / Self-Check" color="blue" />
            <div className="lv2-sec-content">
              {finalQuiz.length > 0 ? (
                <div className="lv2-quiz-list">
                  {finalQuiz.map((q, i) => <QuizItem key={i} q={q} index={i} />)}
                </div>
              ) : (
                <p className="lv2-empty">No quiz questions available.</p>
              )}
            </div>
          </section>

          {/* ════════════════ SECTION 8: ANSWER KEY ════════════════ */}
          <section className="lv2-section lv2-sec-green" id="lv-answers">
            <SecHeader n={8} icon="✅" title="Answer Key" color="green" />
            <div className="lv2-sec-content">
              <div className="lv2-answers-teacher-badge">🔒 For Teacher Reference</div>
              <button
                className="lv2-reveal-btn"
                onClick={() => setShowAnswers(v => !v)}
              >
                {showAnswers ? '🙈 Hide Answers' : '👁 Reveal Answers'}
              </button>
              {showAnswers && (
                <>
                  {Array.isArray(answerKey) && answerKey.length > 0 ? (
                    <table className="lv2-answer-table">
                      <thead>
                        <tr><th>#</th><th>Answer</th></tr>
                      </thead>
                      <tbody>
                        {answerKey.map((ans, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td><span className="lv2-answer-badge">{typeof ans === 'string' ? ans : ans.answer || JSON.stringify(ans)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : answerKey ? (
                    <div className="lv2-answer-text">
                      {paras(String(answerKey)).map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                  ) : (
                    <p className="lv2-empty">No answer key provided.</p>
                  )}
                </>
              )}
            </div>
          </section>

          {/* ════════════════ SECTION 9: TEACHER NOTES ════════════════ */}
          <section className="lv2-section lv2-sec-purple" id="lv-teacher">
            <SecHeader n={9} icon="👩‍🏫" title="Teacher Notes & Narration" color="purple" />
            <div className="lv2-sec-content">
              {finalTeacher ? (
                <div className="lv2-teacher-box">
                  <div className="lv2-teacher-label">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Instructor Guidance
                  </div>
                  {paras(finalTeacher).map((p, i) => <p key={i}>{p}</p>)}
                </div>
              ) : (
                <p className="lv2-empty">No teacher notes provided.</p>
              )}
            </div>
          </section>

          {/* ════════════════ SECTION 10: RESOURCES ════════════════ */}
          <section className="lv2-section lv2-sec-teal" id="lv-resources">
            <SecHeader n={10} icon="📚" title="Additional Resources" color="teal" />
            <div className="lv2-sec-content">
              {resources.length > 0 ? (
                <div className="lv2-resource-grid">
                  {resources.map((r, i) => (
                    <div key={i} className={`lv2-resource-card lv2-res-${r.color}`}>
                      <div className="lv2-res-icon">{r.icon}</div>
                      <div className="lv2-res-info">
                        <div className="lv2-res-name">{r.name}</div>
                        {r.desc && <div className="lv2-res-desc">{r.desc}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="lv2-empty">No additional resources listed.</p>
              )}
            </div>
          </section>

          {/* ════════════════ SECTION 11: IMAGE BLOCKS ════════════════ */}
          <section className="lv2-section lv2-sec-gold" id="lv-images">
            <SecHeader n={11} icon="🖼️" title="Image Blocks" color="gold" />
            <div className="lv2-sec-content">
              {imagePrompts.length > 0 ? (
                <div className="lv2-image-grid">
                  {imagePrompts.map((prompt, i) => (
                    <div key={i} className="lv2-image-card">
                      <div className="lv2-image-placeholder">
                        <span className="lv2-image-placeholder-icon">🖼️</span>
                        <span className="lv2-image-placeholder-label">Illustration {String.fromCharCode(65 + i)}</span>
                      </div>
                      <div className="lv2-image-prompt-text">"{prompt}"</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="lv2-empty">No image prompts generated yet.</p>
              )}
            </div>
          </section>

        </main>{/* /lv2-main */}

        {/* ── RIGHT OVERVIEW PANEL ── */}
        <aside className="lv2-overview">
          <div className="lv2-ov-label">Lesson Overview</div>
          <div className="lv2-ov-title">{title}</div>

          <div className="lv2-ov-meta-grid">
            <div className="lv2-ov-meta-item">
              <span className="lv2-ov-meta-k">Grade</span>
              <span className="lv2-ov-meta-v">{grade}</span>
            </div>
            <div className="lv2-ov-meta-item">
              <span className="lv2-ov-meta-k">Subject</span>
              <span className="lv2-ov-meta-v">{subject}</span>
            </div>
            <div className="lv2-ov-meta-item">
              <span className="lv2-ov-meta-k">Level</span>
              <span className="lv2-ov-meta-v">{level}</span>
            </div>
            <div className="lv2-ov-meta-item">
              <span className="lv2-ov-meta-k">Duration</span>
              <span className="lv2-ov-meta-v">{duration}</span>
            </div>
            {chapter && (
              <div className="lv2-ov-meta-item" style={{ gridColumn: '1/-1' }}>
                <span className="lv2-ov-meta-k">Chapter</span>
                <span className="lv2-ov-meta-v">{chapter}</span>
              </div>
            )}
          </div>

          <div className="lv2-ov-divider" />

          <div className="lv2-ov-active-label">Currently Viewing</div>
          <div className="lv2-ov-active-section">
            {NAV.find(s => s.id === activeSection)?.icon || '📄'}{' '}
            {NAV.find(s => s.id === activeSection)?.label || 'Lesson'}
          </div>

          <div className="lv2-ov-progress">
            <div
              className="lv2-ov-progress-bar"
              style={{ width: `${((NAV.findIndex(s => s.id === activeSection) + 1) / NAV.length) * 100}%` }}
            />
          </div>
          <div className="lv2-ov-progress-label">
            Section {NAV.findIndex(s => s.id === activeSection) + 1} of {NAV.length}
          </div>

          <div className="lv2-ov-divider" />

          <div className="lv2-ov-stats">
            <div className="lv2-ov-stat">
              <span className="lv2-ov-stat-n">{objectives.length}</span>
              <span className="lv2-ov-stat-k">Objectives</span>
            </div>
            <div className="lv2-ov-stat">
              <span className="lv2-ov-stat-n">{vocab.length}</span>
              <span className="lv2-ov-stat-k">Vocab Words</span>
            </div>
            <div className="lv2-ov-stat">
              <span className="lv2-ov-stat-n">{isPoem ? poems.length : finalExamples.length}</span>
              <span className="lv2-ov-stat-k">{isPoem ? 'Poems' : 'Examples'}</span>
            </div>
            <div className="lv2-ov-stat">
              <span className="lv2-ov-stat-n">{quiz.length}</span>
              <span className="lv2-ov-stat-k">Quiz Questions</span>
            </div>
          </div>

        </aside>

      </div>{/* /lv2-layout */}
    </div>
  );
}
