'use client';
import { useEffect, useRef } from 'react';
import { Color } from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  default as globeVertexShader,
  fragmentShader as globeFragmentShader,
} from '@/lib/globe-shader';

function Globe({
  baseColor,
  markerColor,
  glowColor,
  scale = 1,
}: {
  baseColor: [number, number, number];
  markerColor: [number, number, number];
  glowColor: [number, number, number];
  scale?: number;
}) {
  const meshRef = useRef<any>();
  
  const uniforms = {
    baseColor: { value: new Color(...baseColor) },
    markerColor: { value: new Color(...markerColor) },
    glowColor: { value: new Color(...glowColor) },
  };

  return (
    <mesh ref={meshRef} scale={[scale, scale, scale]}>
      <icosahedronGeometry args={[5, 20]} />
      <shaderMaterial
        vertexShader={globeVertexShader}
        fragmentShader={globeFragmentShader}
        uniforms={uniforms}
        wireframe={true}
      />
    </mesh>
  );
}

export default function Earth({
  baseColor = [1, 1, 1],
  markerColor = [1, 1, 1],
  glowColor = [1, 1, 1],
  scale = 1,
}) {
  return (
    <Canvas
      camera={{
        position: [0, 0, 20],
        fov: 50,
      }}
    >
      <ambientLight color={[1, 1, 1]} intensity={0.1} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <Globe
        baseColor={baseColor}
        markerColor={markerColor}
        glowColor={glowColor}
        scale={scale}
      />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
