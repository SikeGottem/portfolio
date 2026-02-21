"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Project } from "@/lib/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/work/${project.slug}`}>
        <div className="group relative w-full h-[60vh] rounded-lg overflow-hidden bg-[#1E1E1E] cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
          {/* Colored hero placeholder */}
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 group-hover:translate-x-1"
            style={{ backgroundColor: project.color }}
          />

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                {/* Tags */}
                <div className="flex gap-3 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs tracking-wider text-[#E8E8E8]/70"
                      style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3
                  className="text-4xl md:text-6xl font-bold text-[#E8E8E8] mb-2"
                  style={{ fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)" }}
                >
                  {project.name}
                </h3>

                {/* Description */}
                <p className="text-[#E8E8E8]/60 text-base md:text-lg max-w-xl">
                  {project.description}
                </p>
              </div>

              {/* Year */}
              <span
                className="text-sm text-[#555] shrink-0"
                style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
              >
                {project.year}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
