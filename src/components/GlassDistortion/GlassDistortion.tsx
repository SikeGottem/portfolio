'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function GlassDistortion() {
  const blobRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);
  const visibleRef = useRef(true);

  const onMove = useCallback((e: MouseEvent) => {
    posRef.current = { x: e.clientX, y: e.clientY };

    // Only show when cursor is over the hero section
    const hero = document.getElementById('hero');
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      visibleRef.current = inside;
    }
  }, []);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    window.addEventListener('mousemove', onMove);

    const animate = () => {
      if (blobRef.current) {
        const { x, y } = posRef.current;
        blobRef.current.style.transform = `translate(${x - 75}px, ${y - 75}px)`;
        blobRef.current.style.opacity = visibleRef.current ? '1' : '0';
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onMove]);

  return (
    <>
      {/* SVG filter for glass-like displacement */}
      <svg
        style={{ position: 'absolute', width: 0, height: 0 }}
        aria-hidden="true"
      >
        <defs>
          <filter id="glass-distort">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="3"
              seed="2"
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Distortion lens that follows cursor */}
      <div
        ref={blobRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 150,
          height: 150,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9997,
          backdropFilter: 'url(#glass-distort)',
          WebkitBackdropFilter: 'url(#glass-distort)',
          willChange: 'transform, opacity',
          transition: 'opacity 0.3s ease',
        }}
      />
    </>
  );
}
