'use client';

import { useRef, useEffect, useState } from 'react';
import AudioVisual from '../components/audio-visual/AudioVisual'; // Adjust the import path as necessary
import TrackButton from '../components/track-button/TrackButton';

export default function Page() {
  const scrollRef = useRef(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [playAudio, setPlayAudio] = useState(false);
  const [trackNumber, setTrackNumber] = useState(0);

  useEffect(() => {
    const raf = () => {
      // Your animation logic here
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  }, []);

  useEffect(() => {
    setTrackNumber(0);
    console.log('Track number:', trackNumber);
  }, []);

  const handlePlay = (track: number) => {
    setTrackNumber(track);
    const context = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    setAudioContext(context);
    setPlayAudio(true);
  };

  return (
    <div
      className=" min-h-[100vh] w-screen text-neutral-200 font-semibold"
      data-scroll-container
    >
      <div className="absolute inset-0 z-0">
        <AudioVisual
          audioContext={audioContext}
          playAudio={playAudio}
          trackNumber={trackNumber}
        />
      </div>
      <div className="bg-black h-[100vh] w-screen flex justify-center items-center flex-col gap-5">
        <div className="">Live Audio Freqency Analysis Test with ThreeJS</div>
        <TrackButton
          handlePlay={() => handlePlay(1)}
          artist="Dj Vadim"
          title="The Larry Chatsworth Theme"
          playAudio={playAudio}
        />

        <TrackButton
          handlePlay={() => handlePlay(2)}
          artist="Superpitcher"
          title="Little Raver"
          playAudio={playAudio}
        />

        <TrackButton
          handlePlay={() => handlePlay(3)}
          artist="Jurgen Pappe"
          title="Take That"
          playAudio={playAudio}
        />
      </div>
    </div>
  );
}
