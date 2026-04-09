import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ElementData } from '../types';
import { CrystalStructureData } from '../data/crystal_structures';
import { CATEGORY_HEX_COLORS } from '../constants';

interface CrystalStructureViewerProps {
  element: ElementData;
  structureData: CrystalStructureData;
}

// Atom positions for a single unit cell, in fractional coordinates
const unitCellPositions: Record<string, [number, number, number][]> = {
    'BCC': [ [0,0,0], [1,0,0], [0,1,0], [0,0,1], [1,1,0], [1,0,1], [0,1,1], [1,1,1], [0.5,0.5,0.5] ],
    'FCC': [ [0,0,0], [1,0,0], [0,1,0], [0,0,1], [1,1,0], [1,0,1], [0,1,1], [1,1,1], [0.5,0.5,0], [0.5,0,0.5], [0,0.5,0.5], [1,0.5,0.5], [0.5,1,0.5], [0.5,0.5,1] ],
    'Diamond Cubic': [ [0,0,0], [1,0,0], [0,1,0], [0,0,1], [1,1,0], [1,0,1], [0,1,1], [1,1,1], [0.5,0.5,0], [0.5,0,0.5], [0,0.5,0.5], [1,0.5,0.5], [0.5,1,0.5], [0.5,0.5,1], [0.25,0.25,0.25], [0.75,0.75,0.25], [0.75,0.25,0.75], [0.25,0.75,0.75] ],
    'HCP': [ [1,0,0], [0.5,0.866,0], [-0.5,0.866,0], [-1,0,0], [-0.5,-0.866,0], [0.5,-0.866,0], [0,0,0], [1,0,1], [0.5,0.866,1], [-0.5,0.866,1], [-1,0,1], [-0.5,-0.866,1], [0.5,-0.866,1], [0,0,1], [0.5,0.288,0.5], [-0.5,0.288,0.5], [0,-0.577,0.5] ],
    'Rhombohedral': [ [0,0,0], [1,0,0], [0,1,0], [0,0,1], [1,1,0], [1,0,1], [0,1,1], [1,1,1] ] // Simplified as a distorted cube
};

const CrystalStructureViewer: React.FC<CrystalStructureViewerProps> = ({ element, structureData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isWireframe, setIsWireframe] = useState(false);
  // FIX: Initializing useRef with null to fix "Expected 1 arguments, but got 0" error, likely due to a strict TypeScript/linter configuration.
  const controlsRef = useRef<OrbitControls | null>(null);
  const initialCameraPos = useMemo(() => new THREE.Vector3(structureData.a * 1.5, structureData.a * 1.2, structureData.a * 1.5), [structureData.a]);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    const width = currentMount.clientWidth;
    const height = 300;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.copy(initialCameraPos);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
    pointLight.position.set(structureData.a, structureData.a * 2, structureData.a * 1.5);
    scene.add(pointLight);

    const elementColor = CATEGORY_HEX_COLORS[element.category] || '#cccccc';
    const atomMaterial = new THREE.MeshPhongMaterial({ color: elementColor, wireframe: isWireframe });
    const atomGeometry = new THREE.SphereGeometry(structureData.a * 0.15, 16, 16);
    
    const latticeGroup = new THREE.Group();
    const positions = unitCellPositions[structureData.lattice] || [];
    
    positions.forEach(pos => {
        const atom = new THREE.Mesh(atomGeometry, atomMaterial);
        atom.position.set(pos[0] * structureData.a, pos[1] * (structureData.c || structureData.a), pos[2] * structureData.a);
        latticeGroup.add(atom);
    });

    const boxGeom = new THREE.BoxGeometry(structureData.a, structureData.c || structureData.a, structureData.a);
    const edges = new THREE.EdgesGeometry(boxGeom);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xaaaaaa }));
    latticeGroup.add(line);
    
    const box = new THREE.Box3().setFromObject(latticeGroup);
    const center = box.getCenter(new THREE.Vector3());
    latticeGroup.position.sub(center);
    controls.target.copy(latticeGroup.position);
    scene.add(latticeGroup);

    let animationFrameId: number;
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        const newWidth = currentMount.clientWidth;
        renderer.setSize(newWidth, height);
        camera.aspect = newWidth / height;
        camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.traverse(obj => {
          if (obj instanceof THREE.Mesh) {
              obj.geometry.dispose();
              if(Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
              else { // @ts-ignore
                obj.material.dispose()
              };
          }
      });
      renderer.dispose();
    };
  }, [element, structureData, isWireframe, initialCameraPos]);

  const resetCamera = () => {
      if (controlsRef.current) {
          controlsRef.current.reset();
      }
  };

  return (
    <div>
        <div ref={mountRef} className="w-full h-[300px] rounded-md bg-gray-200 dark:bg-gray-900 cursor-grab"></div>
        <div className="flex justify-center gap-2 mt-2">
            <button onClick={resetCamera} className="px-3 py-1 text-xs rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition">Reset Camera</button>
            <button onClick={() => setIsWireframe(!isWireframe)} className="px-3 py-1 text-xs rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition">
                {isWireframe ? 'Solid View' : 'Wireframe'}
            </button>
        </div>
    </div>
  );
};

export default CrystalStructureViewer;
