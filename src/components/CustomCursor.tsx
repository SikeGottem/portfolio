"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type CursorVariant = "default" | "pointer" | "view";

const TRAIL_COUNT = 5;
const TRAIL_LERPS = [0.35, 0.28, 0.22, 0.16, 0.11];
const TRAIL_SIZES = [4, 3.5, 3, 2.5, 2];
const TRAIL_OPACITIES = [0.45, 0.35, 0.25, 0.18, 0.1];

export default function CustomCursor() {
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef({ x: -100, y: -100 });
  const trailPositions = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
  );
  const visible = useRef(false);
  const variantRef = useRef<CursorVariant>("default");
  const rafRef = useRef<number>(0);

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

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      visible.current = true;

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

    // RAF loop for trail only
    const animate = () => {
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
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [hasFinePointer, getVariant]);

  if (!hasFinePointer) return null;

  return (
    <>
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
