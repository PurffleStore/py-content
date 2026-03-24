import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePresentation, BACKEND_URL } from '../utils/api';
import logo from '../assets/images/py-logo.png';
import './Presentation.css';

const imgSrc = (url) => url ? `${BACKEND_URL}${url}` : null;

/* ─── Colour palettes per slide colour key ─── */
const PALETTES = {
  blue:   { bg: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)', text: '#fff', accent: '#93c5fd' },
  purple: { bg: 'linear-gradient(135deg,#4c1d95 0%,#7c3aed 100%)', text: '#fff', accent: '#c4b5fd' },
  green:  { bg: 'linear-gradient(135deg,#14532d 0%,#16a34a 100%)', text: '#fff', accent: '#86efac' },
  orange: { bg: 'linear-gradient(135deg,#92400e 0%,#f59e0b 100%)', text: '#fff', accent: '#fde68a' },
  teal:   { bg: 'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)', text: '#fff', accent: '#99f6e4' },
  red:    { bg: 'linear-gradient(135deg,#7f1d1d 0%,#dc2626 100%)', text: '#fff', accent: '#fca5a5' },
  indigo: { bg: 'linear-gradient(135deg,#312e81 0%,#6366f1 100%)', text: '#fff', accent: '#a5b4fc' },
  rose:   { bg: 'linear-gradient(135deg,#881337 0%,#f43f5e 100%)', text: '#fff', accent: '#fda4af' },
};
const getPalette = c => PALETTES[c] || PALETTES.blue;

/* ─── Individual slide renderer ─── */
function SlideRenderer({ slide, index, total }) {
  const pal = getPalette(slide.color);
  const [revealed, setRevealed] = useState(false);           // for single quiz
  const [revealedSet, setRevealedSet] = useState(new Set()); // for multi-quiz — must be top-level!
  const image = imgSrc(slide.imageUrl);

  const revealOne = (i) => setRevealedSet(prev => new Set([...prev, i]));

  const slideNum = (
    <div style={{ position:'absolute', top:14, right:16, fontSize:11, opacity:0.7, fontWeight:700,
      background:'rgba(0,0,0,0.25)', borderRadius:20, padding:'3px 10px', zIndex:2 }}>
      {index + 1} / {total}
    </div>
  );

  // ── Title slide — full image background + text overlay ──
  if (slide.type === 'title') return (
    <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden',
      background: pal.bg, fontFamily:"'DM Sans','Inter',system-ui,sans-serif" }}>
      {image && (
        <img src={image} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%',
          objectFit:'cover', opacity:0.45 }} />
      )}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)' }} />
      {slideNum}
      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', height:'100%', padding:'40px 48px', textAlign:'center', color:'#fff' }}>
        <div style={{ fontSize:'clamp(2.5rem,7vw,4.5rem)', marginBottom:12, lineHeight:1 }}>{slide.emoji}</div>
        <h1 style={{ fontSize:'clamp(1.6rem,4vw,2.8rem)', fontWeight:900, margin:'0 0 14px',
          lineHeight:1.15, letterSpacing:'-0.02em', textShadow:'0 2px 8px rgba(0,0,0,0.5)' }}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p style={{ fontSize:'clamp(0.95rem,2.2vw,1.3rem)', opacity:0.9, margin:0, fontWeight:500,
            background:'rgba(255,255,255,0.12)', padding:'8px 20px', borderRadius:20 }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      <div style={{ position:'absolute', bottom:14, left:0, right:0, textAlign:'center',
        fontSize:11, opacity:0.55, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#fff' }}>
        Py-Content · Grade {slide.grade || ''}
      </div>
    </div>
  );

  // ── Visual slide — large image + caption ──
  if (slide.type === 'visual') return (
    <div style={{ width:'100%', height:'100%', background: pal.bg, position:'relative', overflow:'hidden',
      display:'flex', flexDirection:'column', fontFamily:"'DM Sans','Inter',system-ui,sans-serif", color:'#fff' }}>
      {slideNum}
      <div style={{ padding:'16px 24px 8px', textAlign:'center', zIndex:1 }}>
        <h2 style={{ fontSize:'clamp(1.1rem,2.8vw,1.7rem)', fontWeight:800, margin:0,
          letterSpacing:'-0.01em', textShadow:'0 1px 4px rgba(0,0,0,0.4)' }}>{slide.title}</h2>
      </div>
      <div style={{ flex:1, position:'relative', overflow:'hidden', margin:'0 16px' }}>
        {image ? (
          <img src={image} alt={slide.title} style={{ width:'100%', height:'100%', objectFit:'cover',
            borderRadius:12, display:'block' }} />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'clamp(4rem,12vw,7rem)' }}>{slide.visual || slide.emoji}</div>
        )}
      </div>
      {slide.caption && (
        <div style={{ padding:'10px 20px 16px', textAlign:'center', zIndex:1 }}>
          <p style={{ fontSize:'clamp(0.85rem,2vw,1.1rem)', lineHeight:1.5, margin:0, opacity:0.95,
            background:'rgba(0,0,0,0.25)', borderRadius:10, padding:'8px 16px', display:'inline-block' }}>
            {slide.caption}
          </p>
        </div>
      )}
    </div>
  );

  // ── Quiz slide — image top-right, question + options ──
  if (slide.type === 'quiz') return (
    <div style={{ width:'100%', height:'100%', background: pal.bg, position:'relative', overflow:'hidden',
      display:'flex', fontFamily:"'DM Sans','Inter',system-ui,sans-serif", color:'#fff' }}>
      {slideNum}
      {/* Left: question + options */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'24px 20px 24px 32px', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <span style={{ fontSize:22 }}>{slide.emoji || '🧠'}</span>
          <h2 style={{ fontSize:'clamp(1rem,2.5vw,1.45rem)', fontWeight:800, margin:0 }}>{slide.title || 'Quick Quiz!'}</h2>
        </div>
        <p style={{ fontSize:'clamp(0.9rem,2.2vw,1.15rem)', fontWeight:600, margin:'0 0 16px',
          background:'rgba(255,255,255,0.15)', padding:'10px 16px', borderRadius:10, lineHeight:1.4 }}>
          {slide.question}
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {(slide.options || []).map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isCorrect = revealed && opt === slide.answer;
            return (
              <div key={i} onClick={() => setRevealed(true)}
                style={{ background: isCorrect ? 'rgba(134,239,172,0.35)' : 'rgba(255,255,255,0.15)',
                  border: isCorrect ? '2px solid #86efac' : '2px solid rgba(255,255,255,0.25)',
                  borderRadius:8, padding:'8px 12px', cursor:'pointer',
                  fontSize:'clamp(0.78rem,1.8vw,0.9rem)', fontWeight:600,
                  display:'flex', alignItems:'center', gap:6, transition:'all 0.2s' }}>
                <span style={{ background:'rgba(255,255,255,0.2)', borderRadius:'50%', width:20, height:20,
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, fontWeight:800, flexShrink:0 }}>{letter}</span>
                {opt}{isCorrect && <span style={{ marginLeft:'auto' }}>✓</span>}
              </div>
            );
          })}
        </div>
        {!revealed && <p style={{ marginTop:8, fontSize:11, opacity:0.6 }}>Click an option to reveal</p>}
      </div>
      {/* Right: image */}
      {image && (
        <div style={{ width:'38%', flexShrink:0, position:'relative', overflow:'hidden' }}>
          <img src={image} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', opacity:0.75 }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,0,0,0.4), transparent)' }} />
        </div>
      )}
    </div>
  );

  // ── Summary slide — image background, bullet list ──
  if (slide.type === 'summary') return (
    <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden',
      background: pal.bg, fontFamily:"'DM Sans','Inter',system-ui,sans-serif" }}>
      {image && (
        <img src={image} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%',
          objectFit:'cover', opacity:0.3 }} />
      )}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)' }} />
      {slideNum}
      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', height:'100%', padding:'32px 40px', color:'#fff' }}>
        <div style={{ fontSize:36, marginBottom:10 }}>{slide.emoji}</div>
        <h2 style={{ fontSize:'clamp(1.3rem,3.2vw,2rem)', fontWeight:800, margin:'0 0 20px',
          letterSpacing:'-0.01em', textAlign:'center', textShadow:'0 2px 6px rgba(0,0,0,0.4)' }}>
          {slide.title}
        </h2>
        <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column',
          gap:10, maxWidth:500, width:'100%' }}>
          {(slide.bullets || []).map((b, i) => (
            <li key={i} style={{ background:'rgba(255,255,255,0.18)', backdropFilter:'blur(4px)',
              borderRadius:10, padding:'9px 16px', fontSize:'clamp(0.88rem,2.1vw,1rem)',
              fontWeight:500, textAlign:'left', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color: pal.accent, fontWeight:800, fontSize:16 }}>✓</span> {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // ── Experiment slide — Objective / Activity / Conclusion cards ──
  if (slide.type === 'experiment') return (
    <div style={{ width:'100%', height:'100%', background: pal.bg, position:'relative', overflow:'hidden',
      display:'flex', flexDirection:'column', fontFamily:"'DM Sans','Inter',system-ui,sans-serif", color:'#fff', padding:'18px 22px 14px' }}>
      {slideNum}
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14,
        background:'rgba(255,255,255,0.18)', borderRadius:12, padding:'10px 16px', flexShrink:0 }}>
        <span style={{ fontSize:'1.8rem', flexShrink:0 }}>{slide.emoji || '🧪'}</span>
        <h2 style={{ margin:0, fontSize:'clamp(1.05rem,2.5vw,1.5rem)', fontWeight:800, letterSpacing:'-0.01em' }}>
          {slide.title}
        </h2>
        {image && (
          <img src={image} alt="" style={{ marginLeft:'auto', width:70, height:52, objectFit:'cover',
            borderRadius:8, opacity:0.85, flexShrink:0 }} />
        )}
      </div>
      {/* Three cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, flex:1 }}>
        {slide.objective && (
          <div style={{ background:'rgba(255,255,255,0.14)', borderRadius:10, padding:'9px 14px',
            borderLeft:`4px solid ${pal.accent}`, flex:1 }}>
            <div style={{ color: pal.accent, fontWeight:800, fontSize:'0.75rem', marginBottom:3,
              textTransform:'uppercase', letterSpacing:'0.08em' }}>🎯 Objective</div>
            <div style={{ fontSize:'clamp(0.8rem,1.9vw,0.95rem)', lineHeight:1.5 }}>{slide.objective}</div>
          </div>
        )}
        {slide.activity && (
          <div style={{ background:'rgba(255,255,255,0.14)', borderRadius:10, padding:'9px 14px',
            borderLeft:`4px solid ${pal.accent}`, flex:1 }}>
            <div style={{ color: pal.accent, fontWeight:800, fontSize:'0.75rem', marginBottom:3,
              textTransform:'uppercase', letterSpacing:'0.08em' }}>🧪 Activity</div>
            <div style={{ fontSize:'clamp(0.8rem,1.9vw,0.95rem)', lineHeight:1.5 }}>{slide.activity}</div>
          </div>
        )}
        {slide.conclusion && (
          <div style={{ background:'rgba(255,255,255,0.14)', borderRadius:10, padding:'9px 14px',
            borderLeft:`4px solid ${pal.accent}`, flex:1 }}>
            <div style={{ color: pal.accent, fontWeight:800, fontSize:'0.75rem', marginBottom:3,
              textTransform:'uppercase', letterSpacing:'0.08em' }}>✅ Conclusion</div>
            <div style={{ fontSize:'clamp(0.8rem,1.9vw,0.95rem)', lineHeight:1.5 }}>{slide.conclusion}</div>
          </div>
        )}
        {slide.tryThis && (
          <div style={{ background:'rgba(255,220,50,0.2)', borderRadius:10, padding:'7px 14px',
            borderLeft:'4px solid #fde68a', flexShrink:0 }}>
            <span style={{ color:'#fde68a', fontWeight:700, fontSize:'0.75rem' }}>💡 Try This! </span>
            <span style={{ fontSize:'clamp(0.75rem,1.7vw,0.88rem)', opacity:0.95 }}>{slide.tryThis}</span>
          </div>
        )}
      </div>
    </div>
  );

  // ── Multi-quiz slide — multiple questions with reveal ──
  if (slide.type === 'multi-quiz') return (
      <div style={{ width:'100%', height:'100%', background: pal.bg, position:'relative', overflow:'hidden',
        display:'flex', flexDirection:'column', fontFamily:"'DM Sans','Inter',system-ui,sans-serif", color:'#fff',
        padding:'14px 20px 10px' }}>
        {slideNum}
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, flexShrink:0 }}>
          <span style={{ fontSize:'1.6rem' }}>{slide.emoji || '🧠'}</span>
          <h2 style={{ margin:0, fontSize:'clamp(1rem,2.5vw,1.4rem)', fontWeight:800 }}>{slide.title || 'Science Quiz!'}</h2>
          {image && (
            <img src={image} alt="" style={{ marginLeft:'auto', width:64, height:48, objectFit:'cover',
              borderRadius:8, opacity:0.8, flexShrink:0 }} />
          )}
        </div>
        {/* Questions */}
        <div style={{ display:'flex', flexDirection:'column', gap:7, flex:1, overflowY:'auto' }}>
          {(slide.questions || []).map((qObj, qi) => {
            const isRev = revealedSet.has(qi);
            return (
              <div key={qi} style={{ background:'rgba(255,255,255,0.13)', borderRadius:10, padding:'8px 12px',
                border: isRev ? `2px solid ${pal.accent}` : '2px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontWeight:700, fontSize:'clamp(0.78rem,1.8vw,0.92rem)', marginBottom:5,
                  display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                  <span>{qi + 1}. {qObj.q}</span>
                  {!isRev && (
                    <button onClick={() => revealOne(qi)}
                      style={{ background: pal.accent, color:'#1a1a2e', border:'none', borderRadius:6,
                        padding:'2px 9px', fontSize:10, fontWeight:800, cursor:'pointer', flexShrink:0 }}>
                      Reveal
                    </button>
                  )}
                  {isRev && <span style={{ color: pal.accent, fontSize:10, fontWeight:700, flexShrink:0 }}>✓ {qObj.answer}</span>}
                </div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {(qObj.options || []).map((opt, oi) => {
                    const letter = String.fromCharCode(65 + oi);
                    const isAns = isRev && opt === qObj.answer;
                    return (
                      <span key={oi} style={{ fontSize:'clamp(0.68rem,1.5vw,0.78rem)', padding:'2px 8px',
                        background: isAns ? 'rgba(134,239,172,0.35)' : 'rgba(255,255,255,0.12)',
                        border: isAns ? '1px solid #86efac' : '1px solid rgba(255,255,255,0.2)',
                        borderRadius:5, fontWeight: isAns ? 700 : 400 }}>
                        {letter}. {opt}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {!revealedSet.size && (
          <p style={{ margin:'6px 0 0', fontSize:10, opacity:0.55, textAlign:'center', flexShrink:0 }}>Click "Reveal" on each question to show the answer</p>
        )}
      </div>
  );

  // ── Default: content slide — left text, right image ──
  return (
    <div style={{ width:'100%', height:'100%', background: pal.bg, position:'relative', overflow:'hidden',
      display:'flex', fontFamily:"'DM Sans','Inter',system-ui,sans-serif", color:'#fff' }}>
      {slideNum}
      {/* Left: title + bullets */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'24px 20px 24px 32px', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <span style={{ fontSize:26 }}>{slide.emoji}</span>
          <h2 style={{ fontSize:'clamp(1.1rem,2.8vw,1.65rem)', fontWeight:800, margin:0,
            letterSpacing:'-0.01em' }}>{slide.title}</h2>
        </div>
        <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:8 }}>
          {(slide.bullets || []).map((b, i) => (
            <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:10,
              background:'rgba(255,255,255,0.13)', borderRadius:8, padding:'9px 14px',
              fontSize:'clamp(0.82rem,2vw,0.98rem)', fontWeight:500, lineHeight:1.45 }}>
              <span style={{ color: pal.accent, fontWeight:900, fontSize:16, flexShrink:0, marginTop:1 }}>▸</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
      {/* Right: image */}
      {image ? (
        <div style={{ width:'42%', flexShrink:0, position:'relative', overflow:'hidden' }}>
          <img src={image} alt={slide.title} style={{ position:'absolute', inset:0, width:'100%',
            height:'100%', objectFit:'cover' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,0,0,0.3), transparent)' }} />
        </div>
      ) : (
        <div style={{ width:'35%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'clamp(3rem,8vw,5rem)' }}>{slide.emoji}</div>
      )}
    </div>
  );
}

/* ─── PPTX Download using pptxgenjs ─── */
async function downloadPPTX(presentation) {
  const pptxgen = (await import('pptxgenjs')).default;
  const prs = new pptxgen();
  prs.layout = 'LAYOUT_WIDE'; // 16:9

  (presentation.slides || []).forEach(slide => {
    const pal = getPalette(slide.color);
    const sld = prs.addSlide();

    // Gradient background via fill color (approximate with solid)
    const bgColors = { blue:'1e3a8a', purple:'4c1d95', green:'14532d', orange:'92400e', teal:'134e4a', red:'7f1d1d', indigo:'312e81', rose:'881337' };
    sld.background = { color: bgColors[slide.color] || '1e3a8a' };

    const textOpts = { color:'FFFFFF', fontFace:'Arial', bold:false };

    if (slide.type === 'title') {
      sld.addText(slide.emoji || '', { x:0, y:0.8, w:'100%', align:'center', fontSize:60 });
      sld.addText(slide.title || '', { x:0.5, y:2.2, w:12, align:'center', fontSize:32, bold:true, ...textOpts });
      if (slide.subtitle) sld.addText(slide.subtitle, { x:0.5, y:3.3, w:12, align:'center', fontSize:20, color:'CCDDFF', fontFace:'Arial' });

    } else if (slide.type === 'visual') {
      sld.addText(slide.title || '', { x:0.5, y:0.4, w:12, align:'center', fontSize:24, bold:true, ...textOpts });
      sld.addText(slide.visual || slide.emoji || '', { x:0, y:1.2, w:'100%', align:'center', fontSize:80 });
      if (slide.caption) sld.addText(slide.caption, { x:1.5, y:4, w:10, align:'center', fontSize:18, color:'DDFFFF', fontFace:'Arial', italic:true });

    } else if (slide.type === 'quiz') {
      sld.addText(slide.title || 'Quick Quiz!', { x:0.5, y:0.3, w:12, align:'center', fontSize:26, bold:true, ...textOpts });
      sld.addText(slide.question || '', { x:1, y:1.1, w:11, align:'center', fontSize:20, color:'FFEECC', fontFace:'Arial', bold:true });
      (slide.options || []).forEach((opt, i) => {
        const x = i % 2 === 0 ? 0.5 : 6.8;
        const y = 2.4 + Math.floor(i / 2) * 1.0;
        const letter = String.fromCharCode(65 + i);
        sld.addText(`${letter}. ${opt}`, { x, y, w:5.8, h:0.8, align:'left', fontSize:17, color:'FFFFFF', fontFace:'Arial',
          fill:{ color:'FFFFFF', transparency:85 }, line:{color:'FFFFFF', transparency:50, width:1}, margin:8 });
      });
      sld.addText(`✓ Answer: ${slide.answer}`, { x:0.5, y:4.7, w:12, align:'center', fontSize:16, color:'86EFAC', fontFace:'Arial', italic:true });

    } else if (slide.type === 'experiment') {
      sld.addText((slide.emoji || '🧪') + '  ' + (slide.title || ''), {
        x:0.4, y:0.25, w:12.5, h:0.7, fontSize:22, bold:true, ...textOpts,
        fill:{ color:'FFFFFF', transparency:82 }, margin:6, line:{ color:'FFFFFF', transparency:60, width:1 }
      });
      const sections = [
        { label:'🎯 OBJECTIVE', val: slide.objective },
        { label:'🧪 ACTIVITY',  val: slide.activity },
        { label:'✅ CONCLUSION', val: slide.conclusion },
      ].filter(s => s.val);
      sections.forEach((sec, i) => {
        const y = 1.15 + i * 1.2;
        sld.addText(sec.label, { x:0.4, y, w:12.5, h:0.32, fontSize:12, bold:true, color:'AADDFF', fontFace:'Arial' });
        sld.addText(sec.val, { x:0.4, y: y + 0.32, w:12.5, h:0.78, fontSize:16, ...textOpts,
          fill:{ color:'FFFFFF', transparency:88 }, margin:6, line:{ color:'FFFFFF', transparency:60, width:1 } });
      });
      if (slide.tryThis) {
        sld.addText(`💡 Try This: ${slide.tryThis}`, { x:0.4, y:4.8, w:12.5, h:0.45, fontSize:14,
          color:'FFE680', fontFace:'Arial', italic:true });
      }

    } else if (slide.type === 'multi-quiz') {
      sld.addText((slide.emoji || '🧠') + '  ' + (slide.title || 'Science Quiz!'), {
        x:0.5, y:0.25, w:12, align:'center', fontSize:24, bold:true, ...textOpts
      });
      (slide.questions || []).forEach((qObj, qi) => {
        const y = 1.0 + qi * 0.88;
        const opts = (qObj.options || []).map((o, oi) => `${String.fromCharCode(65+oi)}. ${o}`).join('   ');
        sld.addText(`${qi+1}. ${qObj.q}`, { x:0.4, y, w:12.5, h:0.4, fontSize:15, bold:true, ...textOpts });
        sld.addText(opts + `   ✓ ${qObj.answer}`, { x:0.4, y: y + 0.4, w:12.5, h:0.38, fontSize:12,
          color:'CCFFCC', fontFace:'Arial', italic:true });
      });

    } else {
      // content / summary
      sld.addText(slide.emoji || '', { x:0, y:0.3, w:'100%', align:'center', fontSize:36 });
      sld.addText(slide.title || '', { x:0.5, y:0.9, w:12, align:'center', fontSize:26, bold:true, ...textOpts });
      (slide.bullets || []).forEach((b, i) => {
        sld.addText(`▸  ${b}`, { x:1, y:1.8 + i * 0.72, w:11, fontSize:18, color:'FFFFFF', fontFace:'Arial',
          fill:{ color:'FFFFFF', transparency:88 }, line:{color:'FFFFFF', transparency:60, width:1}, margin:8 });
      });
    }

    // Slide number
    sld.addText(`${(presentation.slides.indexOf(slide) + 1)} / ${presentation.slides.length}`, {
      x:11.5, y:0.1, w:1.3, h:0.3, align:'right', fontSize:11, color:'AAAACC', fontFace:'Arial'
    });
  });

  const slug = (presentation.title || 'presentation').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  await prs.writeFile({ fileName: `${slug}.pptx` });
}

/* ─── MAIN PAGE ─── */
export default function Presentation() {
  const navigate = useNavigate();

  // Input state
  const [topic,      setTopic]      = useState('');
  const [grade,      setGrade]      = useState('3');
  const [subject,    setSubject]    = useState('English');
  const [slideCount, setSlideCount] = useState('8');
  const [style,      setStyle]      = useState('colorful');
  const [extraText,  setExtraText]  = useState('');
  const [file,       setFile]       = useState(null);
  const [fileName,   setFileName]   = useState('');

  // Presentation state
  const [generating,   setGenerating]   = useState(false);
  const [error,        setError]        = useState('');
  const [presentation, setPresentation] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreen,   setFullscreen]   = useState(false);
  const [downloading,  setDownloading]  = useState(false);

  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) { setError('Please enter a topic or prompt.'); return; }
    setError('');
    setGenerating(true);
    setPresentation(null);
    setCurrentSlide(0);

    try {
      const fd = new FormData();
      fd.append('topic',      topic.trim());
      fd.append('grade',      grade);
      fd.append('subject',    subject);
      fd.append('slideCount', slideCount);
      fd.append('style',      style);
      fd.append('extraText',  extraText);
      if (file) fd.append('file', file);

      const data = await generatePresentation(fd);
      setPresentation(data.presentation);
    } catch (err) {
      setError(err.message || 'Failed to generate presentation.');
    } finally {
      setGenerating(false);
    }
  };

  const go = useCallback((dir) => {
    if (!presentation) return;
    setCurrentSlide(i => Math.max(0, Math.min(presentation.slides.length - 1, i + dir)));
  }, [presentation]);

  const handleDownload = async () => {
    if (!presentation || downloading) return;
    setDownloading(true);
    try { await downloadPPTX(presentation); }
    catch (e) { alert('Download failed: ' + e.message); }
    finally { setDownloading(false); }
  };

  const slides = presentation?.slides || [];
  const slide  = slides[currentSlide];

  return (
    <div className="pres-root">

      {/* ── Navbar ── */}
      <header className="pres-navbar">
        <div className="pres-nav-logo" onClick={() => navigate('/')}>
          <img src={logo} alt="Py-Content" className="pres-nav-logo-img" />
          <span className="pres-nav-logo-text">
            <span className="pres-logo-dark">Py-</span>
            <span className="pres-logo-blue">Content</span>
          </span>
        </div>
        <nav className="pres-nav-crumb">
          <button className="pres-crumb-btn" onClick={() => navigate('/generated-lessons')}>Generated Lessons</button>
          <span className="pres-crumb-sep">›</span>
          <span className="pres-crumb-cur">Presentation Builder</span>
        </nav>
        <div className="pres-nav-actions">
          <button className="pres-nav-btn pres-btn-ghost" onClick={() => navigate(-1)}>← Back</button>
          {presentation && (
            <button className="pres-nav-btn pres-btn-primary" onClick={handleDownload} disabled={downloading}>
              {downloading ? '⏳ Exporting…' : '⬇ Download PPTX'}
            </button>
          )}
        </div>
      </header>

      {/* ── Two-column layout ── */}
      <div className="pres-layout">

        {/* ══ LEFT PANEL — Input ══ */}
        <aside className="pres-left">
          <div className="pres-left-inner">

            <div className="pres-panel-title">
              <span className="pres-panel-icon">🎨</span> Build Presentation
            </div>

            {/* Topic */}
            <div className="pres-field">
              <label className="pres-label">Topic / Prompt <span className="pres-required">*</span></label>
              <textarea
                className="pres-textarea"
                rows={3}
                placeholder="e.g. Maya's Magic Story · Types of Animals · The Water Cycle"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </div>

            {/* Grade + Subject */}
            <div className="pres-row">
              <div className="pres-field pres-field-half">
                <label className="pres-label">Grade</label>
                <select className="pres-select" value={grade} onChange={e => setGrade(e.target.value)}>
                  {['K','1','2','3','4','5','6','7','8'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>
              <div className="pres-field pres-field-half">
                <label className="pres-label">Subject</label>
                <select className="pres-select" value={subject} onChange={e => setSubject(e.target.value)}>
                  {['English','Math','Science','Social Studies','History','Art','General'].map(s =>
                    <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Slides + Style */}
            <div className="pres-row">
              <div className="pres-field pres-field-half">
                <label className="pres-label">Slides</label>
                <select className="pres-select" value={slideCount} onChange={e => setSlideCount(e.target.value)}>
                  {['5','6','8','10','12','15'].map(n => <option key={n} value={n}>{n} slides</option>)}
                </select>
              </div>
              <div className="pres-field pres-field-half">
                <label className="pres-label">Style</label>
                <select className="pres-select" value={style} onChange={e => setStyle(e.target.value)}>
                  <option value="colorful">🌈 Colorful</option>
                  <option value="minimal">⚪ Minimal</option>
                  <option value="bold">💪 Bold</option>
                  <option value="fun">🎉 Fun</option>
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div className="pres-field">
              <label className="pres-label">Upload Document <span className="pres-hint">(PDF, Word, TXT)</span></label>
              <div className="pres-upload-box" onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFile} style={{ display:'none' }} />
                {fileName ? (
                  <span className="pres-upload-file">📄 {fileName}
                    <button className="pres-upload-clear" onClick={e => { e.stopPropagation(); setFile(null); setFileName(''); }}>✕</button>
                  </span>
                ) : (
                  <span className="pres-upload-hint">Click to upload · PDF, Word, or TXT<br/><span style={{fontSize:11,opacity:0.6}}>Content will be used to enrich slides</span></span>
                )}
              </div>
            </div>

            {/* Extra text/prompt */}
            <div className="pres-field">
              <label className="pres-label">Extra Notes / Paste Content <span className="pres-hint">(optional)</span></label>
              <textarea
                className="pres-textarea"
                rows={4}
                placeholder="Paste lesson content, story text, or additional instructions…"
                value={extraText}
                onChange={e => setExtraText(e.target.value)}
              />
            </div>

            {error && <div className="pres-error">{error}</div>}

            <button
              className="pres-generate-btn"
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
            >
              {generating ? (
                <><span className="pres-spinner" /> Generating Slides…</>
              ) : (
                <>✨ Generate Presentation</>
              )}
            </button>

            {/* Stats when done */}
            {presentation && (
              <div className="pres-stats">
                <div className="pres-stat"><span>{slides.length}</span>Slides</div>
                <div className="pres-stat">
                  <span>{slides.filter(s => s.type==='experiment').length || slides.filter(s => s.type==='quiz' || s.type==='multi-quiz').length}</span>
                  {slides.some(s => s.type==='experiment') ? 'Experiments' : 'Quiz Slides'}
                </div>
                <div className="pres-stat"><span>Grade {presentation.grade}</span>Level</div>
              </div>
            )}

          </div>
        </aside>

        {/* ══ RIGHT PANEL — Slide Viewer ══ */}
        <main className="pres-right">

          {!presentation && !generating && (
            <div className="pres-empty">
              <div className="pres-empty-icon">🎯</div>
              <h2 className="pres-empty-title">Your Presentation Appears Here</h2>
              <p className="pres-empty-sub">Enter a topic, choose your settings, and click <strong>Generate Presentation</strong>. Each slide will appear with full colour, content, and an interactive quiz.</p>
              <div className="pres-empty-features">
                {['📖 Story-based slides', '🧠 Quiz interactions', '🎨 Colorful themes', '⬇ PPTX download'].map(f => (
                  <span key={f} className="pres-empty-feat">{f}</span>
                ))}
              </div>
            </div>
          )}

          {generating && (
            <div className="pres-generating">
              <div className="pres-gen-spinner" />
              <p className="pres-gen-text">Building your slides…</p>
              <p className="pres-gen-sub">Building content, colours, quiz questions and speaker notes</p>
            </div>
          )}

          {presentation && slide && (
            <div className={`pres-viewer ${fullscreen ? 'pres-viewer-fullscreen' : ''}`}>

              {/* Slide canvas */}
              <div className="pres-slide-canvas">
                <SlideRenderer slide={{...slide, grade: presentation.grade}} index={currentSlide} total={slides.length} />
              </div>

              {/* Controls */}
              <div className="pres-controls">
                <button className="pres-ctrl-btn" onClick={() => go(-1)} disabled={currentSlide === 0}>‹ Prev</button>

                <div className="pres-dots">
                  {slides.map((s, i) => (
                    <button
                      key={i}
                      className={`pres-dot ${i === currentSlide ? 'pres-dot-active' : ''}`}
                      onClick={() => setCurrentSlide(i)}
                      title={s.title}
                    />
                  ))}
                </div>

                <button className="pres-ctrl-btn" onClick={() => go(1)} disabled={currentSlide === slides.length - 1}>Next ›</button>
              </div>

              {/* Speaker notes */}
              {slide.speakerNotes && (
                <div className="pres-notes">
                  <span className="pres-notes-label">🎤 Speaker Notes</span>
                  {slide.speakerNotes}
                </div>
              )}

              {/* Slide strip thumbnail */}
              <div className="pres-strip">
                {slides.map((s, i) => {
                  const pal = getPalette(s.color);
                  return (
                    <button
                      key={i}
                      className={`pres-thumb ${i === currentSlide ? 'pres-thumb-active' : ''}`}
                      onClick={() => setCurrentSlide(i)}
                      style={{ background: pal.bg }}
                    >
                      <span className="pres-thumb-emoji">{s.emoji || s.visual || '📄'}</span>
                      <span className="pres-thumb-title">{s.title?.substring(0, 18) || ''}</span>
                      <span className="pres-thumb-type">{s.type}</span>
                    </button>
                  );
                })}
              </div>

              {/* Download row */}
              <div className="pres-download-row">
                <button className="pres-dl-btn" onClick={handleDownload} disabled={downloading}>
                  {downloading ? '⏳ Exporting…' : '⬇ Download as PowerPoint (.pptx)'}
                </button>
              </div>

            </div>
          )}
        </main>

      </div>
    </div>
  );
}
