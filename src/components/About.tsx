"use client";

import { useRef, useState, MouseEvent } from "react";
import { motion } from "framer-motion";
import RevealOnScroll from "./RevealOnScroll";
import TextReveal from "./TextReveal";

/* ─── Data ─── */

const services = [
  { title: "Brand Identity", desc: "Logos, type systems, brand books — the full kit." },
  { title: "Web Design & Dev", desc: "Next.js sites that look sharp and ship fast." },
  { title: "Pitch Decks", desc: "Investor-ready decks that actually get read." },
  { title: "UI/UX Design", desc: "Interfaces people don't have to think about." },
  { title: "Creative Direction", desc: "Big-picture thinking across every touchpoint." },
  { title: "3D & Motion", desc: "Renders, animations, and visual storytelling." },
];

const tools: { name: string; tier: 1 | 2 | 3 }[] = [
  { name: "Figma", tier: 1 },
  { name: "Next.js", tier: 1 },
  { name: "React", tier: 2 },
  { name: "TypeScript", tier: 2 },
  { name: "Tailwind", tier: 2 },
  { name: "Blender", tier: 1 },
  { name: "After Effects", tier: 2 },
  { name: "Cinema 4D", tier: 3 },
  { name: "Framer Motion", tier: 3 },
  { name: "Adobe Suite", tier: 2 },
  { name: "Illustrator", tier: 3 },
  { name: "Photoshop", tier: 3 },
];

const tierSize: Record<1 | 2 | 3, string> = {
  1: "text-[1.8rem] md:text-[2.6rem]",
  2: "text-[1.1rem] md:text-[1.5rem]",
  3: "text-[0.8rem] md:text-[1rem]",
};

/* ─── Tilt Card ─── */

function TiltCard({ title, desc, index }: { title: string; desc: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`);
  }

  function handleLeave() {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg)");
  }

  return (
    <RevealOnScroll delay={index * 0.08}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ transform, transition: "transform 0.35s ease" }}
        className="group relative border border-black/[0.06] p-8 md:p-10 cursor-default"
      >
        <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#bbb] block mb-4">
          0{index + 1}
        </span>
        <h3 className="font-[family-name:var(--font-space)] text-[1.1rem] md:text-[1.25rem] text-[#1A1A1A] mb-3 relative inline-block">
          {title}
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#E05252] transition-all duration-500 group-hover:w-full" />
        </h3>
        <p className="font-[family-name:var(--font-inter)] text-[14px] leading-[1.7] text-[#999]">
          {desc}
        </p>
      </motion.div>
    </RevealOnScroll>
  );
}

/* ─── Section Label ─── */

function SectionLabel({ label, number }: { label: string; number: string }) {
  return (
    <RevealOnScroll>
      <div className="relative mb-16 md:mb-24">
        {/* Ghost number */}
        <span className="font-[family-name:var(--font-display)] italic text-[8rem] md:text-[12rem] leading-none text-[#1A1A1A] opacity-[0.04] absolute -top-12 md:-top-20 -left-[5%] z-0 select-none pointer-events-none">
          {number}
        </span>
        {/* Label */}
        <div className="flex items-center gap-3 relative">
          <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[#bbb]">
            {label}
          </span>
          <span className="w-6 h-px bg-black/[0.15]" />
          <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#ccc]">
            {number}
          </span>
        </div>
      </div>
    </RevealOnScroll>
  );
}

/* ─── About ─── */

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section id="about" ref={sectionRef} className="relative">

      {/* ── BEAT 1 · INTRO ── */}
      <div className="px-[var(--site-px)] pt-40 md:pt-56 lg:pt-72">
        <SectionLabel label="About" number="01" />

        <TextReveal
          text="I'm Ethan Wu — I run Zen Lab Creative, a design studio out of Sydney."
          as="h2"
          className="font-[family-name:var(--font-display)] italic text-[2.4rem] sm:text-[3.2rem] md:text-[4.2rem] lg:text-[5.2rem] xl:text-[6rem] leading-[1.08] text-[#1A1A1A] max-w-[1100px]"
        />

        <div className="mt-20 md:mt-32 max-w-2xl">
          <RevealOnScroll>
            <p className="font-[family-name:var(--font-inter)] text-[15px] md:text-[16px] leading-[1.9] text-[#555]">
              I keep things intentionally small. No account managers, no
              handoffs, no revolving door. When you work with me, you work
              with me — start to finish.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <p className="font-[family-name:var(--font-inter)] text-[15px] md:text-[16px] leading-[1.9] text-[#555] mt-8">
              I work with brands that care about craft. Asset managers,
              skincare brands, consulting firms — I design their identities,
              build their websites, and create the materials that make people
              take them seriously.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15}>
            <p className="font-[family-name:var(--font-inter)] text-[15px] md:text-[16px] leading-[1.9] text-[#555] mt-8">
              I also study Commerce &amp; Design at UNSW and I&apos;m building
              Briefed — a platform for freelance designers who want to stop
              winging it with clients.
            </p>
          </RevealOnScroll>
        </div>

        {/* Spacer before pull quote */}
        <div className="mb-32 md:mb-44" />
      </div>

      {/* ── BEAT 2 · PULL QUOTE ── */}
      <div className="py-40 md:py-56 lg:py-72">
        <RevealOnScroll>
          <div className="border-t border-black/[0.06] mx-6 md:mx-12 lg:mx-16" />
          <p className="font-[family-name:var(--font-display)] italic text-[2.8rem] sm:text-[4rem] md:text-[5.5rem] lg:text-[7.5rem] xl:text-[9rem] leading-[1.08] text-[#1A1A1A] text-center py-24 md:py-36 lg:py-44 px-6">
            I don&apos;t do &ldquo;<span className="text-[#E05252]">good enough</span>.&rdquo;
          </p>
          <div className="border-t border-black/[0.06] mx-6 md:mx-12 lg:mx-16" />
        </RevealOnScroll>
      </div>

      {/* ── BEAT 3 · SERVICES ── */}
      <div className="px-[var(--site-px)] pt-32 md:pt-44 lg:pt-56">
        <SectionLabel label="Services" number="02" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-[1100px]">
          {services.map((s, i) => (
            <TiltCard key={s.title} title={s.title} desc={s.desc} index={i} />
          ))}
        </div>
      </div>

      {/* ── BEAT 4 · TOOLS ── */}
      <div className="px-[var(--site-px)] pt-32 md:pt-44 lg:pt-56 pb-32 md:pb-44">
        <SectionLabel label="Tools" number="03" />

        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 md:gap-x-8 md:gap-y-4 max-w-[900px]">
          {tools.map((t, i) => (
            <RevealOnScroll key={t.name} delay={i * 0.04}>
              <span
                className={`font-[family-name:var(--font-space)] ${tierSize[t.tier]} text-[#1A1A1A] opacity-[${t.tier === 1 ? "0.9" : t.tier === 2 ? "0.5" : "0.3"}] hover:opacity-100 hover:text-[#E05252] transition-all duration-300 cursor-default`}
              >
                {t.name}
              </span>
            </RevealOnScroll>
          ))}
        </div>

        {/* Fallback mono line */}
        <RevealOnScroll delay={0.3}>
          <p className="font-[family-name:var(--font-mono)] text-[10px] md:text-[11px] text-[#ccc] mt-16 mb-8 leading-relaxed">
            {tools.map((t) => t.name).join(" · ")}
          </p>
        </RevealOnScroll>
      </div>

      {/* Bottom spacing */}
      <div className="pb-32 md:pb-44" />
    </section>
  );
}
