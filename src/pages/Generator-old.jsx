import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, RotateCcw, Sparkles } from 'lucide-react';
import { useGeneration } from '../context/GenerationContext';
import { generateLesson, startBatchGeneration } from '../utils/api';



/* ─────────────────────────────────────────
   Scoped CSS — prefix: g2-
───────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&display=swap');

  .g2-root {
    --sw-blue:     #005B99;
    --sw-blue-mid: #0072BF;
    --sw-blue-lt:  #E8F3FB;
    --sw-blue-dk:  #003E6E;
    --sw-yellow:   #FECC02;
    --sw-yellow-lt:#FFFBE6;
    --ink:         #0F1923;
    --ink-mid:     #3D4E5C;
    --ink-muted:   #7A8A96;
    --surface:     #F4F6F9;
    --paper:       #FDFEFF;
    --border:      rgba(15,25,35,0.10);
    --border-mid:  rgba(15,25,35,0.18);
    --orange:      #E8601C;
    --orange-lt:   #FEF0E9;
    --teal:        #0E7C7B;
    --teal-lt:     #E5F4F4;
    --green:       #1A8A4A;
    --green-lt:    #E6F5EC;
    --shadow-sm:   0 1px 4px rgba(15,25,35,0.08);
    --shadow-md:   0 4px 20px rgba(15,25,35,0.10);
    --radius:      10px;
    --radius-sm:   6px;
    font-family: 'Source Serif 4', Georgia, serif;
    background: var(--surface);
    min-height: 100vh;
    padding-top: 56px;
    padding-bottom: 80px;
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Error bar ── */
  .g2-error {
    margin: 12px 40px 0;
    padding: 11px 16px;
    border-radius: var(--radius-sm);
    border: 1px solid #f5c6c2;
    background: #FDECEA;
    color: #C0392B;
    font-size: 13px; font-weight: 600;
    display: flex; align-items: center; gap: 8px;
  }

  /* ── Body grid ── */
  .g2-body {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 24px;
    padding: 24px 40px;
    max-width: 1300px;
    margin: 0 auto;
  }

  /* ── Main panel ── */
  .g2-panel {
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .g2-panel-head {
    padding: 22px 28px 18px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; gap: 14px;
  }
  .g2-panel-head-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: var(--sw-blue-lt);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .g2-panel-head h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 17px; font-weight: 700; color: var(--ink); margin: 0 0 3px; }
  .g2-panel-head p  { font-size: 13px; color: var(--ink-muted); margin: 0; }

  /* ── Sections ── */
  .g2-section {
    padding: 22px 28px;
    border-bottom: 1px solid var(--border);
  }
  .g2-section:last-child { border-bottom: none; }

  .g2-section-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: var(--ink-muted);
    margin-bottom: 16px;
  }
  .g2-section-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--sw-blue); color: #fff;
    font-size: 11px; font-weight: 700; flex-shrink: 0;
  }
  .g2-optional {
    font-weight: 400; text-transform: none; letter-spacing: 0;
    color: var(--ink-muted); font-size: 11px; margin-left: 4px;
  }

  /* ── Subject pills ── */
  .g2-subject-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  }
  .g2-subject-pill {
    padding: 10px 12px; border-radius: 8px;
    border: 1.5px solid var(--border); background: var(--surface);
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 600; color: var(--ink-mid);
    font-family: 'Source Serif 4', Georgia, serif; text-align: left;
  }
  .g2-subject-pill:hover:not(:disabled)  { border-color: var(--sw-blue); color: var(--sw-blue); background: var(--sw-blue-lt); }
  .g2-subject-pill.active { border-color: var(--sw-blue); background: var(--sw-blue); color: #fff; }
  .g2-subject-pill:disabled { opacity: 0.45; cursor: not-allowed; }
  .g2-subj-icon { font-size: 16px; flex-shrink: 0; }
  .g2-subj-soon {
    font-size: 9px; font-weight: 700; letter-spacing: 0.4px;
    background: var(--ink-muted); color: #fff;
    padding: 1px 5px; border-radius: 3px; margin-left: auto;
    text-transform: uppercase;
  }

  /* ── Chapter chips ── */
  .g2-chapter-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
  }
  .g2-chapter-chip {
    padding: 10px 14px; border-radius: 8px;
    border: 1.5px solid var(--border); background: var(--surface);
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; font-weight: 600; color: var(--ink-mid);
    font-family: 'Source Serif 4', Georgia, serif; text-align: left;
  }
  .g2-chapter-chip:hover  { border-color: var(--sw-blue); color: var(--sw-blue); background: var(--sw-blue-lt); }
  .g2-chapter-chip.active { border-color: var(--sw-blue); background: var(--sw-blue); color: #fff; }
  .g2-chapter-num {
    width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
    background: rgba(0,91,153,0.12); color: var(--sw-blue);
    font-size: 11px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .g2-chapter-chip.active .g2-chapter-num { background: rgba(255,255,255,0.2); color: #fff; }

  /* ── Curriculum labels ── */
  .g2-cur-label {
    font-size: 10.5px; font-weight: 700; letter-spacing: 0.5px;
    color: var(--ink-muted); margin-bottom: 8px; margin-top: 14px;
    text-transform: uppercase;
  }

  /* ── Grade chips ── */
  .g2-grade-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 4px;
  }
  .g2-grade-chip {
    padding: 8px 6px; border-radius: 8px;
    border: 1.5px solid var(--border); background: var(--surface);
    font-size: 11.5px; font-weight: 600; color: var(--ink-mid);
    cursor: pointer; transition: all 0.15s;
    text-align: center; display: flex; flex-direction: column;
    align-items: center; gap: 2px;
    font-family: 'Source Serif 4', Georgia, serif;
  }
  .g2-grade-chip:hover  { border-color: var(--sw-blue); color: var(--sw-blue); background: var(--sw-blue-lt); }
  .g2-grade-chip.active { border-color: var(--sw-blue); background: var(--sw-blue); color: #fff; }
  .g2-chip-sub { font-size: 9.5px; font-weight: 500; opacity: 0.7; }

  /* ── Level cards ── */
  .g2-level-row { display: flex; gap: 8px; margin-top: 4px; }
  .g2-level-card {
    flex: 1; padding: 12px 14px; border-radius: 8px;
    border: 1.5px solid var(--border); background: var(--surface);
    cursor: pointer; transition: all 0.15s; text-align: center;
    font-family: 'Source Serif 4', Georgia, serif;
  }
  .g2-level-card:hover  { border-color: var(--sw-blue); }
  .g2-level-card.active { border-color: var(--sw-blue); background: var(--sw-blue-lt); }
  .g2-level-name { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
  .g2-level-sub  { font-size: 10.5px; color: var(--ink-muted); }
  .g2-level-dots { display: flex; justify-content: center; gap: 3px; margin-top: 6px; }
  .g2-level-dot  { width: 6px; height: 6px; border-radius: 50%; background: var(--border-mid); }
  .g2-level-dot.on { background: var(--sw-blue); }

  /* ── Content type ── */
  .g2-ctype-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  }
  .g2-ctype-card {
    padding: 14px 10px; border-radius: 8px;
    border: 1.5px solid var(--border); background: var(--surface);
    cursor: pointer; transition: all 0.15s; text-align: center;
    font-family: 'Source Serif 4', Georgia, serif;
  }
  .g2-ctype-card:hover  { border-color: var(--sw-blue); }
  .g2-ctype-card.active { border-color: var(--sw-blue); background: var(--sw-blue); }
  .g2-ctype-icon { font-size: 22px; margin-bottom: 6px; }
  .g2-ctype-name { font-size: 11.5px; font-weight: 700; color: var(--ink); }
  .g2-ctype-sub  { font-size: 10px; color: var(--ink-muted); margin-top: 2px; }
  .g2-ctype-card.active .g2-ctype-name { color: #fff; }
  .g2-ctype-card.active .g2-ctype-sub  { color: rgba(255,255,255,0.7); }

  /* ── Custom prompt ── */
  .g2-prompt-box {
    border: 1.5px solid var(--border); border-radius: var(--radius);
    background: var(--surface); overflow: hidden; transition: border-color 0.15s;
  }
  .g2-prompt-box:focus-within { border-color: var(--sw-blue); background: var(--paper); }
  .g2-prompt-ta {
    width: 100%; padding: 13px 16px;
    font-family: 'Source Serif 4', Georgia, serif; font-size: 13.5px; color: var(--ink);
    background: transparent; border: none; outline: none; resize: none;
    min-height: 80px; line-height: 1.6; box-sizing: border-box;
  }
  .g2-prompt-ta::placeholder { color: var(--ink-muted); }
  .g2-prompt-footer {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-top: 1px solid var(--border);
    background: rgba(15,25,35,0.02);
  }
  .g2-prompt-chips { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
  .g2-prompt-chip {
    padding: 3px 9px; border-radius: 100px;
    border: 1px solid var(--border-mid); background: var(--paper);
    font-size: 11px; color: var(--ink-muted); cursor: pointer;
    transition: all 0.15s; font-weight: 500; font-family: 'Source Serif 4', Georgia, serif;
  }
  .g2-prompt-chip:hover { border-color: var(--sw-blue); color: var(--sw-blue); }
  .g2-mic-btn {
    width: 28px; height: 28px; border-radius: 50%;
    border: 1.5px solid var(--border-mid); background: var(--paper);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 13px; transition: all 0.15s; flex-shrink: 0;
  }
  .g2-mic-btn:hover     { border-color: var(--orange); }
  .g2-mic-btn.listening { border-color: var(--sw-blue); background: var(--sw-blue-lt); }

  /* ── Curriculum alignment ── */
  .g2-lgr-box {
    background: var(--sw-blue-lt); border: 1.5px solid rgba(0,91,153,0.2);
    border-radius: var(--radius); padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
  }
  .g2-lgr-icon { font-size: 22px; }
  .g2-lgr-text { flex: 1; }
  .g2-lgr-text strong { font-size: 13px; font-weight: 700; color: var(--sw-blue); display: block; margin-bottom: 2px; }
  .g2-lgr-text span   { font-size: 11.5px; color: var(--ink-muted); }
  .g2-toggle {
    width: 40px; height: 22px; border-radius: 11px;
    background: var(--sw-blue); position: relative; cursor: pointer;
    flex-shrink: 0; transition: background 0.2s; border: none; outline: none;
  }
  .g2-toggle::after {
    content: ''; position: absolute;
    width: 16px; height: 16px; border-radius: 50%; background: #fff;
    top: 3px; right: 3px; transition: all 0.2s;
  }
  .g2-toggle.off { background: var(--border-mid); }
  .g2-toggle.off::after { right: auto; left: 3px; }

  /* ── Resource tiles ── */
  .g2-res-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
  }
  .g2-res-tile {
    border: 1.5px solid var(--border); border-radius: 12px;
    overflow: hidden; cursor: pointer; transition: all 0.15s;
    background: var(--sw-blue-lt); position: relative; text-align: left;
    font-family: 'Source Serif 4', Georgia, serif;
  }
  .g2-res-tile:hover  { border-color: var(--sw-blue); box-shadow: var(--shadow-sm); }
  .g2-res-tile.active {
    border-color: var(--sw-blue);
    background: var(--sw-blue);
  }
  /* icon area */
  .g2-res-icon-wrap {
    height: 84px;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; position: relative;
    background: transparent;
    transition: background 0.15s;
  }
  .g2-res-tile.active .g2-res-icon-wrap {
    background: rgba(0,0,0,0.08);
  }
  /* checkmark badge */
  .g2-res-check {
    position: absolute; top: 8px; right: 8px;
    width: 20px; height: 20px; border-radius: 50%;
    background: #fff; color: var(--sw-blue);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  /* label area */
  .g2-res-label-wrap {
    padding: 0 12px 12px;
  }
  .g2-res-label-name {
    font-size: 12.5px; font-weight: 700;
    color: var(--sw-blue); line-height: 1.3; margin-bottom: 2px;
  }
  .g2-res-tile.active .g2-res-label-name { color: #fff; }
  .g2-res-label-sub {
    font-size: 10.5px; font-weight: 500;
    color: var(--ink-muted); line-height: 1.3;
  }
  .g2-res-tile.active .g2-res-label-sub { color: rgba(255,255,255,0.65); }

  /* ── RIGHT SIDEBAR ── */
  .g2-right { display: flex; flex-direction: column; gap: 14px; }

  .g2-side-card {
    background: var(--paper); border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden; box-shadow: var(--shadow-sm);
  }
  .g2-side-head {
    padding: 13px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .g2-side-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--sw-blue-lt); display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .g2-side-head-text strong { font-family: 'Playfair Display', Georgia, serif; font-size: 13.5px; font-weight: 700; color: var(--ink); display: block; }
  .g2-side-head-text span   { font-size: 11px; color: var(--ink-muted); }
  .g2-side-body { padding: 14px 18px; }

  /* Lesson count */
  .g2-lcount-row { display: flex; gap: 8px; }
  .g2-lcount-btn {
    flex: 1; padding: 10px; border-radius: 8px;
    border: 1.5px solid var(--border); background: var(--surface);
    font-size: 18px; font-weight: 800; color: var(--ink-mid);
    cursor: pointer; transition: all 0.15s; text-align: center;
    font-family: 'Source Serif 4', Georgia, serif;
  }
  .g2-lcount-btn:hover  { border-color: var(--sw-blue); color: var(--sw-blue); }
  .g2-lcount-btn.active { border-color: var(--sw-blue); background: var(--sw-blue); color: #fff; }

  /* Seasonal */
  .g2-seasonal {
    background: linear-gradient(135deg, #0F1923, #1A2D3E);
    border-radius: 12px; padding: 16px; position: relative; overflow: hidden;
  }
  .g2-seasonal::before {
    content: ''; position: absolute; top: 0; right: 0;
    width: 80px; height: 80px;
    background: radial-gradient(circle, rgba(254,204,2,0.15) 0%, transparent 70%);
  }
  .g2-seasonal-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: var(--sw-yellow); margin-bottom: 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .g2-seasonal-title { font-family: 'Playfair Display', Georgia, serif; font-size: 13.5px; font-weight: 700; color: #fff; margin-bottom: 5px; }
  .g2-seasonal-desc  { font-size: 11.5px; color: rgba(255,255,255,0.55); line-height: 1.55; margin-bottom: 12px; }
  .g2-seasonal-btn {
    font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 6px;
    background: var(--sw-yellow); color: var(--ink); border: none; cursor: pointer;
    font-family: 'Source Serif 4', Georgia, serif; transition: all 0.15s; position: relative; z-index: 1;
  }
  .g2-seasonal-btn:hover { background: #e6b800; }

  /* Quick actions */
  .g2-qa-list { display: flex; flex-direction: column; gap: 6px; }
  .g2-qa-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px;
    border: 1px solid var(--border); background: transparent;
    font-family: 'Source Serif 4', Georgia, serif; font-size: 12.5px; font-weight: 600;
    color: var(--ink-mid); cursor: pointer; transition: all 0.15s;
  }
  .g2-qa-btn:hover:not(:disabled) { background: var(--sw-blue-lt); border-color: var(--sw-blue); color: var(--sw-blue); }
  .g2-qa-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── GENERATE BAR ── */
  .g2-gen-bar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
    background: var(--paper); border-top: 1px solid var(--border);
    padding: 13px 40px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 -4px 24px rgba(15,25,35,0.08);
  }
  .g2-bar-left { display: flex; align-items: center; gap: 16px; }
  .g2-bar-count { font-size: 13px; color: var(--ink-mid); }
  .g2-bar-count strong { color: var(--ink); }
  .g2-bar-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .g2-bar-tag { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 4px; }
  .g2-tag-grade   { background: var(--sw-blue-lt); color: var(--sw-blue); }
  .g2-tag-subject { background: var(--teal-lt); color: var(--teal); }
  .g2-tag-level   { background: var(--surface); color: var(--ink-muted); border: 1px solid var(--border-mid); }
  .g2-gen-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 32px; border-radius: 8px; border: none;
    background: var(--sw-blue); color: #fff;
    font-family: 'Source Serif 4', Georgia, serif; font-size: 15px; font-weight: 800;
    cursor: pointer; letter-spacing: 0.3px; transition: all 0.18s;
    box-shadow: 0 4px 16px rgba(0,91,153,0.25);
  }
  .g2-gen-btn:hover { background: var(--sw-blue-mid); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,91,153,0.32); }
  .g2-gen-btn:active { transform: translateY(0); }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .g2-body { grid-template-columns: 1fr; padding: 20px; }
    .g2-right { display: grid; grid-template-columns: 1fr 1fr; }
    .g2-seasonal { grid-column: 1 / -1; }
    .g2-gen-bar { padding: 12px 20px; }
    .g2-bar-tags { display: none; }
  }
  @media (max-width: 600px) {
    .g2-subject-grid { grid-template-columns: 1fr 1fr; }
    .g2-ctype-grid   { grid-template-columns: 1fr 1fr; }
    .g2-grade-grid   { grid-template-columns: repeat(3, 1fr); }
    .g2-right        { grid-template-columns: 1fr; }
  }
`;

/* ── Static data ── */
const SUBJECTS = [
  { value: 'english',  label: 'English',          icon: '🗣️', disabled: false },
  { value: 'math',     label: 'Mathematics',       icon: '🔢', disabled: true  },
  { value: 'science',  label: 'Natural Sciences',  icon: '🌿', disabled: true  },
  { value: 'social',   label: 'Social Sciences',   icon: '🌍', disabled: true  },
  { value: 'swedish',  label: 'Swedish',           icon: '📖', disabled: true  },
  { value: 'arts',     label: 'Visual Arts',       icon: '🎨', disabled: true  },
];

const PRIMARY_GRADES = [
  { value: 'prek', label: 'Pre-K',   sub: 'Preschool Class' },
  { value: '1',    label: 'Grade 1', sub: 'Primary School'  },
  { value: '2',    label: 'Grade 2', sub: 'Primary School'  },
  { value: '3',    label: 'Grade 3', sub: 'Primary School'  },
  { value: '4',    label: 'Grade 4', sub: 'Primary School'  },
  { value: '5',    label: 'Grade 5', sub: 'Primary School'  },
  { value: '6',    label: 'Grade 6', sub: 'Primary School'  },
  { value: '7',    label: 'Grade 7', sub: 'Primary School'  },
];

const SECONDARY_GRADES = [
  { value: '8',   label: 'Grade 8',      sub: 'Lower Secondary' },
  { value: '9',   label: 'Grade 9',      sub: 'Lower Secondary' },
  { value: 'us1', label: 'Upper Sec. 1', sub: 'Upper Secondary' },
  { value: 'us2', label: 'Upper Sec. 2', sub: 'Upper Secondary' },
];

const LEVELS = [
  { value: 'basic',    label: 'Basic',        sub: 'Foundation',   dots: 1 },
  { value: 'medium',   label: 'Intermediate', sub: 'Intermediate', dots: 2 },
  { value: 'advanced', label: 'Advanced',     sub: 'Advanced',     dots: 3 },
];

const CONTENT_TYPES = [
  { value: 'lesson',  label: 'Lesson',     sub: 'Full lesson pack', icon: '📚' },
  { value: 'story',   label: 'Story',      sub: 'Narrative text',   icon: '📖' },
  { value: 'poem',    label: 'Poem/Rhyme', sub: 'Creative writing', icon: '🎵' },
  { value: 'grammar', label: 'Grammar',    sub: 'Language skills',  icon: '✍️' },
];

const PROMPT_CHIPS = [
  '🇸🇪 Swedish characters',
  '🦌 Nordic animals',
  '❄️ Winter theme',
  '🎶 Add a moral',
  '😄 Funny tone',
];

const CHAPTERS = [
  { id: 1, label: 'Stories and Narratives'  },
  { id: 2, label: 'Grammar Fundamentals'    },
  { id: 3, label: 'Vocabulary Development'  },
  { id: 4, label: 'Reading Comprehension'   },
  { id: 5, label: 'Writing Skills'          },
  { id: 6, label: 'Poetry and Literature'   },
  { id: 7, label: 'Communication'           },
  { id: 8, label: 'Critical Thinking'       },
];

/* ─────────────────────────────────────────── */

const Generator = () => {
  const navigate = useNavigate();
  const {
    isGenerating, generationResult, error,
    setGenerationStep, completeGeneration, setGenerationError,
    startBatchGeneration: startBatchCtx,
  } = useGeneration();

  /* ── state ── */
  const [subject,      setSubject]      = useState('');
  const [grade,        setGrade]        = useState('');
  const [chapter,      setChapter]      = useState('');
  const [level,        setLevel]        = useState('');
  const [contentType,  setContentType]  = useState('lesson');
  const [resources,    setResources]    = useState([]);
  const [lessonCount,  setLessonCount]  = useState(1);
  const [lgr22,        setLgr22]        = useState(true);
  const [prompt,       setPrompt]       = useState('');
  const [isListening,  setIsListening]  = useState(false);

  const recognitionRef = useRef(null);

  const resourceTiles = [
    { id: 'guide',      label: "Teacher's Guide",   sub: "Teacher's Guide",   icon: '📋' },
    { id: 'worksheet',  label: 'Worksheets',         sub: 'Worksheets',         icon: '📝' },
    { id: 'exercises',  label: 'Practice Exercises', sub: 'Practice Exercises', icon: '✅' },
    { id: 'assessment', label: 'Assessment Rubric',  sub: 'Assessment Rubric',  icon: '📊' },
    { id: 'multimedia', label: 'Multimedia',         sub: 'Multimedia Content', icon: '🎬' },
    { id: 'references', label: 'References',         sub: 'References',         icon: '📚' },
  ];

  /* ── generation side-effect (unchanged logic) ── */
  useEffect(() => {
    if (!isGenerating) return;
    const run = async () => {
      try {
        setGenerationStep(1, 25);
        const t0 = Date.now();
        const response = await generateLesson(chapter || 1, 1, {
          grade, subject, level, contentType: 'lessons', prompt, resources,
        });
        setGenerationStep(1, 50);
        const { data } = response;
        const fullText       = data.content?.fullContent || '';
        const wordCount      = fullText.split(/\s+/).filter(w => w.length > 0).length;
        const exerciseCount  = (data.content?.exercises || '').split(/\n/).filter(l => l.trim()).length || 15;
        const vocabularyList = (data.content?.vocabulary || '').split(/\n/).filter(l => l.trim()) || [];
        setGenerationStep(2, 75);
        completeGeneration({
          title: `${data.chapter}, Lesson ${data.lesson}`,
          chapter: data.chapter, lesson: data.lesson,
          objectives: data.objectives, estimatedTime: data.estimatedTime,
          wordCount: wordCount || 750, exerciseCount: exerciseCount || 15,
          vocabularyCount: vocabularyList.length || 20,
          cost: 0.04, generationTime: Date.now() - t0,
          rawData: data, selectedResources: resources,
          formData: { subject, grade, level, resources },
          content: {
            theory:      data.content?.introduction || data.content?.mainConcept || '',
            fullContent: data.content?.fullContent  || '',
            mainConcept: data.content?.mainConcept  || '',
            examples:    data.content?.examples     || '',
            activities:  data.content?.activities   || '',
            exercises:   data.content?.exercises    || '',
            vocabulary:  vocabularyList,
            assessment:  data.content?.assessment   || '',
          },
        });
        setGenerationStep(3, 90);
      } catch (err) { setGenerationError(err.message || 'Generation failed.'); }
    };
    run();
  }, [isGenerating]);

  useEffect(() => () => { if (recognitionRef.current) recognitionRef.current.stop(); }, []);

  /* ── handlers ── */
  const handleGenerate = async () => {
    if (!subject || !grade || !level) {
      setGenerationError('Please select subject, grade and level'); return;
    }
    const chapterName = CHAPTERS.find(c => String(c.id) === String(chapter))?.label || CHAPTERS[0].label;
    try {
      const result = await startBatchGeneration({
        subject, grade, level, chapter: chapterName,
        resources, prompt: prompt.trim(), lessonCount,
      });
      if (result.success && result.jobId) {
        startBatchCtx(result.jobId, {
          subject, grade, level, chapter: chapterName,
          resources, prompt: prompt.trim(), lessonCount,
        });
        navigate(`/generated-lessons?jobId=${result.jobId}`);
      }
    } catch (err) { setGenerationError(err.message || 'Failed to start generation'); }
  };

  const toggleResource = id =>
    setResources(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

  const appendChip = chip => {
    const text = chip.replace(/^\S+\s/, '');
    setPrompt(prev => prev ? `${prev}, ${text}` : text);
  };

  const handleMicToggle = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setGenerationError('Voice input not supported.'); return; }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop(); setIsListening(false); return;
    }
    const r = new SR();
    r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 1;
    r.onresult = e => {
      let t = '';
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setPrompt(t.trim());
    };
    r.onend   = () => { setIsListening(false); recognitionRef.current = null; };
    r.onerror = () => { setIsListening(false); recognitionRef.current = null; };
    recognitionRef.current = r; r.start(); setIsListening(true);
  };

  /* ── derived labels for bottom bar ── */
  const hasResult    = Boolean(generationResult);
  const gradeLabel   = [...PRIMARY_GRADES, ...SECONDARY_GRADES].find(g => g.value === grade)?.label  || '';
  const subjectLabel = SUBJECTS.find(s => s.value === subject)?.label || '';
  const levelLabel   = LEVELS.find(l => l.value === level)?.label     || '';
  const chapterLabel = CHAPTERS.find(c => String(c.id) === chapter)?.label || '';

  /* ──────────────────────────────────────────── */
  return (
    <>
      <style>{CSS}</style>
      <div className="g2-root">

        {/* ── Error ── */}
        {error && <div className="g2-error">⚠ {error}</div>}

        <div className="g2-body">

          {/* ═══════════════════════════
              MAIN FORM PANEL
          ═══════════════════════════ */}
          <div>
            <div className="g2-panel">

              {/* Header */}
              <div className="g2-panel-head">
                <div className="g2-panel-head-icon">✏️</div>
                <div>
                  <h2>Create Educational Content</h2>
                  <p>Fill in the fields below and click Generate</p>
                </div>
              </div>

              {/* ── Section 1: Subject ── */}
              <div className="g2-section">
                <div className="g2-section-label">
                  <span className="g2-section-num">1</span>
                  Choose Subject
                </div>
                <div className="g2-subject-grid">
                  {SUBJECTS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      className={`g2-subject-pill${subject === s.value ? ' active' : ''}${s.disabled ? ' g2-subject-disabled' : ''}`}
                      onClick={() => !s.disabled && setSubject(s.value)}
                      disabled={s.disabled}
                      title={s.disabled ? 'Coming soon' : s.label}
                    >
                      <span className="g2-subj-icon">{s.icon}</span>
                      <span>{s.label}</span>
                      {s.disabled && <span className="g2-subj-soon">Soon</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Section 2: Chapter ── */}
              <div className="g2-section">
                <div className="g2-section-label">
                  <span className="g2-section-num">2</span>
                  Choose Chapter
                </div>
                <div className="g2-chapter-grid">
                  {CHAPTERS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className={`g2-chapter-chip${chapter === String(c.id) ? ' active' : ''}`}
                      onClick={() => setChapter(String(c.id))}
                    >
                      <span className="g2-chapter-num">{c.id}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Section 3: Grade & Level ── */}
              <div className="g2-section">
                <div className="g2-section-label">
                  <span className="g2-section-num">3</span>
                  Choose Grade &amp; Level
                </div>

                <div className="g2-cur-label" style={{ marginTop: 0 }}>Primary School</div>
                <div className="g2-grade-grid">
                  {PRIMARY_GRADES.map(g => (
                    <button
                      key={g.value}
                      type="button"
                      className={`g2-grade-chip${grade === g.value ? ' active' : ''}`}
                      onClick={() => setGrade(g.value)}
                    >
                      <span>{g.label}</span>
                      <span className="g2-chip-sub">{g.sub}</span>
                    </button>
                  ))}
                </div>

                <div className="g2-cur-label">Secondary &amp; Upper Secondary</div>
                <div className="g2-grade-grid">
                  {SECONDARY_GRADES.map(g => (
                    <button
                      key={g.value}
                      type="button"
                      className={`g2-grade-chip${grade === g.value ? ' active' : ''}`}
                      onClick={() => setGrade(g.value)}
                    >
                      <span>{g.label}</span>
                      <span className="g2-chip-sub">{g.sub}</span>
                    </button>
                  ))}
                </div>

                <div className="g2-cur-label">Knowledge Level</div>
                <div className="g2-level-row">
                  {LEVELS.map(lv => (
                    <button
                      key={lv.value}
                      type="button"
                      className={`g2-level-card${level === lv.value ? ' active' : ''}`}
                      onClick={() => setLevel(lv.value)}
                    >
                      <div className="g2-level-name">{lv.label}</div>
                      <div className="g2-level-sub">{lv.sub}</div>
                      <div className="g2-level-dots">
                        {[1,2,3].map(d => (
                          <div key={d} className={`g2-level-dot${d <= lv.dots ? ' on' : ''}`} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Section 4: Custom Instruction ── */}
              <div className="g2-section">
                <div className="g2-section-label">
                  <span className="g2-section-num">4</span>
                  Custom Instruction
                  <span className="g2-optional">(optional)</span>
                </div>
                <div className="g2-prompt-box">
                  <textarea
                    className="g2-prompt-ta"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder='e.g. "Make the lesson fun with animal characters" or "Include a winter theme with 400 words"'
                  />
                  <div className="g2-prompt-footer">
                    <div className="g2-prompt-chips">
                      {PROMPT_CHIPS.map(chip => (
                        <button
                          key={chip}
                          type="button"
                          className="g2-prompt-chip"
                          onClick={() => appendChip(chip)}
                        >{chip}</button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className={`g2-mic-btn${isListening ? ' listening' : ''}`}
                      onClick={handleMicToggle}
                      title={isListening ? 'Stop recording' : 'Voice input'}
                    >🎤</button>
                  </div>
                </div>
              </div>

              {/* ── Section 5: Additional Resources ── */}
              <div className="g2-section">
                <div className="g2-section-label">
                  <span className="g2-section-num">5</span>
                  Additional Resources
                  <span className="g2-optional">(optional)</span>
                </div>
                <div className="g2-res-grid">
                  {resourceTiles.map(res => {
                    const active = resources.includes(res.id);
                    return (
                      <button
                        key={res.id}
                        type="button"
                        className={`g2-res-tile${active ? ' active' : ''}`}
                        onClick={() => toggleResource(res.id)}
                      >
                        <div className="g2-res-icon-wrap">
                          <span>{res.icon}</span>
                          {active && <div className="g2-res-check">✓</div>}
                        </div>
                        <div className="g2-res-label-wrap">
                          <div className="g2-res-label-name">{res.label}</div>
                          <div className="g2-res-label-sub">{res.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>{/* /g2-panel */}
          </div>

          {/* ═══════════════════════════
              RIGHT SIDEBAR
          ═══════════════════════════ */}
          <div className="g2-right">

            {/* Lesson count */}
            <div className="g2-side-card">
              <div className="g2-side-head">
                <div className="g2-side-icon">🔢</div>
                <div className="g2-side-head-text">
                  <strong>Number of Lessons</strong>
                  <span>Generate up to 4 at once</span>
                </div>
              </div>
              <div className="g2-side-body">
                <div className="g2-lcount-row">
                  {[1,2,3,4].map(n => (
                    <button
                      key={n}
                      type="button"
                      className={`g2-lcount-btn${lessonCount === n ? ' active' : ''}`}
                      onClick={() => setLessonCount(n)}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Seasonal suggestion */}
            <div className="g2-seasonal">
              <div className="g2-seasonal-label">🗓️ March — In Season</div>
              <div className="g2-seasonal-title">Spring Theme — Easter &amp; New Beginnings</div>
              <div className="g2-seasonal-desc">Generate a lesson about spring traditions, seasonal vocabulary, and nature coming alive with cultural notes.</div>
              <button
                type="button"
                className="g2-seasonal-btn"
                onClick={() => setPrompt('Include a spring / Easter theme with seasonal vocabulary and cultural notes')}
              >Use This Theme →</button>
            </div>

            {/* Quick actions */}
            <div className="g2-side-card">
              <div className="g2-side-head">
                <div className="g2-side-icon">⚡</div>
                <div className="g2-side-head-text">
                  <strong>Quick Actions</strong>
                  <span>Manage your workflow</span>
                </div>
              </div>
              <div className="g2-side-body">
                <div className="g2-qa-list">
                  <button
                    type="button"
                    className="g2-qa-btn"
                    disabled={!hasResult}
                    onClick={() => navigate('/lesson-view', { state: { lesson: generationResult } })}
                  >
                    <Eye size={13} />
                    View Last Lesson
                  </button>
                  <button
                    type="button"
                    className="g2-qa-btn"
                    disabled={!hasResult}
                    onClick={() => {
                      if (!generationResult) return;
                      const blob = new Blob([generationResult.content?.fullContent || ''], { type: 'text/plain' });
                      const url  = URL.createObjectURL(blob);
                      const a = Object.assign(document.createElement('a'), { href: url, download: 'lesson.txt' });
                      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                    }}
                  >
                    <Download size={13} />
                    Download Last
                  </button>
                  <button
                    type="button"
                    className="g2-qa-btn"
                    onClick={() => window.location.reload()}
                  >
                    <RotateCcw size={13} />
                    Reset Form
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ═══════════════════════════
            FIXED GENERATE BAR
        ═══════════════════════════ */}
        <div className="g2-gen-bar">
          <div className="g2-bar-left">
            <div className="g2-bar-count">
              <strong>{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</strong>
              {resources.length > 0 && ` · ${resources.length} resource${resources.length > 1 ? 's' : ''}`}
            </div>
            <div className="g2-bar-tags">
              {gradeLabel   && <span className="g2-bar-tag g2-tag-grade">{gradeLabel}</span>}
              {subjectLabel && <span className="g2-bar-tag g2-tag-subject">{subjectLabel}</span>}
              {chapterLabel && <span className="g2-bar-tag g2-tag-level">{chapterLabel}</span>}
              {levelLabel   && <span className="g2-bar-tag g2-tag-level">{levelLabel}</span>}
            </div>
          </div>
          <button type="button" className="g2-gen-btn" onClick={handleGenerate}>
            <Sparkles size={17} />
            Generate Lesson Pack
          </button>
        </div>

      </div>
    </>
  );
};

export default Generator;
