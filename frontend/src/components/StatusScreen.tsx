import { type ReactNode } from 'react';

interface Props {
  icon: string;
  title: string;
  sub: string;
  loading?: boolean;
  children?: ReactNode;
}

export default function StatusScreen({ icon, title, sub, loading, children }: Props) {
  return (
    <div className="status">
      <div className="status__icon">{icon}</div>
      {loading && <div className="status__spinner" />}
      <h2 className="status__title">{title}</h2>
      <p className="status__sub">{sub}</p>
      {children && <div className="status__actions">{children}</div>}

      <style>{`
        .status {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 60vh; text-align: center; gap: 1rem;
        }
        .status__icon { font-size: 3rem; }
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
          text-decoration: none;
          font-size: 0.9rem; font-family: system-ui;
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
