"use client";

import { useRef, useEffect } from "react";

/**
 * Tracks scroll velocity via RAF loop.
 * Returns a ref (no re-renders) with smoothed velocity in px/frame.
 * Disabled on touch/mobile devices to save CPU.
 */
export function useScrollVelocity() {
  const velocityRef = useRef(0);

  useEffect(() => {
    // Skip on mobile/touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let prevY = window.scrollY;
    let smooth = 0;
    let rafId: number;

    const tick = () => {
      const curY = window.scrollY;
      const raw = curY - prevY;
      prevY = curY;

      smooth += (raw - smooth) * 0.5;

      if (Math.abs(raw) < 0.5) {
        smooth *= 0.97;
      }

      smooth = Math.max(-50, Math.min(50, smooth));

      if (Math.abs(smooth) < 0.01) smooth = 0;

      velocityRef.current = smooth;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return velocityRef;
}
