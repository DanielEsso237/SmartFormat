import { useState } from 'react';
import type { FormDefinition, FormFieldDef } from '../types';

interface Member { nom: string; matricule: string; filiere: string }

interface Props {
  formDefinition: FormDefinition;
  prefillData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

export default function FormView({ formDefinition, prefillData, onSubmit, onBack }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const field of formDefinition.fields) {
      if (field.type === 'members_list') {
        init[field.name] = prefillData?.[field.name] ?? [{ nom: '', matricule: '', filiere: '' }];
      } else {
        init[field.name] = prefillData?.[field.name] ?? '';
      }
    }
    return init;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (name: string, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    for (const field of formDefinition.fields) {
      if (!field.required) continue;
      const val = values[field.name];
      if (!val || (typeof val === 'string' && !val.trim())) {
        errs[field.name] = 'Ce champ est requis';
      }
      if (field.type === 'members_list') {
        const members = val as Member[];
        if (!members || members.length === 0 || !members[0]?.nom?.trim()) {
          errs[field.name] = 'Au moins un membre est requis';
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(values);
  };

  return (
    <div className="form-view">
      <div className="form-view__header">
        <button className="form-view__back" onClick={onBack}>← Retour</button>
        <h2 className="form-view__title">{formDefinition.title}</h2>
        <p className="form-view__sub">Complétez les informations pour générer votre page de garde.</p>
      </div>

      <form onSubmit={handleSubmit} className="form-view__form">
        {formDefinition.fields.map(field => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={val => set(field.name, val)}
          />
        ))}

        <div className="form-view__actions">
          <button type="submit" className="btn btn--primary btn--lg">
            ⚡ Générer le document
          </button>
        </div>
      </form>

      <style>{`
        .form-view { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-view__back { background: none; border: none; color: #8b949e; cursor: pointer; font-size: 0.82rem; padding: 0; }
        .form-view__back:hover { color: #58a6ff; }
        .form-view__title { font-size: 1.3rem; font-weight: 700; color: #e6edf3; margin: 0.25rem 0 0.25rem; font-family: Georgia, serif; }
        .form-view__sub { font-size: 0.84rem; color: #8b949e; margin: 0; }
        .form-view__form { display: flex; flex-direction: column; gap: 1.1rem; }
        .form-view__actions { padding-top: 0.5rem; }

        .field { display: flex; flex-direction: column; gap: 0.35rem; }
        .field__label { font-size: 0.82rem; font-weight: 500; color: #8b949e; }
        .field__label span { color: #f87171; margin-left: 2px; }
        .field__input, .field__textarea, .field__select {
          background: #161b22; border: 1px solid #30363d;
          border-radius: 7px; color: #e6edf3; font-size: 0.9rem;
          padding: 0.6rem 0.85rem; width: 100%; box-sizing: border-box;
          transition: border-color 0.15s; font-family: system-ui;
          outline: none;
        }
        .field__input:focus, .field__textarea:focus, .field__select:focus {
          border-color: #3b82f6;
        }
        .field__input--error { border-color: #f87171 !important; }
        .field__textarea { min-height: 100px; resize: vertical; }
        .field__error { font-size: 0.75rem; color: #f87171; }

        /* Members list */
        .members-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .member-row {
          background: #161b22; border: 1px solid #21262d; border-radius: 8px;
          padding: 0.75rem; display: grid; grid-template-columns: 1fr 1fr 1fr auto;
          gap: 0.5rem; align-items: center;
        }
        .member-row input {
          background: #0d1117; border: 1px solid #30363d;
          border-radius: 6px; color: #e6edf3; font-size: 0.82rem;
          padding: 0.4rem 0.6rem; font-family: system-ui; outline: none;
        }
        .member-row input:focus { border-color: #3b82f6; }
        .member-remove {
          background: none; border: none; color: #8b949e;
          cursor: pointer; font-size: 1rem; padding: 0;
          line-height: 1; transition: color 0.15s;
        }
        .member-remove:hover { color: #f87171; }
        .members-add {
          background: none; border: 1px dashed #30363d;
          border-radius: 7px; color: #8b949e; cursor: pointer;
          font-size: 0.82rem; padding: 0.5rem; text-align: center;
          transition: border-color 0.15s, color 0.15s;
        }
        .members-add:hover { border-color: #58a6ff; color: #58a6ff; }

        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border-radius: 8px; font-weight: 500; cursor: pointer;
          transition: all 0.2s; border: none; outline: none;
          font-size: 0.9rem; font-family: system-ui;
        }
        .btn--primary { background: linear-gradient(135deg,#2563eb,#0891b2); color: white; padding: 0.7rem 1.5rem; }
        .btn--primary:hover { filter: brightness(1.1); }
        .btn--lg { padding: 0.85rem 2rem; font-size: 1rem; }
      `}</style>
    </div>
  );
}


interface FieldProps {
  field: FormFieldDef;
  value: unknown;
  error?: string;
  onChange: (v: unknown) => void;
}

function FieldRenderer({ field, value, error, onChange }: FieldProps) {
  if (field.type === 'members_list') {
    return <MembersField field={field} value={value as Member[]} error={error} onChange={onChange} />;
  }

  if (field.type === 'textarea') {
    return (
      <div className="field">
        <label className="field__label">
          {field.label}{field.required && <span>*</span>}
        </label>
        <textarea
          className={`field__textarea${error ? ' field__input--error' : ''}`}
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={e => onChange(e.target.value)}
        />
        {error && <span className="field__error">{error}</span>}
      </div>
    );
  }

  if (field.type === 'select' && field.options) {
    return (
      <div className="field">
        <label className="field__label">
          {field.label}{field.required && <span>*</span>}
        </label>
        <select
          className="field__select"
          value={String(value ?? '')}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">-- Choisir --</option>
          {field.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {error && <span className="field__error">{error}</span>}
      </div>
    );
  }

  // default: text
  return (
    <div className="field">
      <label className="field__label">
        {field.label}{field.required && <span>*</span>}
      </label>
      <input
        type="text"
        className={`field__input${error ? ' field__input--error' : ''}`}
        placeholder={field.placeholder}
        value={String(value ?? '')}
        onChange={e => onChange(e.target.value)}
      />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}


interface MembersProps {
  field: FormFieldDef;
  value: Member[];
  error?: string;
  onChange: (v: Member[]) => void;
}

function MembersField({ field, value, error, onChange }: MembersProps) {
  const members = Array.isArray(value) ? value : [{ nom: '', matricule: '', filiere: '' }];

  const updateMember = (idx: number, key: keyof Member, val: string) => {
    const next = members.map((m, i) => i === idx ? { ...m, [key]: val } : m);
    onChange(next);
  };
  const addMember = () => onChange([...members, { nom: '', matricule: '', filiere: '' }]);
  const removeMember = (idx: number) => onChange(members.filter((_, i) => i !== idx));

  return (
    <div className="field">
      <label className="field__label">
        {field.label}{field.required && <span>*</span>}
      </label>
      <div className="members-list">
        {members.map((m, i) => (
          <div key={i} className="member-row">
            <input
              placeholder="Nom et prénom"
              value={m.nom}
              onChange={e => updateMember(i, 'nom', e.target.value)}
            />
            <input
              placeholder="Matricule"
              value={m.matricule}
              onChange={e => updateMember(i, 'matricule', e.target.value)}
            />
            <input
              placeholder="Filière"
              value={m.filiere}
              onChange={e => updateMember(i, 'filiere', e.target.value)}
            />
            {members.length > 1 && (
              <button type="button" className="member-remove" onClick={() => removeMember(i)}>✕</button>
            )}
          </div>
        ))}
        <button type="button" className="members-add" onClick={addMember}>
          + Ajouter un membre
        </button>
      </div>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
