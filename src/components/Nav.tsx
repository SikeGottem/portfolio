"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import MagneticButton from "./MagneticButton";

const LINKS = [
  { label: "Home", href: "#hero", num: "00" },
  { label: "Work", href: "#work", num: "01" },
  { label: "About", href: "#about", num: "02" },
  { label: "Contact", href: "#contact", num: "03" },
];

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function Nav() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [wordmarkVisible, setWordmarkVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [dockVisible, setDockVisible] = useState(false);
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  // Show dock after small scroll or delay
  useEffect(() => {
    const timer = setTimeout(() => setDockVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastScrollY.current;
    if (latest < 100) {
      setWordmarkVisible(true);
      setHasScrolled(false);
    } else {
      setHasScrolled(true);
      if (delta > 5) setWordmarkVisible(false);
      else if (delta < -5) setWordmarkVisible(true);
    }
    if (latest > 50) setDockVisible(true);
    lastScrollY.current = latest;
  });

  // Continuous scroll-interpolated position (0 to LINKS.length-1, fractional)
  const [scrollProgress, setScrollProgress] = useState(0);
  const [onDarkBg, setOnDarkBg] = useState(false);

  useEffect(() => {
    const ids = ["hero", "work", "about", "contact"];
    let rafId: number | null = null;
    let ticking = false;

    const computeScroll = () => {
      ticking = false;
      const scrollPos = window.scrollY + window.innerHeight * 0.35;

      const offsets = ids.map((id) => {
        const el = document.getElementById(id);
        return el ? el.offsetTop : 0;
      });

      let current = "hero";
      let progress = 0;

      for (let i = 0; i < offsets.length; i++) {
        if (scrollPos >= offsets[i]) {
          current = ids[i];
          const nextOffset = i < offsets.length - 1 ? offsets[i + 1] : offsets[i] + window.innerHeight;
          const sectionLength = nextOffset - offsets[i];
          const fraction = sectionLength > 0 ? Math.min((scrollPos - offsets[i]) / sectionLength, 1) : 0;
          progress = i + fraction;
        }
      }

      setActiveSection(current);
      setScrollProgress(progress);
      setOnDarkBg(current === "contact");
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(computeScroll);
      }
    };

    computeScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleNavClick = useCallback((href: string) => {
    setMenuOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const activeIndex = LINKS.findIndex((l) => l.href === `#${activeSection}`);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  // Update pill position directly via DOM (no state, no re-render loop)
  useEffect(() => {
    const updatePill = () => {
      const container = containerRef.current;
      const pill = pillRef.current;
      if (!container || !pill || linkRefs.current.length === 0) return;

      const rects = linkRefs.current.map((el) => {
        if (!el) return { left: 0, width: 0 };
        const cr = el.getBoundingClientRect();
        const pr = container.getBoundingClientRect();
        return { left: cr.left - pr.left, width: cr.width };
      });

      const floor = Math.floor(scrollProgress);
      const frac = scrollProgress - floor;
      const from = rects[Math.min(floor, rects.length - 1)];
      const to = rects[Math.min(floor + 1, rects.length - 1)];

      pill.style.left = `${from.left + (to.left - from.left) * frac}px`;
      pill.style.width = `${from.width + (to.width - from.width) * frac}px`;
    };

    updatePill();
  }, [scrollProgress]);

  return (
    <>
      {/* Wordmark removed — name is in the hero */}

      {/* ── Floating Dock Nav (Bottom Center, Desktop) ── */}
      <motion.nav
        className="fixed bottom-6 left-1/2 z-50 hidden md:flex items-center pointer-events-auto"
        style={{ x: "-50%" }}
        initial={{ opacity: 0, y: 40 }}
        animate={{
          opacity: dockVisible ? 1 : 0,
          y: dockVisible ? 0 : 40,
        }}
        transition={{ duration: 0.6, ease: EASE }}
        aria-label="Section navigation"
      >
        <div
          ref={containerRef}
          className="relative flex items-center gap-2 px-8 py-6 rounded-[2.5rem] border border-[#1A1A1A]/[0.06]"
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          {/* Smooth scroll-driven glass pill */}
          <div
            ref={pillRef}
            className="absolute top-0 bottom-0 rounded-[2rem] pointer-events-none"
            style={{
              background: onDarkBg
                ? "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)"
                : "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 100%)",
              backdropFilter: "blur(24px) saturate(1.6)",
              WebkitBackdropFilter: "blur(24px) saturate(1.6)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(0,0,0,0.03)",
              border: onDarkBg ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.6)",
              transition: "none",
            }}
          />

          {LINKS.map((link, i) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.label}
                ref={(el) => { linkRefs.current[i] = el; }}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="relative z-10 group flex items-center gap-2.5 px-6 py-2.5 rounded-[2rem] transition-colors duration-300"
              >
                {/* Number */}
                <motion.span
                  className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.15em]"
                  animate={{
                    color: isActive ? "#E05252" : onDarkBg ? "rgba(245,240,235,0.4)" : "rgba(26,26,26,0.3)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {link.num}
                </motion.span>

                {/* Label */}
                <motion.span
                  className="font-[family-name:var(--font-space)] text-[12px] font-medium uppercase tracking-[0.12em]"
                  animate={{
                    color: isActive ? (onDarkBg ? "#F5F0EB" : "#1A1A1A") : onDarkBg ? "rgba(245,240,235,0.6)" : "rgba(26,26,26,0.5)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {link.label}
                </motion.span>
              </a>
            );
          })}
        </div>
      </motion.nav>

      {/* ── Scroll indicator (top-right) ── */}
      {hasScrolled && (
        <motion.div
          className="fixed top-5 right-[var(--site-px)] z-50 hidden md:flex items-center gap-2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#1A1A1A]/30 tracking-widest uppercase">
            {activeSection || "top"}
          </span>
        </motion.div>
      )}

      {/* ── Hamburger (Mobile) ── */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-5 right-[var(--site-px)] z-[60] md:hidden flex flex-col items-center justify-center w-10 h-10 pointer-events-auto"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        <motion.span
          className="block w-6 h-[1.5px] bg-[#1A1A1A] origin-center"
          animate={{
            rotate: menuOpen ? 45 : 0,
            y: menuOpen ? 0 : -3,
            backgroundColor: menuOpen ? "#F5F2EE" : "#1A1A1A",
          }}
          transition={{ duration: 0.3, ease: EASE }}
        />
        <motion.span
          className="block w-6 h-[1.5px] bg-[#1A1A1A] origin-center"
          animate={{
            rotate: menuOpen ? -45 : 0,
            y: menuOpen ? 0 : 3,
            backgroundColor: menuOpen ? "#F5F2EE" : "#1A1A1A",
          }}
          transition={{ duration: 0.3, ease: EASE }}
        />
      </button>

      {/* ── Full-screen Mobile Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[55] bg-[#1A1A1A] flex flex-col items-start justify-center px-[var(--site-px)] md:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <motion.span
              className="font-[family-name:var(--font-space)] text-[10px] uppercase tracking-[0.4em] text-[#F5F2EE]/30 mb-12"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
            >
              Ethan Wu
            </motion.span>

            {LINKS.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="group flex items-baseline gap-4 mb-2"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: EASE }}
              >
                <span className="font-[family-name:var(--font-mono)] text-sm text-[#E05252] tracking-[0.2em]">
                  {link.num}
                </span>
                <span className="font-[family-name:var(--font-space)] text-[clamp(2rem,8vw,4rem)] font-light uppercase tracking-[0.15em] text-[#F5F2EE] transition-all duration-300 group-hover:tracking-[0.35em] group-hover:text-[#E05252]">
                  {link.label}
                </span>
              </motion.a>
            ))}

            <motion.div
              className="mt-12 w-12 h-[1px] bg-[#E05252]/40"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
              style={{ transformOrigin: "left" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
