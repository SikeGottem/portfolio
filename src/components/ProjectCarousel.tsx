"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { projects, experiments } from "@/lib/projects";

const colorMap: Record<string, string> = {
  bristlecone: "rgba(26, 58, 42, 1)",
  "sun-street-hk": "rgba(1, 30, 65, 1)",
  "s17-skincare": "rgba(42, 26, 26, 1)",
  limage: "rgba(26, 26, 42, 1)",
  briefed: "rgba(224, 82, 82, 0.2)",
  campfire: "rgba(58, 42, 26, 1)",
  lore: "rgba(26, 42, 58, 1)",
  "agent-comms": "rgba(42, 42, 26, 1)",
};

const allProjects = [...projects, ...experiments];

export default function ProjectCarousel() {
  const [isDragging, setIsDragging] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const constraintRef = useRef<HTMLDivElement>(null);

  const cardW = 300;
  const gap = 24;
  const totalWidth = allProjects.length * (cardW + gap);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const handleDragEnd = useCallback(() => {
    resumeTimer.current = setTimeout(() => setIsDragging(false), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const items = [...allProjects, ...allProjects];

  return (
    <section className="pt-32 md:pt-44 lg:pt-56 pb-20 md:pb-28 overflow-hidden">
      <div className="px-6 md:px-12 lg:px-16 mb-16 md:mb-24">
        <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[#bbb]">
          Showcase
        </span>
      </div>

      <div ref={constraintRef} className="overflow-hidden cursor-grab active:cursor-grabbing">
        <motion.div
          drag="x"
          dragConstraints={{ left: -totalWidth, right: 0 }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="flex"
          style={{
            gap,
            animation: isDragging ? "none" : "carousel-scroll 40s linear infinite",
          }}
        >
          {items.map((project, i) => (
            <motion.div
              key={`${project.slug}-${i}`}
              className="flex-shrink-0 relative rounded-lg overflow-hidden group"
              style={{
                width: cardW,
                height: 400,
                backgroundColor: colorMap[project.slug] || "rgba(30,30,30,1)",
              }}
              whileHover={{ scale: 1.03, boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
              transition={{ duration: 0.25 }}
            >
              <div className="absolute top-3 right-3">
                <span className="font-mono text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded">
                  {project.tags[0]}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="font-['Instrument_Serif'] italic text-white text-2xl">
                  {project.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes carousel-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${totalWidth}px);
          }
        }
      `}</style>
    </section>
  );
}
