"use client";

import { experiments } from "@/lib/projects";
import WorkItem from "./WorkItem";
import RevealOnScroll from "./RevealOnScroll";
import SectionHeader from "./SectionHeader";

export default function LabSection() {
  return (
    <section className="relative px-[var(--site-px)] pt-32 md:pt-44 lg:pt-56 pb-20 md:pb-28">
      <SectionHeader
        title="Lab"
        label="Experiments"
        count={experiments.length}
        countLabel="Experiments"
      />

      <div className="relative">
        {experiments.map((project, index) => (
          <RevealOnScroll key={project.slug} delay={index * 0.1}>
            <WorkItem project={project} index={index + 1} basePath="/lab" />
          </RevealOnScroll>
        ))}
        <div className="border-t border-dashed border-black/10" />
      </div>
    </section>
  );
}
