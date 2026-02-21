"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface RevealOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
}

export default function RevealOnScroll({
  children,
  delay = 0,
  direction = "up",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const initial = {
    opacity: 0,
    ...(direction === "up" && { y: 30 }),
    ...(direction === "left" && { x: -30 }),
    ...(direction === "right" && { x: 30 }),
  };

  const animate = {
    opacity: isInView ? 1 : 0,
    y: isInView ? 0 : direction === "up" ? 30 : 0,
    x: isInView ? 0 : direction === "left" ? -30 : direction === "right" ? 30 : 0,
  };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
