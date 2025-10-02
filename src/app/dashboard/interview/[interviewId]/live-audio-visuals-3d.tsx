
'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Analyser } from '@/lib/live-audio/utils';

// Backdrop Shaders
const backdropVS = `
precision highp float;
varying vec3 vViewPosition;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`;

const backdropFS = `
precision highp float;
out vec4 fragmentColor;
uniform vec2 resolution;
uniform float rand;
void main() {
  float aspectRatio = resolution.x / resolution.y; 
  vec2 vUv = gl_FragCoord.xy / resolution;
  float noise = (fract(sin(dot(vUv, vec2(12.9898 + rand,78.233)*2.0)) * 43758.5453));
  vUv -= .5;
  vUv.x *= aspectRatio;
  float factor = 4.;
  float d = factor * length(vUv);
  vec3 from = vec3(3.) / 255.;
  vec3 to = vec3(16., 12., 20.) / 2550.;
  fragmentColor = vec4(mix(from, to, d) + .005 * noise, 1.);
}`;

// Sphere Shaders
const sphereVS = `
#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
  varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float time;
uniform vec4 inputData;
uniform vec4 outputData;

vec3 calc( vec3 pos ) {
  vec3 dir = normalize( pos );
  vec3 p = dir + vec3( time, 0., 0. );
  return pos +
    1. * inputData.x * inputData.y * dir * (.5 + .5 * sin(inputData.z * pos.x + time)) +
    1. * outputData.x * outputData.y * dir * (.5 + .5 * sin(outputData.z * pos.y + time))
  ;
}

vec3 spherical( float r, float theta, float phi ) {
  return r * vec3(
    cos( theta ) * cos( phi ),
    sin( theta ) * cos( phi ),
    sin( phi )
  );
}

void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>

  float inc = 0.001;
  float r = length( position );
  float theta = ( uv.x + 0.5 ) * 2. * PI;
  float phi = -( uv.y + 0.5 ) * PI;
  vec3 np = calc( spherical( r, theta, phi )  );
  vec3 tangent = normalize( calc( spherical( r, theta + inc, phi ) ) - np );
  vec3 bitangent = normalize( calc( spherical( r, theta, phi + inc ) ) - np );
  transformedNormal = -normalMatrix * normalize( cross( tangent, bitangent ) );
  vNormal = normalize( transformedNormal );
  transformed = np;

  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
  #ifdef USE_TRANSMISSION
    vWorldPosition = worldPosition.xyz;
  #endif
}`;

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

        // Analysers
        const inputAnalyser = new Analyser(inputNode);
        const outputAnalyser = new Analyser(outputNode);

        // Backdrop
        const backdropGeo = new THREE.IcosahedronGeometry(10, 5);
        const backdropMat = new THREE.RawShaderMaterial({
            uniforms: {
                resolution: { value: new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio) },
                rand: { value: 0 },
            },
            vertexShader: backdropVS,
            fragmentShader: backdropFS,
        });
        backdropMat.side = THREE.BackSide;
        const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
        scene.add(backdrop);

        // Sphere
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
        sphere.visible = false;
        
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        new EXRLoader().load('/piz_compressed.exr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
            sphereMaterial.envMap = exrCubeRenderTarget.texture;
            sphere.visible = true;
            pmremGenerator.dispose();
            texture.dispose();
        });

        // Post-processing
        const renderPass = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 5, 0.5, 0);
        const composer = new EffectComposer(renderer);
        composer.addPass(renderPass);
        composer.addPass(bloomPass);

        const clock = new THREE.Clock();
        const rotation = new THREE.Vector3(0, 0, 0);

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();

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
                rotation.x += (delta * 60 * f * 0.5 * outputData[1]) / 255;
                rotation.z += (delta * 60 * f * 0.5 * inputData[1]) / 255;
                rotation.y += (delta * 60 * f * 0.25 * (inputData[2] + outputData[2])) / 255;

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
        };
    }, [inputNode, outputNode]);

    return (
        <div ref={mountRef} className="absolute inset-0 -z-10" />
    );
};

export default LiveAudioVisuals3D;
