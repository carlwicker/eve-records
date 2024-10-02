'use client';

import { useRef, useEffect, useState } from 'react';
import AudioVisual from '../components/audio-visual/AudioVisual'; // Adjust the import path as necessary

export default function Page() {
  const scrollRef = useRef(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [playAudio, setPlayAudio] = useState(false);

  useEffect(() => {
    const raf = () => {
      // Your animation logic here
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  }, []);

  const handlePlay = () => {
    const context = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    setAudioContext(context);
    setPlayAudio(true);
  };

  return (
    <div
      className=" min-h-[100vh] w-screen text-9xl text-neutral-200 font-semibold"
      data-scroll-container
    >
      <div className="absolute inset-0 z-0">
        <AudioVisual audioContext={audioContext} playAudio={playAudio} />
      </div>
      <div className="bg-black h-[100vh] w-screen flex justify-center items-center">
        {!playAudio && (
          <button
            className="p-5 bg-red-900 text-[#EEE] relative z-10 text-2xl"
            onClick={handlePlay}
          >
            Enter Site
          </button>
        )}
      </div>
    </div>
  );
}
