"use client";

import { projects } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectsSection() {
  return (
    <section className="px-6 md:px-12 py-24">
      <p
        className="text-xs uppercase tracking-widest text-[#555] mb-12"
        style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
      >
        Selected Work
      </p>

      <div className="flex flex-col gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
