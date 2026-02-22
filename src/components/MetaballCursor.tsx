"use client";

import { useEffect, useRef } from "react";

/**
 * Water-like blob cursor using SVG gooey filter.
 * Main blob + trailing blobs merge/split organically via gaussian blur + color matrix threshold.
 * This creates the connected liquid effect — not discrete circles, but one fluid shape.
 */
export default function MetaballCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<HTMLDivElement[]>([]);
  const rafRef = useRef<number>(0);

  const BLOB_COUNT = 8; // main + 7 trail
  const MAIN_SIZE = 20;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mouse = { x: -100, y: -100 };
    const blobs = Array.from({ length: BLOB_COUNT }, () => ({
      x: -100, y: -100, vx: 0, vy: 0,
    }));

    let inHero = true;
    let currentOpacity = 1;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleScroll = () => {
      const el = document.getElementById("hero");
      if (!el) return;
      inHero = el.getBoundingClientRect().bottom > 80;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      // Fade
      const targetOpacity = inHero ? 1 : 0;
      currentOpacity += (targetOpacity - currentOpacity) * 0.1;
      container.style.opacity = String(currentOpacity);

      // Main blob — softer spring + less damping = more momentum/overshoot
      const main = blobs[0];
      main.vx += (mouse.x - main.x) * 0.09;
      main.vy += (mouse.y - main.y) * 0.09;
      main.vx *= 0.82;
      main.vy *= 0.82;
      main.x += main.vx;
      main.y += main.vy;

      // Trail blobs — each follows the previous with progressively softer springs
      for (let i = 1; i < BLOB_COUNT; i++) {
        const b = blobs[i];
        const leader = blobs[i - 1];
        const stiffness = 0.08 * (1 - i * 0.04); // soft springs = long stretchy trail
        const damping = 0.85 - i * 0.01; // high = lots of momentum, slow settling

        b.vx += (leader.x - b.x) * stiffness;
        b.vy += (leader.y - b.y) * stiffness;
        b.vx *= damping;
        b.vy *= damping;
        b.x += b.vx;
        b.y += b.vy;
      }

      // Update DOM positions
      for (let i = 0; i < BLOB_COUNT; i++) {
        const el = blobRefs.current[i];
        if (!el) continue;
        const b = blobs[i];
        const size = i === 0 ? MAIN_SIZE : MAIN_SIZE * (0.75 - i * 0.055);
        el.style.transform = `translate(${b.x - size / 2}px, ${b.y - size / 2}px)`;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Generate blob sizes
  const sizes = Array.from({ length: BLOB_COUNT }, (_, i) =>
    i === 0 ? MAIN_SIZE : MAIN_SIZE * (0.75 - i * 0.055)
  );

  return (
    <>
      {/* SVG gooey filter — this is what makes the blobs merge like liquid */}
      <svg className="fixed w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 35 -14"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      <div
        ref={containerRef}
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{ filter: "url(#goo)" }}
      >
        {sizes.map((size, i) => (
          <div
            key={i}
            ref={(el) => { if (el) blobRefs.current[i] = el; }}
            className="absolute top-0 left-0 rounded-full bg-[#1A1A1A]"
            style={{
              width: size,
              height: size,
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </>
  );
}
