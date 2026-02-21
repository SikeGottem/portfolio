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
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  // Track scroll direction for wordmark show/hide
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
    lastScrollY.current = latest;
  });

  // Scroll-based active section tracking
  useEffect(() => {
    const ids = ["hero", "work", "about", "contact"];

    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;

      // Find the section whose top is closest to (but before) scrollPos
      let current = "hero";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback((href: string) => {
    setMenuOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const activeIndex = LINKS.findIndex((l) => l.href === `#${activeSection}`);

  return (
    <>
      {/* ── Wordmark ── */}
      <motion.div
        className="fixed top-0 left-0 z-50 px-[var(--site-px)] py-5 pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: wordmarkVisible ? 1 : 0,
          y: wordmarkVisible ? 0 : -20,
        }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <MagneticButton
          href="/"
          className="font-[family-name:var(--font-space)] text-sm font-medium uppercase tracking-[0.25em] text-[#1A1A1A] pointer-events-auto"
        >
          Ethan Wu
        </MagneticButton>
      </motion.div>

      {/* ── Top Navigation (Desktop) ── */}
      <nav
        className="fixed top-0 right-0 z-50 hidden md:flex items-center gap-10 px-[var(--site-px)] py-6 pointer-events-none"
        aria-label="Section navigation"
      >
        {LINKS.map((link) => {
          const isActive = activeSection === link.href.replace("#", "");
          return (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className="group pointer-events-auto flex items-center gap-3 relative"
            >
              {/* Number */}
              <motion.span
                className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.2em] transition-colors duration-300"
                animate={{ color: isActive ? "#E05252" : "rgba(26,26,26,0.35)" }}
              >
                {link.num}
              </motion.span>

              {/* Label */}
              <motion.span
                className="font-[family-name:var(--font-space)] text-[14px] font-medium uppercase"
                initial={false}
                animate={{
                  letterSpacing: isActive ? "0.25em" : "0.12em",
                  color: isActive ? "#E05252" : "#1A1A1A",
                }}
                whileHover={{ letterSpacing: "0.25em", color: "#E05252" }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {link.label}
              </motion.span>

              {/* Active underline */}
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#E05252] origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isActive ? 1 : 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            </a>
          );
        })}
      </nav>

      {/* ── Scroll progress tick (top-right, subtle) ── */}
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
            {/* Wordmark in menu */}
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

            {/* Decorative line */}
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
