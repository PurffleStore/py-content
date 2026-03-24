import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, RotateCcw, Sparkles } from 'lucide-react';
import { useGeneration } from '../context/GenerationContext';
import { generateLesson, startBatchGeneration, subscribeBatchProgress, getBatchJobResult } from '../utils/api';



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
    --surface:     #FFF0F5;
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
  .g2-error.g2-info {
    border-color: rgba(232,96,28,0.28);
    background: #FFF5EE;
    color: #A64B18;
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
  .g2-panel-head-copy { flex: 1; min-width: 0; }
  .g2-panel-head-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: var(--sw-blue-lt);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .g2-panel-head h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: var(--ink); margin: 0 0 4px; }
  .g2-panel-head p  { font-size: 15px; color: var(--ink-muted); margin: 0; }
  .g2-head-meta {
    margin-top: 14px;
    display: grid;
    gap: 10px;
  }
  .g2-status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .g2-status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 999px;
    background: var(--surface);
    border: 1px solid var(--border);
    font-size: 12px;
    font-weight: 700;
    color: var(--ink-mid);
  }
  .g2-status-chip.is-done {
    background: var(--green-lt);
    border-color: rgba(26,138,74,0.2);
    color: var(--green);
  }
  .g2-checklist {
    display: grid;
    gap: 8px;
  }
  .g2-checklist-bar {
    width: 100%;
    height: 8px;
    border-radius: 999px;
    background: rgba(15,25,35,0.08);
    overflow: hidden;
  }
  .g2-checklist-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--sw-blue), var(--sw-blue-mid));
    transition: width 0.2s ease;
  }
  .g2-checklist-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .g2-check-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 9px;
    border-radius: 999px;
    background: var(--surface);
    border: 1px solid var(--border);
    font-size: 12px;
    color: var(--ink-muted);
  }
  .g2-check-item.done {
    background: var(--sw-blue-lt);
    border-color: rgba(0,91,153,0.18);
    color: var(--sw-blue);
  }
  .g2-check-icon {
    width: 16px;
    height: 16px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(15,25,35,0.12);
    color: #fff;
    font-size: 10px;
    font-weight: 800;
  }
  .g2-check-item.done .g2-check-icon {
    background: var(--sw-blue);
  }
  .g2-recovery {
    margin: 18px 28px 0;
    padding: 16px 18px;
    border: 1px solid rgba(0,91,153,0.16);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(232,243,251,0.95), rgba(253,254,255,1));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }
  .g2-recovery strong {
    display: block;
    margin-bottom: 4px;
    font-size: 15px;
    color: var(--sw-blue-dk);
  }
  .g2-recovery span {
    font-size: 13px;
    color: var(--ink-mid);
    line-height: 1.5;
  }
  .g2-recovery-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .g2-recovery-btn {
    border: 1px solid rgba(0,91,153,0.18);
    background: #fff;
    color: var(--sw-blue);
    border-radius: 8px;
    padding: 8px 12px;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }
  .g2-recovery-btn:hover {
    border-color: var(--sw-blue);
    background: var(--sw-blue-lt);
  }
  .g2-recovery-btn.primary {
    background: var(--sw-blue);
    border-color: var(--sw-blue);
    color: #fff;
  }
  .g2-recovery-btn.primary:hover {
    background: var(--sw-blue-mid);
  }

  /* ── Sections ── */
  .g2-section {
    padding: 22px 28px;
    border-bottom: 1px solid var(--border);
    scroll-margin-top: 110px;
  }
  .g2-section:last-child { border-bottom: none; }
  .g2-section.is-missing {
    background: #FFF8F3;
    box-shadow: inset 0 0 0 2px rgba(232,96,28,0.22);
  }
  .g2-section.is-missing .g2-section-label { color: var(--orange); }
  .g2-section.is-missing .g2-section-num { background: var(--orange); }
  .g2-section-note {
    margin-top: 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--orange);
  }

  .g2-section-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 700; letter-spacing: 1.1px;
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
    font-size: 15px; font-weight: 600; color: var(--ink-mid);
    font-family: 'Source Serif 4', Georgia, serif; text-align: left;
  }
  .g2-subject-pill:hover:not(:disabled)  { border-color: var(--sw-blue); color: var(--sw-blue); background: var(--sw-blue-lt); }
  .g2-subject-pill.active {
    border-color: var(--sw-blue);
    background: var(--sw-blue-lt);
    color: var(--ink);
    box-shadow: 0 6px 18px rgba(0,91,153,0.12), inset 0 0 0 1px rgba(0,91,153,0.12);
  }
  .g2-subject-pill:disabled { opacity: 0.45; cursor: not-allowed; }
  .g2-subj-icon { font-size: 18px; flex-shrink: 0; }
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
    font-size: 15px; font-weight: 600; color: var(--ink-mid);
    font-family: 'Source Serif 4', Georgia, serif; text-align: left;
  }
  .g2-chapter-chip:hover  { border-color: var(--sw-blue); color: var(--sw-blue); background: var(--sw-blue-lt); }
  .g2-chapter-chip.active {
    border-color: var(--sw-blue);
    background: var(--sw-blue-lt);
    color: var(--ink);
    box-shadow: 0 6px 18px rgba(0,91,153,0.12), inset 0 0 0 1px rgba(0,91,153,0.12);
  }
  .g2-chapter-num {
    width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
    background: rgba(0,91,153,0.12); color: var(--sw-blue);
    font-size: 12px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .g2-chapter-chip.active .g2-chapter-num { background: var(--sw-blue); color: #fff; }

  /* ── Curriculum labels ── */
  .g2-cur-label {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0 12px;
    border-left: 4px solid var(--sw-blue);
    border-radius: 0 8px 8px 0;
    background: linear-gradient(90deg, rgba(0,91,153,0.16), rgba(0,91,153,0.06));
    font-size: 13px; font-weight: 800; letter-spacing: 0.8px;
    color: var(--sw-blue-dk); margin-bottom: 10px; margin-top: 16px;
    text-transform: uppercase;
  }

  /* ── Grade chips ── */
  .g2-grade-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 4px;
  }
  .g2-grade-chip {
    padding: 8px 6px; border-radius: 8px;
    border: 1.5px solid var(--border); background: var(--surface);
    font-size: 13.5px; font-weight: 600; color: var(--ink-mid);
    cursor: pointer; transition: all 0.15s;
    text-align: center; display: flex; flex-direction: column;
    align-items: center; gap: 2px;
    font-family: 'Source Serif 4', Georgia, serif;
  }
  .g2-grade-chip:hover  { border-color: var(--sw-blue); color: var(--sw-blue); background: var(--sw-blue-lt); }
  .g2-grade-chip.active {
    border-color: var(--sw-blue);
    background: var(--sw-blue-lt);
    color: var(--ink);
    box-shadow: 0 6px 18px rgba(0,91,153,0.12), inset 0 0 0 1px rgba(0,91,153,0.12);
  }
  .g2-grade-chip.active .g2-chip-sub { color: var(--ink-muted); opacity: 0.95; }
  .g2-chip-sub { font-size: 11px; font-weight: 500; opacity: 0.8; }

  /* ── Level cards ── */
  .g2-level-row { display: flex; gap: 8px; margin-top: 4px; }
  .g2-level-card {
    flex: 1; padding: 12px 14px; border-radius: 8px;
    border: 1.5px solid var(--border); background: var(--surface);
    cursor: pointer; transition: all 0.15s; text-align: center;
    font-family: 'Source Serif 4', Georgia, serif;
  }
  .g2-level-card:hover  { border-color: var(--sw-blue); }
  .g2-level-card.active {
    border-color: var(--sw-blue);
    background: var(--sw-blue-lt);
    box-shadow: 0 6px 18px rgba(0,91,153,0.12), inset 0 0 0 1px rgba(0,91,153,0.12);
  }
  .g2-level-name { font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
  .g2-level-sub  { font-size: 13px; color: var(--ink-muted); }
  .g2-level-dots { display: flex; justify-content: center; gap: 3px; margin-top: 6px; }
  .g2-level-dot  { width: 7px; height: 7px; border-radius: 50%; background: var(--border-mid); }
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
  .g2-ctype-card.active {
    border-color: var(--sw-blue);
    background: var(--sw-blue-lt);
    box-shadow: 0 6px 18px rgba(0,91,153,0.12), inset 0 0 0 1px rgba(0,91,153,0.12);
  }
  .g2-ctype-icon { font-size: 22px; margin-bottom: 6px; }
  .g2-ctype-name { font-size: 14px; font-weight: 700; color: var(--ink); }
  .g2-ctype-sub  { font-size: 12px; color: var(--ink-muted); margin-top: 3px; }
  .g2-ctype-card.active .g2-ctype-name { color: var(--ink); }
  .g2-ctype-card.active .g2-ctype-sub  { color: var(--ink-muted); }

  /* ── Custom prompt ── */
  .g2-prompt-box {
    border: 1.5px solid var(--border); border-radius: var(--radius);
    background: var(--surface); overflow: hidden; transition: border-color 0.15s;
  }
  .g2-prompt-box:focus-within { border-color: var(--sw-blue); background: var(--paper); }
  .g2-prompt-ta {
    width: 100%; padding: 13px 16px;
    font-family: 'Source Serif 4', Georgia, serif; font-size: 16px; color: var(--ink);
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
    font-size: 12.5px; color: var(--ink-muted); cursor: pointer;
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
  .g2-mic-btn:disabled  { opacity: 0.45; cursor: not-allowed; }
  .g2-prompt-note {
    padding: 10px 12px 12px;
    border-top: 1px solid var(--border);
    background: rgba(15,25,35,0.02);
    font-size: 12.5px;
    color: var(--ink-muted);
    line-height: 1.5;
  }

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
    background: var(--sw-blue-lt);
    box-shadow: 0 6px 18px rgba(0,91,153,0.12), inset 0 0 0 1px rgba(0,91,153,0.12);
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
    background: rgba(0,91,153,0.08);
  }
  /* checkmark badge */
  .g2-res-check {
    position: absolute; top: 8px; right: 8px;
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--sw-blue); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  /* label area */
  .g2-res-label-wrap {
    padding: 0 12px 12px;
  }
  .g2-res-label-name {
    font-size: 14px; font-weight: 700;
    color: var(--sw-blue); line-height: 1.3; margin-bottom: 2px;
  }
  .g2-res-tile.active .g2-res-label-name { color: var(--ink); }
  .g2-res-label-sub {
    font-size: 12px; font-weight: 500;
    color: var(--ink-muted); line-height: 1.3;
  }
  .g2-res-tile.active .g2-res-label-sub { color: var(--ink-muted); }
  .g2-res-preview {
    margin-top: 8px;
    font-size: 11.5px;
    color: var(--ink-mid);
    line-height: 1.45;
  }

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
  .g2-side-head-text strong { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 700; color: var(--ink); display: block; }
  .g2-side-head-text span   { font-size: 13px; color: var(--ink-muted); }
  .g2-side-body { padding: 14px 18px; }

  /* Lesson count */
  .g2-lcount-row { display: flex; gap: 8px; }
  .g2-lcount-btn {
    flex: 1; padding: 10px; border-radius: 8px;
    border: 1.5px solid var(--border); background: var(--surface);
    font-size: 20px; font-weight: 800; color: var(--ink-mid);
    cursor: pointer; transition: all 0.15s; text-align: center;
    font-family: 'Source Serif 4', Georgia, serif;
  }
  .g2-lcount-btn:hover  { border-color: var(--sw-blue); color: var(--sw-blue); }
  .g2-lcount-btn.active {
    border-color: var(--sw-blue);
    background: var(--sw-blue-lt);
    color: var(--ink);
    box-shadow: 0 6px 18px rgba(0,91,153,0.12), inset 0 0 0 1px rgba(0,91,153,0.12);
  }

  /* Dynamic context card */
  .g2-ctx-card { border-color: var(--sw-blue); }
  .g2-ctx-card .g2-side-head { background: var(--sw-blue-lt); }
  .g2-ctx-card .g2-side-icon { background: var(--sw-blue); }
  .g2-ctx-hint {
    font-size: 11px; color: var(--ink-muted); margin-top: 8px;
    padding: 6px 10px; background: var(--surface);
    border-radius: 6px; border: 1px solid var(--border);
    line-height: 1.5;
  }

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
    font-size: 11.5px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: var(--sw-yellow); margin-bottom: 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .g2-seasonal-title { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .g2-seasonal-desc  { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.55; margin-bottom: 12px; }
  .g2-seasonal-btn {
    font-size: 12.5px; font-weight: 700; padding: 7px 15px; border-radius: 6px;
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
  .g2-bar-count { font-size: 15px; color: var(--ink-mid); }
  .g2-bar-count strong { color: var(--ink); }
  .g2-bar-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .g2-bar-tag { font-size: 12.5px; font-weight: 600; padding: 4px 11px; border-radius: 4px; }
  .g2-tag-grade   { background: var(--sw-blue-lt); color: var(--sw-blue); }
  .g2-tag-subject { background: var(--teal-lt); color: var(--teal); }
  .g2-tag-level   { background: var(--surface); color: var(--ink-muted); border: 1px solid var(--border-mid); }
  .g2-gen-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 32px; border-radius: 8px; border: none;
    background: var(--sw-blue); color: #fff;
    font-family: 'Source Serif 4', Georgia, serif; font-size: 17px; font-weight: 800;
    cursor: pointer; letter-spacing: 0.3px; transition: all 0.18s;
    box-shadow: 0 4px 16px rgba(0,91,153,0.25);
  }
  .g2-gen-btn:hover { background: var(--sw-blue-mid); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,91,153,0.32); }
  .g2-gen-btn:active { transform: translateY(0); }
  .g2-gen-btn:disabled {
    background: #8CA9BF;
    cursor: wait;
    transform: none;
    box-shadow: none;
  }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .g2-body { grid-template-columns: 1fr; padding: 20px; }
    .g2-right { display: grid; grid-template-columns: 1fr 1fr; }
    .g2-seasonal { grid-column: 1 / -1; }
    .g2-gen-bar { padding: 12px 20px; }
    .g2-bar-tags { display: none; }
    .g2-recovery { margin: 18px 20px 0; }
  }
  @media (max-width: 600px) {
    .g2-subject-grid { grid-template-columns: 1fr 1fr; }
    .g2-ctype-grid   { grid-template-columns: 1fr 1fr; }
    .g2-grade-grid   { grid-template-columns: repeat(3, 1fr); }
    .g2-right        { grid-template-columns: 1fr; }
    .g2-panel-head { flex-direction: column; }
    .g2-recovery { flex-direction: column; align-items: flex-start; }
    .g2-recovery-actions { width: 100%; }
  }

  /* ── Progress Modal ── */
  .g2-modal-overlay {
    position: fixed; inset: 0; z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    background: rgba(220,228,240,0.55);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    animation: g2-fadein 0.2s ease;
  }
  @keyframes g2-fadein { from { opacity:0 } to { opacity:1 } }

  .g2-modal-card {
    background: #ffffff; border-radius: 24px;
    padding: 48px 56px 40px; width: 740px; max-width: 94vw;
    box-shadow: 0 8px 48px rgba(15,25,35,0.10), 0 1px 4px rgba(15,25,35,0.06);
    animation: g2-slideup 0.28s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes g2-slideup { from { transform: translateY(28px) scale(0.97); opacity:0 } to { transform:none; opacity:1 } }

  /* Top row: icon box + text */
  .g2-modal-top {
    display: flex; align-items: flex-start; gap: 24px; margin-bottom: 28px;
  }
  .g2-modal-icon-box {
    width: 64px; height: 64px; border-radius: 16px;
    background: #FFF0E8; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .g2-modal-spinner {
    width: 34px; height: 34px; border-radius: 50%;
    border: 3px solid #FDDCC8; border-top-color: #F97316;
    animation: g2-spin 0.85s linear infinite;
  }
  @keyframes g2-spin { to { transform: rotate(360deg); } }
  .g2-modal-text-wrap { display: flex; flex-direction: column; gap: 4px; padding-top: 4px; }
  .g2-modal-eyebrow { font-size: 0.72rem; font-weight: 700; color: #94A3B8; letter-spacing: 0.1em; text-transform: uppercase; font-family: 'Source Serif 4', serif; }
  .g2-modal-title   { font-size: 2rem; font-weight: 800; color: #0F1923; margin: 0; line-height: 1.1; font-family: 'Source Serif 4', serif; }
  .g2-modal-msg     { font-size: 1rem; color: #64748B; margin: 0; font-family: 'Source Serif 4', serif; }

  /* Progress bar */
  .g2-modal-prog-outer {
    height: 10px; background: #E9EDF2; border-radius: 99px; margin-bottom: 10px; overflow: hidden;
  }
  .g2-modal-prog-inner {
    height: 100%;
    background: linear-gradient(90deg, #EF4444 0%, #F97316 45%, #EAB308 100%);
    border-radius: 99px; transition: width 0.6s ease;
  }
  .g2-modal-prog-meta {
    display: flex; justify-content: space-between;
    font-size: 0.9rem; color: #94A3B8; margin-bottom: 32px;
    font-family: 'Source Serif 4', serif;
  }

  /* Stage tracker */
  .g2-modal-stages {
    display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px;
  }
  .g2-stage-item {
    display: flex; flex-direction: column; align-items: center; gap: 10px; flex: 1;
  }
  .g2-stage-item-line {
    display: flex; align-items: center; width: 100%;
  }
  .g2-stage-dot {
    width: 46px; height: 46px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700;
    background: #F1F5F9; color: #CBD5E1; border: 2px solid #E2E8F0;
    flex-shrink: 0; transition: all 0.3s; position: relative; z-index: 1;
  }
  .g2-stage-dot-done   { background: #16A34A; color: #fff; border-color: #16A34A; }
  .g2-stage-dot-active {
    background: #fff; color: #F97316; border-color: #F97316; border-width: 2px;
    animation: g2-pulse 1.3s ease infinite;
  }
  @keyframes g2-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.25)} 50%{box-shadow:0 0 0 8px rgba(249,115,22,0)} }
  .g2-stage-line      { flex: 1; height: 2px; background: #E2E8F0; margin-top: -23px; transition: background 0.3s; }
  .g2-stage-line-done { background: #16A34A; }
  .g2-modal-stage-label {
    font-size: 12.5px; color: #94A3B8; text-align: center;
    font-family: 'Source Serif 4', serif; line-height: 1.3; white-space: nowrap;
  }

  /* Footer note */
  .g2-modal-footer-note {
    margin-top: 28px; font-size: 0.92rem; color: #94A3B8;
    font-style: italic; font-family: 'Source Serif 4', serif;
  }

  /* Complete state */
  .g2-modal-complete { text-align: center; padding: 24px 0 16px; }
  .g2-modal-complete-icon  { font-size: 4rem; margin-bottom: 14px; }
  .g2-modal-complete-title { font-size: 1.6rem; font-weight: 700; color: #16A34A; margin-bottom: 8px; font-family: 'Source Serif 4', serif; }
  .g2-modal-complete-sub   { font-size: 1rem; color: #64748B; font-family: 'Source Serif 4', serif; }
`;

/* ── Static data ── */
const DRAFT_KEY = 'g2_generator_draft';

function loadDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(data) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {}
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

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
  { id: 1,  label: 'Stories and Narratives'     },
  { id: 2,  label: 'Poetry'                     },
  { id: 3,  label: 'Reading Comprehension'      },
  { id: 4,  label: 'Vocabulary Development'     },
  { id: 5,  label: 'Grammar Fundamentals'       },
  { id: 6,  label: 'Writing Skills'             },
  { id: 7,  label: 'Speaking and Communication' },
  { id: 8,  label: 'Listening Skills'           },
  { id: 9,  label: 'Creative Writing'           },
  { id: 10, label: 'Critical Thinking'          },
];

/* Context card config — keyed by chapter id */
const CHAPTER_CONTEXT = {
  2: {                                    /* Poetry */
    icon: '🎵', title: 'Poems per Lesson',
    sub: 'How many poems to generate',
    options: [1, 2, 3, 4, 5, 6],
    stateKey: 'poemCount',
    hint: (n) => `AI will write ${n} complete rhyming poem${n === 1 ? '' : 's'} with images`,
  },
  4: {                                    /* Vocabulary Development */
    icon: '📝', title: 'Vocabulary Words',
    sub: 'Words to learn per lesson',
    options: [6, 8, 10, 12],
    stateKey: 'vocabCount',
    hint: (n) => `${n} vocabulary words with child-friendly definitions`,
  },
  1: {                                    /* Stories and Narratives */
    icon: '📖', title: 'Story Length',
    sub: 'Lesson depth',
    options: [1, 2, 3],
    stateKey: 'storyDepth',
    hint: (n) => ['Short story (1 page)', 'Medium story (2 pages)', 'Long story (3 pages)'][n - 1],
  },
  9: {                                    /* Creative Writing */
    icon: '✏️', title: 'Writing Prompts',
    sub: 'Number of writing prompts',
    options: [2, 3, 4, 5],
    stateKey: 'promptCount',
    hint: (n) => `${n} creative writing prompts with example starters`,
  },
};

const RESOURCE_CUE_MAP = {
  guide: {
    preview: 'Teaching steps and pacing ideas.',
    help: 'Suggested teaching flow, timing, and facilitation tips for the lesson.',
  },
  worksheet: {
    preview: 'Ready-to-use student practice pages.',
    help: 'Printable or shareable follow-up tasks students can complete independently.',
  },
  exercises: {
    preview: 'Extra questions for reinforcement.',
    help: 'Adds focused skill practice so students can apply what they learned right away.',
  },
  assessment: {
    preview: 'Clear scoring criteria and checkpoints.',
    help: 'Helps you evaluate understanding with consistent success criteria.',
  },
  multimedia: {
    preview: 'Media ideas to make lessons engaging.',
    help: 'Adds audio, video, or visual support suggestions to increase engagement.',
  },
  references: {
    preview: 'Source ideas for extension and research.',
    help: 'Provides supporting references you can use for deeper follow-up or planning.',
  },
};

/* ─────────────────────────────────────────── */

const STAGE_LABELS = {
  starting: 'Initializing', planner: 'Planning', content: 'Writing Content',
  images: 'Generating Images', qa: 'Quality Check', formatter: 'Formatting',
  complete: 'Complete!', error: 'Error',
};
const STAGE_ORDER = ['planner', 'content', 'images', 'qa', 'formatter'];

const Generator = () => {
  const navigate = useNavigate();
  const {
    isGenerating, generationResult, error,
    setGenerationStep, completeGeneration, setGenerationError,
    startBatchGeneration: startBatchCtx,
  } = useGeneration();

  /* ── state ── */
  const draftRef = useRef(null);
  if (draftRef.current === null) draftRef.current = loadDraft();
  const savedDraft = draftRef.current || {};
  const hasSavedDraft = Boolean(savedDraft.subject || savedDraft.grade || savedDraft.chapter || savedDraft.level || savedDraft.prompt);

  const [subject,      setSubject]      = useState('');
  const [grade,        setGrade]        = useState('');
  const [chapter,      setChapter]      = useState('');
  const [level,        setLevel]        = useState('');
  const [contentType,  setContentType]  = useState('lesson');
  const [resources,    setResources]    = useState([]);
  const [lessonCount,  setLessonCount]  = useState(1);
  const [poemCount,    setPoemCount]    = useState(1);
  const [vocabCount,   setVocabCount]   = useState(6);
  const [storyDepth,   setStoryDepth]   = useState(1);
  const [promptCount,  setPromptCount]  = useState(3);

  /* Resolve context card value/setter for selected chapter */
  const ctxConfig = CHAPTER_CONTEXT[Number(chapter)] || null;
  const ctxStateMap = {
    poemCount:   { value: poemCount,   set: setPoemCount   },
    vocabCount:  { value: vocabCount,  set: setVocabCount  },
    storyDepth:  { value: storyDepth,  set: setStoryDepth  },
    promptCount: { value: promptCount, set: setPromptCount },
  };
  const ctxState  = ctxConfig ? ctxStateMap[ctxConfig.stateKey] : null;
  const [lgr22,        setLgr22]        = useState(true);
  const [prompt,       setPrompt]       = useState('');
  const [isListening,  setIsListening]  = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingSections, setMissingSections] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceHelpMessage, setVoiceHelpMessage] = useState('');
  const [draftPromptVisible, setDraftPromptVisible] = useState(hasSavedDraft);
  const [draftPersistenceReady, setDraftPersistenceReady] = useState(!hasSavedDraft);
  const [draftStatus, setDraftStatus] = useState(hasSavedDraft ? 'Draft found' : 'Draft autosaves');

  const [showModal,     setShowModal]     = useState(false);
  const [modalProgress, setModalProgress] = useState({ stage: 'starting', progress: 0, message: 'Preparing AI pipeline…' });

  const recognitionRef    = useRef(null);
  const sectionRefs       = useRef({});
  const draftStatusTimerRef = useRef(null);
  const genSseRef         = useRef(null);

  const resourceTiles = [
    { id: 'guide',      label: "Teacher's Guide",   sub: "Teacher's Guide",   icon: '📋' },
    { id: 'worksheet',  label: 'Worksheets',         sub: 'Worksheets',         icon: '📝' },
    { id: 'exercises',  label: 'Practice Exercises', sub: 'Practice Exercises', icon: '✅' },
    { id: 'assessment', label: 'Assessment Rubric',  sub: 'Assessment Rubric',  icon: '📊' },
    { id: 'multimedia', label: 'Multimedia',         sub: 'Multimedia Content', icon: '🎬' },
    { id: 'references', label: 'References',         sub: 'References',         icon: '📚' },
  ].map(tile => ({ ...tile, ...RESOURCE_CUE_MAP[tile.id] }));

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

  useEffect(() => {
    const supported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    setVoiceSupported(supported);
    setVoiceHelpMessage(
      supported
        ? 'Use voice input to dictate your custom instruction.'
        : 'Voice input is not available in this browser. You can still type or paste your instruction.'
    );
  }, []);

  useEffect(() => {
    if (!draftPersistenceReady) return;
    const draft = { subject, grade, chapter, level, prompt };
    if (Object.values(draft).some(Boolean)) {
      saveDraft(draft);
      setDraftStatus('Draft saved');
      if (draftStatusTimerRef.current) clearTimeout(draftStatusTimerRef.current);
      draftStatusTimerRef.current = window.setTimeout(() => {
        setDraftStatus('Draft autosaves');
        draftStatusTimerRef.current = null;
      }, 1800);
    } else {
      clearDraft();
      setDraftStatus('No draft yet');
    }
  }, [subject, grade, chapter, level, prompt, draftPersistenceReady]);

  useEffect(() => {
    const currentMissing = [];
    if (!subject) currentMissing.push('subject');
    if (!chapter) currentMissing.push('chapter');
    if (!grade || !level) currentMissing.push('grade-level');

    setMissingSections(prev => prev.filter(section => currentMissing.includes(section)));
    if (!currentMissing.length) setValidationMessage('');
  }, [subject, chapter, grade, level]);

  useEffect(() => {
    if (!error) return;
    if (subject || chapter || grade || level || prompt) setGenerationError(null);
  }, [subject, chapter, grade, level, prompt, error, setGenerationError]);

  useEffect(() => () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (draftStatusTimerRef.current) clearTimeout(draftStatusTimerRef.current);
  }, []);

  /* ── handlers ── */
  const registerSectionRef = key => node => {
    if (node) sectionRefs.current[key] = node;
  };

  const focusSection = key => {
    const section = sectionRefs.current[key];
    if (!section) return;
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const focusTarget = section.querySelector('button:not(:disabled), textarea:not(:disabled)');
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  };

  const getMissingSections = () => {
    const missing = [];
    if (!subject) missing.push('subject');
    if (!chapter) missing.push('chapter');
    if (!grade || !level) missing.push('grade-level');
    return missing;
  };

  const restoreDraft = () => {
    setSubject(savedDraft.subject || '');
    setGrade(savedDraft.grade || '');
    setChapter(savedDraft.chapter || '');
    setLevel(savedDraft.level || '');
    setPrompt(savedDraft.prompt || '');
    setDraftPromptVisible(false);
    setDraftPersistenceReady(true);
    setDraftStatus('Draft restored');
  };

  const discardSavedDraft = () => {
    clearDraft();
    draftRef.current = {};
    setDraftPromptVisible(false);
    setDraftPersistenceReady(true);
    setDraftStatus('Starting fresh');
  };

  const startProgress = (jobId) => {
    let pollInterval = null;

    const poll = () => {
      pollInterval = setInterval(async () => {
        try {
          const res = await getBatchJobResult(jobId);
          setModalProgress({ stage: res.stage || 'starting', progress: res.progress || 0, message: res.message || '' });
          if (res.status === 'complete' && res.lessons) {
            clearInterval(pollInterval);
            setModalProgress({ stage: 'complete', progress: 100, message: 'Your lesson pack is ready!' });
            setTimeout(() => { setShowModal(false); navigate(`/generated-lessons?jobId=${jobId}`); }, 1400);
          }
          if (res.status === 'failed') {
            clearInterval(pollInterval);
            setShowModal(false); setIsSubmitting(false);
            setGenerationError(res.error || 'Generation failed');
          }
        } catch {}
      }, 3000);
    };

    const sse = subscribeBatchProgress(jobId, (data) => {
      setModalProgress({ stage: data.stage, progress: data.progress || 0, message: data.message || '' });
      if (data.stage === 'complete') {
        getBatchJobResult(jobId).then(res => {
          if (res.success && res.lessons) {
            setModalProgress({ stage: 'complete', progress: 100, message: 'Your lesson pack is ready!' });
            setTimeout(() => { setShowModal(false); navigate(`/generated-lessons?jobId=${jobId}`); }, 1400);
          } else { poll(); }
        }).catch(() => poll());
      }
      if (data.stage === 'error') {
        setShowModal(false); setIsSubmitting(false);
        setGenerationError(data.message || 'Generation failed');
      }
    }, () => poll());

    genSseRef.current = sse;
  };

  const handleGenerate = async () => {
    if (isSubmitting || isGenerating) return;

    const missing = getMissingSections();
    if (missing.length) {
      setGenerationError(null);
      setMissingSections(missing);
      setValidationMessage('Complete the highlighted required section before generating.');
      focusSection(missing[0]);
      return;
    }

    setValidationMessage('');
    setMissingSections([]);
    setIsSubmitting(true);

    const chapterName = CHAPTERS.find(c => String(c.id) === String(chapter))?.label || '';
    try {
      const result = await startBatchGeneration({
        subject, grade, level, chapter: chapterName,
        resources, prompt: prompt.trim(),
        lessonCount, poemCount,
        vocabCount, storyDepth, promptCount,
        contentType,
      });
      if (result.success && result.jobId) {
        startBatchCtx(result.jobId, {
          subject, grade, level, chapter: chapterName,
          resources, prompt: prompt.trim(),
        });
        setModalProgress({ stage: 'starting', progress: 0, message: 'Preparing AI pipeline…' });
        setShowModal(true);
        startProgress(result.jobId);
        return;
      }
      setIsSubmitting(false);
      setGenerationError('Failed to start generation');
    } catch (err) {
      setIsSubmitting(false);
      setGenerationError(err.message || 'Failed to start generation');
    }
  };

  const toggleResource = id =>
    setResources(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

  const appendChip = chip => {
    const text = chip.replace(/^\S+\s/, '');
    setPrompt(prev => prev ? `${prev}, ${text}` : text);
  };

  const handleMicToggle = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceHelpMessage('Voice input is not available here. You can type or paste your instruction instead.');
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop(); setIsListening(false); return;
    }
    const r = new SR();
    r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 1;
    setVoiceHelpMessage('Listening... speak your instruction, then tap the mic again to stop.');
    r.onresult = e => {
      let t = '';
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setPrompt(t.trim());
    };
    r.onend   = () => {
      setIsListening(false);
      recognitionRef.current = null;
      setVoiceHelpMessage('Use voice input to dictate your custom instruction.');
    };
    r.onerror = event => {
      setIsListening(false);
      recognitionRef.current = null;
      setVoiceHelpMessage(
        event?.error === 'not-allowed'
          ? 'Microphone access was blocked. Allow mic access or type your instruction instead.'
          : 'Voice input could not start. You can type or paste your instruction instead.'
      );
    };
    recognitionRef.current = r; r.start(); setIsListening(true);
  };

  /* ── derived labels for bottom bar ── */
  const hasResult    = Boolean(generationResult);
  const gradeLabel   = [...PRIMARY_GRADES, ...SECONDARY_GRADES].find(g => g.value === grade)?.label  || '';
  const subjectLabel = SUBJECTS.find(s => s.value === subject)?.label || '';
  const levelLabel   = LEVELS.find(l => l.value === level)?.label     || '';
  const chapterLabel = CHAPTERS.find(c => String(c.id) === chapter)?.label || '';
  const completionItems = [
    { key: 'subject', label: 'Subject', done: Boolean(subject) },
    { key: 'chapter', label: 'Chapter', done: Boolean(chapter) },
    { key: 'grade', label: 'Grade', done: Boolean(grade) },
    { key: 'level', label: 'Level', done: Boolean(level) },
  ];
  const completedRequiredCount = completionItems.filter(item => item.done).length;
  const completionPercent = (completedRequiredCount / completionItems.length) * 100;
  const bannerMessage = error || validationMessage;
  const isBusy = isSubmitting || isGenerating;
  const sectionMessages = {
    subject: 'Select a subject to continue.',
    chapter: 'Choose a chapter before generating.',
    'grade-level': !grade && !level
      ? 'Choose both a grade and a knowledge level.'
      : !grade
        ? 'Choose a grade to continue.'
        : 'Choose a knowledge level to continue.',
  };

  /* ──────────────────────────────────────────── */
  return (
    <>
      <style>{CSS}</style>
      <div className="g2-root">

        {/* ── Error ── */}
        {error && <div className="g2-error">⚠ {error}</div>}

        {!error && validationMessage && <div className="g2-error g2-info">Please complete the highlighted required section.</div>}

        <div className="g2-body">

          {/* ═══════════════════════════
              MAIN FORM PANEL
          ═══════════════════════════ */}
          <div>
            <div className="g2-panel">

              {/* Header */}
              <div className="g2-panel-head">
                <div className="g2-panel-head-icon">✏️</div>
                <div className="g2-panel-head-copy">
                  <h2>Create Educational Content</h2>
                  <p>Fill in the fields below and click Generate</p>
                  <div className="g2-head-meta">
                    <div className="g2-status-row">
                      <span className={`g2-status-chip${completedRequiredCount === completionItems.length ? ' is-done' : ''}`}>
                        {completedRequiredCount}/{completionItems.length} required choices complete
                      </span>
                      <span className="g2-status-chip">{draftStatus}</span>
                    </div>
                    <div className="g2-checklist">
                      <div className="g2-checklist-bar">
                        <div className="g2-checklist-fill" style={{ width: `${completionPercent}%` }} />
                      </div>
                      <div className="g2-checklist-items">
                        {completionItems.map(item => (
                          <span key={item.key} className={`g2-check-item${item.done ? ' done' : ''}`}>
                            <span className="g2-check-icon">{item.done ? '✓' : '•'}</span>
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 1: Subject ── */}
              {draftPromptVisible && (
                <div className="g2-recovery">
                  <div>
                    <strong>Resume your saved draft?</strong>
                    <span>Your last subject, chapter, grade, level, and prompt are ready to restore.</span>
                  </div>
                  <div className="g2-recovery-actions">
                    <button type="button" className="g2-recovery-btn primary" onClick={restoreDraft}>Resume Draft</button>
                    <button type="button" className="g2-recovery-btn" onClick={discardSavedDraft}>Start Fresh</button>
                  </div>
                </div>
              )}

              <div
                ref={registerSectionRef('subject')}
                className={`g2-section${missingSections.includes('subject') ? ' is-missing' : ''}`}
              >
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
                {missingSections.includes('subject') && <div className="g2-section-note">{sectionMessages.subject}</div>}
              </div>

              {/* ── Section 2: Chapter ── */}
              <div
                ref={registerSectionRef('chapter')}
                className={`g2-section${missingSections.includes('chapter') ? ' is-missing' : ''}`}
              >
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
                {missingSections.includes('chapter') && <div className="g2-section-note">{sectionMessages.chapter}</div>}
              </div>

              {/* ── Section 3: Grade & Level ── */}
              <div
                ref={registerSectionRef('grade-level')}
                className={`g2-section${missingSections.includes('grade-level') ? ' is-missing' : ''}`}
              >
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
                {missingSections.includes('grade-level') && <div className="g2-section-note">{sectionMessages['grade-level']}</div>}
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
                      disabled={!voiceSupported}
                      onClick={handleMicToggle}
                      title={isListening ? 'Stop recording' : voiceHelpMessage}
                    >🎤</button>
                  </div>
                  <div className="g2-prompt-note">{voiceHelpMessage}</div>
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
                        title={res.help}
                        onClick={() => toggleResource(res.id)}
                      >
                        <div className="g2-res-icon-wrap">
                          <span>{res.icon}</span>
                          {active && <div className="g2-res-check">✓</div>}
                        </div>
                        <div className="g2-res-label-wrap">
                          <div className="g2-res-label-name">{res.label}</div>
                          <div className="g2-res-label-sub">{res.sub}</div>
                          <div className="g2-res-preview">{res.preview}</div>
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

            {/* ── ONE card: context card if chapter has options, else Number of Lessons ── */}
            {ctxConfig && ctxState ? (
              <div className="g2-side-card g2-ctx-card">
                <div className="g2-side-head">
                  <div className="g2-side-icon">{ctxConfig.icon}</div>
                  <div className="g2-side-head-text">
                    <strong>{ctxConfig.title}</strong>
                    <span>{ctxConfig.sub}</span>
                  </div>
                </div>
                <div className="g2-side-body">
                  <div className="g2-lcount-row">
                    {ctxConfig.options.map(n => (
                      <button key={n} type="button"
                        className={`g2-lcount-btn${ctxState.value === n ? ' active' : ''}`}
                        onClick={() => ctxState.set(n)}
                      >{n}</button>
                    ))}
                  </div>
                  <div className="g2-ctx-hint">
                    {ctxConfig.icon} {ctxConfig.hint(ctxState.value)}
                  </div>
                </div>
              </div>
            ) : (
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
                      <button key={n} type="button"
                        className={`g2-lcount-btn${lessonCount === n ? ' active' : ''}`}
                        onClick={() => setLessonCount(n)}
                      >{n}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                    onClick={() => {
                      clearDraft();
                      window.location.reload();
                    }}
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
          <button type="button" className="g2-gen-btn" onClick={handleGenerate} disabled={isBusy}>
            <Sparkles size={17} />
            {isBusy ? 'Generating...' : 'Generate Lesson Pack'}
          </button>
        </div>

      </div>

      {/* ══════ PROGRESS MODAL ══════ */}
      {showModal && (() => {
        const curIdx = STAGE_ORDER.indexOf(modalProgress.stage);
        const isComplete = modalProgress.stage === 'complete';
        return (
          <div className="g2-modal-overlay">
            <div className="g2-modal-card">
              {isComplete ? (
                <div className="g2-modal-complete">
                  <div className="g2-modal-complete-icon">🎉</div>
                  <div className="g2-modal-complete-title">Lesson Pack Ready!</div>
                  <div className="g2-modal-complete-sub">Taking you to your lessons…</div>
                </div>
              ) : (
                <>
                  {/* Top: icon box + eyebrow + title + message */}
                  <div className="g2-modal-top">
                    <div className="g2-modal-icon-box">
                      <div className="g2-modal-spinner" />
                    </div>
                    <div className="g2-modal-text-wrap">
                      <div className="g2-modal-eyebrow">Lesson Pack Generator</div>
                      <div className="g2-modal-title">{STAGE_LABELS[modalProgress.stage] || 'Starting…'}</div>
                      <div className="g2-modal-msg">{modalProgress.message || 'Preparing AI pipeline…'}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="g2-modal-prog-outer">
                    <div className="g2-modal-prog-inner" style={{ width: `${Math.max(modalProgress.progress || 0, 2)}%` }} />
                  </div>
                  <div className="g2-modal-prog-meta">
                    <span>{modalProgress.progress || 0}%</span>
                    <span>Generating {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}…</span>
                  </div>

                  {/* Stage dots with labels below each */}
                  <div className="g2-modal-stages">
                    {STAGE_ORDER.map((st, i) => (
                      <React.Fragment key={st}>
                        <div className="g2-stage-item">
                          <div className={[
                            'g2-stage-dot',
                            curIdx > i   ? 'g2-stage-dot-done'   : '',
                            curIdx === i ? 'g2-stage-dot-active' : '',
                          ].join(' ')}>
                            {curIdx > i ? '✓' : i + 1}
                          </div>
                          <div className="g2-modal-stage-label">{STAGE_LABELS[st]}</div>
                        </div>
                        {i < STAGE_ORDER.length - 1 && (
                          <div className={`g2-stage-line${curIdx > i ? ' g2-stage-line-done' : ''}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Footer note */}
                  <div className="g2-modal-footer-note">
                    The generator stays on this page while the content is being written.
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default Generator;
