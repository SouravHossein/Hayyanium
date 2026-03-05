import { useCallback, useMemo, useState } from 'react';
import { UrlState } from '../types';

const parseNumber = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const useUrlState = (defaults: UrlState) => {
  const initial = useMemo<UrlState>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const tabValue = tab === 'learn' || tab === 'classroom' || tab === 'settings' ? tab : 'explore';
    return {
      tab: tabValue,
      search: params.get('q') ?? defaults.search,
      filters: {
        category: params.get('category') ?? defaults.filters.category,
        state: params.get('state') ?? defaults.filters.state,
      },
      elementId: parseNumber(params.get('elementId')),
      studySetId: params.get('studySetId') ?? null,
    };
  }, [defaults.filters.category, defaults.filters.state, defaults.search]);

  const [urlState, setUrlStateState] = useState<UrlState>(initial);

  const setUrlState = useCallback((next: UrlState) => {
    setUrlStateState(next);
    const params = new URLSearchParams();
    if (next.tab !== 'explore') params.set('tab', next.tab);
    if (next.search) params.set('q', next.search);
    if (next.filters.category) params.set('category', next.filters.category);
    if (next.filters.state) params.set('state', next.filters.state);
    if (next.elementId !== null) params.set('elementId', String(next.elementId));
    if (next.studySetId) params.set('studySetId', next.studySetId);
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, []);

  return [urlState, setUrlState] as const;
};
