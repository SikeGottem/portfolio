"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue } from "framer-motion";
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    x.set(e.clientX - rect.left + 20);
    y.set(e.clientY - rect.top + 20);
  }

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
      <div className="border-t border-dashed border-black/10 py-8 md:py-10 flex flex-col md:flex-row md:items-baseline gap-6 md:gap-8">
        {/* Project number and name */}
        <div className="flex items-baseline gap-4 md:gap-6">
          <span className="font-[family-name:var(--font-mono)] text-[13px] text-[#999] transition-all duration-300 group-hover:text-[#E05252] flex-shrink-0">
            {index.toString().padStart(2, "0")}
          </span>
          <h3 className="font-[family-name:var(--font-display)] italic text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] transition-all duration-300">
            {project.name}
          </h3>
        </div>

        <div className="flex-1 flex flex-col md:flex-row md:items-baseline gap-4 md:gap-6 md:ml-8">
          <p className="font-[family-name:var(--font-inter)] text-sm text-[#999] flex-1 transition-all duration-300 group-hover:text-[#666]">
            {project.description}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em] text-[#999] border border-black/10 rounded-full px-3 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#bbb]">
              {project.year}
            </span>
          </div>
        </div>
      </div>

      {/* Hover preview image — desktop only (pointer: fine) */}
      {project.previewImage && (
        <motion.div
          className="hidden pointer-fine:block absolute top-0 left-0 z-50 pointer-events-none w-[300px] h-[200px] rounded-lg overflow-hidden shadow-lg"
          style={{
            x,
            y,
            rotate: 2.5,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Image
            src={project.previewImage}
            alt={project.name}
            fill
            className="object-cover"
            sizes="300px"
          />
        </motion.div>
      )}
    </Link>
  );
}
