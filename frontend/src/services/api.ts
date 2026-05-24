import type {
  AnalyzeResponse,
  FormatRequest,
  FormatResponse,
  FormDefinition,
} from '../types';

const BASE = 'http://localhost:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      msg = data.detail || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function uploadDocument(file: File): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
  return handleResponse<AnalyzeResponse>(res);
}

export async function getForm(docType: string): Promise<FormDefinition> {
  const res = await fetch(`${BASE}/forms/${docType}`);
  return handleResponse<FormDefinition>(res);
}

export async function formatDocument(req: FormatRequest): Promise<FormatResponse> {
  const res = await fetch(`${BASE}/format`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  return handleResponse<FormatResponse>(res);
}

export function getDownloadUrl(path: string): string {
  return `http://localhost:8000${path}`;
}
