"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type CursorVariant = "default" | "pointer" | "view";

const TRAIL_COUNT = 5;
const TRAIL_LERPS = [0.35, 0.28, 0.22, 0.16, 0.11];
const TRAIL_SIZES = [4, 3.5, 3, 2.5, 2];
const TRAIL_OPACITIES = [0.45, 0.35, 0.25, 0.18, 0.1];

interface Drip {
  x: number; y: number; startY: number; opacity: number; born: number; width: number;
}
// No separate ink pool objects — pooling is done by thickening the stroke

export default function CustomCursor() {
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const permCanvasRef = useRef<HTMLCanvasElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const prevPos = useRef({ x: -100, y: -100 });
  const trailPositions = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
  );
  const visible = useRef(false);
  const variantRef = useRef<CursorVariant>("default");
  const rafRef = useRef<number>(0);
  const inkInitialized = useRef(false);

  // Ink effect refs
  const currentWidth = useRef(4);
  const lastAngle = useRef(0);
  const lastSpeed = useRef(0);
  const directionThinning = useRef(0);
  const stillFrames = useRef(0);
  const mouseDown = useRef(false);
  const drips = useRef<Drip[]>([]);
  const posHistory = useRef<{ x: number; y: number }[]>([]);
  const thickPoints = useRef<{ x: number; y: number; born: number; width: number }[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setHasFinePointer(mq.matches);
    const handler = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const getVariant = useCallback((el: Element): CursorVariant => {
    const cursor = el.closest("[data-cursor]");
    if (cursor) {
      const val = cursor.getAttribute("data-cursor");
      if (val === "view") return "view";
      if (val === "pointer") return "pointer";
    }
    if (el.closest("a, button, [role='button'], input[type='submit']"))
      return "pointer";
    return "default";
  }, []);

  useEffect(() => {
    if (!hasFinePointer) return;

    // --- Ink trail canvas setup ---
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const permCanvas = permCanvasRef.current;
    const permCtx = permCanvas?.getContext("2d");
    const resizeCanvas = () => {
      const w = window.innerWidth;
      const h = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      if (canvas) { canvas.width = w; canvas.height = h; }
      if (permCanvas) { permCanvas.width = w; permCanvas.height = h; }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(document.documentElement);
    let lastInkTime = 0;

    const onMouseDown = () => { mouseDown.current = true; };
    const onMouseUp = () => { mouseDown.current = false; };
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    const onMouseMove = (e: MouseEvent) => {
      const ix = e.pageX, iy = e.pageY; // ink coords (page-relative)
      if (!inkInitialized.current) {
        prevPos.current = { x: ix, y: iy };
        posHistory.current = [{ x: ix, y: iy }];
        inkInitialized.current = true;
      }
      pos.current = { x: e.clientX, y: e.clientY };
      visible.current = true;

      // Draw ink stroke — drippy with dynamic thickness, no splattering
      if (ctx && visible.current) {
        const dx = ix - prevPos.current.x;
        const dy = iy - prevPos.current.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        const now = performance.now();
        const angle = Math.atan2(dy, dx);

        // === Calligraphy pressure: slow = thick, fast = thin ===
        let targetWidth: number;
        if (speed < 2) targetWidth = 22 + (1 - speed / 2) * 4;
        else if (speed < 8) targetWidth = 14 + (22 - 14) * (1 - (speed - 2) / 6);
        else if (speed < 20) targetWidth = 5 + (14 - 5) * (1 - (speed - 8) / 12);
        else targetWidth = 2 + 3 * (1 - Math.min((speed - 20) / 15, 1));

        // Broad-nib angle: vertical strokes thicker
        if (speed > 1) {
          const verticalness = Math.abs(Math.sin(angle));
          targetWidth *= 0.3 + verticalness * 0.7;
        }

        // Direction change = momentary thinning
        if (speed > 2 && lastSpeed.current > 2) {
          let angleDiff = Math.abs(angle - lastAngle.current);
          if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
          if (angleDiff > Math.PI / 6) directionThinning.current = 0.5;
        }
        if (directionThinning.current > 0) {
          targetWidth *= (1 - directionThinning.current);
          directionThinning.current *= 0.85;
          if (directionThinning.current < 0.02) directionThinning.current = 0;
        }

        currentWidth.current += (targetWidth - currentWidth.current) * 0.2;
        const lineWidth = currentWidth.current;

        // Lingering = ink soaks in, stroke gets thicker naturally
        if (speed < 1.5) {
          stillFrames.current++;
          // Progressively fatten the stroke the longer you linger
          const soakBonus = Math.min(stillFrames.current * 0.8, 16);
          currentWidth.current = Math.min(currentWidth.current + soakBonus * 0.15, 38);
          // Spawn drip from the pooled-up thick area
          if (stillFrames.current === 20 && drips.current.length < 6) {
            drips.current.push({ x: ix + (Math.random() - 0.5) * 3, y: iy + currentWidth.current * 0.5, startY: iy + currentWidth.current * 0.5, opacity: 0.15, born: now, width: currentWidth.current * 0.35 });
          }
        } else {
          stillFrames.current = 0;
        }

        if (speed > 0.5) {
          lastAngle.current = angle;
          lastSpeed.current = speed;
        }

        // Track thick points for gravity drips
        if (lineWidth > 3) {
          thickPoints.current.push({ x: ix, y: iy, born: now, width: lineWidth });
          if (thickPoints.current.length > 20) thickPoints.current.shift();
        }

        // Position history for catmull-rom
        posHistory.current.push({ x: ix, y: iy });
        if (posHistory.current.length > 4) posHistory.current.shift();

        // === Catmull-Rom spline drawing ===
        ctx.globalCompositeOperation = "source-over";
        const hist = posHistory.current;

        const drawCatmullRom = (p0: {x:number;y:number}, p1: {x:number;y:number}, p2: {x:number;y:number}, p3: {x:number;y:number}) => {
          const steps = Math.max(4, Math.ceil(Math.sqrt((p2.x-p1.x)**2 + (p2.y-p1.y)**2) / 2));
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const t2 = t * t, t3 = t2 * t;
            const x = 0.5 * ((2*p1.x) + (-p0.x+p2.x)*t + (2*p0.x-5*p1.x+4*p2.x-p3.x)*t2 + (-p0.x+3*p1.x-3*p2.x+p3.x)*t3);
            const y = 0.5 * ((2*p1.y) + (-p0.y+p2.y)*t + (2*p0.y-5*p1.y+4*p2.y-p3.y)*t2 + (-p0.y+3*p1.y-3*p2.y+p3.y)*t3);
            ctx.lineTo(x, y);
          }
        };

        // Mouse held = dark permanent ink, otherwise light fading ink
        const held = mouseDown.current;
        const drawCtx = held && permCtx ? permCtx : ctx;
        const mainOpacity = held
          ? Math.min(0.6, 0.25 + lineWidth * 0.02)
          : Math.min(0.12, 0.04 + lineWidth * 0.012);

        if (hist.length >= 4) {
          const [p0, p1, p2, p3] = hist;
          drawCatmullRom(p0, p1, p2, p3);
          // Also draw on the target canvas
          const steps = Math.max(4, Math.ceil(Math.sqrt((p2.x-p1.x)**2 + (p2.y-p1.y)**2) / 2));
          drawCtx.beginPath();
          drawCtx.moveTo(p1.x, p1.y);
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const t2 = t * t, t3 = t2 * t;
            const sx = 0.5 * ((2*p1.x) + (-p0.x+p2.x)*t + (2*p0.x-5*p1.x+4*p2.x-p3.x)*t2 + (-p0.x+3*p1.x-3*p2.x+p3.x)*t3);
            const sy = 0.5 * ((2*p1.y) + (-p0.y+p2.y)*t + (2*p0.y-5*p1.y+4*p2.y-p3.y)*t2 + (-p0.y+3*p1.y-3*p2.y+p3.y)*t3);
            drawCtx.lineTo(sx, sy);
          }
          drawCtx.strokeStyle = `rgba(26, 26, 26, ${mainOpacity})`;
          drawCtx.lineWidth = lineWidth;
          drawCtx.lineCap = "round";
          drawCtx.lineJoin = "round";
          drawCtx.stroke();
        } else if (hist.length >= 2) {
          const a = hist[hist.length - 2], b = hist[hist.length - 1];
          drawCtx.beginPath();
          drawCtx.moveTo(a.x, a.y);
          drawCtx.lineTo(b.x, b.y);
          drawCtx.strokeStyle = `rgba(26, 26, 26, ${mainOpacity})`;
          drawCtx.lineWidth = lineWidth;
          drawCtx.lineCap = "round";
          drawCtx.lineJoin = "round";
          drawCtx.stroke();
        }

        prevPos.current = { x: ix, y: iy };
      }

      // Update crosshair DIRECTLY from event — zero lag
      if (crosshairRef.current) {
        crosshairRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        crosshairRef.current.style.opacity = "1";
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY - 18}px)`;
      }
    };

    const onMouseLeave = () => {
      visible.current = false;
      inkInitialized.current = false;
      if (crosshairRef.current) crosshairRef.current.style.opacity = "0";
      if (labelRef.current) labelRef.current.style.opacity = "0";
      trailRefs.current.forEach((el) => {
        if (el) el.style.opacity = "0";
      });
    };

    const onMouseEnter = () => {
      visible.current = true;
    };

    const onOver = (e: MouseEvent) => {
      const v = getVariant(e.target as Element);
      variantRef.current = v;
      const isActive = v === "pointer" || v === "view";

      if (crosshairRef.current) {
        const size = v === "view" ? 28 : v === "pointer" ? 22 : 18;
        crosshairRef.current.style.setProperty("--size", `${size}px`);
        crosshairRef.current.style.setProperty(
          "--dot-size",
          isActive ? "5px" : "3px"
        );
      }
      if (labelRef.current) {
        labelRef.current.style.opacity = v === "view" ? "1" : "0";
      }
    };

    const onOut = () => {
      variantRef.current = "default";
      if (crosshairRef.current) {
        crosshairRef.current.style.setProperty("--size", "18px");
        crosshairRef.current.style.setProperty("--dot-size", "3px");
      }
      if (labelRef.current) {
        labelRef.current.style.opacity = "0";
      }
    };

    // No scroll clear — ink persists on the page

    // Click = big paint drip
    const onClick = (e: MouseEvent) => {
      const now = performance.now();
      const ix = e.pageX, iy = e.pageY;
      const splashRadius = 16 + Math.random() * 6;
      // Immediate large drip
      drips.current.push({
        x: ix + (Math.random() - 0.5) * 4,
        y: iy + splashRadius * 0.6,
        startY: iy + splashRadius * 0.6,
        opacity: 0.18,
        born: now,
        width: splashRadius * 0.5,
      });
      // Sometimes a second smaller drip offset to the side
      if (Math.random() > 0.3) {
        const side = (Math.random() - 0.5) * splashRadius * 0.8;
        drips.current.push({
          x: ix + side,
          y: iy + splashRadius * 0.4,
          startY: iy + splashRadius * 0.4,
          opacity: 0.14,
          born: now + 150,
          width: splashRadius * 0.3,
        });
      }
      // Draw thick stroke blob at click point (not a circle — just a fat round cap)
      if (ctx) {
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.arc(ix, iy, splashRadius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(26, 26, 26, 0.10)";
        ctx.fill();
      }
    };
    window.addEventListener("click", onClick);

    // RAF loop for trail + ink fade + particle effects
    const animate = () => {
      const now = performance.now();

      if (ctx && canvas && now - lastInkTime > 16) {
        // Fade ink canvas
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
        lastInkTime = now;

        // === Drips from thick stroke areas ===
        for (let i = thickPoints.current.length - 1; i >= 0; i--) {
          const tp = thickPoints.current[i];
          if (now - tp.born > 500 && drips.current.length < 6) {
            drips.current.push({ x: tp.x + (Math.random() - 0.5) * 2, y: tp.y, startY: tp.y, opacity: 0.12, born: now, width: tp.width * 0.4 });
            thickPoints.current.splice(i, 1);
          } else if (now - tp.born > 1500) {
            thickPoints.current.splice(i, 1);
          }
        }
        // Draw drips — teardrop shape, accelerating downward
        for (let i = drips.current.length - 1; i >= 0; i--) {
          const d = drips.current[i];
          const age = now - d.born;
          const maxDist = 40 + d.width * 5;
          if (age > 1500 || d.y - d.startY > maxDist) { drips.current.splice(i, 1); continue; }
          const t = age / 1500;
          // Accelerate: starts slow, speeds up like real gravity
          d.y += 0.3 + t * 2;
          d.opacity = 0.12 * (1 - t * t);
          // Tapered teardrop: wider at top, narrow at bottom
          const w = d.width * (1 - t * 0.6);
          const h = 3 + t * 6;
          ctx.beginPath();
          ctx.ellipse(d.x, d.y - h * 0.3, Math.max(0.3, w), h, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(26, 26, 26, ${d.opacity})`;
          ctx.fill();
          // Tiny bead at the bottom tip
          ctx.beginPath();
          ctx.arc(d.x, d.y + h * 0.5, Math.max(0.3, w * 0.6), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(26, 26, 26, ${d.opacity * 1.3})`;
          ctx.fill();
        }
      }

      const { x, y } = pos.current;
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const tp = trailPositions.current[i];
        tp.x += (x - tp.x) * TRAIL_LERPS[i];
        tp.y += (y - tp.y) * TRAIL_LERPS[i];
        const el = trailRefs.current[i];
        if (el) {
          el.style.transform = `translate(${tp.x}px, ${tp.y}px)`;
          el.style.opacity = visible.current ? String(TRAIL_OPACITIES[i]) : "0";
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("click", onClick);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      resizeObserver.disconnect();
    };
  }, [hasFinePointer, getVariant]);

  if (!hasFinePointer) return null;

  return (
    <>
      {/* Permanent ink canvas — dark strokes that never fade */}
      <canvas
        ref={permCanvasRef}
        className="absolute top-0 left-0 pointer-events-none z-[9997]"
        style={{ width: '100%' }}
      />
      {/* Fading ink trail canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none z-[9998]"
        style={{ width: '100%' }}
      />
      {/* Crosshair + trail layer — mix-blend-mode: difference */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{ mixBlendMode: "difference" }}
      >
        {/* Trail dots */}
        {Array.from({ length: TRAIL_COUNT }, (_, i) => (
          <div
            key={i}
            ref={(el) => { trailRefs.current[i] = el; }}
            className="absolute top-0 left-0"
            style={{
              width: TRAIL_SIZES[i],
              height: TRAIL_SIZES[i],
              marginLeft: -TRAIL_SIZES[i] / 2,
              marginTop: -TRAIL_SIZES[i] / 2,
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              opacity: 0,
              willChange: "transform",
            }}
          />
        ))}

        {/* Crosshair */}
        <div
          ref={crosshairRef}
          className="absolute top-0 left-0"
          style={
            {
              "--size": "18px",
              "--dot-size": "3px",
              opacity: 0,
              willChange: "transform",
            } as React.CSSProperties
          }
        >
          {/* Horizontal line */}
          <div
            className="absolute"
            style={{
              width: "var(--size)",
              height: "1.25px",
              top: "-0.625px",
              left: "calc(var(--size) / -2)",
              backgroundColor: "#FFFFFF",
            }}
          />
          {/* Vertical line */}
          <div
            className="absolute"
            style={{
              width: "1.25px",
              height: "var(--size)",
              left: "-0.625px",
              top: "calc(var(--size) / -2)",
              backgroundColor: "#FFFFFF",
            }}
          />
          {/* Center dot */}
          <div
            className="absolute"
            style={{
              width: "var(--dot-size)",
              height: "var(--dot-size)",
              borderRadius: "50%",
              top: "calc(var(--dot-size) / -2)",
              left: "calc(var(--dot-size) / -2)",
              backgroundColor: "#FFFFFF",
            }}
          />
        </div>
      </div>

      {/* VIEW label — separate layer, no blend mode */}
      <div
        ref={labelRef}
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          opacity: 0,
          willChange: "transform",
          fontFamily: "var(--font-mono), monospace",
          fontSize: "9px",
          fontWeight: 500,
          letterSpacing: "0.2em",
          color: "#E05252",
        }}
      >
        VIEW
      </div>
    </>
  );
}
