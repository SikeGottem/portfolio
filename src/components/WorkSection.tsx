"use client";

import { projects } from "@/lib/projects";
import WorkItem from "./WorkItem";
import RevealOnScroll from "./RevealOnScroll";

export default function WorkSection() {
  return (
    <section
      id="work"
      className="relative pt-40 md:pt-56 lg:pt-72 pb-28 md:pb-40"
    >
      {/* ── Section header — magazine-style divider ── */}
      <div className="px-[var(--site-px)] mb-24 md:mb-36">
        <RevealOnScroll>
          <div className="relative">
            {/* Ghost decorative label */}
            <span className="absolute -top-8 md:-top-12 left-0 font-[family-name:var(--font-display)] italic text-[6rem] md:text-[10rem] lg:text-[14rem] leading-none text-black/[0.02] select-none pointer-events-none">
              Work
            </span>

            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.4em] text-black/25 mb-5">
                  ( Selected Work )
                </p>
                <h2 className="font-[family-name:var(--font-display)] italic text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] tracking-[-0.04em] text-[#1A1A1A]">
                  Work
                </h2>
              </div>
              <div className="flex flex-col items-end gap-2 pb-3">
                <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em] text-black/20">
                  {projects.length} Projects
                </span>
                <span className="w-12 h-px bg-[#E05252]/30" />
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.05}>
          <div className="border-t border-black/10 mt-10" />
        </RevealOnScroll>
      </div>

      {/* ── Project list ── */}
      <div className="relative">
        {projects.map((project, index) => (
          <RevealOnScroll key={project.slug} delay={index * 0.1}>
            <WorkItem project={project} index={index + 1} />
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
