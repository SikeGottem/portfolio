"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProject, getNextProject } from "@/lib/projects";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.3 },
};

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = getProject(slug);
  const next = project ? getNextProject(slug) : undefined;

  if (!project) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-[#E8E8E8] flex items-center justify-center">
        <p>Project not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#E8E8E8]">
      {/* Back link */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="text-sm text-[#555] hover:text-[#E8E8E8] transition-colors"
          style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
        >
          ← Back
        </Link>
      </div>

      {/* Full-bleed hero */}
      <div
        className="w-full h-[70vh] relative"
        style={{ backgroundColor: project.color }}
      />

      {/* Project info */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div {...fadeIn}>
          {/* Tags */}
          <div className="flex gap-3 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs tracking-wider text-[#555]"
                style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
              >
                {tag}
              </span>
            ))}
            <span
              className="text-xs tracking-wider text-[#555]"
              style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
            >
              {project.year}
            </span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)" }}
          >
            {project.name}
          </h1>

          <p className="text-xl text-[#E8E8E8]/60 mb-16">
            {project.description}
          </p>
        </motion.div>

        {/* The Brief */}
        <motion.div {...fadeIn} className="mb-16">
          <h2
            className="text-xs uppercase tracking-widest text-[#555] mb-4"
            style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
          >
            The Brief
          </h2>
          <p className="text-lg leading-relaxed text-[#E8E8E8]/80">
            Brief content coming soon. This section will describe the client&apos;s
            challenge and the goals for the project.
          </p>
        </motion.div>

        {/* The Approach */}
        <motion.div {...fadeIn} className="mb-16">
          <h2
            className="text-xs uppercase tracking-widest text-[#555] mb-4"
            style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
          >
            The Approach
          </h2>
          <p className="text-lg leading-relaxed text-[#E8E8E8]/80">
            Approach content coming soon. This section will outline the strategy,
            process, and key decisions made during the project.
          </p>
        </motion.div>
      </div>

      {/* Full-width image placeholders */}
      <motion.div {...fadeIn} className="px-6 md:px-12 mb-16">
        <div className="w-full h-[50vh] rounded-lg" style={{ backgroundColor: project.color }} />
      </motion.div>

      <motion.div {...fadeIn} className="px-6 md:px-12 mb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[40vh] rounded-lg" style={{ backgroundColor: project.color }} />
        <div className="h-[40vh] rounded-lg bg-[#1E1E1E]" />
      </motion.div>

      {/* Next project */}
      {next && (
        <Link href={`/work/${next.slug}`}>
          <div className="border-t border-[#1E1E1E] px-6 md:px-12 py-16 hover:bg-[#1E1E1E]/30 transition-colors">
            <p
              className="text-xs uppercase tracking-widest text-[#555] mb-2"
              style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
            >
              Next Project
            </p>
            <p
              className="text-3xl md:text-5xl font-bold"
              style={{ fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)" }}
            >
              {next.name} →
            </p>
          </div>
        </Link>
      )}
    </main>
  );
}
