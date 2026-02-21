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

  useEffect(() => {
    const ids = ["hero", "work", "about", "contact"];
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;
      let current = "hero";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) current = id;
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
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      {/* ── Wordmark (top-left, always) ── */}
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
          className="flex items-center gap-1 px-2 py-2 rounded-full border border-[#1A1A1A]/[0.06]"
          style={{
            background: "rgba(245, 242, 238, 0.7)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
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
                className="relative group flex items-center gap-2 px-4 py-2.5 rounded-full transition-colors duration-300"
              >
                {/* Active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 rounded-full bg-[#1A1A1A]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Number */}
                <motion.span
                  className="relative z-10 font-[family-name:var(--font-mono)] text-[10px] tracking-[0.15em] transition-colors duration-300"
                  animate={{
                    color: isActive ? "#E05252" : "rgba(26,26,26,0.3)",
                  }}
                >
                  {link.num}
                </motion.span>

                {/* Label */}
                <motion.span
                  className="relative z-10 font-[family-name:var(--font-space)] text-[12px] font-medium uppercase tracking-[0.1em] transition-colors duration-300"
                  animate={{
                    color: isActive ? "#F5F2EE" : "#1A1A1A",
                  }}
                  style={{
                    opacity: 1,
                  }}
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
