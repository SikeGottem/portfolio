"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const gradients = [
  "from-accent/20 to-purple-900/20",
  "from-blue-900/20 to-accent/20",
  "from-emerald-900/20 to-accent/20",
];

export default function Hero({ spaceGrotesk }: { spaceGrotesk: string }) {
  const [bgIndex, setBgIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((i) => (i + 1) % gradients.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Typing effect
  const text = "Currently building Briefed";
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 1500);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Crossfading background gradients */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={bgIndex}
          className={`absolute inset-0 bg-gradient-to-br ${gradients[bgIndex]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
        />
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 text-center">
        <motion.h1
          className={`${spaceGrotesk} text-7xl md:text-9xl font-bold tracking-tighter text-foreground`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          ETHAN WU
        </motion.h1>

        <motion.p
          className="text-muted text-lg md:text-xl mt-4 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Design & Code
        </motion.p>

        <motion.p
          className="text-foreground/70 text-sm md:text-base mt-6 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {displayed}
          {showCursor && <span className="animate-blink ml-0.5">|</span>}
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 animate-bounce-slow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
          <path d="M7 10l5 5 5-5" />
        </svg>
      </motion.div>
    </section>
  );
}
