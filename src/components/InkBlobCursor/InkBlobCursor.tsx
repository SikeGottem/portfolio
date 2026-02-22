'use client';

import { useEffect, useRef, useCallback } from 'react';
import { FluidSimulation, FluidConfig } from './fluidSimulation';

export interface InkBlobCursorProps {
  config?: Partial<FluidConfig>;
  className?: string;
  style?: React.CSSProperties;
  enabled?: boolean;
}

/**
 * InkBlobCursor — Black, subtle ink trail cursor effect for light backgrounds.
 */
export default function InkBlobCursor({
  config: configOverrides,
  className,
  style,
  enabled = true,
}: InkBlobCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<FluidSimulation | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!simRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    simRef.current.updatePointerMoveData(0, x, y);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!simRef.current) return;
    simRef.current.updatePointerUpData();
  }, []);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;

    // Black, subtle defaults for light backgrounds
    const subtleBlackConfig: Partial<FluidConfig> = {
      SPLAT_RADIUS: 0.08,
      SPLAT_FORCE: 3000,
      DENSITY_DISSIPATION: 3.5,
      VELOCITY_DISSIPATION: 1.2,
      PRESSURE: 0.4,
      PRESSURE_ITERATIONS: 10,
      CURL: 15,
      TRANSPARENT: true,
      BLOOM: false,
      SHADING: true,
      COLORFUL: false,
      COLOR_PALETTE: [[15, 15, 15], [30, 30, 30], [10, 10, 10]],
      AUTO_SPLATS: false,
      SPLAT_ON_MOVE_ONLY: true,
      SIM_RESOLUTION: 64,
      DYE_RESOLUTION: 512,
      ...configOverrides,
    };

    try {
      const sim = new FluidSimulation(canvas, subtleBlackConfig);
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
  }, [enabled, configOverrides, handleMouseMove, handleMouseUp]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998,
        ...style,
      }}
    />
  );
}
