
export default `
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  
  void main() {
    vNormal = normalize( normalMatrix * normal );
    vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

export const fragmentShader = `
  uniform vec3 glowColor;
  uniform vec3 baseColor;
  uniform vec3 markerColor;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;

  void main() {
    float intensity = pow( 0.7 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 4.0 );
    
    // Mix of baseColor and markerColor based on some noise
    // A simple noise function (can be replaced with a better one)
    float noise = fract(sin(dot(vPositionNormal.xy, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 color = mix(baseColor, markerColor, smoothstep(0.45, 0.55, noise));
    
    gl_FragColor = vec4( color, 1.0 ) * intensity + vec4( glowColor, 1.0 ) * intensity;
  }
`;
