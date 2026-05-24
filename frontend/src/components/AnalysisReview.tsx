import type { DocumentAnalysis, FormDefinition } from '../types';
import { DOC_TYPE_LABELS } from '../types';

interface Props {
  analysis: DocumentAnalysis;
  formDefinition?: FormDefinition;
  serverMessage?: string;
  onUseExtracted: () => void;
  onShowForm: () => void;
}

export default function AnalysisReview({
  analysis,
  formDefinition,
  serverMessage,
  onUseExtracted,
  onShowForm,
}: Props) {
  const { cover_info, document_type, title, sections } = analysis;

  const coverStatus = cover_info.cover_complete
    ? 'complete'
    : cover_info.cover_partial
    ? 'partial'
    : 'missing';

  const hasExtracted = Object.values(cover_info.extracted_data).some(
    v => v && (typeof v === 'string' ? v.trim() : true)
  );

  return (
    <div className="review">
      {/* Header */}
      <div className="review__header">
        <h2 className="review__title">Analyse terminée</h2>
        {serverMessage && <p className="review__msg">{serverMessage}</p>}
      </div>

      {/* Doc type + title */}
      <div className="review__card">
        <div className="review__card-row">
          <span className="review__label">Type détecté</span>
          <span className="tag tag--blue">{DOC_TYPE_LABELS[document_type] ?? document_type}</span>
        </div>
        {title && (
          <div className="review__card-row">
            <span className="review__label">Titre</span>
            <span className="review__value" title={title}>{title}</span>
          </div>
        )}
        <div className="review__card-row">
          <span className="review__label">Page de garde</span>
          <span className={`tag tag--${coverStatus === 'complete' ? 'green' : coverStatus === 'partial' ? 'yellow' : 'red'}`}>
            {coverStatus === 'complete' ? '✓ Détectée et complète'
              : coverStatus === 'partial' ? '~ Partielle'
              : '✗ Absente'}
          </span>
        </div>
      </div>

      {/* Extracted data preview */}
      {hasExtracted && (
        <div className="review__card">
          <p className="review__section-title">Informations extraites</p>
          <div className="review__extracted">
            {Object.entries(cover_info.extracted_data).map(([k, v]) => {
              if (!v || (typeof v === 'string' && !v.trim())) return null;
              if (Array.isArray(v) && v.length === 0) return null;
              return (
                <div key={k} className="extracted-row">
                  <span className="extracted-row__key">{k}</span>
                  <span className="extracted-row__val">
                    {Array.isArray(v)
                      ? `${v.length} membre(s)`
                      : String(v).slice(0, 60)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections detected */}
      {sections.length > 0 && (
        <div className="review__card">
          <p className="review__section-title">Structure détectée ({sections.length} sections)</p>
          <ul className="review__sections">
            {sections.slice(0, 8).map((s, i) => (
              <li key={i} style={{ paddingLeft: `${(s.level - 1) * 1}rem` }}>
                <span className="sec-level">H{s.level}</span>
                <span className="sec-title">{s.title}</span>
              </li>
            ))}
            {sections.length > 8 && (
              <li className="sec-more">+{sections.length - 8} autres sections…</li>
            )}
          </ul>
        </div>
      )}

      {/* Missing fields */}
      {cover_info.missing_fields.length > 0 && (
        <div className="review__card review__card--warn">
          <p className="review__section-title">Informations manquantes</p>
          <div className="missing-tags">
            {cover_info.missing_fields.map(f => (
              <span key={f} className="tag tag--red">{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="review__actions">
        {cover_info.cover_complete ? (
          <>
            <button className="btn btn--primary" onClick={onUseExtracted}>
              ⚡ Formater maintenant
            </button>
            <button className="btn btn--outline" onClick={onShowForm}>
              Modifier les informations
            </button>
          </>
        ) : hasExtracted ? (
          <>
            <button className="btn btn--primary" onClick={onShowForm}>
              {formDefinition ? '📝 Compléter le formulaire' : 'Continuer'}
            </button>
            <button className="btn btn--outline" onClick={onUseExtracted}>
              Utiliser les infos extraites telles quelles
            </button>
          </>
        ) : (
          <button className="btn btn--primary" onClick={onShowForm}>
            📝 Remplir le formulaire
          </button>
        )}
      </div>

      <style>{`
        .review { display: flex; flex-direction: column; gap: 1.25rem; }
        .review__header {}
        .review__title { font-size: 1.35rem; font-weight: 700; color: #e6edf3; margin: 0 0 0.4rem; font-family: Georgia, serif; }
        .review__msg { font-size: 0.85rem; color: #8b949e; margin: 0; }
        .review__card {
          background: #161b22;
          border: 1px solid #21262d;
          border-radius: 10px;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .review__card--warn { border-color: rgba(234,179,8,0.25); background: rgba(234,179,8,0.04); }
        .review__card-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .review__label { font-size: 0.82rem; color: #8b949e; }
        .review__value { font-size: 0.85rem; color: #c9d1d9; max-width: 55%; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
        .review__section-title { font-size: 0.8rem; color: #8b949e; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 0.5rem; }
        .review__extracted { display: flex; flex-direction: column; gap: 0.3rem; }
        .extracted-row { display: flex; gap: 0.75rem; align-items: flex-start; }
        .extracted-row__key { font-size: 0.78rem; color: #8b949e; font-family: monospace; min-width: 120px; }
        .extracted-row__val { font-size: 0.82rem; color: #c9d1d9; }
        .review__sections { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
        .review__sections li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; }
        .sec-level { font-family: monospace; font-size: 0.7rem; color: #58a6ff; background: rgba(88,166,255,0.1); padding: 1px 5px; border-radius: 4px; }
        .sec-title { color: #8b949e; }
        .sec-more { color: #484f58; font-size: 0.78rem; font-style: italic; }
        .missing-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .review__actions { display: flex; flex-direction: column; gap: 0.6rem; }

        .tag {
          font-size: 0.75rem; border-radius: 20px;
          padding: 0.2rem 0.7rem; font-weight: 500;
          display: inline-block;
        }
        .tag--blue   { background: rgba(59,130,246,0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.3); }
        .tag--green  { background: rgba(34,197,94,0.12);  color: #86efac; border: 1px solid rgba(34,197,94,0.25); }
        .tag--yellow { background: rgba(234,179,8,0.12);  color: #fde68a; border: 1px solid rgba(234,179,8,0.25); }
        .tag--red    { background: rgba(239,68,68,0.12);  color: #fca5a5; border: 1px solid rgba(239,68,68,0.25); }

        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border-radius: 8px; font-weight: 500; cursor: pointer;
          transition: all 0.2s; border: none; outline: none;
          font-size: 0.9rem; font-family: system-ui;
        }
        .btn--primary { background: linear-gradient(135deg,#2563eb,#0891b2); color: white; padding: 0.7rem 1.5rem; }
        .btn--primary:hover { filter: brightness(1.1); }
        .btn--outline { background: transparent; color: #8b949e; border: 1px solid #30363d; padding: 0.65rem 1.4rem; }
        .btn--outline:hover { border-color: #58a6ff; color: #58a6ff; }
      `}</style>
    </div>
  );
}
