"use client";

import { useRef, useEffect } from "react";

/**
 * Tracks scroll velocity via RAF loop.
 * Returns a ref (no re-renders) with smoothed velocity in px/frame.
 * Positive = scrolling down, negative = scrolling up. Clamped to ±50.
 */
export function useScrollVelocity() {
  const velocityRef = useRef(0);

  useEffect(() => {
    let prevY = window.scrollY;
    let smooth = 0;
    let rafId: number;

    const tick = () => {
      const curY = window.scrollY;
      const raw = curY - prevY;
      prevY = curY;

      smooth += (raw - smooth) * 0.5;

      // Decay toward 0 when raw delta is 0
      if (Math.abs(raw) < 0.5) {
        smooth *= 0.97;
      }

      // Clamp
      smooth = Math.max(-50, Math.min(50, smooth));

      // Zero out tiny values
      if (Math.abs(smooth) < 0.01) smooth = 0;

      velocityRef.current = smooth;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return velocityRef;
}
