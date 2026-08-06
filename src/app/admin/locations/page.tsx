'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, MapPin, Plus, Star, Trash2, X } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import {
  ADMIN_INPUT,
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  SearchInput,
  StatusPill,
} from '@/components/admin/ui';

interface State {
  id: string;
  name: string;
  isActive: boolean;
  _count: { cities: number };
}

interface City {
  id: string;
  stateId: string;
  name: string;
  isHub: boolean;
  isActive: boolean;
}

export default function LocationsPage() {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const [newState, setNewState] = useState('');
  const [newCity, setNewCity] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const load = useCallback(
    async (stateId: string, search: string) => {
      setError('');
      const params = new URLSearchParams();
      if (stateId) params.set('stateId', stateId);
      if (search) params.set('search', search);
      try {
        const res = await fetch(`/api/admin/locations?${params}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Could not load locations');
          return;
        }
        setStates(data.states ?? []);
        setCities(data.cities ?? []);
      } catch {
        setError('Could not load locations');
      } finally {
        setLoading(false);
        setCitiesLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setCitiesLoading(Boolean(selected));
    const timer = setTimeout(() => void load(selected, citySearch), 250);
    return () => clearTimeout(timer);
  }, [load, selected, citySearch]);

  async function addState() {
    const name = newState.trim();
    if (!name) return;
    setBusy('new-state');
    try {
      const res = await apiFetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'state', name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not add this state');
        return;
      }
      setNewState('');
      void load(selected, citySearch);
    } finally {
      setBusy(null);
    }
  }

  async function addCity() {
    const name = newCity.trim();
    if (!name || !selected) return;
    setBusy('new-city');
    try {
      const res = await apiFetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'city', stateId: selected, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not add this city');
        return;
      }
      setNewCity('');
      void load(selected, citySearch);
    } finally {
      setBusy(null);
    }
  }

  async function patch(type: 'state' | 'city', id: string, fields: Record<string, unknown>) {
    setBusy(id);
    try {
      const res = await apiFetch('/api/admin/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, ...fields }),
      });
      if (res.ok) void load(selected, citySearch);
    } finally {
      setBusy(null);
    }
  }

  async function removeState(state: State) {
    if (
      !window.confirm(
        `Delete "${state.name}"? Its ${state._count.cities} cit${state._count.cities === 1 ? 'y' : 'ies'} go with it. Candidates and jobs already in that state keep their saved location.`
      )
    ) {
      return;
    }
    setBusy(state.id);
    try {
      const res = await apiFetch(`/api/admin/locations?type=state&id=${state.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (selected === state.id) setSelected('');
        void load(selected === state.id ? '' : selected, citySearch);
      }
    } finally {
      setBusy(null);
    }
  }

  async function removeCity(city: City) {
    if (!window.confirm(`Delete "${city.name}"?`)) return;
    setBusy(city.id);
    try {
      const res = await apiFetch(`/api/admin/locations?type=city&id=${city.id}`, {
        method: 'DELETE',
      });
      if (res.ok) void load(selected, citySearch);
    } finally {
      setBusy(null);
    }
  }

  const selectedState = states.find((s) => s.id === selected);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Locations"
        subtitle={`${states.length} state${states.length === 1 ? '' : 's'} · pick one to manage its cities`}
      />

      {error && (
        <p className="bg-caution-soft border border-[#F3DBB4] text-[#9A5D00] rounded-[12px] px-4 py-3 text-[13.5px]">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="States">
          <div className="flex gap-2 p-4 border-b border-line-soft">
            <input
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void addState();
              }}
              placeholder="New state name"
              className={`${ADMIN_INPUT} flex-1`}
            />
            <ActionButton
              tone="primary"
              onClick={addState}
              disabled={busy === 'new-state' || !newState.trim()}
            >
              {busy === 'new-state' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Add
            </ActionButton>
          </div>

          {states.length === 0 ? (
            <div className="py-12 px-6">
              <EmptyState icon={MapPin} title="No states yet" body="Add your first state above." />
            </div>
          ) : (
            <ul className="divide-y divide-line-soft max-h-[520px] overflow-y-auto scroll-slim">
              {states.map((s) => (
                <li
                  key={s.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors ${
                    selected === s.id ? 'bg-brand-50' : 'hover:bg-canvas'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelected(s.id);
                      setCitySearch('');
                    }}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span
                      className={`block text-[13.5px] font-semibold truncate ${
                        selected === s.id ? 'text-brand-700' : 'text-ink'
                      }`}
                    >
                      {s.name}
                    </span>
                    <span className="block text-[12px] text-ink-muted">
                      {s._count.cities} cit{s._count.cities === 1 ? 'y' : 'ies'}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!s.isActive && <StatusPill label="Hidden" tone="neutral" />}
                    <button
                      onClick={() => patch('state', s.id, { isActive: !s.isActive })}
                      disabled={busy === s.id}
                      aria-label={s.isActive ? `Hide ${s.name}` : `Show ${s.name}`}
                      className="p-1.5 rounded-[8px] border border-line bg-white text-ink-muted hover:text-[#9A5D00] hover:border-[#F3DBB4] transition-colors disabled:opacity-50"
                    >
                      {s.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => removeState(s)}
                      disabled={busy === s.id}
                      aria-label={`Delete ${s.name}`}
                      className="p-1.5 rounded-[8px] border border-line bg-white text-ink-muted hover:text-[#B32B2B] hover:border-[#F3C9C9] transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={selectedState ? `Cities in ${selectedState.name}` : 'Cities'}>
          {!selected ? (
            <div className="py-16 px-6">
              <EmptyState
                icon={MapPin}
                title="Pick a state"
                body="Select a state on the left to see and manage its cities."
              />
            </div>
          ) : (
            <>
              <div className="flex gap-2 p-4 border-b border-line-soft">
                <input
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void addCity();
                  }}
                  placeholder="New city name"
                  className={`${ADMIN_INPUT} flex-1`}
                />
                <ActionButton
                  tone="primary"
                  onClick={addCity}
                  disabled={busy === 'new-city' || !newCity.trim()}
                >
                  {busy === 'new-city' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Add
                </ActionButton>
              </div>

              <div className="p-4 border-b border-line-soft">
                <SearchInput value={citySearch} onChange={setCitySearch} placeholder="Search cities…" />
              </div>

              {citiesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
                </div>
              ) : cities.length === 0 ? (
                <div className="py-12 px-6">
                  <EmptyState
                    icon={MapPin}
                    title="No cities yet"
                    body={`Add the first city for ${selectedState?.name}.`}
                  />
                </div>
              ) : (
                <ul className="divide-y divide-line-soft max-h-[420px] overflow-y-auto scroll-slim">
                  {cities.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-ink truncate">{c.name}</p>
                        {c.isHub && (
                          <span className="text-[11.5px] text-brand-600 font-semibold">
                            Automotive hub
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!c.isActive && <StatusPill label="Hidden" tone="neutral" />}
                        <button
                          onClick={() => patch('city', c.id, { isHub: !c.isHub })}
                          disabled={busy === c.id}
                          aria-label={c.isHub ? `Unmark ${c.name} as hub` : `Mark ${c.name} as hub`}
                          className={`p-1.5 rounded-[8px] border bg-white transition-colors disabled:opacity-50 ${
                            c.isHub
                              ? 'border-brand-200 text-brand-600'
                              : 'border-line text-ink-muted hover:text-brand-700 hover:border-brand-200'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => patch('city', c.id, { isActive: !c.isActive })}
                          disabled={busy === c.id}
                          aria-label={c.isActive ? `Hide ${c.name}` : `Show ${c.name}`}
                          className="p-1.5 rounded-[8px] border border-line bg-white text-ink-muted hover:text-[#9A5D00] hover:border-[#F3DBB4] transition-colors disabled:opacity-50"
                        >
                          {c.isActive ? (
                            <X className="w-3.5 h-3.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => removeCity(c)}
                          disabled={busy === c.id}
                          aria-label={`Delete ${c.name}`}
                          className="p-1.5 rounded-[8px] border border-line bg-white text-ink-muted hover:text-[#B32B2B] hover:border-[#F3C9C9] transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
