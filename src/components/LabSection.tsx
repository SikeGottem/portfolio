"use client";

import { experiments } from "@/lib/projects";
import WorkItem from "./WorkItem";
import RevealOnScroll from "./RevealOnScroll";

export default function LabSection() {
  return (
    <section className="relative px-6 md:px-12 lg:px-16 pt-32 md:pt-44 lg:pt-56 pb-20 md:pb-28">
      <RevealOnScroll>
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[#bbb] mb-2">
          Lab
        </p>
        <p className="font-[family-name:var(--font-inter)] text-sm text-[#aaa] mb-12">
          Self-initiated experiments — apps, platforms, and ideas I&apos;ve built from scratch.
        </p>
      </RevealOnScroll>

      <div className="border-t border-black/10 mb-12" />

      <div className="relative">
        {experiments.map((project, index) => (
          <RevealOnScroll key={project.slug} delay={index * 0.1}>
            <WorkItem project={project} index={index + 1} />
          </RevealOnScroll>
        ))}
        <div className="border-t border-dashed border-black/10" />
      </div>
    </section>
  );
}
