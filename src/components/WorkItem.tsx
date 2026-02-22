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

  /* Pick first 2 tags max, truncate to short form */
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
        <div className="border-t border-black/[0.08]" />
      </div>

      <div className="px-[var(--site-px)]">
        <div className="py-56 md:py-72 lg:py-80 relative overflow-hidden">
          {/* ── Ghost number — massive, creative position ── */}
          <span
            className="
              absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2
              font-[family-name:var(--font-display)] italic
              text-[14rem] md:text-[20rem] lg:text-[26rem] leading-none
              text-black/[0.025] select-none pointer-events-none
              transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover:text-[#E05252]/[0.06] group-hover:scale-105
            "
          >
            {num}
          </span>

          {/* Ghost preview removed — clashed with ghost numbers */}

          {/* ── Content stack ── */}
          <div className="relative z-10">
            {/* Year — whisper-quiet */}
            <span
              className="
                font-[family-name:var(--font-mono)] text-[10px] text-black/20
                tracking-[0.3em] uppercase
                block mb-10
                transition-colors duration-600
                group-hover:text-[#E05252]/40
              "
            >
              {project.year}
            </span>

            {/* Title — THE hero, massive and breathing */}
            <h3
              className="
                font-[family-name:var(--font-display)] italic
                text-[clamp(1.4rem,3vw,2.8rem)] leading-[0.95] tracking-[-0.01em]
                text-[#1A1A1A]
                transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                group-hover:translate-x-3 md:group-hover:translate-x-8
              "
            >
              {project.name}
            </h3>

            {/* Tags — minimal whisper, well below title */}
            <div className="mt-10 flex items-center gap-4">
              {minimalTags.map((tag) => (
                <span
                  key={tag}
                  className="
                    font-[family-name:var(--font-mono)] text-[9px]
                    uppercase tracking-[0.25em] text-black/20
                    transition-colors duration-600
                    group-hover:text-black/35
                  "
                >
                  {tag}
                </span>
              ))}

              {/* Arrow — inline, subtle */}
              <span
                className="
                  hidden md:inline-flex items-center justify-center flex-shrink-0
                  w-8 h-8 rounded-full border border-black/[0.06]
                  text-black/20 text-xs ml-auto
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
        </div>
      </div>

      {/* ── Hover preview image — follows cursor, LARGER ── */}
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
