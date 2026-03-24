import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  FileText,
  Image,
  Layers3,
  PencilRuler,
  Rocket,
  Sparkles,
  Wand2,
} from 'lucide-react';
import './HowItWorks.css';

const stepRows = [
  [
    {
      number: '01',
      title: 'Select subject and grade',
      description:
        'Choose the subject, grade, chapter, and difficulty level so the system starts from the correct classroom context.',
      accent: 'Setup',
    },
    {
      number: '02',
      title: 'Add custom teacher input',
      description:
        'Include your prompt, story idea, outcomes, or teaching notes. Upload supporting files or speak instructions if needed.',
      accent: 'Prompt',
    },
    {
      number: '03',
      title: 'Planner agent builds the lesson map',
      description:
        'The planner breaks the request into sections, objectives, vocabulary, activities, and the right page structure.',
      accent: 'Plan',
    },
  ],
  [
    {
      number: '04',
      title: 'Writer and media agents expand content',
      description:
        'Content agents write textbook-style pages, examples, callouts, and image placements that fit the chosen level.',
      accent: 'Compose',
    },
    {
      number: '05',
      title: 'Exercises and QA agents review quality',
      description:
        'Practice tasks, quizzes, worksheets, and validation checks are added so the lesson is complete and classroom ready.',
      accent: 'Review',
    },
    {
      number: '06',
      title: 'Formatter prepares final outputs',
      description:
        'The final lesson is assembled into structured pages for viewing, downloading, printing, and classroom reuse.',
      accent: 'Deliver',
    },
  ],
];

const pipelineAgents = [
  'Input Parser',
  'Planner Agent',
  'Content Writer',
  'Image Selector',
  'Practice Builder',
  'Assessment Agent',
  'QA Reviewer',
  'Formatter Agent',
];

const agentCards = [
  {
    icon: <ClipboardList size={18} />,
    title: 'Planning layer',
    text: 'Defines learning goals, page flow, vocabulary targets, and activity distribution before content generation starts.',
  },
  {
    icon: <PencilRuler size={18} />,
    title: 'Authoring layer',
    text: 'Builds the main lesson pages, reading passages, explanations, examples, and student-friendly textbook content.',
  },
  {
    icon: <Image size={18} />,
    title: 'Resource layer',
    text: 'Matches visuals, worksheets, printable resources, and teaching aids to the topic and reading level.',
  },
  {
    icon: <CheckCircle2 size={18} />,
    title: 'Validation layer',
    text: 'Checks page completeness, consistency, prompt alignment, and output formatting before the lesson is returned.',
  },
];

const lessonStructure = [
  'Cover page with lesson title and objective summary',
  'Introduction and concept-building pages with visuals',
  'Examples, guided practice, and explanation spreads',
  'Worksheet, quiz, and reinforcement activities',
  'Teacher notes, printable resources, and export-ready ending pages',
];

const exportFormats = [
  {
    title: 'Interactive lesson view',
    text: 'A textbook-style reader page with sections, images, callouts, and guided navigation for each page.',
    icon: <Layers3 size={20} />,
  },
  {
    title: 'PDF and print output',
    text: 'Export classroom-ready pages for sharing, printing, or attaching to school LMS workflows.',
    icon: <Download size={20} />,
  },
  {
    title: 'Worksheet pack',
    text: 'Includes printable exercises, activities, and assessment pages aligned to the main lesson.',
    icon: <FileText size={20} />,
  },
  {
    title: 'Reusable teacher package',
    text: 'Keeps prompts, selected resources, and structured lesson content ready for quick regeneration.',
    icon: <Bot size={20} />,
  },
];

const faqItems = [
  {
    question: 'What happens after I click Generate Lesson?',
    answer:
      'The system sends your selections and prompt through multiple agents. One plans the lesson, others write the pages, add exercises, attach resources, and format the final output for viewing and export.',
  },
  {
    question: 'Will the lesson look like a real textbook page?',
    answer:
      'That is the target structure. Newly generated lessons are arranged into multi-page content with section flow, image areas, explanations, activities, and final export support instead of a flat dashboard summary.',
  },
  {
    question: 'Can I influence what the agents write?',
    answer:
      'Yes. The Generator Actions card is designed for custom prompts, spoken instructions, and file attachments so the final lesson can match a story idea, concept focus, or classroom requirement.',
  },
  {
    question: 'What outputs can I use after generation?',
    answer:
      'You can view the lesson in the content reader, export PDF-style output, use attached resources, and regenerate a new version from the same workflow when needed.',
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const totalAgents = useMemo(() => pipelineAgents.length, []);

  return (
    <main className="hiw-page">
      <section className="hiw-hero">
        <div className="hiw-shell hiw-hero-grid">
          <div className="hiw-hero-copy">
            <p className="hiw-eyebrow">How It Works</p>
            <h1>See how Content Studio turns one idea into a full lesson package.</h1>
            <p className="hiw-hero-subtext">
              Your selections move through a multi-agent workflow that plans, writes, checks, enriches,
              and formats classroom-ready content. The result is a lesson experience designed to feel like
              a real digital textbook, not a flat dashboard.
            </p>
            <div className="hiw-hero-actions">
              <button type="button" className="hiw-btn hiw-btn-primary" onClick={() => navigate('/generator')}>
                Build a Lesson
                <ArrowRight size={18} />
              </button>
              <button type="button" className="hiw-btn hiw-btn-secondary" onClick={() => window.scrollTo({ top: 720, behavior: 'smooth' })}>
                Explore Workflow
              </button>
            </div>
          </div>

          <div className="hiw-hero-panel">
            <div className="hiw-panel-card hiw-panel-card-main">
              <div className="hiw-panel-header">
                <span className="hiw-icon-chip">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3>Lesson generation pipeline</h3>
                  <p>{totalAgents} coordinated agents convert your request into a structured teaching package.</p>
                </div>
              </div>
              <div className="hiw-panel-list">
                {pipelineAgents.map((agent, index) => (
                  <div key={agent} className="hiw-panel-list-item">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{agent}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hiw-panel-card hiw-panel-card-mini">
              <p className="hiw-mini-label">Output target</p>
              <strong>5-10 textbook-style pages</strong>
              <span>With lesson content, visuals, activities, and downloadable resources.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="hiw-section">
        <div className="hiw-shell">
          <div className="hiw-heading">
            <p className="hiw-section-label">Workflow</p>
            <h2 className="hiw-section-title">From teacher input to finished classroom content</h2>
            <p className="hiw-section-sub">
              The full flow is intentionally broken into clear stages so quality, structure, and supporting
              resources are handled before the lesson reaches the viewer.
            </p>
          </div>

          <div className="hiw-steps-grid">
            {stepRows.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="hiw-steps-row">
                {row.map((step) => (
                  <article key={step.number} className="hiw-step-card">
                    <div className="hiw-step-top">
                      <div className="hiw-step-num-wrap">{step.number}</div>
                      <span className="hiw-step-tag">{step.accent}</span>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hiw-section hiw-section-alt">
        <div className="hiw-shell">
          <div className="hiw-heading">
            <p className="hiw-section-label">Agent Pipeline</p>
            <h2 className="hiw-section-title">A visible workflow instead of a black box</h2>
            <p className="hiw-section-sub">
              The platform separates planning, writing, enrichment, review, and formatting so each layer has a
              clear job and the final output is more stable.
            </p>
          </div>

          <div className="hiw-pipeline-wrap">
            <div className="hiw-pipeline-flow">
              {pipelineAgents.map((agent) => (
                <div key={agent} className="hiw-agent-block">
                  <Wand2 size={16} />
                  <span>{agent}</span>
                </div>
              ))}
            </div>

            <div className="hiw-agent-detail-grid">
              {agentCards.map((card) => (
                <article key={card.title} className="hiw-agent-detail-card">
                  <div className="hiw-agent-detail-icon">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hiw-section">
        <div className="hiw-shell">
          <div className="hiw-heading">
            <p className="hiw-section-label">Outputs</p>
            <h2 className="hiw-section-title">What the user receives after generation</h2>
            <p className="hiw-section-sub">
              The lesson is not only text. It is structured into readable pages, exportable materials, and
              reusable resource blocks for teachers.
            </p>
          </div>

          <div className="hiw-output-layout">
            <article className="hiw-lesson-structure">
              <div className="hiw-lesson-structure-header">
                <span className="hiw-icon-chip hiw-icon-chip-light">
                  <Rocket size={18} />
                </span>
                <div>
                  <h3>Suggested lesson package structure</h3>
                  <p>Designed for full content viewing instead of summary-only cards.</p>
                </div>
              </div>
              <ul>
                {lessonStructure.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <div className="hiw-export-cards">
              {exportFormats.map((item) => (
                <article key={item.title} className="hiw-export-card">
                  <div className="hiw-export-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hiw-section hiw-section-alt">
        <div className="hiw-shell">
          <div className="hiw-heading">
            <p className="hiw-section-label">FAQ</p>
            <h2 className="hiw-section-title">Common questions about the workflow</h2>
            <p className="hiw-section-sub">
              These are the implementation details users usually want clarified before depending on the system.
            </p>
          </div>

          <div className="hiw-faq-grid">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={item.question} className={`hiw-faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button type="button" className="hiw-faq-q" onClick={() => setOpenFaq(isOpen ? -1 : index)}>
                    <span>{item.question}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && <div className="hiw-faq-a">{item.answer}</div>}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hiw-cta-section">
        <div className="hiw-shell">
          <div className="hiw-cta-card">
            <div>
              <p className="hiw-section-label">Ready</p>
              <h2>Open the generator and run the full lesson workflow.</h2>
              <p>
                Select the topic, add your prompt, choose resources, and let the agents build the final lesson package.
              </p>
            </div>
            <button type="button" className="hiw-btn hiw-btn-primary" onClick={() => navigate('/generator')}>
              Go to Generator
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HowItWorks;
