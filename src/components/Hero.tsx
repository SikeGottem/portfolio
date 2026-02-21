"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationControls,
} from "framer-motion";
import CircleBadge from "./CircleBadge";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Noise field canvas — subtle generative "lab" texture ── */
function NoiseField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Simple 2D noise-like dot field
    const cols = 48;
    const rows = 32;
    let t = 0;

    const draw = () => {
      t += 0.003;
      ctx.clearRect(0, 0, w, h);

      const cellW = w / cols;
      const cellH = h / rows;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * cellW + cellW / 2;
          const y = j * cellH + cellH / 2;

          // Pseudo-noise using sin combinations
          const n =
            Math.sin(i * 0.3 + t * 2) *
            Math.cos(j * 0.4 + t * 1.5) *
            Math.sin((i + j) * 0.2 + t);

          const radius = Math.max(0, n * 1.8 + 0.3);
          const alpha = Math.max(0, n * 0.12 + 0.04);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 82, 82, ${alpha})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.5 }}
      aria-hidden="true"
    />
  );
}

/* ── Letter-by-letter reveal with hover drift ── */
function HeroLetter({
  char,
  index,
  baseDelay,
}: {
  char: string;
  index: number;
  baseDelay: number;
}) {
  const controls = useAnimationControls();
  const hasRevealed = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      controls.start({ opacity: 1, y: 0 }).then(() => {
        hasRevealed.current = true;
      });
    }, (baseDelay + index * 0.06) * 1000);
    return () => clearTimeout(timeout);
  }, [controls, baseDelay, index]);

  return (
    <motion.span
      className="inline-block cursor-default select-none"
      initial={{ opacity: 0, y: 40 }}
      animate={controls}
      transition={{ duration: 0.8, ease: EASE }}
      onMouseEnter={() => {
        if (!hasRevealed.current) return;
        controls.start({
          y: [0, -8, 0],
          rotate: [0, -3, 2, 0],
          transition: { duration: 0.5, ease: EASE },
        });
      }}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

function AnimatedHeading({
  text,
  baseDelay,
  className,
}: {
  text: string;
  baseDelay: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {text.split("").map((char, i) => (
        <HeroLetter key={`${char}-${i}`} char={char} index={i} baseDelay={baseDelay} />
      ))}
    </div>
  );
}

/* ── Horizontal rule that draws itself ── */
function AnimatedRule({ delay }: { delay: number }) {
  return (
    <motion.div
      className="h-px bg-[#E05252]/30 origin-left"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1.2, ease: EASE, delay }}
    />
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsMobile(mq.matches);
  }, []);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 30 });

  const headingX = useTransform(smoothX, [0, 1], [-4, 4]);
  const headingY = useTransform(smoothY, [0, 1], [-3, 3]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isMobile) return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [isMobile, mouseX, mouseY],
  );

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Generative noise field — lab aesthetic */}
      <NoiseField />

      {/* ── Main typographic composition ── */}
      <motion.div
        className="relative z-10 w-full flex flex-col items-center px-6"
        style={isMobile ? {} : { x: headingX, y: headingY }}
      >
        {/* "Zen Lab" — the hero moment */}
        <AnimatedHeading
          text="Zen Lab"
          baseDelay={0.2}
          className="font-[family-name:var(--font-display)] italic text-[clamp(5rem,16vw,15rem)] leading-[0.88] tracking-[-0.04em] text-[#1A1A1A] text-center"
        />

        {/* Thin animated rule */}
        <div className="w-16 sm:w-24 mt-5 mb-4">
          <AnimatedRule delay={0.9} />
        </div>

        {/* "Creative Studio" — quiet counterpoint */}
        <motion.span
          className="font-[family-name:var(--font-mono)] text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#999] text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 1.1 }}
        >
          Creative Studio
        </motion.span>
      </motion.div>

      {/* Circle badge — bottom left */}
      <motion.div
        className="absolute bottom-10 left-6 md:left-12 lg:left-16 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
      >
        <CircleBadge />
      </motion.div>

      {/* Stats strip — bottom center */}
      <motion.div
        className="absolute bottom-6 left-0 right-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
      >
        {["5+ Clients", "2025 — Present", "Sydney, AU"].map((stat, i) => (
          <div key={stat} className="flex items-center">
            {i > 0 && <div className="w-px h-3 bg-black/10 mx-5" />}
            <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.12em] text-[#bbb] uppercase">
              {stat}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
