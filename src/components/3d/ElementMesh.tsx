import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ElementData } from '../../types';
import { CATEGORY_HEX_COLORS } from '../../constants';

interface ElementMeshProps {
  element: ElementData;
  position: [number, number, number];
  rotation?: [number, number, number];
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (el: ElementData) => void;
  onHover: (el: ElementData | null) => void;
}

const BLOCK_COLORS: Record<string, string> = {
  s: '#4ade80',
  p: '#60a5fa',
  d: '#facc15',
  f: '#f472b6',
};

const ElementMesh: React.FC<ElementMeshProps> = ({
  element, position, rotation, isSelected, isFavorite, onSelect, onHover,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const baseColor = useMemo(() => {
    return CATEGORY_HEX_COLORS[element.category] || '#888888';
  }, [element.category]);

  const emissiveColor = useMemo(() => {
    return BLOCK_COLORS[element.block] || '#4ade80';
  }, [element.block]);

  // Smooth hover animation
  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = hovered || isSelected ? 1.35 : 1;
    const s = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(s, targetScale, 0.1));
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation || [0, 0, 0]}
      onClick={(e) => { e.stopPropagation(); onSelect(element); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(element); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); onHover(null); document.body.style.cursor = 'auto'; }}
    >
      <boxGeometry args={[1.7, 1.7, 0.4]} />
      <meshStandardMaterial
        color={baseColor}
        emissive={hovered || isSelected ? emissiveColor : '#000000'}
        emissiveIntensity={hovered ? 0.7 : isSelected ? 0.9 : 0}
        metalness={0.2}
        roughness={0.4}
        transparent
        opacity={0.95}
      />

      {/* HTML overlay for element label */}
      <Html
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          width: '80px',
          textAlign: 'center',
        }}
      >
        <div style={{
          color: '#fff',
          textShadow: '0 2px 8px rgba(0,0,0,1)',
          lineHeight: 0.9,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '8px', fontWeight: 700, opacity: 0.85, marginBottom: 1 }}>{element.atomicNumber}</div>
          <div style={{ fontSize: '50px', fontWeight: 600, letterSpacing: '-0.02em' }}>{element.symbol}</div>
          {(hovered || isSelected) && (
            <div style={{
              fontSize: '10px',
              fontWeight: 600,
              marginTop: 4,
              background: 'rgba(0,0,0,0.7)',
              padding: '2px 6px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              whiteSpace: 'nowrap'
            }}>
              {element.name}
            </div>
          )}
        </div>
      </Html>

      {/* Favorite star */}
      {isFavorite && (
        <Html
          position={[0.7, 0.7, 0.25]}
          center
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <span style={{ fontSize: '14px', color: '#fbbf24', textShadow: '0 0 6px rgba(0,0,0,0.9)' }}>★</span>
        </Html>
      )}
    </mesh>
  );
};

export default ElementMesh;
