"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationControls,
  useScroll,
} from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Ripple {
  x: number;
  y: number;
  time: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const RIPPLE_SPEED = 600;
const RIPPLE_HIT_BAND = 50;
const RIPPLE_COOLDOWN = 500;
const MORPH_SYMBOLS = "αβγδφψΣΩ∞∇";

/* ── TypewriterTagline ── */
function TypewriterTagline({ delay = 0 }: { delay?: number }) {
  const fullText = "If it's not remarkable, why bother?";
  const [charCount, setCharCount] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setCharCount(i);
        if (i >= fullText.length) {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 2000);
        }
      }, 55);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  const displayed = fullText.slice(0, charCount);
  const remarkableStart = fullText.indexOf("remarkable");
  const remarkableEnd = remarkableStart + "remarkable".length;

  const parts: React.ReactNode[] = [];
  for (let i = 0; i < displayed.length; i++) {
    if (i >= remarkableStart && i < remarkableEnd) {
      // Find the end of the remarkable substring within displayed
      const end = Math.min(displayed.length, remarkableEnd);
      parts.push(
        <span key="remarkable" style={{ color: "#E05252", WebkitTextStroke: "0" }}>
          {displayed.slice(remarkableStart, end)}
        </span>
      );
      i = end - 1;
    } else {
      parts.push(displayed[i]);
    }
  }

  return (
    <span className="font-[family-name:var(--font-display)] italic text-[clamp(1.5rem,3.5vw,3rem)] leading-[1.2] text-[#1A1A1A]">
      {parts}
      {showCursor && (
        <motion.span
          className="inline-block ml-0.5"
          style={{ color: "#E05252" }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
        >
          |
        </motion.span>
      )}
    </span>
  );
}

/* ── Letter-by-letter reveal with hover drift + ripple reaction ── */
function HeroLetter({
  char,
  index,
  baseDelay,
  ripplesRef,
  mouseClientX,
  mouseClientY,
  isMobile,
}: {
  char: string;
  index: number;
  baseDelay: number;
  ripplesRef?: React.RefObject<Ripple[]>;
  mouseClientX?: React.RefObject<number>;
  mouseClientY?: React.RefObject<number>;
  isMobile: boolean;
}) {
  const controls = useAnimationControls();
  const hasRevealed = useRef(false);
  const letterRef = useRef<HTMLSpanElement>(null);
  const magnetRef = useRef<HTMLSpanElement>(null);
  const lastHitTime = useRef(0);
  const processedRipples = useRef(new Set<number>());
  const isSpace = char === " ";
  const [displayedChar, setDisplayedChar] = useState(isSpace ? "\u00A0" : isMobile ? char : "φ");

  useEffect(() => {
    if (isSpace || isMobile) return;
    const delayMs = (baseDelay + index * 0.06) * 1000;
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => {
      const pick = () => MORPH_SYMBOLS[Math.floor(Math.random() * MORPH_SYMBOLS.length)];
      const r1 = pick();
      let r2 = pick();
      while (r2 === r1) r2 = pick();

      setDisplayedChar(r1);
      timers.push(setTimeout(() => setDisplayedChar(r2), 100));
      timers.push(setTimeout(() => setDisplayedChar(char), 200));
    }, delayMs));

    return () => timers.forEach(clearTimeout);
  }, [char, baseDelay, index, isSpace, isMobile]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      controls.start({ opacity: 1, y: 0 }).then(() => {
        hasRevealed.current = true;
      });
    }, (baseDelay + index * 0.06) * 1000);
    return () => clearTimeout(timeout);
  }, [controls, baseDelay, index]);

  useEffect(() => {
    if (!ripplesRef || isMobile) return;
    let rafId: number;

    const check = () => {
      rafId = requestAnimationFrame(check);
      if (!hasRevealed.current || !letterRef.current) return;

      const ripples = ripplesRef.current;
      if (!ripples || ripples.length === 0) return;

      const now = performance.now();
      if (now - lastHitTime.current < RIPPLE_COOLDOWN) return;

      const rect = letterRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      for (const ripple of ripples) {
        if (processedRipples.current.has(ripple.time)) continue;

        const elapsed = (now - ripple.time) / 1000;
        if (elapsed > 2) continue;

        const ringRadius = elapsed * RIPPLE_SPEED;
        const parent = letterRef.current.closest('[class*="relative"]');
        if (!parent) continue;
        const parentRect = parent.getBoundingClientRect();
        const rippleScreenX = parentRect.left + ripple.x;
        const rippleScreenY = parentRect.top + ripple.y;

        const dist = Math.sqrt((cx - rippleScreenX) ** 2 + (cy - rippleScreenY) ** 2);
        const ringDist = Math.abs(dist - ringRadius);

        if (ringDist < RIPPLE_HIT_BAND) {
          lastHitTime.current = now;
          processedRipples.current.add(ripple.time);
          if (processedRipples.current.size > 20) {
            const entries = Array.from(processedRipples.current);
            entries.slice(0, 10).forEach((t) => processedRipples.current.delete(t));
          }

          controls.start({
            y: [0, -5, 0],
            scale: [1, 1.08, 1],
            rotate: [0, -2, 1.5, 0],
            transition: { duration: 0.45, ease: EASE },
          });
          break;
        }
      }
    };

    rafId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(rafId);
  }, [ripplesRef, controls, isMobile]);

  const inkRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!mouseClientX || !mouseClientY || isMobile) return;
    let rafId: number;
    const MAX_DIST = 300;
    const MAX_PULL = 12;
    const INK_RADIUS = 200;

    const update = () => {
      rafId = requestAnimationFrame(update);
      const el = magnetRef.current;
      const letter = letterRef.current;
      if (!el || !letter) return;

      const rect = letter.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mx = mouseClientX.current;
      const my = mouseClientY.current;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_DIST && dist > 0) {
        const strength = (1 - dist / MAX_DIST) * MAX_PULL;
        const tx = (dx / dist) * strength;
        const ty = (dy / dist) * strength;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
      } else {
        el.style.transform = "translate(0px, 0px)";
      }

      // Per-letter ink fill — opacity based on proximity
      if (inkRef.current) {
        if (dist < INK_RADIUS && dist > 0) {
          const fill = 1 - dist / INK_RADIUS;
          // Ease the fill for a smoother look
          const eased = fill * fill; // quadratic ease-in
          inkRef.current.style.opacity = `${eased}`;
        } else {
          inkRef.current.style.opacity = "0";
        }
      }
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [mouseClientX, mouseClientY, isMobile]);

  if (isMobile) {
    return (
      <motion.span
        ref={letterRef}
        className="inline-block cursor-default select-none"
        initial={{ opacity: 0, y: 30 }}
        animate={controls}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {displayedChar}
      </motion.span>
    );
  }

  return (
    <span ref={magnetRef} className="inline-block" style={{ transition: "transform 0.15s ease-out" }}>
    <motion.span
      ref={letterRef}
      className="inline-block cursor-default select-none relative"
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
      {displayedChar}
      {/* Ink fill — solid version, opacity controlled by cursor proximity */}
      <span
        ref={inkRef}
        className="absolute inset-0 text-[#1A1A1A] pointer-events-none"
        style={{ opacity: 0, WebkitTextStroke: "0px", transition: "opacity 0.15s ease-out" }}
        aria-hidden="true"
      >
        {displayedChar}
      </span>
    </motion.span>
    </span>
  );
}

function AnimatedHeading({
  text,
  baseDelay,
  className,
  ripplesRef,
  mouseClientX,
  mouseClientY,
  isMobile,
}: {
  text: string;
  baseDelay: number;
  className?: string;
  ripplesRef?: React.RefObject<Ripple[]>;
  mouseClientX?: React.RefObject<number>;
  mouseClientY?: React.RefObject<number>;
  isMobile: boolean;
}) {
  return (
    <div className={className}>
      {text.split("").map((char, i) => (
        <HeroLetter
          key={`${char}-${i}`}
          char={char}
          index={i}
          baseDelay={baseDelay}
          ripplesRef={isMobile ? undefined : ripplesRef}
          mouseClientX={isMobile ? undefined : mouseClientX}
          mouseClientY={isMobile ? undefined : mouseClientY}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}

function useSydneyGreeting() {
  const [greeting, setGreeting] = useState("(01) Design Studio");
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = parseInt(
        now.toLocaleString("en-AU", { timeZone: "Australia/Sydney", hour: "numeric", hour12: false }),
        10
      );
      if (hour >= 5 && hour < 12) setGreeting("Good morning from Sydney");
      else if (hour >= 12 && hour < 17) setGreeting("Good afternoon from Sydney");
      else if (hour >= 17 && hour < 21) setGreeting("Good evening from Sydney");
      else setGreeting("Late nights in Sydney");
      setTime(now.toLocaleString("en-AU", { timeZone: "Australia/Sydney", hour: "2-digit", minute: "2-digit", hour12: true }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);
  return { greeting, time };
}

export default function Hero({ ripplesRef, scrollVelocityRef }: { ripplesRef?: React.RefObject<Ripple[]>; scrollVelocityRef?: React.RefObject<number> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const { greeting, time } = useSydneyGreeting();

  /* ── Scroll velocity DOM refs ── */
  const desktopTextRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef<HTMLDivElement>(null);
  const metaLeftRef = useRef<HTMLSpanElement>(null);
  const metaRightRef = useRef<HTMLSpanElement>(null);

  /* ── Scroll-triggered name merge ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const ethanX = useTransform(scrollYProgress, [0, 0.6], ["0%", "35%"]);
  const ethanY = useTransform(scrollYProgress, [0, 0.6], ["0%", "80%"]);
  const wuX = useTransform(scrollYProgress, [0, 0.6], ["0%", "-55%"]);
  const wuY = useTransform(scrollYProgress, [0, 0.6], ["0%", "-60%"]);
  const mergeScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.85]);

  /* ── Scroll velocity RAF loop (desktop only) ── */
  useEffect(() => {
    if (!scrollVelocityRef || isMobile) return;
    let rafId: number;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const v = scrollVelocityRef.current;

      if (desktopTextRef.current) {
        desktopTextRef.current.style.transform = `skewY(${v * 0.3}deg)`;
      }
      if (phiRef.current) {
        phiRef.current.style.setProperty("--scroll-ty", `${-v * 0.8}px`);
      }
      if (metaLeftRef.current) {
        metaLeftRef.current.style.transform = `translateY(${v * 0.3}px)`;
      }
      if (metaRightRef.current) {
        metaRightRef.current.style.transform = `translateY(${v * 0.3}px)`;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [scrollVelocityRef, isMobile]);

  /* ── Raw mouse position for magnetic letters (desktop only) ── */
  const mouseClientX = useRef(0);
  const mouseClientY = useRef(0);

  /* ── Mouse parallax (desktop only) ── */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 30 });

  const headingX = useTransform(smoothX, [0, 1], [-4, 4]);
  const headingY = useTransform(smoothY, [0, 1], [-3, 3]);

  const phiX = useTransform(smoothX, [0, 1], [8, -8]);
  const phiY = useTransform(smoothY, [0, 1], [6, -6]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isMobile) return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseClientX.current = e.clientX;
      mouseClientY.current = e.clientY;
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [isMobile, mouseX, mouseY],
  );

  /* ── Font classes ── */
  const heroFont =
    "font-[family-name:var(--font-display)] italic leading-[0.88] tracking-[-0.04em] text-[#1A1A1A]";
  const bigSize = "text-[clamp(5rem,15vw,15rem)]";
  const smallSize = "text-[clamp(4rem,11vw,11rem)]";
  const monoMeta =
    "font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.25em] text-[#777]";

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={isMobile ? undefined : handleMouseMove}
      className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden"
    >
      {/* ── Ghost φ (golden ratio) — desktop only ── */}
      {!isMobile && (
        <motion.div
          ref={phiRef}
          className="hidden md:block absolute top-1/2 -translate-y-1/2 right-[var(--site-px)] pointer-events-none select-none"
          style={{ x: phiX, y: phiY, marginTop: "var(--scroll-ty, 0px)" }}
        >
          <span
            className="font-[family-name:var(--font-display)] italic text-[clamp(12rem,28vw,32rem)] leading-none text-[#1A1A1A] opacity-[0.035]"
          >
            φ
          </span>
        </motion.div>
      )}

      {/* ── Scattered metadata: top-left ── */}
      <motion.span
        ref={metaLeftRef}
        className={`hidden md:block absolute top-8 left-[var(--site-px)] ${monoMeta}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
      >
        {greeting}{time && ` · ${time}`}
      </motion.span>

      {/* ── Scattered metadata: top-right coordinates ── */}
      <motion.span
        ref={metaRightRef}
        className={`hidden md:block absolute top-8 right-[var(--site-px)] ${monoMeta}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
      >
        33.87°S 151.21°E
      </motion.span>

      {/* ── Main typographic composition ── */}
      <motion.div
        className="relative z-10 w-full"
        style={{ paddingLeft: "var(--site-px)", paddingRight: "var(--site-px)", ...(isMobile ? {} : { x: headingX, y: headingY }) }}
      >
        {/* ── MOBILE: centered stack ── */}
        <div className="md:hidden flex flex-col items-center">
          <AnimatedHeading ripplesRef={ripplesRef} mouseClientX={mouseClientX} mouseClientY={mouseClientY} isMobile={isMobile}
            text="Ethan"
            baseDelay={0.2}
            className={`${heroFont} ${bigSize}`}
          />
          <AnimatedHeading ripplesRef={ripplesRef} mouseClientX={mouseClientX} mouseClientY={mouseClientY} isMobile={isMobile}
            text="Wu"
            baseDelay={0.4}
            className={`${heroFont} ${bigSize} mt-[-0.1em]`}
          />
          <motion.p
            className="mt-6 max-w-[280px] text-center font-[family-name:var(--font-display)] italic text-[clamp(1.1rem,5vw,1.5rem)] leading-[1.2] hero-stroke-text hero-tagline"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.0 }}
          >
            If it&apos;s not remarkable, why bother?
          </motion.p>
          <motion.p
            className="mt-6 max-w-[280px] text-center font-[family-name:var(--font-space)] text-[12px] leading-relaxed text-[#999]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.1 }}
          >
            A one-person studio. Small by design, sharp by nature.
          </motion.p>
          <motion.span
            className={`mt-4 ${monoMeta}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            Studio — Sydney
          </motion.span>
        </div>

        {/* ── DESKTOP ── */}
        <div className="hidden md:block">
          <div ref={desktopTextRef} className="relative" style={{ transition: "transform 0.3s ease-out", height: "clamp(24rem, 55vh, 42rem)" }}>
            {/* Ethan — outline/stroke, top-left, per-letter ink fill on cursor proximity */}
            <motion.div style={{ x: ethanX, y: ethanY, scale: mergeScale }}>
              <div className="absolute top-0 left-0 hero-stroke-text">
                <AnimatedHeading ripplesRef={ripplesRef} mouseClientX={mouseClientX} mouseClientY={mouseClientY} isMobile={isMobile}
                  text="Ethan"
                  baseDelay={0.2}
                  className="font-[family-name:var(--font-display)] italic leading-[0.88] tracking-[-0.04em] text-[clamp(5rem,14vw,18rem)]"
                />
              </div>
            </motion.div>

            {/* Wu — solid fill, bottom-right */}
            <motion.div style={{ x: wuX, y: wuY, scale: mergeScale }}>
              <div className="absolute bottom-[4%] right-[3%]">
                <AnimatedHeading ripplesRef={ripplesRef} mouseClientX={mouseClientX} mouseClientY={mouseClientY} isMobile={isMobile}
                  text="Wu"
                  baseDelay={0.4}
                  className={`${heroFont} text-[clamp(8rem,22vw,28rem)]`}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Tagline — desktop only (TypewriterTagline) ── */}
      <motion.div
        className="hidden md:block absolute bottom-28 left-[var(--site-px)] z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 1.0 }}
      >
        <TypewriterTagline delay={1.2} />
      </motion.div>

      {/* ── Bottom bar — desktop only ── */}
      <motion.p
        className="hidden md:block absolute bottom-16 left-[var(--site-px)] max-w-[360px] font-[family-name:var(--font-space)] text-[13px] leading-relaxed text-[#999] z-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 1.2 }}
      >
        A one-person studio. Small by design, sharp by nature.
      </motion.p>
      <motion.span
        className={`hidden md:inline absolute bottom-16 right-[var(--site-px)] ${monoMeta} z-10`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 1.3 }}
      >
        Studio — Sydney
      </motion.span>

      {/* ── Scroll indicator: bottom-right ── */}
      <motion.div
        className="absolute bottom-8 right-[var(--site-px)] hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <motion.span
          className={`${monoMeta} text-[#bbb]`}
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ↓
        </motion.span>
      </motion.div>

      {/* ── Mobile scroll hint ── */}
      <motion.div
        className="md:hidden absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <motion.div
          className="w-px h-8 bg-[#1A1A1A]/20"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
