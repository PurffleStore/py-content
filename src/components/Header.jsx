import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Eye, EyeOff, ChevronDown, LogOut, User } from 'lucide-react';
import logo from '../assets/images/py-logo.png';

/* ─────────────────────────────────────────────
   Login Modal
───────────────────────────────────────────── */
const LoginModal = ({ onLogin, onClose }) => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  /* Close on ESC */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  /* Prevent body scroll while modal is open */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const validate = () => {
    if (!email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    /* Simulate async auth — replace with real API call when ready */
    setTimeout(() => {
      setLoading(false);
      const rawName  = email.split('@')[0].replace(/[._-]+/g, ' ');
      const name     = rawName.replace(/\b\w/g, (c) => c.toUpperCase());
      onLogin({ email, name });
    }, 800);
  };

  return (
    /* Backdrop */
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          1000,
        background:      'rgba(7, 16, 31, 0.65)',
        backdropFilter:  'blur(4px)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '16px',
      }}
    >
      {/* Modal card */}
      <div
        style={{
          background:   '#FFFFFF',
          borderRadius: '18px',
          padding:      '36px 36px 32px',
          width:        '100%',
          maxWidth:     '420px',
          position:     'relative',
          boxShadow:    '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
          animation:    'modalSlideIn 0.22s cubic-bezier(0.34, 1.2, 0.64, 1)',
        }}
      >
        <style>{`
          @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(-16px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)     scale(1);    }
          }
        `}</style>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position:   'absolute',
            top:        '16px',
            right:      '16px',
            background: '#F1F5F9',
            border:     'none',
            borderRadius: '50%',
            width:      '32px',
            height:     '32px',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor:     'pointer',
            color:      '#64748B',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '6px',
            marginBottom:   '16px',
            fontFamily:     "'Space Grotesk', system-ui, sans-serif",
            fontSize:       '20px',
            letterSpacing:  '-0.02em',
          }}>
            <span style={{ fontWeight: 800, color: '#111827' }}>Py-</span>
            <span style={{ fontWeight: 800, color: '#2563EB' }}>Content</span>
          </div>
          <h2 style={{
            margin:      0,
            fontSize:    '22px',
            fontWeight:  700,
            color:       '#0F172A',
            fontFamily:  "'Space Grotesk', system-ui, sans-serif",
            letterSpacing: '-0.02em',
          }}>
            Welcome back
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B' }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Error message */}
          {error && (
            <div style={{
              background:   '#FEF2F2',
              border:       '1px solid #FECACA',
              color:        '#DC2626',
              borderRadius: '8px',
              padding:      '10px 14px',
              fontSize:     '13.5px',
              marginBottom: '16px',
              fontWeight:   500,
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display:      'block',
              fontSize:     '13px',
              fontWeight:   600,
              color:        '#374151',
              marginBottom: '6px',
            }}>
              Email address
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width:        '100%',
                padding:      '11px 14px',
                border:       '1.5px solid #E2E8F0',
                borderRadius: '8px',
                fontSize:     '14.5px',
                color:        '#0F172A',
                outline:      'none',
                boxSizing:    'border-box',
                fontFamily:   'inherit',
                transition:   'border-color 0.15s',
                background:   '#FAFAFA',
              }}
              onFocus={e  => e.target.style.borderColor = '#2563EB'}
              onBlur={e   => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                Password
              </label>
              <span style={{
                fontSize: '12.5px',
                color:    '#2563EB',
                cursor:   'pointer',
                fontWeight: 500,
              }}>
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width:        '100%',
                  padding:      '11px 44px 11px 14px',
                  border:       '1.5px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize:     '14.5px',
                  color:        '#0F172A',
                  outline:      'none',
                  boxSizing:    'border-box',
                  fontFamily:   'inherit',
                  transition:   'border-color 0.15s',
                  background:   '#FAFAFA',
                }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e  => e.target.style.borderColor = '#E2E8F0'}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position:   'absolute',
                  right:      '12px',
                  top:        '50%',
                  transform:  'translateY(-50%)',
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  color:      '#94A3B8',
                  display:    'flex',
                  padding:    0,
                }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width:          '100%',
              padding:        '13px',
              background:     loading ? '#FED7AA' : '#F97316',
              color:          '#FFFFFF',
              border:         'none',
              borderRadius:   '8px',
              fontSize:       '15px',
              fontWeight:     700,
              cursor:         loading ? 'not-allowed' : 'pointer',
              fontFamily:     "'Space Grotesk', system-ui, sans-serif",
              letterSpacing:  '0.01em',
              transition:     'background 0.15s, transform 0.12s',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#EA580C'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#F97316'; }}
          >
            {loading ? (
              <>
                <span style={{
                  width:  '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spinBtn 0.7s linear infinite',
                }} />
                <style>{`@keyframes spinBtn { to { transform: rotate(360deg); } }`}</style>
                Signing in…
              </>
            ) : 'Sign In'}
          </button>

          {/* Sign up link */}
          <p style={{
            textAlign:  'center',
            fontSize:   '13px',
            color:      '#64748B',
            marginTop:  '18px',
            marginBottom: 0,
          }}>
            Don't have an account?{' '}
            <span style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>
              Sign up free
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Header
───────────────────────────────────────────── */
const Header = () => {
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [loginOpen,    setLoginOpen]    = useState(false);
  const [user,         setUser]         = useState(null);   // { name, email }
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const navigate    = useNavigate();
  const location    = useLocation();

  /* Shadow on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close user dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { label: 'Home',           path: '/' },
    { label: 'How It Works',   path: '/how-it-works' },
    { label: '📊 Presentation', path: '/presentation' },
    { label: '📚 History',     path: '/history' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname === path;

  const handleLogin = ({ email, name }) => {
    setUser({ email, name });
    setLoginOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setUserMenuOpen(false);
  };

  /* First letter of first name */
  const initials = user
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <>
      <header
        style={{
          position:    'fixed',
          top:         0,
          left:        0,
          right:       0,
          zIndex:      50,
          background:  '#EFF6FF',
          borderBottom: scrolled ? '1px solid #BFDBFE' : '1px solid #DBEAFE',
          boxShadow:   scrolled  ? '0 1px 8px rgba(37,99,235,0.08)' : 'none',
          transition:  'box-shadow 0.2s, border-color 0.2s',
          fontFamily:  "'DM Sans', 'Inter', system-ui, sans-serif",
        }}
      >
        <nav
          style={{
            maxWidth:       'none',
            margin:         0,
            padding:        '0 16px',
            height:         62,
            display:        'flex',
            alignItems:     'center',
            gap:            8,
            justifyContent: 'flex-start',
          }}
        >
          {/* ── Logo ── */}
          <Link
            to="/"
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            10,
              textDecoration: 'none',
              marginRight:    10,
            }}
          >
            <img src={logo} alt="Py-Content" style={{ height: 46, objectFit: 'contain' }} />
            <span style={{
              display:       'flex',
              alignItems:    'baseline',
              gap:           0,
              fontFamily:    "'Space Grotesk', 'DM Sans', system-ui, sans-serif",
              letterSpacing: '-0.02em',
              fontSize:      26,
              lineHeight:    1,
            }}>
              <span style={{ fontWeight: 800, color: '#111827' }}>Py-</span>
              <span style={{ fontWeight: 800, color: '#2563EB' }}>Content</span>
            </span>
          </Link>

          {/* ── Desktop nav links — pushed right, above the cards column ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding:        '7px 14px',
                  borderRadius:   8,
                  fontSize:       14,
                  fontWeight:     isActive(link.path) ? 700 : 500,
                  color:          isActive(link.path) ? '#2563EB' : '#475569',
                  textDecoration: 'none',
                  transition:     'all 0.15s',
                  background:     isActive(link.path) ? '#EFF6FF' : 'transparent',
                  whiteSpace:     'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.path)) {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.color = '#1E293B';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(link.path)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right side: Login / User ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>

            {user ? (
              /* ── Logged-in: avatar + dropdown ── */
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          8,
                    padding:      '6px 10px 6px 6px',
                    borderRadius: '30px',
                    border:       '1.5px solid #E2E8F0',
                    background:   userMenuOpen ? '#DBEAFE' : '#EFF6FF',
                    cursor:       'pointer',
                    transition:   'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
                  onMouseLeave={e => { if (!userMenuOpen) e.currentTarget.style.background = '#EFF6FF'; }}
                >
                  {/* Avatar circle */}
                  <div style={{
                    width:          32,
                    height:         32,
                    borderRadius:   '50%',
                    background:     'linear-gradient(135deg, #2563EB, #60A5FA)',
                    color:          '#FFFFFF',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    fontSize:       12,
                    fontWeight:     700,
                    flexShrink:     0,
                    fontFamily:     "'Space Grotesk', system-ui, sans-serif",
                  }}>
                    {initials}
                  </div>
                  <span style={{
                    fontSize:   14,
                    fontWeight: 600,
                    color:      '#0F172A',
                    maxWidth:   120,
                    overflow:   'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.name}
                  </span>
                  <ChevronDown
                    size={14}
                    color="#94A3B8"
                    style={{
                      transition: 'transform 0.2s',
                      transform:  userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div style={{
                    position:     'absolute',
                    top:          'calc(100% + 8px)',
                    right:        0,
                    background:   '#FFFFFF',
                    border:       '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow:    '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                    minWidth:     '210px',
                    overflow:     'hidden',
                    zIndex:       100,
                    animation:    'dropDown 0.18s cubic-bezier(0.34,1.2,0.64,1)',
                  }}>
                    <style>{`
                      @keyframes dropDown {
                        from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                        to   { opacity: 1; transform: translateY(0)    scale(1);    }
                      }
                    `}</style>

                    {/* User info */}
                    <div style={{
                      padding:      '14px 16px 12px',
                      borderBottom: '1px solid #F1F5F9',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                        {user.name}
                      </div>
                      <div style={{
                        fontSize:     12,
                        color:        '#94A3B8',
                        marginTop:    2,
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace:   'nowrap',
                      }}>
                        {user.email}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: '6px' }}>
                      <DropdownItem icon={<User size={14} />} label="My Account" onClick={() => setUserMenuOpen(false)} />
                      <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />
                      <DropdownItem
                        icon={<LogOut size={14} />}
                        label="Sign Out"
                        danger
                        onClick={handleLogout}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Not logged in: Login button ── */
              <button
                onClick={() => setLoginOpen(true)}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          6,
                  padding:      '8px 18px',
                  background:   '#F97316',
                  color:        '#FFFFFF',
                  border:       'none',
                  borderRadius: '8px',
                  fontSize:     14,
                  fontWeight:   700,
                  cursor:       'pointer',
                  fontFamily:   "'Space Grotesk', system-ui, sans-serif",
                  letterSpacing: '0.01em',
                  transition:   'background 0.15s, transform 0.12s',
                  boxShadow:    '0 2px 8px rgba(249,115,22,0.30)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background  = '#EA580C';
                  e.currentTarget.style.transform   = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow   = '0 4px 14px rgba(249,115,22,0.40)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background  = '#F97316';
                  e.currentTarget.style.transform   = 'translateY(0)';
                  e.currentTarget.style.boxShadow   = '0 2px 8px rgba(249,115,22,0.30)';
                }}
              >
                Log In
              </button>
            )}
          </div>

          {/* ── Mobile menu toggle ── */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display:      'none',
              padding:      8,
              borderRadius: 8,
              border:       '1px solid #E2E8F0',
              background:   'transparent',
              cursor:       'pointer',
              color:        '#475569',
              marginLeft:   8,
            }}
            className="flex md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* ── Mobile dropdown ── */}
        {menuOpen && (
          <div style={{
            background:     '#EFF6FF',
            borderTop:      '1px solid #BFDBFE',
            padding:        '12px 16px 16px',
            display:        'flex',
            flexDirection:  'column',
            gap:            4,
          }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding:        '10px 14px',
                  borderRadius:   8,
                  fontSize:       15,
                  fontWeight:     500,
                  color:          '#1E293B',
                  textDecoration: 'none',
                  display:        'block',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />
            {user ? (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                style={{
                  padding:    '10px 14px',
                  borderRadius: 8,
                  fontSize:   15,
                  fontWeight: 600,
                  color:      '#DC2626',
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  textAlign:  'left',
                  display:    'flex',
                  alignItems: 'center',
                  gap:        8,
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            ) : (
              <button
                onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
                style={{
                  margin:       '4px 0 0',
                  padding:      '11px 14px',
                  background:   '#F97316',
                  color:        '#FFFFFF',
                  border:       'none',
                  borderRadius: '8px',
                  fontSize:     15,
                  fontWeight:   700,
                  cursor:       'pointer',
                  textAlign:    'center',
                  fontFamily:   "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Log In
              </button>
            )}
          </div>
        )}
      </header>

      {/* ── Login Modal ── */}
      {loginOpen && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setLoginOpen(false)}
        />
      )}
    </>
  );
};

/* Small helper for dropdown menu items */
const DropdownItem = ({ icon, label, danger, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display:      'flex',
      alignItems:   'center',
      gap:          10,
      width:        '100%',
      padding:      '9px 12px',
      borderRadius: '8px',
      border:       'none',
      background:   'none',
      fontSize:     13.5,
      fontWeight:   500,
      color:        danger ? '#DC2626' : '#374151',
      cursor:       'pointer',
      textAlign:    'left',
      transition:   'background 0.12s',
      fontFamily:   "'DM Sans', system-ui, sans-serif",
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? '#FEF2F2' : '#F8FAFC'}
    onMouseLeave={e => e.currentTarget.style.background = 'none'}
  >
    {icon}
    {label}
  </button>
);

export default Header;
