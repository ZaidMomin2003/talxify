
'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { Analyser } from '@/lib/analyser';
import { fs as backdropFS, vs as backdropVS } from '@/lib/shaders/backdrop';
import { vs as sphereVS } from '@/lib/shaders/sphere';


interface LiveAudioVisuals3DProps {
  inputNode: GainNode | null;
  outputNode: GainNode | null;
}


const LiveAudioVisuals3D: React.FC<LiveAudioVisuals3DProps> = ({ inputNode, outputNode }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!mountRef.current || typeof window === 'undefined' || !inputNode || !outputNode) return;
        
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x100c14);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(2, -2, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        const inputAnalyser = new Analyser(inputNode);
        const outputAnalyser = new Analyser(outputNode);

        const backdropGeo = new THREE.IcosahedronGeometry(10, 5);
        const backdropMat = new THREE.RawShaderMaterial({
            uniforms: {
                resolution: { value: new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio) },
                rand: { value: 0 },
            },
            vertexShader: backdropVS,
            fragmentShader: backdropFS,
            glslVersion: THREE.GLSL3
        });
        backdropMat.side = THREE.BackSide;
        const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
        scene.add(backdrop);

        const sphereGeo = new THREE.IcosahedronGeometry(1, 10);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: 0x000010,
            metalness: 0.5,
            roughness: 0.1,
            emissive: 0x000010,
            emissiveIntensity: 1.5,
        });

        sphereMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.time = { value: 0 };
            shader.uniforms.inputData = { value: new THREE.Vector4() };
            shader.uniforms.outputData = { value: new THREE.Vector4() };
            sphereMaterial.userData.shader = shader;
            shader.vertexShader = sphereVS;
        };
        const sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
        scene.add(sphere);
        sphere.visible = true; // Make sphere visible immediately
        
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        
        const renderPass = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 5, 0.5, 0);
        const composer = new EffectComposer(renderer);
        composer.addPass(renderPass);
        composer.addPass(bloomPass);

        const clock = new THREE.Clock();
        const rotation = new THREE.Vector3(0, 0, 0);
        let prevTime = 0;

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            
            const t = performance.now();
            const delta = (t - prevTime) / (1000 / 60);
            prevTime = t;

            inputAnalyser.update();
            outputAnalyser.update();
            const inputData = inputAnalyser.data;
            const outputData = outputAnalyser.data;
            
            backdropMat.uniforms.rand.value = Math.random() * 10000;

            if (sphereMaterial.userData.shader) {
                const avgOutputVolume = outputData.reduce((acc, val) => acc + val, 0) / outputData.length;
                const targetIntensity = avgOutputVolume > 5 ? 3.0 : 1.5;
                sphereMaterial.emissiveIntensity = THREE.MathUtils.lerp(sphereMaterial.emissiveIntensity, targetIntensity, 0.1);
                
                sphere.scale.setScalar(1 + (0.2 * outputData[1]) / 255);

                const f = 0.001;
                rotation.x += (delta * f * 0.5 * outputData[1]) / 255;
                rotation.z += (delta * f * 0.5 * inputData[1]) / 255;
                rotation.y += (delta * f * 0.25 * (inputData[2] + outputData[2])) / 255;

                const euler = new THREE.Euler(rotation.x, rotation.y, rotation.z);
                const quaternion = new THREE.Quaternion().setFromEuler(euler);
                const vector = new THREE.Vector3(0, 0, 5);
                vector.applyQuaternion(quaternion);
                camera.position.copy(vector);
                camera.lookAt(sphere.position);

                sphereMaterial.userData.shader.uniforms.time.value += (delta * 0.1 * outputData[0]) / 255;
                sphereMaterial.userData.shader.uniforms.inputData.value.set( (1 * inputData[0]) / 255, (0.1 * inputData[1]) / 255, (10 * inputData[2]) / 255, 0);
                sphereMaterial.userData.shader.uniforms.outputData.value.set( (2 * outputData[0]) / 255, (0.1 * outputData[1]) / 255, (10 * outputData[2]) / 255, 0);
            }
            
            composer.render();
        };

        animate();

        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            composer.setSize(w, h);
            const dpr = renderer.getPixelRatio();
            backdropMat.uniforms.resolution.value.set(w * dpr, h * dpr);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            backdropGeo.dispose();
            backdropMat.dispose();
            sphereGeo.dispose();
            sphereMaterial.dispose();
            pmremGenerator.dispose();
        };
    }, [inputNode, outputNode]);

    return (
        <div ref={mountRef} className="absolute inset-0 -z-10" />
    );
};

export default LiveAudioVisuals3D;
