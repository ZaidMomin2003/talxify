'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { Analyser } from '@/lib/live-audio/utils';

interface LiveAudioVisuals3DProps {
  inputNode: GainNode | null;
  outputNode: GainNode | null;
}

const LiveAudioVisuals3D: React.FC<LiveAudioVisuals3DProps> = ({ inputNode, outputNode }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    if (!inputNode || !outputNode) return;

    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let inputAnalyser: Analyser, outputAnalyser: Analyser;
    let particles: THREE.Points, material: THREE.PointsMaterial;

    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      mountRef.current!.appendChild(renderer.domElement);

      // Environment Map
      new EXRLoader().load('/piz_compressed.exr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
      });

      // Particles
      const particleCount = 5000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Analysers
      inputAnalyser = new Analyser(inputNode);
      outputAnalyser = new Analyser(outputNode);

      window.addEventListener('resize', onWindowResize);
      animate();
    };

    const animate = () => {
      requestAnimationFrame(animate);
      
      inputAnalyser.update();
      outputAnalyser.update();

      const inputData = inputAnalyser.data;
      const outputData = outputAnalyser.data;
      
      const inputAvg = inputData.reduce((a, b) => a + b, 0) / inputData.length;
      const outputAvg = outputData.reduce((a, b) => a + b, 0) / outputData.length;

      const scale = 1 + (inputAvg / 128) * 0.2 + (outputAvg / 128) * 0.5;
      particles.scale.set(scale, scale, scale);
      
      particles.rotation.y += 0.0005;
      
      material.size = 0.02 + (outputAvg / 128) * 0.03;
      material.opacity = 0.5 + (inputAvg / 128) * 0.5;


      renderer.render(scene, camera);
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    init();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [inputNode, outputNode]);

  return <div ref={mountRef} className="absolute inset-0 -z-10" />;
};

export default LiveAudioVisuals3D;
