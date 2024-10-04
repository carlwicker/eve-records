import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

interface AudioVisualProps {
  audioContext: AudioContext | null;
  playAudio: boolean;
  trackNumber: number;
}

export default function AudioVisual({
  audioContext,
  playAudio,
  trackNumber,
}: AudioVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioContext) return;

    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      20,
      window.innerWidth / window.innerHeight,
      0.1,
      50
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current?.appendChild(renderer.domElement);

    // Load the audio
    const audio = new Audio('/mp3/' + trackNumber + '.mp3');
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;
    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

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
      cube.position.x = i - totalWidth / 2; // Center the group of cubes
      cube.position.y = 0;
      scene.add(cube);
      cubes.push(cube);
    }

    // Calculate the position of the central cube
    const centralCubeIndex = Math.floor(numCubes / 2);
    const centralCube = cubes[centralCubeIndex];

    // Position camera and point
    camera.position.set(0, 10, 10);
    if (centralCube) {
      camera.lookAt(new THREE.Vector3(-7, 0, 0));
    } else {
      console.error('Central cube not found');
    }

    // Bloom effect setup
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0.1;
    bloomPass.strength = 0.9;
    bloomPass.radius = 0.8;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

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
        const scale = average / 280; // Adjust the divisor to control the scaling effect

        if (isNaN(scale)) {
          console.error(`Scale for cube ${i} is NaN`);
          continue;
        }

        cubes[i].scale.set(scale * 2, scale * 2, scale * 2); // Adjust the z scale to make the cubes taller

        // Adjust the bloom strength based on the average frequency value
        const intensity = average / 130; // Adjust the divisor to control the intensity
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
  }, [playAudio, trackNumber]);

  return (
    <div ref={containerRef} className="flex align-middle justify-center">
      {trackNumber !== 0 && (
        <button
          className="absolute top-0 left-0 flex  items-center p-5 bg-red-900 text-[#EEE] text-2xl"
          onClick={() => {
            window.location.reload();
          }}
        >
          Back
        </button>
      )}
    </div>
  );
}
