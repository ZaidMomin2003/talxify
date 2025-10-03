
'use client';

import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { Analyser } from '@/lib/analyser';
import { vs as sphereVs } from '@/lib/shaders/sphere';
import { vs as backdropVs, fs as backdropFs } from '@/lib/shaders/backdrop';

interface VisualizerProps {
  analyser: Analyser | null;
}

const Visualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const backdropRef = useRef<THREE.Mesh>(null);

  const inputUniforms = {
    time: { value: 0 },
    inputData: { value: new THREE.Vector4() },
    outputData: { value: new THREE.Vector4() },
  };

  const backdropUniforms = {
      rand: { value: Math.random() },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (sphereRef.current) {
        // @ts-ignore
      sphereRef.current.material.uniforms.time.value = time;
    }
    if (analyser) {
      analyser.update();
      const data = analyser.data;
      const inputLevel = data[2] / 255;
      const outputLevel = data[10] / 255;
        // @ts-ignore
      sphereRef.current.material.uniforms.inputData.value.x = inputLevel;
       // @ts-ignore
      sphereRef.current.material.uniforms.outputData.value.x = outputLevel;
    }
  });

  return (
    <>
      <Sphere ref={sphereRef} args={[1.5, 64, 64]}>
         <shaderMaterial
            vertexShader={sphereVs}
            fragmentShader={THREE.ShaderLib.standard.fragmentShader}
            uniforms={{
              ...THREE.ShaderLib.standard.uniforms,
              ...inputUniforms,
            }}
            // @ts-ignore
            defines={{
                USE_UV: true,
                STANDARD: true
            }}
            lights
            transparent
            />
      </Sphere>
       <Plane ref={backdropRef} args={[10, 10]} position={[0,0,-3]}>
            <shaderMaterial
                vertexShader={backdropVs}
                fragmentShader={backdropFs}
                uniforms={backdropUniforms}
            />
       </Plane>
    </>
  );
};

interface LiveAudioVisuals3DProps {
    inputStream: MediaStream | null;
    outputStream: MediaStream | null;
}

const LiveAudioVisuals3D: React.FC<LiveAudioVisuals3DProps> = ({ inputStream, outputStream }) => {
  const inputAnalyser = useRef<Analyser | null>(null);
  const outputAnalyser = useRef<Analyser | null>(null);

  useEffect(() => {
    if (inputStream) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(inputStream);
        inputAnalyser.current = new Analyser(source);
    }
     if (outputStream) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(outputStream);
        outputAnalyser.current = new Analyser(source);
    }
  }, [inputStream, outputStream]);

  return (
    <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 5, 5]} intensity={1}/>
            <Suspense fallback={null}>
                <Visualizer analyser={inputAnalyser.current || outputAnalyser.current} />
            </Suspense>
            <OrbitControls enableZoom={false} enablePan={false} autoRotate/>
        </Canvas>
    </div>
  );
};

export default LiveAudioVisuals3D;
