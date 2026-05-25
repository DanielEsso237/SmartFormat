import { useRef } from 'react';
import type { AppState, FormDefinition } from '../types';
import { uploadDocument, formatDocument, getDownloadUrl } from '../services/api';
import FormView from '../components/FormView';
import AnalysisReview from '../components/AnalysisReview';
import StatusScreen from '../components/StatusScreen';

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  reset: () => void;
}

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#30363d" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function WorkspacePage({ state, update, reset }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    update({ file, filePreviewUrl: URL.createObjectURL(file), step: 'analyzing', errorMessage: undefined });
    try {
      const resp = await uploadDocument(file);
      update({ sessionId: resp.session_id, analysis: resp.analysis, formDefinition: resp.form_definition, serverMessage: resp.message, step: 'review' });
    } catch (e: unknown) {
      update({ step: 'error', errorMessage: String(e) });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const doFormat = async (sid: string, formData?: Record<string, unknown>, useExtracted?: boolean) => {
    update({ step: 'formatting' });
    try {
      const resp = await formatDocument({ session_id: sid, form_data: formData, use_extracted_cover: useExtracted });
      update({ step: 'done', downloadUrl: getDownloadUrl(resp.download_url), filename: resp.filename, serverMessage: resp.message });
    } catch (e: unknown) {
      update({ step: 'error', errorMessage: String(e) });
    }
  };

  const handleUseExtracted = async () => { if (state.sessionId) await doFormat(state.sessionId, undefined, true); };
  const handleShowForm     = () => update({ step: 'form' });
  const handleFormSubmit   = async (formData: Record<string, unknown>) => { if (state.sessionId) { update({ formData }); await doFormat(state.sessionId, formData, false); } };

  return (
    <div className="ws">
      <nav className="ws__nav">
        <button className="ws__back" onClick={reset}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Accueil
        </button>
        <span className="ws__logo">
          <span className="logo-sf">SF</span> SmartFormat
        </span>
        <span className="ws__step-label">{stepLabel(state.step)}</span>
      </nav>

      <div className="ws__body">
        <div className="ws__panel ws__panel--left">
          {state.step === 'uploading' ? (
            <div className="drop-zone" onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept=".docx,.pdf" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
              <UploadIcon />
              <div className="drop-zone__title">Déposez votre document ici</div>
              <div className="drop-zone__sub">.docx ou .pdf — max 20 Mo</div>
              <button className="btn btn--primary" style={{marginTop:'1rem'}}>Choisir un fichier</button>
            </div>
          ) : (
            <div className="preview-panel">
              <div className="preview-panel__label">{state.file?.name}</div>
              {state.filePreviewUrl && <iframe src={state.filePreviewUrl} title="Aperçu" className="preview-panel__iframe" />}
            </div>
          )}
        </div>

        <div className="ws__panel ws__panel--right">
          {state.step === 'uploading' && (
            <div className="step-intro">
              <h2>Comment ça fonctionne</h2>
              <ol className="step-list">
                {[
                  ['Upload', 'Déposez votre document brut (.docx ou .pdf)'],
                  ['Analyse IA', 'Détection automatique du type, de la structure et de la couverture'],
                  ['Formulaire', 'Complétion des informations manquantes pour la page de garde'],
                  ['Export', 'DOCX professionnel conforme à la charte FS-UEb'],
                ].map(([title, desc]) => (
                  <li key={title}><strong>{title}</strong> — {desc}</li>
                ))}
              </ol>
            </div>
          )}

          {state.step === 'analyzing' && (
            <StatusScreen icon="search" title="Analyse en cours…" sub="L'IA détecte la structure, le type et la couverture de votre document." loading />
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
            <StatusScreen icon="gear" title="Formatage en cours…" sub="Génération du document DOCX selon la charte académique." loading />
          )}

          {state.step === 'done' && state.downloadUrl && (
            <StatusScreen icon="check" title="Document prêt" sub={state.serverMessage || 'Votre document est conforme à la charte FS-UEb.'}>
              <a href={state.downloadUrl} download={state.filename} className="btn btn--primary btn--lg">
                <DownloadIcon /> Télécharger le DOCX
              </a>
              <button className="btn btn--outline" onClick={reset}>Formater un autre document</button>
            </StatusScreen>
          )}

          {state.step === 'error' && (
            <StatusScreen icon="error" title="Une erreur s'est produite" sub={state.errorMessage || 'Veuillez réessayer.'}>
              <button className="btn btn--primary" onClick={reset}>Recommencer</button>
            </StatusScreen>
          )}
        </div>
      </div>

      <style>{`
        .ws { min-height: 100vh; background: #0d1117; color: #e6edf3; display: flex; flex-direction: column; font-family: system-ui, -apple-system, sans-serif; }
        .ws__nav { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; border-bottom: 1px solid #21262d; background: #0d1117; position: sticky; top: 0; z-index: 50; }
        .ws__back { display: flex; align-items: center; gap: 0.4rem; background: none; border: none; color: #8b949e; cursor: pointer; font-size: 0.85rem; transition: color 0.15s; padding: 0; }
        .ws__back:hover { color: #e6edf3; }
        .ws__logo { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 600; color: #c9d1d9; font-family: Georgia, serif; }
        .ws__step-label { font-size: 0.75rem; color: #8b949e; font-family: 'Courier New', monospace; letter-spacing: 1px; }
        .ws__body { flex: 1; display: grid; grid-template-columns: 1fr 1fr; height: calc(100vh - 60px); }
        .ws__panel { overflow-y: auto; padding: 2rem; }
        .ws__panel--left { border-right: 1px solid #21262d; background: #0a0d13; display: flex; align-items: center; justify-content: center; }
        .ws__panel--right { background: #0d1117; }
        .drop-zone { border: 2px dashed #30363d; border-radius: 16px; padding: 4rem 2rem; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .drop-zone:hover { border-color: #3b82f6; background: rgba(59,130,246,0.04); }
        .drop-zone:hover svg { stroke: #3b82f6; }
        .drop-zone__title { font-size: 1rem; font-weight: 600; color: #c9d1d9; }
        .drop-zone__sub { font-size: 0.8rem; color: #8b949e; }
        .preview-panel { width: 100%; height: 100%; display: flex; flex-direction: column; gap: 0.5rem; }
        .preview-panel__label { font-size: 0.78rem; color: #8b949e; font-family: monospace; text-align: center; }
        .preview-panel__iframe { flex: 1; border: 1px solid #21262d; border-radius: 8px; background: white; }
        .step-intro h2 { font-size: 1.2rem; color: #c9d1d9; margin-bottom: 1.5rem; font-family: Georgia, serif; }
        .step-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; counter-reset: step; }
        .step-list li { background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 0.9rem 1.1rem; font-size: 0.88rem; color: #8b949e; display: flex; align-items: flex-start; gap: 0.75rem; counter-increment: step; }
        .step-list li::before { content: counter(step); min-width: 22px; height: 22px; background: #21262d; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: #58a6ff; font-weight: 700; flex-shrink: 0; }
        .step-list li strong { color: #e6edf3; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; outline: none; font-size: 0.9rem; font-family: system-ui; text-decoration: none; }
        .btn--primary { background: linear-gradient(135deg,#2563eb,#0891b2); color: white; padding: 0.65rem 1.5rem; }
        .btn--primary:hover { filter: brightness(1.1); }
        .btn--outline { background: transparent; color: #8b949e; border: 1px solid #30363d; padding: 0.6rem 1.4rem; }
        .btn--outline:hover { border-color: #58a6ff; color: #58a6ff; }
        .btn--lg { padding: 0.85rem 2rem; font-size: 1rem; }
        .logo-sf { background: linear-gradient(135deg,#3b82f6,#06b6d4); border-radius: 5px; padding: 2px 7px; font-size: 0.8rem; font-weight: bold; font-family: 'Courier New', monospace; }
        @media (max-width: 768px) { .ws__body { grid-template-columns: 1fr; } .ws__panel--left { display: none; } }
      `}</style>
    </div>
  );
}

function stepLabel(step: string): string {
  const labels: Record<string, string> = {
    uploading: 'ÉTAPE 1 · UPLOAD', analyzing: 'ÉTAPE 2 · ANALYSE IA',
    review: 'ÉTAPE 3 · RÉSULTAT', form: 'ÉTAPE 4 · FORMULAIRE',
    formatting: 'ÉTAPE 5 · FORMATAGE', done: 'TERMINÉ', error: 'ERREUR',
  };
  return labels[step] || '';
}