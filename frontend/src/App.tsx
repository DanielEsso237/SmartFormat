import { useState, useCallback } from 'react';
import type { AppState } from './types';
import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';

const INITIAL: AppState = { step: 'landing' };

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL);

  const update = useCallback((patch: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  if (state.step === 'landing') {
    return <LandingPage onStart={() => update({ step: 'uploading' })} />;
  }

  return <WorkspacePage state={state} update={update} reset={reset} />;
}
