import { useEffect, useRef } from 'react';

interface Props { onStart: () => void }

export default function LandingPage({ onStart }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Subtle particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,179,237,${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="landing">
      <canvas ref={canvasRef} className="landing__canvas" />

      <nav className="landing__nav">
        <span className="landing__logo">
          <span className="logo-sf">SF</span>
          <span className="logo-text">SmartFormat</span>
        </span>
        <button className="btn btn--outline" onClick={onStart}>Commencer</button>
      </nav>

      <main className="landing__main">
        <div className="landing__badge">FS-UEb · Charte académique officielle</div>

        <h1 className="landing__title">
          Vos documents,<br />
          <span className="landing__title--accent">parfaitement formatés.</span>
        </h1>

        <p className="landing__sub">
          Déposez votre mémoire, rapport ou exposé brut.<br />
          L'IA analyse, restructure et génère un DOCX conforme
          à la charte de la Faculté des Sciences d'Ébolowa.
        </p>

        <button className="btn btn--primary landing__cta" onClick={onStart}>
          Formater mon document
        </button>

        <div className="landing__features">
          {[
            { icon: 'search', title: 'Analyse intelligente', desc: 'Détecte automatiquement le type, la structure et la couverture' },
            { icon: 'doc', title: 'Cover automatique', desc: 'Génère ou conserve votre page de garde selon la charte' },
            { icon: 'zap', title: 'Export instantané', desc: 'DOCX professionnel prêt en quelques secondes' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-card__icon">
              {f.icon === 'search' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>}
              {f.icon === 'doc' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
              {f.icon === 'zap' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
            </div>
              <div className="feature-card__title">{f.title}</div>
              <div className="feature-card__desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        .landing {
          min-height: 100vh;
          background: #0a0e1a;
          color: #e8eaf0;
          display: flex;
          flex-direction: column;
          font-family: 'Georgia', 'Times New Roman', serif;
          position: relative;
          overflow: hidden;
        }
        .landing__canvas {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .landing__nav {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
          border-bottom: 1px solid rgba(99,179,237,0.12);
        }
        .landing__logo { display: flex; align-items: center; gap: 0.6rem; }
        .logo-sf {
          background: linear-gradient(135deg,#3b82f6,#06b6d4);
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 0.85rem;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          letter-spacing: 1px;
        }
        .logo-text { font-size: 1.1rem; font-weight: 600; letter-spacing: 0.5px; color: #cbd5e1; }
        .landing__main {
          position: relative; z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          gap: 2rem;
        }
        .landing__badge {
          font-family: 'Courier New', monospace;
          font-size: 0.72rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #60a5fa;
          border: 1px solid rgba(96,165,250,0.3);
          padding: 0.35rem 1rem;
          border-radius: 100px;
          background: rgba(96,165,250,0.07);
        }
        .landing__title {
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 700;
          line-height: 1.12;
          color: #f1f5f9;
          letter-spacing: -1px;
          margin: 0;
        }
        .landing__title--accent {
          background: linear-gradient(135deg,#3b82f6 0%,#06b6d4 50%,#8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .landing__sub {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #94a3b8;
          max-width: 520px;
          margin: 0;
        }
        .landing__cta { font-size: 1rem; padding: 0.9rem 2.5rem; }
        .landing__features {
          display: flex;
          gap: 1.5rem;
          margin-top: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .feature-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 1.5rem;
          width: 200px;
          text-align: left;
          transition: border-color 0.2s, background 0.2s;
        }
        .feature-card:hover {
          border-color: rgba(99,179,237,0.3);
          background: rgba(99,179,237,0.05);
        }
        .feature-card__icon { font-size: 1.5rem; margin-bottom: 0.6rem; }
        .feature-card__title { font-size: 0.9rem; font-weight: 600; color: #e2e8f0; margin-bottom: 0.4rem; }
        .feature-card__desc  { font-size: 0.78rem; color: #64748b; line-height: 1.5; font-family: system-ui; }

        /* Buttons */
        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border-radius: 8px; font-weight: 500; cursor: pointer;
          transition: all 0.2s; border: none; outline: none;
          font-family: system-ui, sans-serif;
        }
        .btn--primary {
          background: linear-gradient(135deg,#2563eb,#0891b2);
          color: white;
          padding: 0.7rem 1.8rem;
          box-shadow: 0 4px 20px rgba(37,99,235,0.35);
        }
        .btn--primary:hover { filter: brightness(1.12); transform: translateY(-1px); }
        .btn--outline {
          background: transparent;
          color: #94a3b8;
          border: 1px solid rgba(148,163,184,0.3);
          padding: 0.55rem 1.4rem;
          font-size: 0.9rem;
        }
        .btn--outline:hover { border-color: #60a5fa; color: #60a5fa; }
        .btn--primary:hover
      `}</style>
    </div>
  );
}  