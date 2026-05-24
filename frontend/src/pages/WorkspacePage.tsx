import { useRef } from 'react';
import type { AppState, FormDefinition } from '../types';
import { DOC_TYPE_LABELS } from '../types';
import { uploadDocument, formatDocument, getDownloadUrl } from '../services/api';
import FormView from '../components/FormView';
import AnalysisReview from '../components/AnalysisReview';
import StatusScreen from '../components/StatusScreen';

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  reset: () => void;
}

export default function WorkspacePage({ state, update, reset }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step 1 : upload ────────────────────────────────────────────────────────
  const handleFileSelect = async (file: File) => {
    update({
      file,
      filePreviewUrl: URL.createObjectURL(file),
      step: 'analyzing',
      errorMessage: undefined,
    });

    try {
      const resp = await uploadDocument(file);
      update({
        sessionId:      resp.session_id,
        analysis:       resp.analysis,
        formDefinition: resp.form_definition,
        serverMessage:  resp.message,
        step: 'review',
      });
    } catch (e: unknown) {
      update({ step: 'error', errorMessage: String(e) });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // ── Step 2 : review → decide cover path ───────────────────────────────────
  const handleUseExtracted = async () => {
    if (!state.sessionId) return;
    await doFormat(state.sessionId, undefined, true);
  };

  const handleShowForm = () => {
    update({ step: 'form' });
  };

  // ── Step 3 : form submit ───────────────────────────────────────────────────
  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    if (!state.sessionId) return;
    update({ formData, step: 'formatting' });
    await doFormat(state.sessionId, formData, false);
  };

  // ── Common format call ─────────────────────────────────────────────────────
  const doFormat = async (
    sid: string,
    formData?: Record<string, unknown>,
    useExtracted?: boolean,
  ) => {
    update({ step: 'formatting' });
    try {
      const resp = await formatDocument({
        session_id: sid,
        form_data: formData,
        use_extracted_cover: useExtracted,
      });
      update({
        step: 'done',
        downloadUrl: getDownloadUrl(resp.download_url),
        filename: resp.filename,
        serverMessage: resp.message,
      });
    } catch (e: unknown) {
      update({ step: 'error', errorMessage: String(e) });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ws">
      {/* Navbar */}
      <nav className="ws__nav">
        <button className="ws__back" onClick={reset}>← Accueil</button>
        <span className="ws__logo">
          <span className="logo-sf">SF</span> SmartFormat
        </span>
        <span className="ws__step-label">
          {stepLabel(state.step)}
        </span>
      </nav>

      <div className="ws__body">
        {/* Left panel: file drop / preview */}
        <div className="ws__panel ws__panel--left">
          {state.step === 'uploading' ? (
            <div
              className="drop-zone"
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf"
                hidden
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              <div className="drop-zone__icon">📂</div>
              <div className="drop-zone__title">Déposez votre document ici</div>
              <div className="drop-zone__sub">.docx ou .pdf — max 20 Mo</div>
              <button className="btn btn--primary" style={{marginTop:'1rem'}}>
                Choisir un fichier
              </button>
            </div>
          ) : (
            <div className="preview-panel">
              <div className="preview-panel__label">
                {state.file?.name}
              </div>
              {state.filePreviewUrl && (
                <iframe
                  src={state.filePreviewUrl}
                  title="Aperçu"
                  className="preview-panel__iframe"
                />
              )}
            </div>
          )}
        </div>

        {/* Right panel: workflow steps */}
        <div className="ws__panel ws__panel--right">
          {state.step === 'uploading' && (
            <div className="step-intro">
              <h2>Comment ça fonctionne</h2>
              <ol className="step-list">
                <li><strong>Upload</strong> – Déposez votre document brut</li>
                <li><strong>Analyse IA</strong> – Détection type, structure, couverture</li>
                <li><strong>Formulaire</strong> – Complétion des informations manquantes</li>
                <li><strong>Export</strong> – DOCX conforme à la charte FS-UEb</li>
              </ol>
            </div>
          )}

          {state.step === 'analyzing' && (
            <StatusScreen
              icon="🔍"
              title="Analyse en cours…"
              sub="L'IA détecte la structure, le type et la couverture de votre document."
              loading
            />
          )}

          {state.step === 'review' && state.analysis && (
            <AnalysisReview
              analysis={state.analysis}
              formDefinition={state.formDefinition as FormDefinition | undefined}
              serverMessage={state.serverMessage}
              onUseExtracted={handleUseExtracted}
              onShowForm={handleShowForm}
            />
          )}

          {state.step === 'form' && state.formDefinition && (
            <FormView
              formDefinition={state.formDefinition}
              prefillData={state.analysis?.cover_info.extracted_data}
              onSubmit={handleFormSubmit}
              onBack={() => update({ step: 'review' })}
            />
          )}

          {state.step === 'formatting' && (
            <StatusScreen
              icon="⚙️"
              title="Formatage en cours…"
              sub="Génération du document DOCX selon la charte académique."
              loading
            />
          )}

          {state.step === 'done' && state.downloadUrl && (
            <StatusScreen
              icon="✅"
              title="Document prêt !"
              sub={state.serverMessage || 'Votre document est conforme à la charte FS-UEb.'}
            >
              <a
                href={state.downloadUrl}
                download={state.filename}
                className="btn btn--primary btn--lg"
              >
                ⬇ Télécharger le DOCX
              </a>
              <button className="btn btn--outline" onClick={reset} style={{marginTop:'0.75rem'}}>
                Formater un autre document
              </button>
            </StatusScreen>
          )}

          {state.step === 'error' && (
            <StatusScreen
              icon="❌"
              title="Une erreur s'est produite"
              sub={state.errorMessage || 'Veuillez réessayer.'}
            >
              <button className="btn btn--primary" onClick={reset}>
                Recommencer
              </button>
            </StatusScreen>
          )}
        </div>
      </div>

      <style>{`
        .ws {
          min-height: 100vh;
          background: #0d1117;
          color: #e6edf3;
          display: flex;
          flex-direction: column;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .ws__nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          border-bottom: 1px solid #21262d;
          background: #0d1117;
          position: sticky; top: 0; z-index: 50;
        }
        .ws__back {
          background: none; border: none;
          color: #8b949e; cursor: pointer;
          font-size: 0.85rem;
          transition: color 0.15s;
        }
        .ws__back:hover { color: #e6edf3; }
        .ws__logo {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 1rem; font-weight: 600; color: #c9d1d9;
          font-family: Georgia, serif;
        }
        .ws__step-label {
          font-size: 0.78rem;
          color: #8b949e;
          font-family: 'Courier New', monospace;
          letter-spacing: 1px;
        }
        .ws__body {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          height: calc(100vh - 60px);
        }
        .ws__panel {
          overflow-y: auto;
          padding: 2rem;
        }
        .ws__panel--left {
          border-right: 1px solid #21262d;
          background: #0a0d13;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ws__panel--right {
          background: #0d1117;
        }

        /* Drop zone */
        .drop-zone {
          border: 2px dashed #30363d;
          border-radius: 16px;
          padding: 4rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          width: 100%;
        }
        .drop-zone:hover {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.04);
        }
        .drop-zone__icon  { font-size: 3rem; margin-bottom: 1rem; }
        .drop-zone__title { font-size: 1.1rem; font-weight: 600; color: #c9d1d9; margin-bottom: 0.4rem; }
        .drop-zone__sub   { font-size: 0.82rem; color: #8b949e; }

        /* Preview */
        .preview-panel { width: 100%; height: 100%; display: flex; flex-direction: column; gap: 0.5rem; }
        .preview-panel__label { font-size: 0.8rem; color: #8b949e; font-family: monospace; text-align: center; }
        .preview-panel__iframe { flex: 1; border: 1px solid #21262d; border-radius: 8px; background: white; }

        /* Step intro */
        .step-intro h2 { font-size: 1.3rem; color: #c9d1d9; margin-bottom: 1.5rem; font-family: Georgia, serif; }
        .step-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
        .step-list li {
          background: #161b22; border: 1px solid #21262d;
          border-radius: 10px; padding: 1rem 1.25rem;
          font-size: 0.9rem; color: #8b949e;
          counter-increment: step;
        }
        .step-list li strong { color: #e6edf3; }

        /* Buttons */
        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border-radius: 8px; font-weight: 500; cursor: pointer;
          transition: all 0.2s; border: none; outline: none;
          font-size: 0.9rem; font-family: system-ui;
        }
        .btn--primary {
          background: linear-gradient(135deg,#2563eb,#0891b2);
          color: white;
          padding: 0.65rem 1.5rem;
        }
        .btn--primary:hover { filter: brightness(1.1); }
        .btn--outline {
          background: transparent; color: #8b949e;
          border: 1px solid #30363d;
          padding: 0.6rem 1.4rem;
        }
        .btn--outline:hover { border-color: #58a6ff; color: #58a6ff; }
        .btn--lg { padding: 0.85rem 2rem; font-size: 1rem; }

        .logo-sf {
          background: linear-gradient(135deg,#3b82f6,#06b6d4);
          border-radius: 5px; padding: 2px 7px;
          font-size: 0.8rem; font-weight: bold;
          font-family: 'Courier New', monospace;
        }

        @media (max-width: 768px) {
          .ws__body { grid-template-columns: 1fr; }
          .ws__panel--left { display: none; }
        }
      `}</style>
    </div>
  );
}

function stepLabel(step: string): string {
  const labels: Record<string, string> = {
    uploading:  'ÉTAPE 1 · UPLOAD',
    analyzing:  'ÉTAPE 2 · ANALYSE IA',
    review:     'ÉTAPE 3 · RÉSULTAT',
    form:       'ÉTAPE 4 · FORMULAIRE',
    formatting: 'ÉTAPE 5 · FORMATAGE',
    done:       'TERMINÉ',
    error:      'ERREUR',
  };
  return labels[step] || '';
}
