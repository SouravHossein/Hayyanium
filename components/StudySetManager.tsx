import React, { useMemo, useState } from 'react';
import { ElementData, StudySet } from '../types';
interface StudySetManagerProps {
  allElements: ElementData[];
  filteredElements: ElementData[];
  activeSetId: string | null;
  onSelectSet: (setId: string | null) => void;
  customSets: StudySet[];
  onCustomSetsChange: (sets: StudySet[]) => void;
}

const StudySetManager: React.FC<StudySetManagerProps> = ({ allElements, filteredElements, activeSetId, onSelectSet, customSets, onCustomSetsChange }) => {
  const [customName, setCustomName] = useState('');
  const [selectedBuiltIn, setSelectedBuiltIn] = useState<string>('');

  const builtInSets = useMemo<StudySet[]>(() => {
    const sets: StudySet[] = [];
    const byCategory = Array.from(new Set(allElements.map(el => el.category)));
    byCategory.forEach(category => {
      sets.push({
        id: `builtin-category-${category}`,
        name: `Category: ${category}`,
        elementIds: allElements.filter(el => el.category === category).map(el => el.atomicNumber),
        source: 'builtin',
        createdAt: Date.now(),
      });
    });
    const byBlock = Array.from(new Set(allElements.map(el => el.block)));
    byBlock.forEach(block => {
      sets.push({
        id: `builtin-block-${block}`,
        name: `Block: ${block.toUpperCase()}`,
        elementIds: allElements.filter(el => el.block === block).map(el => el.atomicNumber),
        source: 'builtin',
        createdAt: Date.now(),
      });
    });
    for (let period = 1; period <= 7; period += 1) {
      sets.push({
        id: `builtin-period-${period}`,
        name: `Period ${period}`,
        elementIds: allElements.filter(el => el.period === period).map(el => el.atomicNumber),
        source: 'builtin',
        createdAt: Date.now(),
      });
    }
    for (let group = 1; group <= 18; group += 1) {
      sets.push({
        id: `builtin-group-${group}`,
        name: `Group ${group}`,
        elementIds: allElements.filter(el => el.group === group).map(el => el.atomicNumber),
        source: 'builtin',
        createdAt: Date.now(),
      });
    }
    ['solid', 'liquid', 'gas', 'unknown'].forEach(state => {
      sets.push({
        id: `builtin-state-${state}`,
        name: `State at STP: ${state}`,
        elementIds: allElements.filter(el => el.stateAtSTP.toLowerCase() === state).map(el => el.atomicNumber),
        source: 'builtin',
        createdAt: Date.now(),
      });
    });
    return sets;
  }, [allElements]);

  const handleCreateCustom = () => {
    if (!customName.trim() || filteredElements.length === 0) return;
    const newSet: StudySet = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      elementIds: filteredElements.map(el => el.atomicNumber),
      source: 'custom',
      createdAt: Date.now(),
    };
    onCustomSetsChange([newSet, ...customSets]);
    setCustomName('');
    onSelectSet(newSet.id);
  };

  const handleDeleteCustom = (id: string) => {
    onCustomSetsChange(customSets.filter(set => set.id !== id));
    if (activeSetId === id) onSelectSet(null);
  };

  const applyBuiltIn = () => {
    if (!selectedBuiltIn) return;
    onSelectSet(selectedBuiltIn);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Built‑in Study Sets</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            value={selectedBuiltIn}
            onChange={e => setSelectedBuiltIn(e.target.value)}
          >
            <option value="">Select a built‑in set</option>
            {builtInSets.map(set => (
              <option key={set.id} value={set.id}>{set.name}</option>
            ))}
          </select>
          <button onClick={applyBuiltIn} className="px-3 py-2 rounded-md bg-cyan-600 text-white font-semibold">Use Set</button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Custom Study Sets</h3>
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <input
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="Custom set name"
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
          <button onClick={handleCreateCustom} className="px-3 py-2 rounded-md bg-emerald-600 text-white font-semibold">
            Save Current Filters ({filteredElements.length})
          </button>
        </div>
        <div className="space-y-2">
          {customSets.length === 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-300">No custom sets yet.</div>
          )}
          {customSets.map(set => (
            <div key={set.id} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{set.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{set.elementIds.length} elements</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onSelectSet(set.id)} className={`px-3 py-1 rounded-md text-sm ${activeSetId === set.id ? 'bg-emerald-600 text-white' : 'bg-cyan-600 text-white'}`}>
                  {activeSetId === set.id ? 'Active' : 'Use'}
                </button>
                <button onClick={() => handleDeleteCustom(set.id)} className="px-3 py-1 rounded-md bg-rose-600 text-white text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudySetManager;
