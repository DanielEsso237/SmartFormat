import { type ReactNode } from 'react';

const ICONS = {
  search: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  gear:   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>,
  check:  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  error:  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
};

type IconKey = keyof typeof ICONS;

interface Props {
  icon: IconKey;
  title: string;
  sub: string;
  loading?: boolean;
  children?: ReactNode;
}

export default function StatusScreen({ icon, title, sub, loading, children }: Props) {
  return (
    <div className="status">
      <div className="status__icon">{ICONS[icon]}</div>
      {loading && <div className="status__spinner" />}
      <h2 className="status__title">{title}</h2>
      <p className="status__sub">{sub}</p>
      {children && <div className="status__actions">{children}</div>}

      <style>{`
        .status {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 60vh; text-align: center; gap: 1.25rem;
        }
        .status__icon { line-height: 1; }
        .status__spinner {
          width: 36px; height: 36px;
          border: 3px solid #21262d;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .status__title { font-size: 1.5rem; font-weight: 700; color: #e6edf3; margin: 0; font-family: Georgia, serif; }
        .status__sub { font-size: 0.9rem; color: #8b949e; margin: 0; max-width: 360px; line-height: 1.6; }
        .status__actions { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; margin-top: 0.5rem; }
        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border-radius: 8px; font-weight: 500; cursor: pointer;
          transition: all 0.2s; border: none; outline: none;
          text-decoration: none; font-size: 0.9rem; font-family: system-ui;
        }
        .btn--primary { background: linear-gradient(135deg,#2563eb,#0891b2); color: white; padding: 0.7rem 1.5rem; }
        .btn--primary:hover { filter: brightness(1.1); }
        .btn--outline { background: transparent; color: #8b949e; border: 1px solid #30363d; padding: 0.65rem 1.4rem; }
        .btn--outline:hover { border-color: #58a6ff; color: #58a6ff; }
        .btn--lg { padding: 0.85rem 2.5rem; font-size: 1rem; }
      `}</style>
    </div>
  );
}