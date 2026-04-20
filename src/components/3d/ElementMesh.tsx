import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ElementData } from '../../types';
import { CATEGORY_HEX_COLORS } from '../../constants';

interface ElementMeshProps {
  element: ElementData;
  position: [number, number, number];
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
  element, position, isSelected, isFavorite, onSelect, onHover,
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
    const targetScale = hovered || isSelected ? 1.25 : 1;
    const s = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(s, targetScale, 0.1));
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect(element); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(element); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); onHover(null); document.body.style.cursor = 'auto'; }}
    >
      <boxGeometry args={[1.8, 1.8, 0.4]} />
      <meshStandardMaterial
        color={baseColor}
        emissive={hovered || isSelected ? emissiveColor : '#000000'}
        emissiveIntensity={hovered ? 0.6 : isSelected ? 0.8 : 0}
        metalness={0.1}
        roughness={0.6}
        transparent
        opacity={0.92}
      />

      {/* HTML overlay for element label */}
      <Html
        center
        distanceFactor={12}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          width: '50px',
          textAlign: 'center',
        }}
      >
        <div style={{
          color: '#fff',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          lineHeight: 1.1,
        }}>
          <div style={{ fontSize: '8px', opacity: 0.7 }}>{element.atomicNumber}</div>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>{element.symbol}</div>
          {(hovered || isSelected) && (
            <div style={{ fontSize: '7px', opacity: 0.8, marginTop: 1 }}>{element.name}</div>
          )}
        </div>
      </Html>

      {/* Favorite star */}
      {isFavorite && (
        <Html
          position={[0.7, 0.7, 0.3]}
          center
          distanceFactor={12}
          style={{ pointerEvents: 'none' }}
        >
          <span style={{ fontSize: '10px', color: '#fbbf24' }}>★</span>
        </Html>
      )}
    </mesh>
  );
};

export default ElementMesh;
