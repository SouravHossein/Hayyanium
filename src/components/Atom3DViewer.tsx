import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface ShellInfo {
  shell: number;
  electrons: number;
}

interface Atom3DViewerProps {
  shells: ShellInfo[];
  symbol: string;
}

const Atom3DViewer: React.FC<Atom3DViewerProps> = ({ shells, symbol }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    const width = currentMount.clientWidth;
    const height = 240; // Fixed height for consistency
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    currentMount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.enablePan = false;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Nucleus
    const nucleusGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const nucleusMaterial = new THREE.MeshStandardMaterial({ color: 0x4A5568, roughness: 0.5 });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    scene.add(nucleus);

    // Shells and Electrons
    const shellGroups: THREE.Group[] = [];
    const validShells = shells.filter(s => s.electrons > 0).sort((a,b) => a.shell - b.shell);

    validShells.forEach(({ shell, electrons }) => {
      const shellGroup = new THREE.Group();
      
      // Orbit path
      const orbitGeometry = new THREE.TorusGeometry(shell * 1.2, 0.02, 16, 100);
      const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x4A5568 });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      shellGroup.add(orbit);

      // Electrons
      const electronMaterial = new THREE.MeshStandardMaterial({ color: 0x4299E1, emissive: 0x0BC5EA, emissiveIntensity: 0.5 });
      const angleStep = (2 * Math.PI) / electrons;
      
      for (let i = 0; i < electrons; i++) {
          const electronGeometry = new THREE.SphereGeometry(0.15, 16, 16);
          const electron = new THREE.Mesh(electronGeometry, electronMaterial);
          const angle = i * angleStep;
          electron.position.x = shell * 1.2 * Math.cos(angle);
          electron.position.y = shell * 1.2 * Math.sin(angle);
          shellGroup.add(electron);
      }
      
      // Randomly orient each shell's plane
      shellGroup.rotation.x = Math.random() * Math.PI;
      shellGroup.rotation.y = Math.random() * Math.PI;
      
      shellGroups.push(shellGroup);
      scene.add(shellGroup);
    });

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      // Animate shells
      shellGroups.forEach((group, index) => {
        const speed = 0.005 / (index + 1);
        group.rotation.z += speed;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
        const newWidth = currentMount.clientWidth;
        renderer.setSize(newWidth, height);
        camera.aspect = newWidth / height;
        camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
              if (object.geometry) {
                  object.geometry.dispose();
              }
              if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
              }
          }
      });
      renderer.dispose();
    };
  }, [shells, symbol]);

  return <div ref={mountRef} className="w-full h-[240px] cursor-grab" />;
};

export default Atom3DViewer;