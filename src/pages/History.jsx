import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, getHistoryLesson, deleteHistoryLesson, BACKEND_URL } from '../utils/api';
import { Trash2, Eye, BookOpen, RefreshCw, Search, ChevronLeft } from 'lucide-react';
import logo from '../assets/images/py-logo.png';

/* ── scoped styles ── */
const CSS = `
  .hist-root {
    min-height: 100vh;
    background: #FFF0F5;
    font-family: 'Source Serif 4', Georgia, serif;
    -webkit-font-smoothing: antialiased;
  }

  /* top bar */
  .hist-topbar {
    background: #EFF6FF;
    border-bottom: 1px solid #BFDBFE;
    padding: 0 16px;
    height: 62px;
    display: flex; align-items: center; gap: 10px;
    position: sticky; top: 0; z-index: 50;
    font-family: 'DM Sans', 'Inter', system-ui, sans-serif;
  }
  .hist-topbar-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none;
  }
  .hist-topbar-logo img { height: 46px; object-fit: contain; }
  .hist-topbar-logo-text {
    display: flex; align-items: baseline; gap: 4px;
    font-family: 'Space Grotesk', 'DM Sans', system-ui, sans-serif;
    letter-spacing: -0.02em; font-size: 26px; line-height: 1;
  }
  .hist-topbar-logo-text .cs-content { font-weight: 800; color: #111827; }
  .hist-topbar-logo-text .cs-studio  { font-weight: 800; color: #2563EB; }
  .hist-back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    font-size: 14px; font-weight: 600; color: #475569;
    font-family: 'DM Sans', inherit; padding: 7px 14px; border-radius: 8px;
    margin-left: auto; transition: background 0.15s, color 0.15s;
  }
  .hist-back-btn:hover { background: #F8FAFC; color: #1E293B; }

  /* page content */
  .hist-body { max-width: 1200px; margin: 0 auto; padding: 32px 40px 80px; }
  .hist-header { margin-bottom: 28px; }
  .hist-title { font-size: 28px; font-weight: 800; color: #0F1923; margin: 0 0 6px; }
  .hist-subtitle { font-size: 14px; color: #7A8A96; margin: 0; }

  /* controls */
  .hist-controls {
    display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
  }
  .hist-search-wrap {
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 1px solid rgba(15,25,35,0.12);
    border-radius: 8px; padding: 8px 14px; flex: 1; max-width: 360px;
  }
  .hist-search-wrap svg { color: #7A8A96; flex-shrink: 0; }
  .hist-search-input {
    border: none; outline: none; font-size: 13px; width: 100%;
    font-family: 'Source Serif 4', Georgia, serif; color: #0F1923;
    background: transparent;
  }
  .hist-count { font-size: 13px; color: #7A8A96; margin-left: auto; }

  /* grid */
  .hist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  /* card */
  .hist-card {
    background: #fff;
    border: 1px solid rgba(15,25,35,0.10);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(15,25,35,0.07);
    transition: box-shadow 0.18s, transform 0.18s;
    display: flex; flex-direction: column;
  }
  .hist-card:hover { box-shadow: 0 6px 24px rgba(15,25,35,0.12); transform: translateY(-2px); }

  .hist-card-cover {
    height: 140px; width: 100%; object-fit: cover; display: block;
  }
  .hist-card-cover-placeholder {
    height: 140px;
    display: flex; align-items: center; justify-content: center;
    font-size: 40px;
  }

  .hist-card-body { padding: 16px 18px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .hist-card-title { font-size: 15px; font-weight: 700; color: #0F1923; margin: 0; line-height: 1.3; }
  .hist-card-pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .hist-pill {
    font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 4px;
  }
  .hist-pill-grade   { background: #E8F3FB; color: #005B99; }
  .hist-pill-subject { background: #E5F4F4; color: #0E7C7B; }
  .hist-pill-level   { background: #F4F6F9; color: #3D4E5C; border: 1px solid rgba(15,25,35,0.12); }
  .hist-card-meta { font-size: 12px; color: #7A8A96; margin-top: auto; padding-top: 4px; }
  .hist-card-chapter { font-size: 12px; color: #3D4E5C; }

  .hist-card-actions {
    padding: 12px 18px;
    border-top: 1px solid rgba(15,25,35,0.08);
    display: flex; gap: 8px;
  }
  .hist-btn-view {
    flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    background: #005B99; color: #fff; border: none; border-radius: 7px;
    padding: 8px 0; font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: 'Source Serif 4', Georgia, serif; transition: background 0.15s;
  }
  .hist-btn-view:hover { background: #0072BF; }
  .hist-btn-view:disabled { opacity: 0.5; cursor: not-allowed; }
  .hist-btn-delete {
    display: inline-flex; align-items: center; justify-content: center;
    background: none; border: 1px solid rgba(15,25,35,0.14); border-radius: 7px;
    padding: 8px 12px; cursor: pointer; color: #C0392B; transition: background 0.15s;
  }
  .hist-btn-delete:hover { background: #FDECEA; border-color: #f5c6c2; }

  /* empty state */
  .hist-empty {
    text-align: center; padding: 80px 20px; color: #7A8A96;
  }
  .hist-empty-icon { font-size: 56px; margin-bottom: 16px; }
  .hist-empty h3 { font-size: 20px; font-weight: 700; color: #3D4E5C; margin: 0 0 8px; }
  .hist-empty p  { font-size: 14px; margin: 0 0 24px; }
  .hist-empty-cta {
    display: inline-flex; align-items: center; gap: 8px;
    background: #005B99; color: #fff; border: none; border-radius: 8px;
    padding: 11px 24px; font-size: 14px; font-weight: 700; cursor: pointer;
    font-family: 'Source Serif 4', Georgia, serif;
  }
  .hist-empty-cta:hover { background: #0072BF; }

  /* loading / error */
  .hist-loading { text-align: center; padding: 60px; color: #7A8A96; font-size: 14px; }
  .hist-error {
    margin: 24px 0; padding: 14px 18px; background: #FDECEA; border: 1px solid #f5c6c2;
    border-radius: 8px; color: #C0392B; font-size: 13px; font-weight: 600;
  }

  /* confirm overlay */
  .hist-overlay {
    position: fixed; inset: 0; background: rgba(15,25,35,0.45); z-index: 200;
    display: flex; align-items: center; justify-content: center;
  }
  .hist-confirm {
    background: #fff; border-radius: 14px; padding: 28px 32px; max-width: 380px; width: 90%;
    box-shadow: 0 20px 60px rgba(15,25,35,0.2);
  }
  .hist-confirm h4 { margin: 0 0 8px; font-size: 17px; color: #0F1923; }
  .hist-confirm p  { margin: 0 0 20px; font-size: 14px; color: #7A8A96; }
  .hist-confirm-actions { display: flex; gap: 10px; justify-content: flex-end; }
  .hist-confirm-cancel {
    background: none; border: 1px solid rgba(15,25,35,0.18); border-radius: 7px;
    padding: 8px 18px; font-size: 13px; cursor: pointer; font-family: inherit; color: #3D4E5C;
  }
  .hist-confirm-del {
    background: #C0392B; color: #fff; border: none; border-radius: 7px;
    padding: 8px 18px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
  }
  .hist-confirm-del:hover { background: #a93226; }

  @media (max-width: 640px) {
    .hist-body { padding: 20px 16px 60px; }
    .hist-topbar { padding: 0 16px; }
    .hist-grid { grid-template-columns: 1fr; }
  }
`;

/* gradient backgrounds for cover placeholder */
const GRADIENTS = [
  'linear-gradient(135deg,#005B99,#0E7C7B)',
  'linear-gradient(135deg,#E8601C,#FECC02)',
  'linear-gradient(135deg,#1A8A4A,#005B99)',
  'linear-gradient(135deg,#7B3F9E,#E8601C)',
  'linear-gradient(135deg,#0F172A,#005B99)',
];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function History() {
  const navigate = useNavigate();
  const [records,   setRecords]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState('');
  const [loadingId, setLoadingId] = useState(null);   // which card is loading
  const [confirmId, setConfirmId] = useState(null);   // which card is pending delete

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory();
      setRecords(data.lessons || []);
    } catch (e) {
      setError('Could not load history. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  /* filter by search */
  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return !q ||
      r.title?.toLowerCase().includes(q) ||
      r.subject?.toLowerCase().includes(q) ||
      r.grade?.toLowerCase().includes(q) ||
      r.chapter?.toLowerCase().includes(q);
  });

  /* open a saved lesson */
  const handleView = async (record) => {
    setLoadingId(record.id);
    try {
      const data = await getHistoryLesson(record.id);
      if (data.success && data.record?.lessons?.length) {
        const lesson = data.record.lessons[0];
        navigate('/lesson-view', { state: { lesson, fromBatch: false, jobId: null } });
      } else {
        alert('Could not load lesson data.');
      }
    } catch (e) {
      alert('Error loading lesson.');
    } finally {
      setLoadingId(null);
    }
  };

  /* delete */
  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteHistoryLesson(confirmId);
      setRecords(prev => prev.filter(r => r.id !== confirmId));
    } catch {
      alert('Failed to delete.');
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="hist-root">

        {/* top bar */}
        <header className="hist-topbar">
          <div className="hist-topbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="Py-Content" />
            <div className="hist-topbar-logo-text">
              <span className="cs-content">Py-</span>
              <span className="cs-studio">Content</span>
            </div>
          </div>
          <button className="hist-back-btn" onClick={() => navigate('/')}>
            <ChevronLeft size={15} /> Home
          </button>
        </header>

        <div className="hist-body">
          <div className="hist-header">
            <h1 className="hist-title">📚 Generation History</h1>
            <p className="hist-subtitle">All previously generated lessons — saved automatically after each run.</p>
          </div>

          {error && <div className="hist-error">⚠ {error}</div>}

          {!loading && records.length > 0 && (
            <div className="hist-controls">
              <div className="hist-search-wrap">
                <Search size={15} />
                <input
                  className="hist-search-input"
                  placeholder="Search by title, subject, grade…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button
                style={{ background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#005B99',fontFamily:'inherit',fontWeight:600 }}
                onClick={fetchHistory}
              >
                <RefreshCw size={14}/> Refresh
              </button>
              <span className="hist-count">{filtered.length} lesson{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          {loading ? (
            <div className="hist-loading">Loading history…</div>

          ) : records.length === 0 ? (
            <div className="hist-empty">
              <div className="hist-empty-icon">📭</div>
              <h3>No lessons yet</h3>
              <p>Generate your first lesson and it will appear here automatically.</p>
              <button className="hist-empty-cta" onClick={() => navigate('/generator')}>
                <BookOpen size={16}/> Create a Lesson
              </button>
            </div>

          ) : filtered.length === 0 ? (
            <div className="hist-empty">
              <div className="hist-empty-icon">🔍</div>
              <h3>No results</h3>
              <p>No lessons match "{search}".</p>
            </div>

          ) : (
            <div className="hist-grid">
              {filtered.map((record, idx) => {
                const coverUrl = record.coverImage
                  ? (String(record.coverImage).startsWith('http') ? record.coverImage : `${BACKEND_URL}${record.coverImage}`)
                  : null;
                const gradient = GRADIENTS[idx % GRADIENTS.length];
                const isLoading = loadingId === record.id;

                return (
                  <div key={record.id} className="hist-card">
                    {/* cover */}
                    {coverUrl ? (
                      <img src={coverUrl} alt={record.title} className="hist-card-cover" />
                    ) : (
                      <div className="hist-card-cover-placeholder" style={{ background: gradient }}>
                        📖
                      </div>
                    )}

                    <div className="hist-card-body">
                      <h3 className="hist-card-title">{record.title || 'Untitled Lesson'}</h3>

                      <div className="hist-card-pills">
                        {record.grade   && <span className="hist-pill hist-pill-grade">Grade {record.grade}</span>}
                        {record.subject && <span className="hist-pill hist-pill-subject">{record.subject}</span>}
                        {record.level   && <span className="hist-pill hist-pill-level">{record.level}</span>}
                      </div>

                      {record.chapter && (
                        <div className="hist-card-chapter">📚 {record.chapter}</div>
                      )}

                      <div className="hist-card-meta">
                        🕐 {formatDate(record.createdAt)}
                      </div>
                    </div>

                    <div className="hist-card-actions">
                      <button
                        className="hist-btn-view"
                        onClick={() => handleView(record)}
                        disabled={isLoading}
                      >
                        <Eye size={14}/> {isLoading ? 'Loading…' : 'View Lesson'}
                      </button>
                      <button
                        className="hist-btn-delete"
                        onClick={() => setConfirmId(record.id)}
                        title="Delete"
                      >
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete confirm overlay */}
        {confirmId && (
          <div className="hist-overlay" onClick={() => setConfirmId(null)}>
            <div className="hist-confirm" onClick={e => e.stopPropagation()}>
              <h4>Delete this lesson?</h4>
              <p>This will permanently remove the saved lesson. This cannot be undone.</p>
              <div className="hist-confirm-actions">
                <button className="hist-confirm-cancel" onClick={() => setConfirmId(null)}>Cancel</button>
                <button className="hist-confirm-del" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
