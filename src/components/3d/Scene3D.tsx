'use client';

import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { ElementData } from '../../types';
import { Table3DMode } from '../../layouts/3d/types';
import { get3DLayoutEngine } from '../../layouts/3d';
import ElementMesh from './ElementMesh';

interface Scene3DProps {
  elements: ElementData[];
  selectedElement: ElementData | null;
  favorites: number[];
  onSelectElement: (el: ElementData) => void;
  onHoverElement: (el: ElementData | null) => void;
  mode: Table3DMode;
}

// Inner scene content (must be inside Canvas)
const SceneContent: React.FC<Scene3DProps> = ({
  elements, selectedElement, favorites, onSelectElement, onHoverElement, mode,
}) => {
  const engine = get3DLayoutEngine(mode);
  const layout = useMemo(() => engine(elements), [engine, elements]);

  const camPos = layout.cameraPosition || [0, 10, 50];
  const camTarget = layout.cameraTarget || [0, 0, 0];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 30, 20]} intensity={1} castShadow />
      <pointLight position={[-20, -10, -20]} intensity={0.3} color="#60a5fa" />
      <pointLight position={[20, -10, 20]} intensity={0.3} color="#f472b6" />

      {/* Stars background */}
      <Stars radius={200} depth={60} count={2000} factor={4} saturation={0.5} fade speed={0.5} />

      {/* Controls */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={10}
        maxDistance={150}
        target={camTarget}
      />

      {/* Elements */}
      {elements.map((el) => {
        const pos = layout.positions.get(el.atomicNumber);
        if (!pos) return null;

        return (
          <ElementMesh
            key={el.atomicNumber}
            element={el}
            position={[pos.x, pos.y, pos.z]}
            isSelected={selectedElement?.atomicNumber === el.atomicNumber}
            isFavorite={favorites.includes(el.atomicNumber)}
            onSelect={onSelectElement}
            onHover={onHoverElement}
          />
        );
      })}
    </>
  );
};

// Main Scene3D component
const Scene3D: React.FC<Scene3DProps> = (props) => {
  const layout = useMemo(() => {
    const engine = get3DLayoutEngine(props.mode);
    return engine(props.elements);
  }, [props.mode, props.elements]);

  const camPos = layout.cameraPosition || [0, 10, 50];

  return (
    <div className="w-full h-[500px] sm:h-[600px] lg:h-[700px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-950 relative">
      {/* Performance hint */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[10px] text-white/60">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Drag to rotate · Scroll to zoom · Click element for details
      </div>

      <Canvas
        camera={{
          position: camPos as [number, number, number],
          fov: 55,
          near: 0.1,
          far: 500,
        }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #0d1117 50%, #111827 100%)' }}
      >
        <Suspense fallback={null}>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
