"use client";

import { projects } from "@/lib/projects";
import WorkItem from "./WorkItem";
import RevealOnScroll from "./RevealOnScroll";
import SectionHeader from "./SectionHeader";

export default function WorkSection() {
  return (
    <section
      id="work"
      className="relative pt-40 md:pt-56 lg:pt-72 pb-28 md:pb-40"
    >
      <SectionHeader
        title="Work"
        label="Selected Work"
        count={projects.length}
        countLabel="Projects"
      />

      {/* Project list */}
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
