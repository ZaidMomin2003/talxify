
'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Analyser } from '@/lib/live-audio/utils';

// Backdrop Shaders
const backdropVS = `
precision highp float;
in vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
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

const SceneContent: React.FC<LiveAudioVisuals3DProps> = ({ inputNode, outputNode }) => {
  const { scene, camera, gl } = useThree();
  const composerRef = useRef<EffectComposer>();
  const backdropRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const rotationRef = useRef(new THREE.Vector3(0, 0, 0));
  const inputAnalyser = useRef<Analyser>();
  const outputAnalyser = useRef<Analyser>();
  const sphereMaterialRef = useRef<THREE.MeshStandardMaterial>();

  useEffect(() => {
    // Setup Analysers
    if (inputNode) inputAnalyser.current = new Analyser(inputNode);
    if (outputNode) outputAnalyser.current = new Analyser(outputNode);
  }, [inputNode, outputNode]);

  useEffect(() => {
    // Scene setup
    scene.background = new THREE.Color(0x100c14);

    // Backdrop
    const backdropGeo = new THREE.IcosahedronGeometry(10, 5);
    const backdropMat = new THREE.RawShaderMaterial({
      uniforms: {
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        rand: { value: 0 },
      },
      vertexShader: backdropVS,
      fragmentShader: backdropFS,
      glslVersion: THREE.GLSL3,
      side: THREE.BackSide,
    });
    if (backdropRef.current) backdropRef.current.material = backdropMat;

    // Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(1, 10);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x000010,
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0x000010,
      emissiveIntensity: 1.5,
    });

    sphereMat.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 };
      shader.uniforms.inputData = { value: new THREE.Vector4() };
      shader.uniforms.outputData = { value: new THREE.Vector4() };
      sphereMat.userData.shader = shader;
      shader.vertexShader = sphereVS;
    };
    sphereMaterialRef.current = sphereMat;
    if (sphereRef.current) sphereRef.current.material = sphereMat;

    new EXRLoader().load('/piz_compressed.exr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      const pmremGenerator = new THREE.PMREMGenerator(gl);
      pmremGenerator.compileEquirectangularShader();
      const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      sphereMat.envMap = exrCubeRenderTarget.texture;
      if (sphereRef.current) sphereRef.current.visible = true;
      pmremGenerator.dispose();
    });

    // Post-processing
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 5, 0.5, 0);
    const effectComposer = new EffectComposer(gl);
    effectComposer.addPass(renderPass);
    effectComposer.addPass(bloomPass);
    composerRef.current = effectComposer;

    const onResize = () => {
        const dpr = gl.getPixelRatio();
        const w = window.innerWidth;
        const h = window.innerHeight;
        if(backdropMat.uniforms.resolution) {
            backdropMat.uniforms.resolution.value.set(w * dpr, h * dpr);
        }
        effectComposer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [scene, camera, gl]);

  useFrame((state, delta) => {
    if (!inputAnalyser.current || !outputAnalyser.current) return;
    
    inputAnalyser.current.update();
    outputAnalyser.current.update();

    const inputData = inputAnalyser.current.data;
    const outputData = outputAnalyser.current.data;

    if (backdropRef.current && backdropRef.current.material) {
        (backdropRef.current.material as THREE.RawShaderMaterial).uniforms.rand.value = Math.random() * 10000;
    }
    
    if (sphereRef.current && sphereMaterialRef.current?.userData.shader) {
        const shader = sphereMaterialRef.current.userData.shader;
        const sphere = sphereRef.current;
        const rotation = rotationRef.current;

        const avgOutputVolume = outputData.reduce((acc, val) => acc + val, 0) / outputData.length;
        const targetIntensity = avgOutputVolume > 5 ? 3.0 : 1.5;
        sphereMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(sphereMaterialRef.current.emissiveIntensity, targetIntensity, 0.1);
        
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

        shader.uniforms.time.value += (delta * 0.1 * outputData[0]) / 255;
        shader.uniforms.inputData.value.set(
            (1 * inputData[0]) / 255,
            (0.1 * inputData[1]) / 255,
            (10 * inputData[2]) / 255,
            0
        );
        shader.uniforms.outputData.value.set(
            (2 * outputData[0]) / 255,
            (0.1 * outputData[1]) / 255,
            (10 * outputData[2]) / 255,
            0
        );
    }
    
    composerRef.current?.render();
  }, 1);

  return (
    <>
      <mesh ref={backdropRef}>
        <icosahedronGeometry args={[10, 5]} />
      </mesh>
      <mesh ref={sphereRef} visible={false}>
         <icosahedronGeometry args={[1, 10]} />
      </mesh>
    </>
  );
};


const LiveAudioVisuals3D: React.FC<LiveAudioVisuals3DProps> = ({ inputNode, outputNode }) => {
    return (
        <div className="absolute inset-0 -z-10">
            <Canvas camera={{ position: [2, -2, 5], fov: 75 }}>
                <SceneContent inputNode={inputNode} outputNode={outputNode} />
            </Canvas>
        </div>
    );
};

export default LiveAudioVisuals3D;
