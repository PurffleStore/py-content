import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

const Footer = () => {
  const year     = new Date().getFullYear();
  const navigate = useNavigate();

  const cols = [
    {
      title: 'Product',
      links: [
        { label: 'Features',         to: '/#features' },
        { label: 'How It Works',     to: '/how-it-works' },
        { label: 'Curriculum Align', to: '/#curriculum' },
        { label: 'Start Generating', to: '/generator' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation',    to: '/' },
        { label: 'FAQ',              to: '/' },
        { label: 'Blog',             to: '/' },
        { label: 'Release Notes',    to: '/' },
      ],
    },
    {
      title: 'Compliance',
      links: [
        { label: 'GDPR Policy',      to: '/' },
        { label: 'Data Processing',  to: '/' },
        { label: 'Privacy Policy',   to: '/' },
        { label: 'Cookie Settings',  to: '/' },
      ],
    },
  ];

  const socials = [
    { Icon: Twitter,  href: 'https://twitter.com',  label: 'Twitter'  },
    { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { Icon: Github,   href: 'https://github.com',   label: 'GitHub'   },
    { Icon: Mail,     href: 'mailto:hello@contentstudio.app', label: 'Email' },
  ];

  return (
    <footer
      style={{
        background: '#0F172A',
        color: '#E2E8F0',
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Upper footer ── */}
      <div
        style={{
          maxWidth: 1160,
          margin: '0 auto',
          padding: '64px 28px 48px',
          display: 'grid',
          gridTemplateColumns: '1fr repeat(3, auto)',
          gap: 48,
        }}
      >
        {/* Brand column */}
        <div style={{ maxWidth: 280 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: 14,
              letterSpacing: '-0.02em',
            }}
          >
            📚 Content Studio
          </div>
          <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.75, marginBottom: 24 }}>
            The AI-powered lesson content platform for European educators. Generate
            curriculum-aligned, GDPR-compliant lessons in minutes.
          </p>

          {/* Compliance badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {[
              { icon: '🔒', text: 'GDPR Compliant' },
              { icon: '🇪🇺', text: 'EU Data Storage' },
              { icon: '🛡️', text: 'Privacy First' },
            ].map((b, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#94A3B8',
                }}
              >
                {b.icon} {b.text}
              </span>
            ))}
          </div>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#F97316';
                  e.currentTarget.style.borderColor = '#F97316';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#94A3B8';
                }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {cols.map((col) => (
          <div key={col.title}>
            <h4
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#F8FAFC',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 18,
              }}
            >
              {col.title}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    style={{
                      fontSize: 14,
                      color: '#64748B',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                      fontWeight: 400,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#E2E8F0'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Contact bar ── */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '18px 28px',
          background: 'rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          {[
            { icon: '📧', text: 'hello@contentstudio.app' },
            { icon: '📍', text: 'Stockholm, Sweden · Munich, Germany' },
            { icon: '🕐', text: 'Support: Mon–Fri 08:00–18:00 CET' },
          ].map((item, i) => (
            <span
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#475569',
              }}
            >
              {item.icon} {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 28px',
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>
            © {year} Content Studio. All rights reserved.
            Built for European educators.
          </p>

          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'].map((label) => (
              <a
                key={label}
                href="/"
                style={{
                  fontSize: 13,
                  color: '#334155',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
                onMouseLeave={e => e.currentTarget.style.color = '#334155'}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
