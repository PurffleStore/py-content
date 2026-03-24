/**
 * downloadDocx.js
 * HTML-blob Word export — same technique as LessonView's handleExportWord.
 * Produces a .doc file (Word-compatible HTML) with embedded content & images.
 */

const toArr = v => (Array.isArray(v) ? v : v ? [v] : []);

/* Fetch an image URL → base64 data-URI (returns null on failure) */
async function toDataURI(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror  = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/* Shared Word-document HTML wrapper */
function wrapWord(title, bodyHtml) {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8"/>
  <meta name="ProgId" content="Word.Document"/>
  <meta name="Generator" content="Microsoft Word 15"/>
  <title>${title}</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>90</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
  <style>
    @page { size:A4; margin:2cm 2.5cm }
    * { box-sizing:border-box }
    body { font-family:'Times New Roman',serif; font-size:12pt; color:#111; line-height:1.7 }
    h1 { font-size:22pt; color:#111827; margin:0 0 8px; font-family:Georgia,serif }
    h2 { font-size:14pt; color:#1a2e4a; margin:24px 0 8px; border-bottom:1pt solid #1a2e4a; padding-bottom:4px }
    p  { margin:0 0 6pt }
    .meta { font-size:10pt; color:#555; margin-bottom:14pt }
    .pill { display:inline; border:1pt solid #999; padding:2pt 8pt; font-size:9pt; margin-right:6pt; border-radius:12pt }
    .section { margin-bottom:24pt }
    .img-hero { width:100%; max-height:280pt; object-fit:cover; display:block; margin-bottom:20pt }
    .tag { font-size:9pt; font-weight:bold; letter-spacing:.1em; text-transform:uppercase; color:#1a4fc4; margin-bottom:8pt; display:block }
    /* Story */
    .chip-row { margin:8pt 0 12pt }
    .chip { display:inline; border:1pt solid #bfdbfe; background:#eff6ff; color:#1e40af; padding:2pt 10pt; font-size:10pt; font-weight:bold; margin-right:8pt; border-radius:12pt }
    .story-para { font-size:12pt; line-height:1.85; margin:0 0 10pt; text-indent:2em }
    .story-para.first { text-indent:0 }
    .moral-box { border-left:4pt solid #1a4fc4; background:#eff6ff; padding:10pt 14pt; margin:16pt 0 }
    .moral-label { font-size:9pt; font-weight:bold; letter-spacing:.08em; text-transform:uppercase; color:#1e40af; margin-bottom:4pt }
    .moral-text { font-style:italic; color:#1e3a8a; font-size:12pt; font-family:Georgia,serif }
    /* Vocab table */
    .vocab-table { width:100%; border-collapse:collapse; margin:8pt 0 }
    .vocab-table th { background:#1e3a8a; color:#fff; padding:5pt 8pt; font-size:10pt; text-align:left; border:1pt solid #bfdbfe }
    .vocab-table td { padding:5pt 8pt; font-size:10pt; border:1pt solid #bfdbfe; vertical-align:top }
    .vocab-table tr:nth-child(odd) td { background:#eff6ff }
    .vocab-word-cell { font-weight:bold; color:#1e40af }
    .vocab-usage { font-style:italic; font-size:9pt; color:#6b7280 }
    /* Q&A */
    .qa-item { margin:10pt 0 }
    .qa-q { font-weight:600; font-size:11pt }
    .qa-num { display:inline-block; background:#1a4fc4; color:#fff; border-radius:50%; width:16pt; height:16pt; text-align:center; font-size:9pt; font-weight:bold; line-height:16pt; margin-right:6pt }
    .qa-a { padding-left:22pt; color:#374151; font-size:10pt; margin-top:3pt }
    .qa-a-label { font-weight:bold; color:#1a4fc4; margin-right:4pt }
    /* Poem */
    .poem-block { border-left:4pt solid #c41a1a; padding:10pt 14pt; background:#fafaf8; margin:10pt 0 }
    .poem-line { font-style:italic; font-size:13pt; line-height:2.2; display:block; font-family:Georgia,serif }
    .rhyme-box { background:#fff8f0; border:1pt solid #fcd9a0; padding:8pt 12pt; margin:10pt 0 }
    .rhyme-label { font-size:9pt; font-weight:bold; letter-spacing:.08em; text-transform:uppercase; color:#9a5c0a; margin-bottom:6pt }
    .rhyme-chip { display:inline; border:1.5pt solid #f59e0b; color:#92400e; padding:3pt 10pt; font-size:11pt; margin-right:6pt; font-family:Georgia,serif; font-weight:600 }
    /* Generic lesson */
    .obj-list { list-style:none; margin:0; padding:0 }
    .obj-item { margin:5pt 0 }
    .obj-bullet { color:#2563eb; font-weight:bold; margin-right:5pt }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

/* ─────────────────────────────────────────────────────
   STORY BODY
───────────────────────────────────────────────────── */
async function buildStoryBody(lesson, coverUrl) {
  const paragraphs = toArr(lesson.paragraphs);
  const characters = toArr(lesson.characters);
  const vocab      = toArr(lesson.keyVocabulary);
  const questions  = toArr(lesson.storyQuestions);

  let html = '';

  /* Hero image */
  if (coverUrl) {
    const dataURI = await toDataURI(coverUrl);
    if (dataURI) html += `<img class="img-hero" src="${dataURI}" alt="${lesson.title || ''}" />`;
  }

  /* Tag + Title */
  html += `<span class="tag">📖 Story</span>`;
  html += `<h1>${lesson.title || 'Untitled Story'}</h1>`;

  /* Characters + Setting */
  const chips = [];
  if (characters.length) chips.push(`👤 ${characters.join(', ')}`);
  if (lesson.setting)    chips.push(`📍 ${lesson.setting}`);
  if (chips.length) {
    html += `<div class="chip-row">${chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>`;
  }

  html += `<hr style="border:none;border-top:1pt solid #e0e0e0;margin:12pt 0"/>`;

  /* Story paragraphs */
  paragraphs.forEach((para, i) => {
    html += `<p class="story-para${i === 0 ? ' first' : ''}">${para}</p>`;
  });

  /* Moral */
  if (lesson.moral) {
    html += `<div class="moral-box">
      <div class="moral-label">⭐ Moral of the Story</div>
      <div class="moral-text">${lesson.moral}</div>
    </div>`;
  }

  /* Vocabulary table */
  if (vocab.length) {
    html += `<div class="section">
      <h2>📚 Key Vocabulary</h2>
      <table class="vocab-table">
        <tr><th>Word</th><th>Definition</th><th>Used in Story</th></tr>
        ${vocab.map(v => `<tr>
          <td class="vocab-word-cell">${v.word || ''}</td>
          <td>${v.definition || ''}</td>
          <td class="vocab-usage">${v.usedInStory ? `"${v.usedInStory}"` : ''}</td>
        </tr>`).join('')}
      </table>
    </div>`;
  }

  /* Q&A */
  if (questions.length) {
    html += `<div class="section"><h2>💬 Story Questions</h2>`;
    questions.forEach((qa, i) => {
      html += `<div class="qa-item">
        <div class="qa-q"><span class="qa-num">${i + 1}</span>${qa.question || ''}</div>
        <div class="qa-a"><span class="qa-a-label">A:</span>${qa.answer || ''}</div>
      </div>`;
    });
    html += `</div>`;
  }

  return html;
}

/* ─────────────────────────────────────────────────────
   POEM BODY
───────────────────────────────────────────────────── */

function detectRhymeScheme(lines) {
  const getSound = l => (l.trim().split(/\s+/).pop() || '').toLowerCase().replace(/[^a-z]/g, '').slice(-4);
  const map = {}; let code = 65;
  return lines.map(l => {
    const s = getSound(l);
    if (!s) return '?';
    if (!(s in map)) map[s] = String.fromCharCode(code++);
    return map[s];
  }).join('');
}

function findRhymingGroups(lines) {
  const soundMap = {};
  lines.forEach(line => {
    const word = (line.trim().split(/\s+/).pop() || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return;
    const sound = word.slice(-4);
    if (!soundMap[sound]) soundMap[sound] = [];
    if (!soundMap[sound].includes(word)) soundMap[sound].push(word);
  });
  return Object.values(soundMap).filter(g => g.length > 1);
}

async function buildPoemBody(poems, poemImageUrls) {
  let html = '';

  for (let i = 0; i < poems.length; i++) {
    const poem = poems[i];
    if (i > 0) html += `<div style="page-break-before:always"></div>`;

    /* Image */
    if (poemImageUrls[i]) {
      const dataURI = await toDataURI(poemImageUrls[i]);
      if (dataURI) html += `<img class="img-hero" src="${dataURI}" alt="${poem.title}" />`;
    }

    html += `<span class="tag">🎵 Poem ${i + 1}</span>`;
    html += `<h1>${poem.title}</h1>`;
    html += `<hr style="border:none;border-top:1pt solid #e0e0e0;margin:12pt 0"/>`;

    /* Poem lines */
    html += `<div class="poem-block">`;
    poem.lines.forEach(line => {
      html += `<span class="poem-line">${line || '&nbsp;'}</span>`;
    });
    html += `</div>`;

    /* Rhyming words */
    const rhyming = findRhymingGroups(poem.lines);
    if (rhyming.length) {
      const scheme = detectRhymeScheme(poem.lines);
      html += `<div class="rhyme-box">
        <div class="rhyme-label">🔤 Rhyming Words &nbsp;·&nbsp; Scheme: ${scheme}</div>
        ${rhyming.map(g => `<span class="rhyme-chip">${g.join(' · ')}</span>`).join('')}
      </div>`;
    }
  }

  return html;
}

/* ─────────────────────────────────────────────────────
   GENERIC LESSON BODY
───────────────────────────────────────────────────── */
async function buildGenericBody(lesson, coverUrl) {
  const objectives = toArr(lesson.objectives || lesson.learningObjectives)
    .map(o => typeof o === 'string' ? o : o.text || o.objective || '').filter(Boolean);

  let html = '';

  if (coverUrl) {
    const dataURI = await toDataURI(coverUrl);
    if (dataURI) html += `<img class="img-hero" src="${dataURI}" alt="${lesson.title || ''}" />`;
  }

  html += `<h1>${lesson.title || 'Untitled Lesson'}</h1>`;
  html += `<div class="meta">
    <span class="pill">Grade ${lesson.grade || '3'}</span>
    <span class="pill">${lesson.subject || 'English'}</span>
    <span class="pill">${lesson.level || 'Medium'}</span>
    <span class="pill">⏱ ${lesson.duration || '45 min'}</span>
  </div>`;

  if (lesson.description) {
    html += `<p style="font-style:italic;color:#3d3d3d;border-left:3pt solid #c41a1a;padding-left:12pt;margin:12pt 0">${lesson.description}</p>`;
  }

  if (objectives.length) {
    html += `<div class="section"><h2>🎯 Learning Objectives</h2><ul class="obj-list">`;
    objectives.forEach(o => {
      html += `<li class="obj-item"><span class="obj-bullet">→</span>${o}</li>`;
    });
    html += `</ul></div>`;
  }

  return html;
}

/* ─────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────── */
export async function downloadTextbookDocx({
  lesson,
  isStory,
  isPoetry,
  poems = [],
  poemImages = [],
  coverUrl = null,
  pageTitle,
}) {
  let bodyHtml;

  if (isStory) {
    bodyHtml = await buildStoryBody(lesson, coverUrl);
  } else if (isPoetry && poems.length > 0) {
    bodyHtml = await buildPoemBody(poems, poemImages);
  } else {
    bodyHtml = await buildGenericBody(lesson, coverUrl);
  }

  const fullHtml  = wrapWord(pageTitle || lesson.title || 'Lesson', bodyHtml);
  const blob      = new Blob([fullHtml], { type: 'application/msword;charset=utf-8' });
  const url       = URL.createObjectURL(blob);
  const a         = document.createElement('a');
  a.href          = url;
  a.download      = `${(pageTitle || lesson.title || 'lesson').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
