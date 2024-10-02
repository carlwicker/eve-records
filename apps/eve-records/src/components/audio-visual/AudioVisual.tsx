import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

interface AudioVisualProps {
  audioContext: AudioContext | null;
  playAudio: boolean;
}

export default function AudioVisual({
  audioContext,
  playAudio,
}: AudioVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioContext) return;

    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current?.appendChild(renderer.domElement);

    // Set up the audio analyser
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Create cubes for different frequency ranges
    const numCubes = 16; // Number of cubes
    const cubes: any = [];
    const segmentSize = Math.floor(bufferLength / numCubes);

    for (let i = 0; i < numCubes; i++) {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x000000,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = i * 2 - (numCubes - 1); // Position cubes in a row
      scene.add(cube);
      cubes.push(cube);
    }

    // Calculate the position of the central cube
    const centralCubeIndex = Math.floor(numCubes / 2);
    const centralCube = cubes[centralCubeIndex];

    // Position the camera and point it at the central cube
    camera.position.z = 20;
    camera.lookAt(centralCube.position);

    // Set up the bloom effect
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 1.5;
    bloomPass.radius = 0;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Load the audio
    const audio = new Audio('/mp3/littleraver.mp3');
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      analyser.getByteFrequencyData(dataArray);

      // Update each cube based on the average frequency value of its segment
      for (let i = 0; i < numCubes; i++) {
        const start = i * segmentSize;
        const end = start + segmentSize;
        const segment = dataArray.slice(start, end);

        if (segment.length === 0) {
          console.error(`Segment ${i} is empty`);
          continue;
        }

        const average =
          segment.reduce((sum, value) => sum + value, 0) / segment.length;
        const scale = average / 40; // Adjust the divisor to control the scaling effect

        if (isNaN(scale)) {
          console.error(`Scale for cube ${i} is NaN`);
          continue;
        }

        cubes[i].scale.set(scale, scale, scale);

        // Adjust the bloom strength based on the average frequency value
        const intensity = average / 256; // Adjust the divisor to control the intensity
        cubes[i].material.emissive = new THREE.Color(
          intensity,
          intensity,
          intensity
        );
      }

      composer.render();
    };

    animate();

    // Clean up on component unmount
    return () => {
      audio.pause();
      audioContext.close();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [audioContext]);

  useEffect(() => {
    if (playAudio && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Autoplay failed:', error);
      });
    }
  }, [playAudio]);

  return <div ref={containerRef} className="absolute inset-0"></div>;
}
