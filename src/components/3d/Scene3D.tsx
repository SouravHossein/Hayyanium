'use client';

import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Float } from '@react-three/drei';
import { ElementData } from '../../types';
import { Table3DMode } from '../../layouts/3d/types';
import { get3DLayoutEngine } from '../../layouts/3d';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { theme } = useTheme();
  const engine = get3DLayoutEngine(mode);
  const layout = useMemo(() => engine(elements), [engine, elements]);

  const camTarget = layout.cameraTarget || [0, 0, 0];
  const isDark = theme === 'dark';

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={isDark ? 0.4 : 0.8} />
      <directionalLight position={[20, 30, 20]} intensity={isDark ? 0.8 : 1.2} castShadow />
      <pointLight position={[-20, -10, -20]} intensity={0.4} color={isDark ? "#60a5fa" : "#3b82f6"} />
      <pointLight position={[20, -10, 20]} intensity={0.4} color={isDark ? "#f472b6" : "#ec4899"} />

      {/* Stars background - only in dark mode */}
      {isDark && (
        <Stars radius={200} depth={60} count={3000} factor={4} saturation={0.5} fade speed={1} />
      )}

      {/* Controls */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.4}
        minDistance={8}
        maxDistance={150}
        target={camTarget}
      />

      {/* Elements */}
      {elements.map((el) => {
        const item = layout.positions.get(el.atomicNumber);
        if (!item) return null;

        return (
          <ElementMesh
            key={el.atomicNumber}
            element={el}
            position={[item.x, item.y, item.z]}
            rotation={item.rotation}
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
  const { theme } = useTheme();
  
  const layout = useMemo(() => {
    const engine = get3DLayoutEngine(props.mode);
    return engine(props.elements);
  }, [props.mode, props.elements]);

  const camPos = layout.cameraPosition || [0, 10, 50];
  const isDark = theme === 'dark';

  const bgGradient = isDark 
    ? 'linear-gradient(180deg, #0a0a1a 0%, #0d1117 50%, #111827 100%)'
    : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)';

  return (
    <div className={`w-full h-[500px] sm:h-[600px] lg:h-[750px] rounded-2xl overflow-hidden border transition-colors duration-500 ${
      isDark ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'
    } relative shadow-2xl`}>
      {/* Performance hint */}
      <div className={`absolute top-3 left-3 z-10 flex items-center gap-2 backdrop-blur-md rounded-lg px-3 py-1.5 text-[10px] ${
        isDark ? 'bg-black/40 text-white/70' : 'bg-white/60 text-gray-600 border border-gray-100'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`} />
        Interactive Spatial Engine · Drag to explore
      </div>

      <Canvas
        shadows
        camera={{
          position: camPos as [number, number, number],
          fov: 50,
          near: 0.1,
          far: 500,
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: bgGradient }}
      >
        <Suspense fallback={null}>
          <SceneContent {...props} />
          {!isDark && <Environment preset="city" />}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
