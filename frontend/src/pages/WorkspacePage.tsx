import { useRef } from 'react';
import type { AppState, FormDefinition } from '../types';
import { uploadDocument, formatDocument, getDownloadUrl } from '../services/api';
import FormView from '../components/FormView';
import AnalysisReview from '../components/AnalysisReview';
import StatusScreen from '../components/StatusScreen';
import { ReactNode } from 'react';

import {
  FiUpload,
  FiSearch,
  FiSettings,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiFolder
} from 'react-icons/fi';

interface Props {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  reset: () => void;
}

export default function WorkspacePage({ state, update, reset }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        sessionId: resp.session_id,
        analysis: resp.analysis,
        formDefinition: resp.form_definition,
        serverMessage: resp.message,
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

  const handleUseExtracted = async () => {
    if (!state.sessionId) return;
    await doFormat(state.sessionId, undefined, true);
  };

  const handleShowForm = () => {
    update({ step: 'form' });
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    if (!state.sessionId) return;
    update({ formData, step: 'formatting' });
    await doFormat(state.sessionId, formData, false);
  };

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

  return (
    <div className="ws">
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
              <div className="drop-zone__icon"><FiFolder size={40} /></div>
              <div className="drop-zone__title">Déposez votre document ici</div>
              <div className="drop-zone__sub">.docx ou .pdf — max 20 Mo</div>
              <button className="btn btn--primary" style={{ marginTop: '1rem' }}>
                <FiUpload /> Choisir un fichier
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

        <div className="ws__panel ws__panel--right">
          {state.step === 'uploading' && (
            <div className="step-intro">
              <h2>Comment ça fonctionne</h2>
              <ol className="step-list">
                <li><strong>Upload</strong> – Déposez votre document brut</li>
                <li><strong>Analyse IA</strong> – Détection structure</li>
                <li><strong>Formulaire</strong> – Complétion</li>
                <li><strong>Export</strong> – DOCX final</li>
              </ol>
            </div>
          )}

          {state.step === 'analyzing' && (
            <StatusScreen
              icon={<FiSearch />}
              title="Analyse en cours…"
              sub="L'IA analyse votre document."
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
              icon={<FiSettings />}
              title="Formatage en cours…"
              sub="Génération du document."
              loading
            />
          )}

          {state.step === 'done' && state.downloadUrl && (
            <StatusScreen
              icon={<FiCheckCircle />}
              title="Document prêt !"
              sub={state.serverMessage}
            >
              <a
                href={state.downloadUrl}
                download={state.filename}
                className="btn btn--primary btn--lg"
              >
                <FiDownload /> Télécharger
              </a>
              <button
                className="btn btn--outline"
                onClick={reset}
                style={{ marginTop: '0.75rem' }}
              >
                Recommencer
              </button>
            </StatusScreen>
          )}

          {state.step === 'error' && (
            <StatusScreen
              icon={<FiXCircle />}
              title="Une erreur s'est produite"
              sub={state.errorMessage}
            >
              <button className="btn btn--primary" onClick={reset}>
                Recommencer
              </button>
            </StatusScreen>
          )}
        </div>
      </div>
    </div>
  );
}

function stepLabel(step: string): string {
  const labels: Record<string, string> = {
    uploading: 'ÉTAPE 1 · UPLOAD',
    analyzing: 'ÉTAPE 2 · ANALYSE IA',
    review: 'ÉTAPE 3 · RÉSULTAT',
    form: 'ÉTAPE 4 · FORMULAIRE',
    formatting: 'ÉTAPE 5 · FORMATAGE',
    done: 'TERMINÉ',
    error: 'ERREUR',
  };
  return labels[step] || '';
}