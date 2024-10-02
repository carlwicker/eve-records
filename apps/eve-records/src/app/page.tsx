'use client';

import { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import Lenis from 'lenis';

export default function Home() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const locomotiveScroll = new LocomotiveScroll();
    const lenis = new Lenis();

    function raf(time: any) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen container mx-auto text-9xl text-neutral-200 uppercase font-semibold">
      <div ref={scrollRef} data-scroll-container>
        <div data-scroll-section>
          <h1 data-scroll>Eve Records</h1>
          <p data-scroll data-scroll-speed="1">
            👋
          </p>
        </div>
      </div>
    </div>
  );
}
