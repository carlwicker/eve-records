import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

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

    // Load the font
    const fontLoader = new FontLoader();
    fontLoader.load('/path/to/font.json', (font) => {
      const textGeometry = new TextGeometry('three the mind', {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 5,
      });

      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xff0000, // Emissive color for glow effect
        emissiveIntensity: 10, // Adjust intensity as needed
      });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);

      // Position the text at a cool angle
      textMesh.position.set(0, 0, 0);
      textMesh.rotation.set(0, Math.PI / 4, 0);

      scene.add(textMesh);
    });

    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      25,
      window.innerWidth / window.innerHeight,
      0.1,
      50
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
    const numCubes = 10; // Number of cubes
    const cubes: any = [];
    const segmentSize = Math.floor(bufferLength / numCubes);

    // Calculate the total width of the group of cubes
    const totalWidth = (numCubes - 1) * 2;

    for (let i = 0; i < numCubes; i++) {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0x000000,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = i * 2 - totalWidth / 2; // Center the group of cubes
      scene.add(cube);
      cubes.push(cube);
    }

    // Calculate the position of the central cube
    const centralCubeIndex = Math.floor(numCubes / 2);
    const centralCube = cubes[centralCubeIndex];

    // Position camera and point
    camera.position.set(15, -15, 15);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Bloom effect setup
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0.1;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.9;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Load the audio
    const audio = new Audio('/mp3/1.mp3');
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
        const scale = average / 50; // Adjust the divisor to control the scaling effect

        if (isNaN(scale)) {
          console.error(`Scale for cube ${i} is NaN`);
          continue;
        }

        cubes[i].scale.set(scale - 0.5, scale, scale);

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

  return <div ref={containerRef}></div>;
}
