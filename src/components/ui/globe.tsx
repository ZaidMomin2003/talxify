'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

function GlobeModel({ baseColor, markerColor, glowColor, scale }: {
  baseColor: [number, number, number];
  markerColor: [number, number, number];
  glowColor: [number, number, number];
  scale?: number;
}) {
  const globeRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={globeRef} scale={scale}>
      <icosahedronGeometry args={[5, 20]} />
      <meshBasicMaterial color={new THREE.Color(...baseColor)} wireframe transparent opacity={0.2} />
    </mesh>
  );
}

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
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <GlobeModel baseColor={baseColor} markerColor={markerColor} glowColor={glowColor} scale={scale} />
    </Canvas>
  );
};

export default Globe;