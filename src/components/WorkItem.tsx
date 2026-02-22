"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Project } from "@/lib/projects";

const layoutConfigs = [
  { align: "left" as const, marginLeft: "10%", marginRight: "auto", maxWidth: "60%", titleSize: "clamp(1.8rem,4vw,3.4rem)", paddingTop: "8rem", paddingBottom: "6rem", hoverRotate: 1.5, imageRight: "6%", imageLeft: "auto", imageRotate: 3 },
  { align: "right" as const, marginLeft: "auto", marginRight: "10%", maxWidth: "60%", titleSize: "clamp(1.6rem,3.5vw,3rem)", paddingTop: "6rem", paddingBottom: "8rem", hoverRotate: -1, imageRight: "auto", imageLeft: "6%", imageRotate: -2 },
  { align: "left" as const, marginLeft: "10%", marginRight: "auto", maxWidth: "60%", titleSize: "clamp(1.6rem,3.5vw,3rem)", paddingTop: "8rem", paddingBottom: "6rem", hoverRotate: 2, imageRight: "8%", imageLeft: "auto", imageRotate: -3 },
  { align: "right" as const, marginLeft: "auto", marginRight: "10%", maxWidth: "60%", titleSize: "clamp(1.6rem,3.5vw,3rem)", paddingTop: "6rem", paddingBottom: "8rem", hoverRotate: -1.5, imageRight: "auto", imageLeft: "8%", imageRotate: 2 },
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

  const num = index.toString().padStart(2, "0");
  const config = layoutConfigs[(index - 1) % layoutConfigs.length];
  const minimalTags = project.tags.slice(0, 2);

  const accent = project.accentColor || "#1A1A1A";
  const light = project.accentTextLight !== false;
  const textPrimary = light ? "#F5F2EE" : "#1A1A1A";
  const textSecondary = light ? "rgba(245,242,238,0.5)" : "rgba(26,26,26,0.4)";
  const textMuted = light ? "rgba(245,242,238,0.3)" : "rgba(26,26,26,0.2)";
  const ghostColor = light ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const lineColor = light ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

  return (
    <Link
      href={`${basePath}/${project.slug}`}
      className="block group relative"
      data-cursor="view"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Separator line */}
      <div className="px-[var(--site-px)]">
        <div
          className="border-t transition-colors duration-500"
          style={{ borderColor: isHovered ? lineColor : "rgba(0,0,0,0.06)" }}
        />
      </div>

      {/* Accent flood — full width, behind everything */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: accent }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="px-[var(--site-px)] relative">

        {/* Floating image card */}
        {project.previewImage && (
          <motion.div
            className="hidden lg:block absolute top-1/2 z-30 w-[320px] rounded-lg shadow-2xl pointer-events-none"
            style={{
              right: config.imageRight,
              left: config.imageLeft,
              rotate: config.imageRotate,
              translateY: "-50%",
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.85,
              y: isHovered ? "-50%" : "-40%",
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={project.previewImage}
              alt={project.name}
              width={1440}
              height={900}
              className="w-full h-auto rounded-lg"
              sizes="320px"
            />
          </motion.div>
        )}

        <motion.div
          className="relative z-10"
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
          {/* Ghost number */}
          <span
            className="absolute pointer-events-none select-none font-[family-name:var(--font-display)] italic text-[10rem] md:text-[14rem] lg:text-[18rem] leading-none transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              left: "0%",
              top: "-5%",
              transform: "translateX(-10%)",
              color: isHovered ? ghostColor : "rgba(0,0,0,0.025)",
            }}
          >
            {num}
          </span>

          {/* Content */}
          <div className="relative z-10">
            {/* Number + Year row */}
            <div className="flex items-center gap-4 mb-6">
              <span
                className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase transition-colors duration-600"
                style={{ color: isHovered ? textMuted : "rgba(0,0,0,0.15)" }}
              >
                {num}
              </span>
              <span
                className="w-6 h-px transition-colors duration-500"
                style={{ backgroundColor: isHovered ? lineColor : "rgba(0,0,0,0.1)" }}
              />
              <span
                className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase transition-colors duration-600"
                style={{ color: isHovered ? textMuted : "rgba(0,0,0,0.15)" }}
              >
                {project.year}
              </span>
            </div>

            {/* Title */}
            <h3
              className="font-[family-name:var(--font-display)] italic leading-[0.95] tracking-[-0.01em] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                fontSize: config.titleSize,
                color: isHovered ? textPrimary : "#1A1A1A",
                transform: isHovered ? "translateX(1.5rem)" : "translateX(0)",
              }}
            >
              {project.name}
            </h3>

            {/* Tags */}
            <div className="mt-6 flex items-center gap-4">
              {minimalTags.map((tag) => (
                <span
                  key={tag}
                  className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.25em] transition-colors duration-600"
                  style={{ color: isHovered ? textSecondary : "rgba(0,0,0,0.2)" }}
                >
                  {tag}
                </span>
              ))}
              <span
                className="hidden md:inline-flex items-center justify-center flex-shrink-0 w-7 h-7 rounded-full border text-[10px] ml-auto transition-all duration-600"
                style={{
                  borderColor: isHovered ? textSecondary : "rgba(0,0,0,0.06)",
                  color: isHovered ? textPrimary : "rgba(0,0,0,0.2)",
                  backgroundColor: isHovered ? "transparent" : "transparent",
                  transform: isHovered ? "scale(1.1) rotate(45deg)" : "scale(1) rotate(0deg)",
                }}
              >
                ↗
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </Link>
  );
}
