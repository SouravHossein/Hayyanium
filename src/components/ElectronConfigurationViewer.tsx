import React, { Suspense, lazy, useMemo, useState } from 'react';

const Atom3DViewer = lazy(() => import('./Atom3DViewer'));

const NOBLE_GAS_CONFIGS: Record<string, string> = {
  He: '1s2',
  Ne: '1s2 2s2 2p6',
  Ar: '1s2 2s2 2p6 3s2 3p6',
  Kr: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6',
  Xe: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6',
  Rn: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6 4f14 5d10 6s2 6p6',
};

const ORBITAL_BOXES: Record<string, number> = { s: 1, p: 3, d: 5, f: 7 };
const ORBITAL_ORDER = ['s', 'p', 'd', 'f'];

interface ParsedOrbital {
  shell: number;
  type: string;
  electrons: number;
}

interface ShellInfo {
  shell: number;
  electrons: number;
}

const expandElectronConfiguration = (config: string): string => {
  const match = config.match(/\[(\w+)\]\s*(.*)/);
  if (match) {
    const nobleGas = match[1];
    const rest = match[2];
    const core = NOBLE_GAS_CONFIGS[nobleGas] || '';
    return `${core} ${rest}`.trim();
  }
  return config;
};

const parseOrbitals = (fullConfig: string): ParsedOrbital[] => {
  const orbitalRegex = /(\d+)([spdf])(\d+)/g;
  let match;
  const orbitals: ParsedOrbital[] = [];
  while ((match = orbitalRegex.exec(fullConfig)) !== null) {
    orbitals.push({
      shell: parseInt(match[1]),
      type: match[2],
      electrons: parseInt(match[3]),
    });
  }
  return orbitals;
};

const getShells = (parsedOrbitals: ParsedOrbital[]): ShellInfo[] => {
  const shells: Record<number, number> = {};
  parsedOrbitals.forEach(orb => {
    if (!shells[orb.shell]) {
      shells[orb.shell] = 0;
    }
    shells[orb.shell] += orb.electrons;
  });
  return Object.entries(shells).map(([num, count]) => ({ shell: parseInt(num), electrons: count }));
};


const BohrModel: React.FC<{ shells: ShellInfo[], symbol: string }> = ({ shells, symbol }) => {
    const size = 200;
    const center = size / 2;
    const nucleusRadius = 12;
    const maxRadius = center - 15;
    const shellCount = shells.length > 0 ? Math.max(...shells.map(s => s.shell)) : 0;
    const radiusStep = shellCount > 0 ? maxRadius / shellCount : 0;
  
    // Filter out empty shells and sort
    const validShells = shells.filter(s => s.electrons > 0).sort((a,b) => a.shell - b.shell);

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Bohr model for ${symbol}`}>
        <defs>
            <radialGradient id="nucleusGradient">
                <stop offset="0%" stopColor="#a0aec0" />
                <stop offset="100%" stopColor="#4a5568" />
            </radialGradient>
        </defs>
        <circle cx={center} cy={center} r={nucleusRadius} fill="url(#nucleusGradient)" />
        <text x={center} y={center + 4} textAnchor="middle" fill="white" fontSize="10px" fontWeight="bold">{symbol}</text>
        
        {validShells.map(({ shell, electrons }) => {
          const radius = shell * radiusStep;
          if (radius === 0) return null;
          const angleStep = 360 / electrons;
          const initialAngle = shell * 15;
          return (
            <g key={shell}>
              <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
              {Array.from({ length: electrons }).map((_, j) => {
                const angle = initialAngle + j * angleStep;
                const x = center + radius * Math.cos((angle * Math.PI) / 180);
                const y = center + radius * Math.sin((angle * Math.PI) / 180);
                return <circle key={j} cx={x} cy={y} r="3" fill="currentColor" className="text-cyan-400" />;
              })}
            </g>
          );
        })}
      </svg>
    );
};

const OrbitalDiagram: React.FC<{ orbitals: ParsedOrbital[] }> = ({ orbitals }) => {
    const sortedOrbitals = [...orbitals].sort((a, b) => {
      if (a.shell !== b.shell) return a.shell - b.shell;
      return ORBITAL_ORDER.indexOf(a.type) - ORBITAL_ORDER.indexOf(b.type);
    });
  
    return (
      <div className="w-full text-xs sm:text-sm">
        {sortedOrbitals.map(({ shell, type, electrons }, index) => {
          const numBoxes = ORBITAL_BOXES[type];
  
          return (
            <div key={index} className="flex items-center space-x-2 my-2" role="group" aria-label={`Orbital ${shell}${type}`}>
              <span className="font-mono w-8 text-right pr-2 text-gray-500 dark:text-gray-400">{`${shell}${type}`}</span>
              <div className="flex space-x-0.5" role="presentation">
                {Array.from({ length: numBoxes }).map((_, boxIndex) => {
                    const arrows = [];
                    // Fill up-arrows first (Hund's rule)
                    if (electrons > boxIndex) {
                        arrows.push('↑');
                    }
                    // Fill down-arrows after all boxes have one up-arrow
                    if (electrons > boxIndex + numBoxes) {
                        arrows.push('↓');
                    }
  
                  return (
                    <div key={boxIndex} className="w-6 h-6 border border-gray-400 dark:border-gray-600 flex items-center justify-center space-x-px text-base">
                      {arrows.map((arrow, i) => (
                        <span key={i} aria-hidden="true" className={arrow === '↑' ? 'text-cyan-500' : 'text-fuchsia-500'}>{arrow}</span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
};
  

interface ElectronConfigurationViewerProps {
    configuration: string;
    symbol: string;
}

const ElectronConfigurationViewer: React.FC<ElectronConfigurationViewerProps> = ({ configuration, symbol }) => {
  const [view, setView] = useState<'bohr' | 'orbital' | '3d'>('bohr');

  const { fullConfiguration, shells, parsedOrbitals } = useMemo(() => {
    const fullConfig = expandElectronConfiguration(configuration);
    const orbitals = parseOrbitals(fullConfig);
    const shellData = getShells(orbitals);
    return { fullConfiguration: fullConfig, shells: shellData, parsedOrbitals: orbitals };
  }, [configuration]);

  const buttonBaseClasses = "px-4 py-2 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-cyan-500";
  const activeButtonClasses = "bg-cyan-500 text-white";
  const inactiveButtonClasses = "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600";

  return (
    <div>
      <h4 className="font-bold text-cyan-600 dark:text-cyan-300 text-lg mb-2">Electron Configuration</h4>
      <p className="text-sm font-mono mb-4 p-2 bg-gray-100 dark:bg-gray-900 rounded-md text-gray-600 dark:text-gray-300">{configuration}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setView('bohr')} className={`${buttonBaseClasses} ${view === 'bohr' ? activeButtonClasses : inactiveButtonClasses}`}>Bohr Model (2D)</button>
        <button onClick={() => setView('orbital')} className={`${buttonBaseClasses} ${view === 'orbital' ? activeButtonClasses : inactiveButtonClasses}`}>Orbital Diagram</button>
        <button onClick={() => setView('3d')} className={`${buttonBaseClasses} ${view === '3d' ? activeButtonClasses : inactiveButtonClasses}`}>Atomic Model (3D)</button>
      </div>

      <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-md flex justify-center items-center min-h-[256px]">
        {view === 'bohr' && <BohrModel shells={shells} symbol={symbol} />}
        {view === 'orbital' && <OrbitalDiagram orbitals={parsedOrbitals} />}
        {view === '3d' && (
          <Suspense fallback={<div className="text-sm text-gray-500 dark:text-gray-400">Loading 3D model...</div>}>
            <Atom3DViewer key={symbol} shells={shells} symbol={symbol} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default ElectronConfigurationViewer;
