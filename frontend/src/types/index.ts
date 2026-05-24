// ── API types ────────────────────────────────────────────────────────────────

export interface CoverInfo {
  has_cover: boolean;
  cover_complete: boolean;
  cover_partial: boolean;
  missing_fields: string[];
  extracted_data: Record<string, unknown>;
}

export interface DocumentSection {
  level: number;
  title: string;
  content: string;
}

export interface DocumentAnalysis {
  document_type: DocumentType;
  title: string;
  cover_info: CoverInfo;
  sections: DocumentSection[];
  needs_form: boolean;
}

export interface FormFieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'members_list';
  required: boolean;
  placeholder: string;
  options?: string[];
  fields?: FormFieldDef[];  // pour members_list
}

export interface FormDefinition {
  doc_type: DocumentType;
  title: string;
  fields: FormFieldDef[];
}

export interface AnalyzeResponse {
  session_id: string;
  analysis: DocumentAnalysis;
  form_definition?: FormDefinition;
  message: string;
}

export interface FormatRequest {
  session_id: string;
  form_data?: Record<string, unknown>;
  use_extracted_cover?: boolean;
}

export interface FormatResponse {
  session_id: string;
  download_url: string;
  filename: string;
  document_type: DocumentType;
  status: string;
  message: string;
}

// ── App types ─────────────────────────────────────────────────────────────────

export type DocumentType =
  | 'memoire'
  | 'rapport_stage'
  | 'rapport_projet'
  | 'expose'
  | 'demande';

export type AppStep =
  | 'landing'
  | 'uploading'
  | 'analyzing'
  | 'review'       // résultat analyse + décision cover
  | 'form'         // saisie formulaire
  | 'formatting'
  | 'done'
  | 'error';

export interface AppState {
  step: AppStep;
  sessionId?: string;
  file?: File;
  filePreviewUrl?: string;
  analysis?: DocumentAnalysis;
  formDefinition?: FormDefinition;
  formData?: Record<string, unknown>;
  downloadUrl?: string;
  filename?: string;
  errorMessage?: string;
  serverMessage?: string;
}

export const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  memoire:        'Mémoire',
  rapport_stage:  'Rapport de stage',
  rapport_projet: 'Rapport de projet',
  expose:         'Exposé',
  demande:        'Demande administrative',
};
