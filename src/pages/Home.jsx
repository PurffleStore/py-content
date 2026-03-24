import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Icon = {
  ArrowRight: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Play: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Zap: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Globe: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Target: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  FileText: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Download: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Sparkles: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 4.7L5.5 9.5l4.6 1.8L12 16l1.9-4.7 4.6-1.8-4.6-1.8z" />
      <path d="M5 3v4" />
      <path d="M3 5h4" />
      <path d="M19 17v4" />
      <path d="M17 19h4" />
    </svg>
  ),
  Cpu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  ),
};

function DisplayCards() {
  const cards = [
    {
      icon: <Icon.Download />,
      avCls: 'hp-dc-av-blue',
      cls: 'hp-dc-c1',
      title: 'Download & Teach',
      desc: 'Your complete lesson is ready: print-ready worksheets, editable PDFs, cover images, and teacher notes. Use as-is or customise further.',
    },
    {
      icon: <Icon.Cpu />,
      avCls: 'hp-dc-av-gray',
      cls: 'hp-dc-c2',
      title: 'AI Generates Content',
      desc: 'Our 8-agent AI pipeline - Planner, Content Writer, Assessment, QA Reviewer - works in parallel to build a complete, checked lesson package.',
    },
    {
      icon: <Icon.Settings />,
      avCls: 'hp-dc-av-gray',
      cls: 'hp-dc-c3',
      title: 'Configure Your Lesson',
      desc: 'Select subject, grade level, topic, and your curriculum standard. Add a custom prompt to tailor the output to your class.',
    },
  ];

  return (
    <div className="hp-dc-stack">
      {cards.map((card, i) => (
        <div key={i} className={`hp-dc-card ${card.cls}`}>
          <div className="hp-dc-card-head">
            <span className={`hp-dc-av ${card.avCls}`}>{card.icon}</span>
            <span className="hp-dc-card-name">{card.title}</span>
          </div>
          <div className="hp-dc-desc-wrap">
            <p className="hp-dc-card-desc">{card.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroSection({ onStart }) {
  return (
    <section className="hp-hero-dark">
      <div className="hp-glow hp-glow-1" />
      <div className="hp-glow hp-glow-2" />
      <div className="hp-glow hp-glow-3" />
      <div className="hp-dot-grid" />

      <div className="hp-hero-dark-inner">
        <div className="hp-hero-left">
          <h1 className="hp-dark-h1">
            Create <span className="hp-dark-h1-yellow">intelligent</span>
            <br />
            lessons in minutes
          </h1>
          <p className="hp-dark-sub">
            Generate dynamic lessons, worksheets, activities, and assessments instantly. Powered by intelligent multi-agent AI,
            delivering fresh, curriculum-aligned content every time.
          </p>
          <div className="hp-dark-ctas">
            <button className="hp-btn-yellow" onClick={onStart}>
              Start Creating Now
              <Icon.ArrowRight />
            </button>
            <button className="hp-btn-dark-ghost" onClick={onStart}>
              <Icon.Play />
              Watch Demo
            </button>
          </div>
        </div>

        <div className="hp-hero-right">
          <DisplayCards />
          <div className="hp-hiw-mini">
            <div className="hp-hiw-mini-label">How It Works</div>
            <h3 className="hp-hiw-mini-title">
              From idea to lesson
              <br />
              in three steps
            </h3>
            <p className="hp-hiw-mini-sub">No training required. Designed for busy teachers who need quality content fast.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ onStart }) {
  const steps = [
    {
      num: '01',
      icon: <Icon.Settings />,
      title: 'Configure Your Lesson',
      desc: 'Select subject, grade level, topic, and your curriculum standard. Add a custom prompt to tailor the output to your class.',
      detail: ['Choose from 12+ subjects', 'Select curriculum standard', 'Add custom instructions'],
    },
    {
      num: '02',
      icon: <Icon.Sparkles />,
      title: 'AI Generates Content',
      desc: 'Our 8-agent AI pipeline - Planner, Content Writer, Assessment, QA Reviewer - works in parallel to build a complete, checked lesson package.',
      detail: ['8-agent AI pipeline', 'Content + quiz + resources', 'Quality checked by AI'],
    },
    {
      num: '03',
      icon: <Icon.Download />,
      title: 'Download & Teach',
      desc: 'Your complete lesson is ready: print-ready worksheets, editable PDFs, cover images, and teacher notes. Use as-is or customise further.',
      detail: ['PDF & printable export', 'Cover image generated', 'Fully editable output'],
    },
  ];

  return (
    <section className="hp-section hp-section-white" id="how-it-works">
      <div className="hp-container">
        <div className="hp-section-head">
          <div className="hp-section-eyebrow">How It Works</div>
          <h2 className="hp-section-h2">From idea to lesson in three steps</h2>
          <p className="hp-section-sub">No training required. Designed for busy teachers who need quality content fast.</p>
        </div>

        <div className="hp-steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="hp-step-card">
              <div className="hp-step-num">{s.num}</div>
              <div className="hp-step-icon">{s.icon}</div>
              <h3 className="hp-step-title">{s.title}</h3>
              <p className="hp-step-desc">{s.desc}</p>
              <ul className="hp-step-details">
                {s.detail.map((d, j) => (
                  <li key={j}>
                    <span className="hp-check-icon">
                      <Icon.Check />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
              {i < 2 && (
                <div className="hp-step-arrow">
                  <Icon.ArrowRight />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hp-section-cta-row">
          <button className="hp-btn-primary" onClick={onStart}>
            Try It Now - It's Free <Icon.ArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Icon.Target />,
      color: 'blue',
      title: 'Curriculum-Aligned Content',
      desc: 'Automatically aligned to curriculum standards worldwide. Select your framework during setup - the AI tailors every lesson to match your requirements.',
    },
    {
      icon: <Icon.Shield />,
      color: 'green',
      title: 'Privacy & Data Security',
      desc: 'Privacy by design, full data sovereignty, and no student data stored. Built to meet strict data protection requirements across all regions.',
    },
    {
      icon: <Icon.Globe />,
      color: 'teal',
      title: 'Multi-Language Support',
      desc: 'Generate lessons in multiple languages with native-quality output. Perfect for diverse classrooms, bilingual programs, and international schools.',
    },
    {
      icon: <Icon.Cpu />,
      color: 'purple',
      title: '8-Agent AI Pipeline',
      desc: 'Dedicated AI agents for planning, writing, assessment, image generation, and quality assurance - all working in parallel.',
    },
    {
      icon: <Icon.Zap />,
      color: 'orange',
      title: '60-Second Generation',
      desc: 'A complete, high-quality lesson package - objectives, vocabulary, explanation, exercises, quiz, teacher notes - in under a minute.',
    },
    {
      icon: <Icon.FileText />,
      color: 'indigo',
      title: 'Professional Export',
      desc: 'Export as print-ready PDF, editable Word document, or structured textbook content. Cover images included with every lesson.',
    },
  ];

  return (
    <section className="hp-section hp-section-gray" id="features">
      <div className="hp-container">
        <div className="hp-section-head">
          <div className="hp-section-eyebrow">Platform Capabilities</div>
          <h2 className="hp-section-h2">Everything teachers need, nothing they do not</h2>
          <p className="hp-section-sub">Built for educators worldwide - professional, private, and powerful.</p>
        </div>
        <div className="hp-features-grid">
          {features.map((f, i) => (
            <div key={i} className="hp-feature-card">
              <div className={`hp-feature-icon-wrap hp-icon-${f.color}`}>{f.icon}</div>
              <h3 className="hp-feature-title">{f.title}</h3>
              <p className="hp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CurriculumSection() {
  const curricula = [
    { flag: 'US', country: 'United States', standard: 'Common Core State Standards' },
    { flag: 'UK', country: 'United Kingdom', standard: 'National Curriculum (KS1-KS4)' },
    { flag: 'AU', country: 'Australia', standard: 'Australian Curriculum (ACARA)' },
    { flag: 'CA', country: 'Canada', standard: 'Provincial Curriculum Standards' },
    { flag: 'IN', country: 'India', standard: 'NCERT / CBSE Framework' },
    { flag: 'JP', country: 'Japan', standard: 'Course of Study (MEXT)' },
    { flag: 'BR', country: 'Brazil', standard: 'Base Nacional Comum (BNCC)' },
    { flag: 'ZA', country: 'South Africa', standard: 'CAPS (National Curriculum)' },
  ];

  return (
    <section className="hp-section hp-section-blue" id="curriculum">
      <div className="hp-container">
        <div className="hp-section-head hp-section-head-white">
          <div className="hp-section-eyebrow hp-eyebrow-light">Curriculum Alignment</div>
          <h2 className="hp-section-h2 hp-h2-white">Aligned to global curriculum standards</h2>
          <p className="hp-section-sub hp-sub-light">
            Content Studio supports official curriculum frameworks from countries worldwide. Select your standard during setup - the AI handles the rest.
          </p>
        </div>
        <div className="hp-curriculum-grid">
          {curricula.map((c, i) => (
            <div key={i} className="hp-curriculum-card">
              <span className="hp-curriculum-flag">{c.flag}</span>
              <div>
                <div className="hp-curriculum-country">{c.country}</div>
                <div className="hp-curriculum-standard">{c.standard}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="hp-curriculum-more">+ 40 more countries supported</div>
      </div>
    </section>
  );
}

function CtaSection({ onStart }) {
  return (
    <section className="hp-cta-section">
      <div className="hp-cta-inner">
        <div className="hp-cta-badge">Start Today - Free Plan Available</div>
        <h2 className="hp-cta-h2">Ready to save hours every week?</h2>
        <p className="hp-cta-sub">
          Join 2,400+ teachers worldwide who have already transformed their lesson planning. No credit card needed. Cancel any time.
        </p>
        <div className="hp-cta-buttons">
          <button className="hp-btn-cta-primary" onClick={onStart}>
            Start Generating Free <Icon.ArrowRight />
          </button>
          <button className="hp-btn-cta-ghost" onClick={onStart}>View Demo Lesson</button>
        </div>
        <div className="hp-cta-trust-row">
          <span className="hp-cta-trust-item"><Icon.Shield /> Data Secure</span>
          <span className="hp-cta-trust-sep">·</span>
          <span className="hp-cta-trust-item">Secure Data Storage</span>
          <span className="hp-cta-trust-sep">·</span>
          <span className="hp-cta-trust-item">No credit card required</span>
          <span className="hp-cta-trust-sep">·</span>
          <span className="hp-cta-trust-item">Free plan available</span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const go = () => navigate('/generator');

  return (
    <div className="hp-page">
      <HeroSection onStart={go} />
      <HowItWorksSection onStart={go} />
      <FeaturesSection />
      <CurriculumSection />
      <CtaSection onStart={go} />
    </div>
  );
}
