'use client';

import { useEffect, useRef, useCallback } from 'react';
import { FluidSimulation, FluidConfig } from './fluidSimulation';

export default function InkBlobCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<FluidSimulation | null>(null);
  const inHeroRef = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!simRef.current || !canvasRef.current) return;

    // Check if over hero
    const hero = document.getElementById('hero');
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;

      if (inside !== inHeroRef.current) {
        inHeroRef.current = inside;
        if (canvasRef.current) {
          canvasRef.current.style.opacity = inside ? '1' : '0';
        }
      }
      if (!inside) return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    simRef.current.updatePointerMoveDataNormalized(0, x, y);
  }, []);

  const handleMouseUp = useCallback(() => {
    simRef.current?.updatePointerUpData();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;

    const config: Partial<FluidConfig> = {
      SPLAT_RADIUS: 0.03,
      SPLAT_FORCE: 1500,
      DENSITY_DISSIPATION: 5.0,
      VELOCITY_DISSIPATION: 2.0,
      PRESSURE: 0.2,
      PRESSURE_ITERATIONS: 10,
      CURL: 25,
      TRANSPARENT: true,
      BLOOM: false,
      SHADING: true,
      COLORFUL: false,
      COLOR_PALETTE: [[255, 255, 255], [200, 200, 200], [230, 230, 230]],
      AUTO_SPLATS: false,
      SPLAT_ON_MOVE_ONLY: true,
      SIM_RESOLUTION: 64,
      DYE_RESOLUTION: 512,
    };

    try {
      const sim = new FluidSimulation(canvas, config);
      simRef.current = sim;
      sim.start();

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        sim.destroy();
        simRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    } catch (err) {
      console.warn('InkBlobCursor: WebGL not supported', err);
    }
  }, [handleMouseMove, handleMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
}
