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
      {/* ── Section header ── */}
      <div className="px-[var(--site-px)] mb-20 md:mb-32">
        <RevealOnScroll>
          <div className="flex items-end justify-between">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.35em] text-[#bbb] mb-4">
                ( Selected Work )
              </p>
              <h2 className="font-[family-name:var(--font-display)] italic text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-[-0.03em] text-[#1A1A1A]">
                Work
              </h2>
            </div>
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[#bbb] pb-2">
              {projects.length} Projects
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.05}>
          <div className="border-t border-black/10 mt-8" />
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
