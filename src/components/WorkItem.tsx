"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { Project } from "@/lib/projects";

export default function WorkItem({
  project,
  index,
  basePath = "/work",
}: {
  project: Project;
  index: number;
  basePath?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLAnchorElement>(null);

  /* ── Mouse-follow image position ── */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 150, damping: 25 });
  const y = useSpring(rawY, { stiffness: 150, damping: 25 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      rawX.set(e.clientX - rect.left);
      rawY.set(e.clientY - rect.top);
    },
    [rawX, rawY]
  );

  const num = index.toString().padStart(2, "0");

  return (
    <Link
      ref={containerRef}
      href={`${basePath}/${project.slug}`}
      className="block group relative"
      data-cursor="view"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="px-[var(--site-px)]">
        <div className="border-b border-black/[0.06] py-16 md:py-28 lg:py-36 relative overflow-hidden">
          {/* ── Ghost number — large background element ── */}
          <span
            className="
              absolute -right-4 md:right-8 top-1/2 -translate-y-1/2
              font-[family-name:var(--font-display)] italic
              text-[6rem] md:text-[8rem] lg:text-[10rem] leading-none
              text-black/[0.03] select-none pointer-events-none
              transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover:text-[#E05252]/[0.06] group-hover:scale-110
            "
          >
            {num}
          </span>

          {/* ── Main row ── */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0 relative z-10">
            {/* Number */}
            <span
              className="
                font-[family-name:var(--font-mono)] text-[11px] text-[#ccc]
                md:w-20 flex-shrink-0
                transition-all duration-600
                group-hover:text-[#E05252]
              "
            >
              {num}
            </span>

            {/* Title — dominant element */}
            <h3
              className="
                font-[family-name:var(--font-display)] italic
                text-[clamp(1.8rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.02em]
                text-[#1A1A1A]
                transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                group-hover:translate-x-3 md:group-hover:translate-x-8
                group-hover:text-[#1A1A1A]
                flex-1
              "
            >
              {project.name}
            </h3>

            {/* Right side — meta */}
            <div
              className="
                flex items-center gap-6 md:ml-auto
                transition-all duration-600
                opacity-50 group-hover:opacity-100
                group-hover:-translate-x-2
              "
            >
              {/* Tags */}
              <div className="flex gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="
                      font-[family-name:var(--font-mono)] text-[9px]
                      uppercase tracking-[0.2em] text-[#999]
                      border border-black/[0.06] rounded-full px-3 py-1.5
                      transition-all duration-500
                      group-hover:border-[#E05252]/20 group-hover:text-[#666]
                    "
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Year */}
              <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#bbb] tabular-nums">
                {project.year}
              </span>

              {/* Arrow */}
              <span
                className="
                  hidden md:inline-flex items-center justify-center
                  w-10 h-10 rounded-full border border-black/[0.08]
                  text-[#ccc] text-sm
                  transition-all duration-600
                  group-hover:border-[#E05252] group-hover:text-white
                  group-hover:bg-[#E05252] group-hover:scale-110
                  group-hover:rotate-45
                "
              >
                ↗
              </span>
            </div>
          </div>

          {/* ── Description — reveals on hover (desktop) / always visible (mobile) ── */}
          <div className="md:pl-20 mt-4 md:mt-0 overflow-hidden relative z-10">
            <p
              className="
                font-[family-name:var(--font-inter)] text-[13px] leading-[1.7] text-[#999] max-w-lg
                md:max-h-0 md:opacity-0 md:translate-y-4
                md:transition-all md:duration-600 md:ease-[cubic-bezier(0.22,1,0.36,1)]
                md:group-hover:max-h-24 md:group-hover:opacity-100 md:group-hover:translate-y-0
                md:group-hover:mt-5
              "
            >
              {project.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── Hover preview image — follows cursor, desktop only ── */}
      {project.previewImage && (
        <motion.div
          className="
            hidden pointer-fine:block
            absolute top-0 left-0 z-50 pointer-events-none
            w-[420px] h-[280px] rounded-xl overflow-hidden
            shadow-2xl shadow-black/10
          "
          style={{
            x,
            y,
            translateX: "-50%",
            translateY: "-120%",
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.85,
            rotate: isHovered ? -3 : -6,
          }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Image
            src={project.previewImage}
            alt={project.name}
            fill
            className="object-cover"
            sizes="420px"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </motion.div>
      )}
    </Link>
  );
}
