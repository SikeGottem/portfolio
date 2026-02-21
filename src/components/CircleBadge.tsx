"use client";

import { motion } from "framer-motion";

export default function CircleBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -10 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-[120px] h-[120px] rounded-full border border-black/10 flex flex-col items-center justify-center gap-0.5"
    >
      <span className="font-[family-name:var(--font-space)] text-[8px] uppercase tracking-[0.2em] text-[#1A1A1A]">
        Ethan Wu
      </span>
      <span className="font-[family-name:var(--font-mono)] text-[7px] uppercase tracking-[0.15em] text-[#999] mt-1.5">
        Est. 2025
      </span>
    </motion.div>
  );
}
