"use client";

import { useEffect, useRef, useCallback } from "react";

interface Dot {
  baseX: number;
  baseY: number;
  phase: number;
}

interface Ripple {
  x: number;
  y: number;
  time: number;
}

interface DotGridProps {
  ripplesRef?: React.RefObject<Ripple[]>;
  scrollVelocityRef?: React.RefObject<number>;
}

export default function DotGrid({ ripplesRef, scrollVelocityRef }: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const dotsRef = useRef<Dot[]>([]);
  const rafRef = useRef<number>(0);
  const isCoarseRef = useRef(false);

  const SPACING = 40;
  const BASE_SIZE = 1.5;
  const HOVER_SIZE = 2.5;
  const INTERACTION_RADIUS = 120;
  const LINE_MAX_DIST = 100;
  const DRIFT_AMP = 0.5;
  const DRIFT_SPEED = 0.0008;

  const buildGrid = useCallback((w: number, h: number) => {
    const dots: Dot[] = [];
    const cols = Math.ceil(w / SPACING) + 1;
    const rows = Math.ceil(h / SPACING) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          baseX: c * SPACING,
          baseY: r * SPACING,
          phase: Math.random() * Math.PI * 2,
          
        });
      }
    }

    dotsRef.current = dots;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      isCoarseRef.current = window.matchMedia("(pointer: coarse)").matches;
    }
    if (isCoarseRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid(window.innerWidth, window.innerHeight);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const draw = (time: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const dots = dotsRef.current;
      const rSq = INTERACTION_RADIUS * INTERACTION_RADIUS;
      const lineSq = LINE_MAX_DIST * LINE_MAX_DIST;

      // Prune expired ripples
      const ripples = ripplesRef?.current;
      if (ripples) {
        const now = performance.now();
        while (ripples.length > 0 && now - ripples[0].time > 2000) {
          ripples.shift();
        }
      }

      const nearby: { x: number; y: number }[] = [];

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const driftX = Math.sin(time * DRIFT_SPEED + d.phase) * DRIFT_AMP;
        const driftY = Math.cos(time * DRIFT_SPEED * 0.7 + d.phase + 1) * DRIFT_AMP;
        const x = d.baseX + driftX;
        const y = d.baseY + driftY;

        const dx = x - mx;
        const dy = y - my;
        const distSq = dx * dx + dy * dy;
        const isNear = distSq < rSq;

        const dotSize = BASE_SIZE;
        const dotAlpha = 0.15;

        let size = isNear
          ? dotSize + (HOVER_SIZE - dotSize) * (1 - Math.sqrt(distSq) / INTERACTION_RADIUS)
          : dotSize;

        let alpha = isNear
          ? dotAlpha + 0.15 * (1 - Math.sqrt(distSq) / INTERACTION_RADIUS)
          : dotAlpha;

        // Apply ripple effects
        if (ripples) {
          const now = performance.now();
          for (let r = 0; r < ripples.length; r++) {
            const ripple = ripples[r];
            const elapsed = (now - ripple.time) / 1000;
            if (elapsed > 2.0) continue;

            const dist = Math.sqrt((x - ripple.x) ** 2 + (y - ripple.y) ** 2);

            // Primary ring
            const ringRadius = elapsed * 600;
            const ringDist = Math.abs(dist - ringRadius);
            const ringWidth = 120;

            if (ringDist < ringWidth) {
              const proximity = 1 - ringDist / ringWidth;
              const fade = Math.max(0, 1 - elapsed / 1.4);
              const boost = proximity * fade;
              size += boost * 2.5;
              alpha += boost * 0.25;
            }

            // Echo ring (100ms behind, fainter)
            const echoElapsed = Math.max(0, elapsed - 0.1);
            const echoRadius = echoElapsed * 600;
            const echoDist = Math.abs(dist - echoRadius);

            if (echoDist < ringWidth && echoElapsed > 0) {
              const proximity = 1 - echoDist / ringWidth;
              const fade = Math.max(0, 1 - elapsed / 1.6);
              const boost = proximity * fade;
              size += boost * 1.2;
              alpha += boost * 0.12;
            }
          }
        }

        // Calculate ripple intensity for color blending
        const baseAlpha = isNear
          ? dotAlpha + 0.15 * (1 - Math.sqrt(distSq) / INTERACTION_RADIUS)
          : dotAlpha;
        const rippleIntensity = Math.min(1, Math.max(0, (alpha - baseAlpha) / 0.15));

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        if (rippleIntensity > 0.05) {
          // Blend from dark to red based on ripple strength
          const r = Math.round(26 + (224 - 26) * rippleIntensity);
          const g = Math.round(26 + (82 - 26) * rippleIntensity);
          const b = Math.round(26 + (82 - 26) * rippleIntensity);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(26, 26, 26, ${alpha})`;
        }
        ctx.fill();

        if (isNear) {
          nearby.push({ x, y });
        }
      }

      // Draw connection lines between nearby dots
      if (nearby.length > 1) {
        ctx.strokeStyle = "rgba(224, 82, 82, 0.08)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < nearby.length; i++) {
          for (let j = i + 1; j < nearby.length; j++) {
            const dx = nearby[i].x - nearby[j].x;
            const dy = nearby[i].y - nearby[j].y;
            if (dx * dx + dy * dy < lineSq) {
              ctx.beginPath();
              ctx.moveTo(nearby[i].x, nearby[i].y);
              ctx.lineTo(nearby[j].x, nearby[j].y);
              ctx.stroke();
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [buildGrid, ripplesRef]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none hidden md:block"
      aria-hidden="true"
    />
  );
}
