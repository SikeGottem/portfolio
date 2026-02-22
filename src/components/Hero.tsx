"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationControls,
} from "framer-motion";

interface Ripple {
  x: number;
  y: number;
  time: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const RIPPLE_SPEED = 600; // px/s — must match DotGrid
const RIPPLE_HIT_BAND = 50; // px tolerance for ring proximity
const RIPPLE_COOLDOWN = 500; // ms before a letter can react again
const MORPH_SYMBOLS = "αβγδφψΣΩ∞∇";

/* ── Letter-by-letter reveal with hover drift + ripple reaction ── */
function HeroLetter({
  char,
  index,
  baseDelay,
  ripplesRef,
  mouseClientX,
  mouseClientY,
}: {
  char: string;
  index: number;
  baseDelay: number;
  ripplesRef?: React.RefObject<Ripple[]>;
  mouseClientX?: React.RefObject<number>;
  mouseClientY?: React.RefObject<number>;
}) {
  const controls = useAnimationControls();
  const hasRevealed = useRef(false);
  const letterRef = useRef<HTMLSpanElement>(null);
  const magnetRef = useRef<HTMLSpanElement>(null);
  const lastHitTime = useRef(0);
  const processedRipples = useRef(new Set<number>());
  const isSpace = char === " ";
  const [displayedChar, setDisplayedChar] = useState(isSpace ? "\u00A0" : "φ");

  /* ── Character morph: φ → random symbols → real letter ── */
  useEffect(() => {
    if (isSpace) return;
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
  }, [char, baseDelay, index, isSpace]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      controls.start({ opacity: 1, y: 0 }).then(() => {
        hasRevealed.current = true;
      });
    }, (baseDelay + index * 0.06) * 1000);
    return () => clearTimeout(timeout);
  }, [controls, baseDelay, index]);

  /* ── RAF loop: check if any ripple ring is passing through this letter ── */
  useEffect(() => {
    if (!ripplesRef) return;
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
        // Skip already-processed ripples for this letter
        if (processedRipples.current.has(ripple.time)) continue;

        const elapsed = (now - ripple.time) / 1000;
        if (elapsed > 2) continue; // ripple expired

        const ringRadius = elapsed * RIPPLE_SPEED;
        // Ripple coords are relative to the DotGrid container (same as click target)
        // We need to convert — ripple x/y are relative to the clicked container's rect
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
          // Clean up old entries
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
  }, [ripplesRef, controls]);

  /* ── RAF loop: magnetic pull toward cursor ── */
  useEffect(() => {
    if (!mouseClientX || !mouseClientY) return;
    let rafId: number;
    const MAX_DIST = 2000;
    const MAX_PULL = 15; // px

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
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [mouseClientX, mouseClientY]);

  return (
    <span ref={magnetRef} className="inline-block" style={{ transition: "transform 0.15s ease-out" }}>
    <motion.span
      ref={letterRef}
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
      {displayedChar}
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
}: {
  text: string;
  baseDelay: number;
  className?: string;
  ripplesRef?: React.RefObject<Ripple[]>;
  mouseClientX?: React.RefObject<number>;
  mouseClientY?: React.RefObject<number>;
}) {
  return (
    <div className={className}>
      {text.split("").map((char, i) => (
        <HeroLetter key={`${char}-${i}`} char={char} index={i} baseDelay={baseDelay} ripplesRef={ripplesRef} mouseClientX={mouseClientX} mouseClientY={mouseClientY} />
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
  const [isMobile, setIsMobile] = useState(false);
  const { greeting, time } = useSydneyGreeting();

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsMobile(mq.matches);
  }, []);

  /* ── Scroll velocity DOM refs ── */
  const desktopTextRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef<HTMLDivElement>(null);
  const metaLeftRef = useRef<HTMLSpanElement>(null);
  const metaRightRef = useRef<HTMLSpanElement>(null);

  /* ── Scroll velocity RAF loop ── */
  useEffect(() => {
    if (!scrollVelocityRef) return;
    let rafId: number;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const v = scrollVelocityRef.current;

      // Skew the desktop text container
      if (desktopTextRef.current) {
        const skew = v * 0.3;
        desktopTextRef.current.style.transform = `skewY(${skew}deg)`;
      }

      // φ lags behind — shifts opposite to scroll direction
      if (phiRef.current) {
        const ty = -v * 0.8;
        // Compose with existing motion style (phiX/phiY handled by framer-motion)
        phiRef.current.style.setProperty("--scroll-ty", `${ty}px`);
      }

      // Metadata drifts with scroll
      if (metaLeftRef.current) {
        metaLeftRef.current.style.transform = `translateY(${v * 0.3}px)`;
      }
      if (metaRightRef.current) {
        metaRightRef.current.style.transform = `translateY(${v * 0.3}px)`;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [scrollVelocityRef]);

  /* ── Raw mouse position for magnetic letters ── */
  const mouseClientX = useRef(0);
  const mouseClientY = useRef(0);

  /* ── Mouse parallax ── */
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
  const bigSize = "text-[clamp(5rem,15vw,15rem)]"; // used for mobile
  const smallSize = "text-[clamp(4rem,11vw,11rem)]"; // used for mobile
  const monoMeta =
    "font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.25em] text-[#777]";

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden"
    >
      {/* ── Ghost φ (golden ratio) ── */}
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
          <AnimatedHeading ripplesRef={ripplesRef} mouseClientX={mouseClientX} mouseClientY={mouseClientY}
            text="Ethan"
            baseDelay={0.2}
            className={`${heroFont} ${bigSize}`}
          />
          <AnimatedHeading ripplesRef={ripplesRef} mouseClientX={mouseClientX} mouseClientY={mouseClientY}
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

        {/* ── DESKTOP: tight stack with staircase offset ──
             Compositional logic:
             • Group sits at optical center (~45% from top via the parent flex-center)
             • "Zen" left-aligned — anchors the top-left third
             • "Lab" offset ~30% right — creates a stepping rhythm
             • "Creative" offset ~15% right — arc between Zen & Lab
             • Tight leading (0.88) binds the three words as one unit
             • Ghost "01" at golden-ratio from right (~38.2% from right = 61.8% from left)
             • Negative space on the right is intentional counterweight
             • Description bottom-left, location bottom-right = rule-of-thirds baseline
        ── */}
        {/* ── DESKTOP: dynamic diagonal spread across full viewport ──
             • "Zen" — massive, top-left, anchors the eye
             • "Lab" — outline/stroke only, center-right, creates depth
             • "Creative" — medium, bottom-right, completes the diagonal
             • Words flow diagonally across the viewport using the full width
        ── */}
        <div className="hidden md:block">
          <div ref={desktopTextRef} className="relative" style={{ transition: "transform 0.3s ease-out", height: "clamp(22rem, 50vh, 36rem)" }}>
            {/* Ethan — outline/stroke, top-left */}
            <div className="absolute top-0 left-0 hero-stroke-text">
              <AnimatedHeading ripplesRef={ripplesRef} mouseClientX={mouseClientX} mouseClientY={mouseClientY}
                text="Ethan"
                baseDelay={0.2}
                className="font-[family-name:var(--font-display)] italic leading-[0.88] tracking-[-0.04em] text-[clamp(5rem,12vw,13rem)]"
              />
            </div>

            {/* Wu — solid fill, bottom-right */}
            <div className="absolute bottom-[4%] right-[3%]">
              <AnimatedHeading ripplesRef={ripplesRef} mouseClientX={mouseClientX} mouseClientY={mouseClientY}
                text="Wu"
                baseDelay={0.4}
                className={`${heroFont} text-[clamp(8rem,18vw,20rem)]`}
              />
            </div>
          </div>

        </div>
      </motion.div>

      {/* ── Tagline — display font, bottom-left above footer text (desktop only) ── */}
      <motion.p
        className="hidden md:block absolute bottom-28 left-[var(--site-px)] z-10 font-[family-name:var(--font-display)] italic text-[clamp(1.5rem,3.5vw,3rem)] leading-[1.2] hero-stroke-text hero-tagline"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 1.0 }}
      >
        If it&apos;s not remarkable, why bother?
      </motion.p>

      {/* ── Bottom bar: pinned to section bottom corners, matching top metadata padding (desktop only) ── */}
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
