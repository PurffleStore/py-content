import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Download,
  FileImage,
  FileText,
  GitBranch,
  GraduationCap,
  Image,
  Layers3,
  LayoutTemplate,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import generatedLessonsImage from '../assets/images/generated-lessons.jpg';
import processingImage from '../assets/images/processing.png';
import teacherGuideImage from '../assets/images/teacher-guide.PNG';
import lessonImage from '../assets/images/lesson.JPG';
import storiesImage from '../assets/images/stories.PNG';
import practiceImage from '../assets/images/practice-excer.jpg';
import rubricImage from '../assets/images/grading-rubric.PNG';
import worksheetImage from '../assets/images/resource-worksheet.jpg';
import multimediaImage from '../assets/images/multi-media.jpg';
import bookFormatImage from '../assets/images/book-format.png';
import hiwStandardModeImage from '../assets/images/hiw-standard-mode.PNG';
import hiwTextbookModeImage from '../assets/images/hiw-textbook-mode.png';
import hiwHomepageImage from '../assets/images/hiw-homepage.PNG';
import hiwGeneratorImage from '../assets/images/hiw-generator.jpg';
import hiwGeneratedLessonsImage from '../assets/images/hiw-generated-lessons.jpg';
import hiwLessonViewImage from '../assets/images/hiw-lesson-view.png';
import hiwTextbookViewImage from '../assets/images/hiw-textbook-view.PNG';
import './HowItWorks.css';

const capabilityPills = [
  '8 specialized AI agents',
  'Real-time SSE progress tracking',
  'Fallback-safe generation',
  'DALL-E 3 visuals',
];

const heroStats = [
  { value: '8', label: 'AI agents in the lesson pipeline' },
  { value: '3x', label: 'Faster parallel stage for practice, assessment, and resources' },
  { value: '4-8 min', label: 'Typical lesson generation window' },
  { value: '12-20 min', label: 'Typical textbook generation window' },
];

const workflowStages = [
  {
    number: '01',
    title: 'Teachers configure the request',
    text:
      'The Generator page collects the classroom context before any content is written: subject, grade, chapter or unit, difficulty, resource preferences, and optional prompt guidance.',
    icon: <LayoutTemplate size={18} />,
    bullets: [
      'Starts from subject, grade, chapter, and topic context',
      'Supports resource preferences like practice, assessment, worksheets, and images',
      'Uses required-field validation before generation begins',
    ],
  },
  {
    number: '02',
    title: 'Planner and Content Writer build the core lesson',
    text:
      'Agent 1 creates the structured framework, then Agent 2 expands it into the main educational content with warm-ups, explanations, examples, vocabulary, and reflection.',
    icon: <Bot size={18} />,
    bullets: [
      'Planner defines 5-7 main sections and 3-5 learning objectives',
      'Content Writer produces the main explanation, examples, and vocabulary',
      'The structure stays grade-appropriate and curriculum-aware',
    ],
  },
  {
    number: '03',
    title: 'Three agents run in parallel for speed',
    text:
      'Practice, assessment, and supporting resources are generated at the same time so the workflow stays comprehensive without becoming slow or brittle.',
    icon: <GitBranch size={18} />,
    bullets: [
      'Practice Generator creates easy, medium, and challenge tasks',
      'Assessment Creator adds quizzes, answer keys, and exit tickets',
      'Resource Generator produces teacher guides, worksheets, and multimedia ideas',
    ],
  },
  {
    number: '04',
    title: 'Visuals, QA, and formatting complete the package',
    text:
      'The image prompt layer prepares DALL-E 3 visuals, quality assurance checks alignment and safety, and the formatter converts everything into a polished textbook-style output.',
    icon: <Image size={18} />,
    bullets: [
      'Image prompts are generated for covers, sections, and concept visuals',
      'QA checks age-appropriateness, grammar, inclusivity, and objectives',
      'Formatter applies visual hierarchy, section styling, and print-ready structure',
    ],
  },
  {
    number: '05',
    title: 'Users track progress and open the final content',
    text:
      'Generated Lessons shows live status updates through Server-Sent Events, then the finished lesson opens in dedicated viewer pages with export and reuse options.',
    icon: <Workflow size={18} />,
    bullets: [
      'Progress updates stream in real time while agents are running',
      'Lessons open in a detailed reader with objectives, activities, and resources',
      'Textbooks use a chapter-based view with navigation and reading flow',
    ],
  },
];

const agentCards = [
  {
    title: 'Planner',
    icon: <LayoutTemplate size={18} />,
    text: 'Builds the lesson framework, section hierarchy, objectives, vocabulary targets, and prerequisite knowledge list.',
    outputs: ['5-7 sections', '3-5 objectives', '10-15 terms'],
    image: hiwStandardModeImage,
    imageAlt: 'Planner agent lesson layout preview',
  },
  {
    title: 'Content Writer',
    icon: <FileText size={18} />,
    text: 'Writes the main explanation, warm-up activity, examples, vocabulary definitions, misconceptions, and reflection prompts.',
    outputs: ['800-1200 words', '4-6 examples', 'Warm-up + reflection'],
    image: storiesImage,
    imageAlt: 'Content writer storytelling preview',
  },
  {
    title: 'Practice Generator',
    icon: <GraduationCap size={18} />,
    text: 'Creates differentiated student work across easy, medium, and challenge levels so practice is layered by difficulty.',
    outputs: ['15-20 items', 'Answer keys', '3 levels'],
    image: practiceImage,
    imageAlt: 'Practice generator exercise preview',
  },
  {
    title: 'Assessment Creator',
    icon: <ShieldCheck size={18} />,
    text: 'Produces quiz questions, explanations, answer keys, and short exit-ticket checks for formative assessment.',
    outputs: ['10-15 quiz items', '3-5 exit tickets', 'Error notes'],
    image: rubricImage,
    imageAlt: 'Assessment creator rubric preview',
  },
  {
    title: 'Resource Generator',
    icon: <Download size={18} />,
    text: 'Adds teacher guides, printable worksheets, and multimedia suggestions that extend the main lesson.',
    outputs: ['Teacher guide', '2-3 worksheets', 'Media suggestions'],
    image: worksheetImage,
    imageAlt: 'Resource generator worksheet preview',
  },
  {
    title: 'Image Prompt Generator',
    icon: <FileImage size={18} />,
    text: 'Turns key concepts into detailed DALL-E 3 prompts for lesson covers, section visuals, and concept illustrations.',
    outputs: ['3-5 prompts', 'Cover art', 'Section visuals'],
    image: multimediaImage,
    imageAlt: 'Image prompt generator multimedia preview',
  },
  {
    title: 'Quality Assurance',
    icon: <CheckCircle2 size={18} />,
    text: 'Reviews content quality, safety, grade fit, grammar, inclusivity, and learning-objective alignment before release.',
    outputs: ['Quality score', 'Issue flags', 'Recommendations'],
    image: generatedLessonsImage,
    imageAlt: 'Quality assurance generated lesson review preview',
  },
  {
    title: 'Formatter',
    icon: <Layers3 size={18} />,
    text: 'Polishes the lesson into a professional textbook-style structure with typography, visual hierarchy, and export-ready formatting.',
    outputs: ['Styled layout', 'Visual hierarchy', 'Print-ready output'],
    image: bookFormatImage,
    imageAlt: 'Formatter book layout preview',
  },
];

const modeCards = [
  {
    label: 'Standard Mode',
    title: 'Single-lesson generation for everyday classroom prep',
    text:
      'The documented standard workflow uses the 8-agent pipeline to produce complete lesson materials for one teaching session.',
    icon: <Bot size={20} />,
    meta: 'Typical processing time: 4-8 minutes',
    image: lessonImage,
    imageAlt: 'Standard mode content generation preview',
    bullets: [
      'Best for one lesson at a time',
      'Includes content, practice, assessment, resources, and visuals',
      'Optimized for fast turnaround with reliable fallback behavior',
    ],
  },
  {
    label: 'Textbook Mode',
    title: 'Chapter-scale generation for deeper instructional packages',
    text:
      'Textbook mode adds extra outlining and section-writing behavior so Content Studio can assemble larger chapter experiences instead of a single lesson.',
    icon: <Layers3 size={20} />,
    meta: 'Typical processing time: 12-20 minutes',
    image: hiwTextbookModeImage,
    imageAlt: 'Textbook mode chapter layout preview',
    bullets: [
      'Extends the workflow for full chapter coverage',
      'Adds chapter structure, detailed sections, and summarization',
      'Designed for reader-style textbook output with navigation flow',
    ],
  },
];

const pageCards = [
  {
    route: '/',
    title: 'Homepage',
    text: 'Introduces the value proposition, feature set, and a short preview of the workflow before users start.',
    icon: <Sparkles size={18} />,
    image: hiwHomepageImage,
    imageAlt: 'Homepage preview',
  },
  {
    route: '/generator',
    title: 'Generator',
    text: 'Collects lesson inputs like subject, grade, chapter, topic, difficulty, resources, and content preferences.',
    icon: <LayoutTemplate size={18} />,
    image: hiwGeneratorImage,
    imageAlt: 'Generator preview',
  },
  {
    route: '/generated-lessons',
    title: 'Generated Lessons',
    text: 'Shows the live progress bar, agent status updates, estimated time, completion state, and retry behavior.',
    icon: <Workflow size={18} />,
    image: hiwGeneratedLessonsImage,
    imageAlt: 'Generated lessons preview',
  },
  {
    route: '/lesson-view',
    title: 'Lesson View',
    text: 'Displays the completed lesson with objectives, explanations, vocabulary, practice, assessment, notes, and visuals.',
    icon: <FileText size={18} />,
    image: hiwLessonViewImage,
    imageAlt: 'Lesson view preview',
  },
  {
    route: '/textbook-view',
    title: 'Textbook View',
    text: 'Provides chapter navigation, section summaries, reading progress, and textbook-style browsing for larger outputs.',
    icon: <Layers3 size={18} />,
    image: hiwTextbookViewImage,
    imageAlt: 'Textbook view preview',
  },
];

const faqItems = [
  {
    question: 'How does the app show progress while content is being generated?',
    answer:
      'The documented flow uses Server-Sent Events (SSE) so the Generated Lessons page can stream progress percentages, current agent activity, and status messages in real time.',
  },
  {
    question: 'What happens if one agent fails during generation?',
    answer:
      'The pipeline is designed with fallback generation. If a single agent fails, predefined backup content is used so the lesson can still complete instead of the whole workflow stopping.',
  },
  {
    question: 'Are images part of the core workflow or an optional extra?',
    answer:
      'Images are part of the documented pipeline. The Image Prompt Generator creates prompts for DALL-E 3, and the system can fall back to default educational graphics if image generation fails.',
  },
  {
    question: 'What is the difference between lesson mode and textbook mode?',
    answer:
      'Lesson mode runs the standard 8-agent workflow for one lesson package. Textbook mode extends the process with additional chapter-structuring behavior so the output can cover larger textbook-style sections.',
  },
  {
    question: 'What kind of output should users expect at the end?',
    answer:
      'The final material is meant to feel like a professional digital learning package, with structured pages, visuals, practice tasks, assessments, teacher support, and export-friendly formatting.',
  },
];

const workflowMetrics = [
  { label: 'Sequential setup', value: 'Agents 1-2' },
  { label: 'Parallel branch', value: 'Agents 3-5' },
  { label: 'Live delivery', value: 'SSE tracking' },
];

const HowItWorks = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const scrollToWorkflow = () => {
    document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="hiw-page">
      <section className="hiw-hero">
        <div className="hiw-hero-glow hiw-hero-glow-a" />
        <div className="hiw-hero-glow hiw-hero-glow-b" />
        <div className="hiw-hero-dots" />

        <div className="hiw-shell hiw-hero-grid">
          <div className="hiw-hero-copy">
            <p className="hiw-eyebrow">How It Works</p>
            <h1>
              From one prompt
              <br />
              to a complete
              <br />
              teaching package.
            </h1>
            <p className="hiw-hero-subtext">
              Based on your application documentation, the platform uses eight specialized AI agents to
              plan, write, enrich, verify, and format lessons or textbook content, while keeping users
              informed with real-time progress updates throughout the workflow.
            </p>

            <div className="hiw-hero-actions">
              <button type="button" className="hiw-btn hiw-btn-primary" onClick={() => navigate('/generator')}>
                Open Generator
                <ArrowRight size={18} />
              </button>
              <button type="button" className="hiw-btn hiw-btn-secondary" onClick={scrollToWorkflow}>
                Explore Workflow
              </button>
            </div>

            <div className="hiw-pill-row">
              {capabilityPills.map((item) => (
                <span key={item} className="hiw-pill">
                  {item}
                </span>
              ))}
            </div>

            <div className="hiw-stat-grid">
              {heroStats.map((stat) => (
                <article key={stat.label} className="hiw-stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="hiw-hero-panel">
            <article className="hiw-panel-card hiw-panel-card-main">
              <div className="hiw-panel-head">
                <span className="hiw-panel-icon">
                  <Sparkles size={18} />
                </span>
                <div>
                  <p className="hiw-panel-kicker">Documented core pipeline</p>
                  <h3>Sequential foundations, parallel enrichment, polished delivery</h3>
                </div>
              </div>

              <p className="hiw-panel-text">
                Agents 1 and 2 define the lesson structure and main content. Agents 3, 4, and 5 then work
                in parallel to improve speed, before images, QA, and formatting finalize the output.
              </p>

              <div className="hiw-pipeline-list">
                {agentCards.map((agent, index) => (
                  <div key={agent.title} className="hiw-pipeline-item">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{agent.title}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="hiw-panel-card hiw-panel-card-glance">
              <div>
                <p className="hiw-panel-kicker hiw-panel-kicker-dark">Reliability layer</p>
                <h3>Built to keep the workflow moving</h3>
                <p className="hiw-panel-text hiw-panel-text-dark">
                  The platform combines SSE progress tracking, fallback content generation, and automated
                  image support so users get a dependable experience from start to finish.
                </p>
              </div>

              <div className="hiw-glance-list">
                <span>
                  <Clock3 size={16} />
                  Lesson mode: 4-8 minutes
                </span>
                <span>
                  <Workflow size={16} />
                  Live agent progress over SSE
                </span>
                <span>
                  <FileImage size={16} />
                  DALL-E 3 image generation
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="workflow" className="hiw-section hiw-workflow-section">
        <div className="hiw-shell">
          <div className="hiw-workflow-board">
            <div className="hiw-workflow-top">
              <div className="hiw-heading hiw-heading-left hiw-workflow-heading">
                <p className="hiw-section-label">Workflow</p>
                <h2 className="hiw-section-title">From user input to classroom-ready output</h2>
                <p className="hiw-section-sub">
                  The documented process is not a single prompt-response jump. It is a staged production flow
                  that separates planning, writing, practice, assessment, resources, visuals, validation, and
                  final formatting.
                </p>

                <div className="hiw-workflow-metrics">
                  {workflowMetrics.map((metric) => (
                    <article key={metric.label} className="hiw-workflow-metric">
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                    </article>
                  ))}
                </div>
              </div>

              <div className="hiw-workflow-showcase">
                <div className="hiw-workflow-visual">
                  <div className="hiw-workflow-frame">
                    <img src={processingImage} alt="Content Studio generation workflow preview" />
                  </div>

                  <div className="hiw-workflow-badge hiw-workflow-badge-a">
                    <img src={generatedLessonsImage} alt="Generated lessons screen preview" />
                    <div>
                      <strong>Real-time progress</strong>
                      <span>Users see the pipeline while it runs.</span>
                    </div>
                  </div>

                  <div className="hiw-workflow-badge hiw-workflow-badge-b">
                    <img src={teacherGuideImage} alt="Teacher resource preview" />
                    <div>
                      <strong>Teacher-ready output</strong>
                      <span>Resources and support materials are packaged in.</span>
                    </div>
                  </div>

                  <div className="hiw-workflow-pulse">
                    <span className="hiw-workflow-pulse-dot" />
                    SSE live updates
                  </div>
                </div>
              </div>
            </div>

            <div className="hiw-stage-grid">
              {workflowStages.map((stage) => (
                <article key={stage.number} className="hiw-stage-card">
                  <div className="hiw-stage-head">
                    <span className="hiw-stage-num">{stage.number}</span>
                    <span className="hiw-stage-icon">{stage.icon}</span>
                    <h3>{stage.title}</h3>
                  </div>
                  <p>{stage.text}</p>
                  <ul>
                    {stage.bullets.map((bullet) => (
                      <li key={bullet}>
                        <CheckCircle2 size={16} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hiw-section hiw-section-alt">
        <div className="hiw-shell">
          <div className="hiw-heading">
            <p className="hiw-section-label">Agent System</p>
            <h2 className="hiw-section-title">The eight documented agents and what each one contributes</h2>
            <p className="hiw-section-sub">
              Each agent owns a specific responsibility so the overall output is more structured, faster to
              produce, and easier to quality-check than a single-pass generation flow.
            </p>
          </div>

          <div className="hiw-agent-grid">
            {agentCards.map((agent) => (
              <article key={agent.title} className="hiw-agent-card">
                <div className="hiw-agent-media">
                  <img src={agent.image} alt={agent.imageAlt} />
                </div>
                <div className="hiw-agent-head">
                  <div className="hiw-agent-icon">{agent.icon}</div>
                  <h3>{agent.title}</h3>
                </div>
                <p>{agent.text}</p>
                <div className="hiw-agent-tags">
                  {agent.outputs.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hiw-section">
        <div className="hiw-shell">
          <div className="hiw-heading">
            <p className="hiw-section-label">Modes And Pages</p>
            <h2 className="hiw-section-title">How the workflow expands across lesson mode, textbook mode, and the app screens</h2>
            <p className="hiw-section-sub">
              Your documentation distinguishes between the core lesson pipeline and the larger textbook flow,
              while also mapping where users see the process across the application.
            </p>
          </div>

          <div className="hiw-mode-grid">
            {modeCards.map((mode) => (
              <article key={mode.label} className="hiw-mode-card">
                <div className="hiw-mode-media">
                  <img src={mode.image} alt={mode.imageAlt} />
                </div>
                <div className="hiw-mode-head">
                  <span className="hiw-mode-icon">{mode.icon}</span>
                  <div>
                    <p className="hiw-mode-label">{mode.label}</p>
                    <h3>{mode.title}</h3>
                  </div>
                </div>
                <p className="hiw-mode-text">{mode.text}</p>
                <p className="hiw-mode-meta">{mode.meta}</p>
                <ul>
                  {mode.bullets.map((bullet) => (
                    <li key={bullet}>
                      <CheckCircle2 size={16} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="hiw-page-flow">
            {pageCards.map((page) => (
              <article key={page.route} className="hiw-page-card">
                <div className="hiw-page-media">
                  <img src={page.image} alt={page.imageAlt} />
                </div>
                <div className="hiw-page-head">
                  <div className="hiw-page-icon">{page.icon}</div>
                  <div>
                    <h3>{page.title}</h3>
                  </div>
                </div>
                <p>{page.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hiw-section hiw-section-alt">
        <div className="hiw-shell">
          <div className="hiw-heading">
            <p className="hiw-section-label">FAQ</p>
            <h2 className="hiw-section-title">Common workflow questions answered by the documentation</h2>
            <p className="hiw-section-sub">
              These answers reflect the current documented behavior of the application rather than future
              roadmap ideas.
            </p>
          </div>

          <div className="hiw-faq-grid">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={item.question} className={`hiw-faq-item${isOpen ? ' is-open' : ''}`}>
                  <button type="button" className="hiw-faq-question" onClick={() => setOpenFaq(isOpen ? -1 : index)}>
                    <span>{item.question}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && <div className="hiw-faq-answer">{item.answer}</div>}
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
              <p className="hiw-section-label hiw-section-label-light">Ready To Build</p>
              <h2>Move from configuration to finished educational content in one workflow.</h2>
              <p>
                Open the generator, choose the classroom context, add your prompt, and let the documented
                multi-agent system build the lesson package for you.
              </p>
            </div>
            <button type="button" className="hiw-btn hiw-btn-primary" onClick={() => navigate('/generator')}>
              Start Creating
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HowItWorks;
