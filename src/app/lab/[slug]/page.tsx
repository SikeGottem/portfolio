import { notFound } from "next/navigation";
import Link from "next/link";
import { experiments } from "@/lib/projects";

export function generateStaticParams() {
  return experiments.map((p) => ({ slug: p.slug }));
}

export default async function LabPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idx = experiments.findIndex((p) => p.slug === slug);
  if (idx === -1) notFound();

  const project = experiments[idx];
  const next = experiments[(idx + 1) % experiments.length];

  return (
    <main className="min-h-screen px-6 md:px-10 py-16 md:py-24">
      <Link
        href="/#lab"
        className="font-[family-name:var(--font-space)] text-sm uppercase tracking-[0.2em] text-[#999] hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-2 mb-16"
      >
        ← Back
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#999] border border-[#999]/30 rounded px-2 py-1">
            LAB
          </span>
        </div>
        
        <h1 className="font-[family-name:var(--font-display)] italic text-5xl md:text-7xl lg:text-8xl text-[#1A1A1A] mb-8">
          {project.name}
        </h1>

        <div className="flex flex-wrap gap-4 items-center mb-16">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.15em] text-[#999]"
            >
              {tag}
            </span>
          ))}
          <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#bbb]">
            {project.year}
          </span>
        </div>

        <section className="mb-16">
          <h2 className="font-[family-name:var(--font-space)] text-xs uppercase tracking-[0.25em] text-[#999] mb-4">
            The Brief
          </h2>
          <p className="font-[family-name:var(--font-inter)] text-[15px] leading-[1.8] text-[#333]">
            {project.brief}
          </p>
        </section>

        <section className="mb-16">
          <h2 className="font-[family-name:var(--font-space)] text-xs uppercase tracking-[0.25em] text-[#999] mb-4">
            The Approach
          </h2>
          <p className="font-[family-name:var(--font-inter)] text-[15px] leading-[1.8] text-[#333]">
            {project.approach}
          </p>
        </section>

        {/* Image placeholders */}
        <div className="space-y-8 mb-16">
          <div className="w-full aspect-video bg-[#EBE8E4] rounded-sm" />
          <div className="w-full aspect-video bg-[#EBE8E4] rounded-sm" />
        </div>

        <Link
          href={`/lab/${next.slug}`}
          className="font-[family-name:var(--font-space)] text-sm uppercase tracking-[0.2em] text-[#999] hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-2"
        >
          Next Project — {next.name} →
        </Link>
      </div>
    </main>
  );
}