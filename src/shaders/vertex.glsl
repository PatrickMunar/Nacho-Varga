uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float uFrequency;
uniform float uTime;
uniform float uOscillationFrequency;
uniform float uAmplitude;

attribute vec3 position;
attribute float aRandom;
attribute vec2 uv;

varying float vRandom;
varying float vElevation;
varying vec2 vUv;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = 0.0;
    elevation += sin(modelPosition.x * uFrequency + uTime * uOscillationFrequency) * 0.1 * uAmplitude;
    elevation += sin(modelPosition.y * uFrequency + uTime * uOscillationFrequency) * 0.1 * uAmplitude;

    modelPosition.z += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vRandom = aRandom;
    vElevation = elevation;
    vUv = uv;
}