'use client';

import AudioVisual from '../../components/audio-visual/AudioVisual';
import TrackButton from '../../components/track-button/TrackButton';
import { useRef, useEffect, useState } from 'react';

export default function page() {
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
  }, []);

  const handlePlay = (track: number) => {
    setTrackNumber(track);
    const context = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    setAudioContext(context);
    setPlayAudio(true);
  };

  return (
    <div>
      <div
        className=" min-h-[100vh] w-screen text-neutral-200 font-semibold bg-black"
        data-scroll-container
      >
        <div className="absolute inset-0 z-0">
          <AudioVisual
            audioContext={audioContext}
            playAudio={playAudio}
            trackNumber={trackNumber}
          />
        </div>
        <div className="h-[100vh]  md:w-1/2 flex justify-center  flex-col gap-5 p-5 mx-auto ">
          <div className="uppercase text-3xl md:w-1/2">
            Realtime audio frequency Analysis Performance Tests
          </div>
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
          <TrackButton
            handlePlay={() => handlePlay(4)}
            artist="Closer Musik"
            title="One Two Three No Gravity"
            playAudio={playAudio}
          />
        </div>
      </div>
    </div>
  );
}
