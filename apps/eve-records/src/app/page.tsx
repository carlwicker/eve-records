'use client';

import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex flex-col gap-5 tracking-tighter font-semibold text-2xl capitalize h-screen w-screen justify-center items-center text-white">
      <button className="bg-red-800 p-5 hover:bg-red-900">
        <Link href="/eq">Realtime Audio Processing Test</Link>
      </button>
      <button className="bg-red-800 p-5 hover:bg-red-900">
        <Link href="/glitch">ThreeJS GlitchPass Tests</Link>
      </button>
    </div>
  );
}
