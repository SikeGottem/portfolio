"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { Project } from "@/lib/projects";

/* ── Layout configs — clean staggered zigzag ── */
const layoutConfigs = [
  {
    align: "left" as const,
    marginLeft: "10%",
    marginRight: "auto",
    maxWidth: "60%",
    titleSize: "clamp(1.8rem,4vw,3.4rem)",
    ghostLeft: "0%",
    ghostTop: "-5%",
    ghostTranslateX: "-10%",
    paddingTop: "8rem",
    paddingBottom: "6rem",
    hoverRotate: 1.5,
  },
  {
    align: "right" as const,
    marginLeft: "auto",
    marginRight: "10%",
    maxWidth: "60%",
    titleSize: "clamp(1.6rem,3.5vw,3rem)",
    ghostLeft: "65%",
    ghostTop: "0%",
    ghostTranslateX: "-50%",
    paddingTop: "6rem",
    paddingBottom: "8rem",
    hoverRotate: -1,
  },
  {
    align: "left" as const,
    marginLeft: "10%",
    marginRight: "auto",
    maxWidth: "60%",
    titleSize: "clamp(1.6rem,3.5vw,3rem)",
    ghostLeft: "55%",
    ghostTop: "-5%",
    ghostTranslateX: "-50%",
    paddingTop: "8rem",
    paddingBottom: "6rem",
    hoverRotate: 2,
  },
  {
    align: "right" as const,
    marginLeft: "auto",
    marginRight: "10%",
    maxWidth: "60%",
    titleSize: "clamp(1.6rem,3.5vw,3rem)",
    ghostLeft: "5%",
    ghostTop: "0%",
    ghostTranslateX: "0%",
    paddingTop: "6rem",
    paddingBottom: "8rem",
    hoverRotate: -1.5,
  },
];

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
  const config = layoutConfigs[(index - 1) % layoutConfigs.length];
  const minimalTags = project.tags.slice(0, 2);

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
      {/* ── Separator line ── */}
      <div className="px-[var(--site-px)]">
        <div className="border-t border-black/[0.06]" />
      </div>

      <div className="px-[var(--site-px)]">
        <motion.div
          className="relative overflow-hidden"
          style={{
            marginLeft: config.marginLeft,
            marginRight: config.marginRight,
            maxWidth: config.maxWidth,
            paddingTop: config.paddingTop,
            paddingBottom: config.paddingBottom,
          }}
          whileHover={{ rotate: config.hoverRotate }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Ghost number — big but contained ── */}
          <span
            className="
              absolute pointer-events-none select-none
              font-[family-name:var(--font-display)] italic
              text-[10rem] md:text-[14rem] lg:text-[18rem] leading-none
              text-black/[0.025]
              transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover:text-[#E05252]/[0.06] group-hover:scale-110
            "
            style={{
              left: config.ghostLeft,
              top: config.ghostTop,
              transform: `translateX(${config.ghostTranslateX})`,
            }}
          >
            {num}
          </span>

          {/* ── Content ── */}
          <div className="relative z-10">
            {/* Number + Year row */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-black/15 tracking-[0.3em] uppercase transition-colors duration-600 group-hover:text-[#E05252]/40">
                {num}
              </span>
              <span className="w-6 h-px bg-black/10" />
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-black/15 tracking-[0.3em] uppercase transition-colors duration-600 group-hover:text-[#E05252]/40">
                {project.year}
              </span>
            </div>

            {/* Title */}
            <h3
              className="
                font-[family-name:var(--font-display)] italic
                leading-[0.95] tracking-[-0.01em]
                text-[#1A1A1A]
                transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                group-hover:translate-x-3 md:group-hover:translate-x-6
              "
              style={{ fontSize: config.titleSize }}
            >
              {project.name}
            </h3>

            {/* Tags */}
            <div className="mt-6 flex items-center gap-4">
              {minimalTags.map((tag) => (
                <span
                  key={tag}
                  className="
                    font-[family-name:var(--font-mono)] text-[9px]
                    uppercase tracking-[0.25em] text-black/20
                    transition-colors duration-600
                    group-hover:text-black/40
                  "
                >
                  {tag}
                </span>
              ))}
              <span
                className="
                  hidden md:inline-flex items-center justify-center flex-shrink-0
                  w-7 h-7 rounded-full border border-black/[0.06]
                  text-black/20 text-[10px] ml-auto
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
        </motion.div>
      </div>

      {/* ── Hover preview image — follows cursor ── */}
      {project.previewImage && (
        <motion.div
          className="
            hidden pointer-fine:block
            absolute top-0 left-0 z-50 pointer-events-none
            w-[520px] h-[360px] rounded-xl overflow-hidden
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
            sizes="520px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </motion.div>
      )}
    </Link>
  );
}
