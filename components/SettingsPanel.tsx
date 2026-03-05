import React from 'react';
import { UiSettings } from '../types';

interface SettingsPanelProps {
  settings: UiSettings;
  onChange: (next: UiSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange }) => {
  const toggle = (key: keyof UiSettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Accessibility & Display</h2>
      <div className="grid gap-3">
        <label className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <span>
            <div className="font-semibold text-gray-800 dark:text-gray-100">High contrast</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Boost contrast across the interface.</div>
          </span>
          <input type="checkbox" checked={settings.highContrast} onChange={() => toggle('highContrast')} />
        </label>
        <label className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <span>
            <div className="font-semibold text-gray-800 dark:text-gray-100">Reduced motion</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Minimize animations and transitions.</div>
          </span>
          <input type="checkbox" checked={settings.reducedMotion} onChange={() => toggle('reducedMotion')} />
        </label>
        <label className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <span>
            <div className="font-semibold text-gray-800 dark:text-gray-100">Dyslexia‑friendly font</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Switch to a more legible font stack.</div>
          </span>
          <input type="checkbox" checked={settings.dyslexiaFont} onChange={() => toggle('dyslexiaFont')} />
        </label>
      </div>
    </div>
  );
};

export default SettingsPanel;
