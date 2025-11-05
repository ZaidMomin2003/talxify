'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Globe = ({
  baseColor,
  markerColor,
  glowColor,
  scale = 1,
}: {
  baseColor: [number, number, number];
  markerColor: [number, number, number];
  glowColor: [number, number, number];
  scale?: number;
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Globe Geometry
    const geometry = new THREE.IcosahedronGeometry(5, 20);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(...baseColor),
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    
    const globe = new THREE.Mesh(geometry, material);
    globe.scale.set(scale, scale, scale);
    scene.add(globe);
    
    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [baseColor, markerColor, glowColor, scale]);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default Globe;
