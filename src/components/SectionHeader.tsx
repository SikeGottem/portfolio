"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function SectionHeader({
  title,
  label,
  count,
  countLabel,
}: {
  title: string;
  label: string;
  count: number;
  countLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="px-[var(--site-px)] mb-24 md:mb-36">
      <div className="relative">
        {/* Big letter-by-letter title */}
        <div className="relative">
          <h2 className="font-[family-name:var(--font-display)] italic text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] tracking-[-0.04em]">
            {title.split("").map((char, i) => (
              <motion.span
                key={i}
                className={`sh-letter inline-block ${inView ? "filled" : ""}`}
                initial={{ y: 80, opacity: 0 }}
                animate={inView ? { y: 0, opacity: 1 } : {}}
                transition={{
                  duration: 0.8,
                  delay: i * 0.06,
                  ease: EASE,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </h2>
        </div>

        {/* Meta row */}
        <div className="relative z-10 flex items-end justify-between mt-5">
          {/* Mono label — slides from left */}
          <motion.p
            className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.4em] text-black/25"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          >
            ( {label} )
          </motion.p>

          {/* Count + red accent */}
          <motion.div
            className="flex flex-col items-end gap-2 pb-1"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
          >
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em] text-black/20">
              {count} {countLabel}
            </span>
            <span className="w-12 h-px bg-[#E05252]/30" />
          </motion.div>
        </div>
      </div>

      {/* Horizontal rule draws across */}
      <motion.div
        className="border-t border-black/10 mt-10 origin-left"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: 0.5, ease: EASE }}
      />
    </div>
  );
}
