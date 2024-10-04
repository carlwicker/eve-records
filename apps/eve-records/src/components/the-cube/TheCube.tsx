import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';

export default function TheCube() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const handleStart = () => {
    setIsPlaying(true);

    // Create AudioContext
    const audioContext = new ((window.AudioContext ||
      (window as any).webkitAudioContext) as typeof AudioContext)();
    audioContextRef.current = audioContext;

    // Create and configure audio element
    const audio = new Audio('/mp3/1.mp3');
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    // Create media element source and analyser
    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;

    // Create data array for frequency data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    // Connect nodes
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Resume audio context and play audio
    audioContext.resume().then(() => {
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
      });
    });

    // Debugging: Check if audio is playing
    audio.addEventListener('play', () => {
      console.log('Audio is playing');
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });
  };

  useEffect(() => {
    if (
      !audioContextRef.current ||
      !audioRef.current ||
      !analyserRef.current ||
      !dataArrayRef.current
    ) {
      return;
    }
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
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.5; // Increase exposure for more intensity
    containerRef.current?.appendChild(renderer.domElement);

    // Create a cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Change color to white
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add a point light for better visual effect
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Position the camera
    camera.position.z = 5;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);

    // Set up bloom effect
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // initial strength
      0.4, // radius
      0.2 // threshold
    );
    composer.addPass(bloomPass);

    // Set up glitch effect
    const glitchPass = new GlitchPass();
    composer.addPass(glitchPass);

    // Timer for random glitch effect
    let glitchTimer = 0;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (isPlaying && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        // Calculate the average frequency value
        const average =
          dataArrayRef.current.reduce((sum, value) => sum + value, 0) /
          dataArrayRef.current.length;

        // Adjust the scaling effect of the cube
        const scale = Math.max(average / 40, 0.1); // Ensure the scale is not too small
        cube.scale.set(scale, scale, scale);

        // Adjust the bloom strength based on the scale
        bloomPass.strength = (scale * average) / 150; // Adjust the multiplier as needed

        // Adjust the glitch effect based on the audio frequency
        glitchPass.goWild = average > 16; // Enable "wild" glitch effect if average frequency is high
      }

      // Rotate the cube
      cube.rotation.y += 0.01;

      // Randomly enable or disable the glitch effect
      glitchTimer -= 1;
      if (glitchTimer <= 0) {
        glitchPass.enabled = Math.random() > 0.5;
        glitchTimer = Math.random() * 10; // Random interval between glitches
      }

      composer.render();
    };

    animate();

    // Clean up on component unmount
    return () => {
      audioRef.current?.pause();
      audioContextRef.current?.close();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [isPlaying]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0"></div>
      <div>
        <div className="w-full p-5 text-6xl font-semibold tracking-tighter">
          ThreeJS GlitchPass Effect Test
        </div>
        <div className="p-5">
          {!isPlaying && (
            <button
              onClick={handleStart}
              className="absolute bg-blue-500 text-white px-4 py-2 rounded"
            >
              Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
