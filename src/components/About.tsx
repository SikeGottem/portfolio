"use client";

import { useRef, useState, MouseEvent } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import RevealOnScroll from "./RevealOnScroll";
import TextReveal from "./TextReveal";

/* ─── Data ─── */

const philosophy = [
  { left: "Ship", right: "Perfect", symbol: ">" },
  { left: "Depth", right: "Breadth", symbol: ">" },
  { left: "Taste", right: "Trends", symbol: "over" },
];

const services = [
  { title: "Brand Identity", desc: "Logos, type systems, brand books — the full kit." },
  { title: "Web Design & Dev", desc: "Next.js sites that look sharp and ship fast." },
  { title: "Pitch Decks", desc: "Investor-ready decks that actually get read." },
  { title: "UI/UX Design", desc: "Interfaces people don't have to think about." },
  { title: "Creative Direction", desc: "Big-picture thinking across every touchpoint." },
  { title: "3D & Motion", desc: "Renders, animations, and visual storytelling." },
];

const stats = [
  { label: "Age", value: "17" },
  { label: "Based in", value: "Sydney" },
  { label: "Studying", value: "Commerce × Design" },
  { label: "At", value: "UNSW" },
  { label: "Studio", value: "Zen Lab Creative" },
  { label: "Building", value: "Briefed" },
];

const clients = ["Bristlecone Asset Management", "S17 Skincare", "Limage"];

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

/* ─── Horizontal Rule ─── */

function Rule() {
  return <div className="w-full h-px bg-black/[0.06]" />;
}

/* ─── Stagger Letter Reveal ─── */

function LetterReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: "inline-flex", overflow: "hidden" }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: "110%" }}
          animate={isInView ? { y: "0%" } : { y: "110%" }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
            delay: i * 0.025,
          }}
          style={{ display: "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ─── Service Row ─── */

function ServiceRow({
  title,
  desc,
  index,
}: {
  title: string;
  desc: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <RevealOnScroll delay={index * 0.06}>
      <div
        className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[3rem_1fr_1.5fr] items-baseline gap-4 md:gap-8 py-6 md:py-8 border-b border-black/[0.06] cursor-default"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#bbb]">
          0{index + 1}
        </span>
        <h3
          className="font-[family-name:var(--font-space)] text-[1rem] md:text-[1.15rem] text-[#1A1A1A] transition-colors duration-300"
          style={{ color: hovered ? "#E05252" : "#1A1A1A" }}
        >
          {title}
        </h3>
        <p className="font-[family-name:var(--font-inter)] text-[13px] md:text-[14px] text-[#999] leading-[1.6] hidden md:block">
          {desc}
        </p>
      </div>
    </RevealOnScroll>
  );
}

/* ─── About ─── */

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="about" ref={sectionRef} className="relative">
      {/* ── BEAT 1 · THE OPENER ── */}
      <div className="px-[var(--site-px)] pt-40 md:pt-56 lg:pt-72">
        {/* Section tag */}
        <RevealOnScroll>
          <div className="flex items-center gap-3 mb-16 md:mb-24">
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[#bbb]">
              About
            </span>
            <span className="w-6 h-px bg-black/[0.15]" />
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#ccc]">
              01
            </span>
          </div>
        </RevealOnScroll>

        {/* Mixed-weight typographic intro */}
        <div className="max-w-[1200px]">
          <TextReveal
            text="I'm Ethan Wu —"
            as="h2"
            className="font-[family-name:var(--font-display)] italic text-[2.2rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] xl:text-[5.8rem] leading-[1.08] text-[#1A1A1A]"
          />
          <div className="mt-2 md:mt-3">
            <TextReveal
              text="a one-person studio that doesn't feel like one."
              as="h2"
              className="font-[family-name:var(--font-inter)] text-[1.4rem] sm:text-[2rem] md:text-[2.6rem] lg:text-[3.2rem] xl:text-[3.6rem] leading-[1.15] text-[#1A1A1A] opacity-40 font-light"
            />
          </div>
        </div>

        {/* Two-column blurb */}
        <div className="mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-[900px]">
          <RevealOnScroll>
            <p className="font-[family-name:var(--font-inter)] text-[15px] leading-[1.9] text-[#555]">
              I run Zen Lab Creative out of Sydney. No account managers, no
              handoffs, no revolving door — when you work with me, you work
              with me. Start to finish.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <p className="font-[family-name:var(--font-inter)] text-[15px] leading-[1.9] text-[#555]">
              I design identities, build websites, and create the materials
              that make brands get taken seriously. I also study Commerce &amp;
              Design at UNSW and I&apos;m building Briefed — a platform
              for designers who want to stop winging it.
            </p>
          </RevealOnScroll>
        </div>
      </div>

      {/* ── BEAT 2 · PHILOSOPHY (large kinetic type) ── */}
      <div ref={parallaxRef} className="py-32 md:py-48 lg:py-64">
        <RevealOnScroll>
          <Rule />
        </RevealOnScroll>
        <div className="px-[var(--site-px)] py-20 md:py-32 lg:py-40">
          {philosophy.map((item, i) => (
            <RevealOnScroll key={i} delay={i * 0.12}>
              <motion.div
                style={i === 1 ? { y } : undefined}
                className="flex items-baseline justify-center gap-3 md:gap-6 lg:gap-8"
              >
                <span className="font-[family-name:var(--font-display)] italic text-[2.4rem] sm:text-[3.6rem] md:text-[5.5rem] lg:text-[7.5rem] xl:text-[9rem] leading-[1.15] text-[#1A1A1A]">
                  {item.left}
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[0.7rem] md:text-[0.9rem] text-[#E05252] uppercase tracking-[0.2em]">
                  {item.symbol}
                </span>
                <span className="font-[family-name:var(--font-display)] italic text-[2.4rem] sm:text-[3.6rem] md:text-[5.5rem] lg:text-[7.5rem] xl:text-[9rem] leading-[1.15] text-[#1A1A1A] opacity-[0.12]">
                  {item.right}
                </span>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
        <RevealOnScroll>
          <Rule />
        </RevealOnScroll>
      </div>

      {/* ── BEAT 3 · THE FACTS (stat grid) ── */}
      <div className="px-[var(--site-px)] pb-32 md:pb-48">
        <RevealOnScroll>
          <div className="flex items-center gap-3 mb-16 md:mb-24">
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[#bbb]">
              Quick facts
            </span>
            <span className="w-6 h-px bg-black/[0.15]" />
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-14 md:gap-y-20 max-w-[800px]">
          {stats.map((s, i) => (
            <RevealOnScroll key={s.label} delay={i * 0.06}>
              <div>
                <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.25em] text-[#bbb] block mb-2">
                  {s.label}
                </span>
                <span className="font-[family-name:var(--font-space)] text-[1.1rem] md:text-[1.3rem] text-[#1A1A1A]">
                  {s.value}
                </span>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* Clients inline */}
        <RevealOnScroll delay={0.3}>
          <div className="mt-24 md:mt-32">
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.25em] text-[#bbb] block mb-4">
              Selected clients
            </span>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {clients.map((c, i) => (
                <span
                  key={c}
                  className="font-[family-name:var(--font-inter)] text-[14px] text-[#777]"
                >
                  {c}
                  {i < clients.length - 1 && (
                    <span className="ml-6 text-[#ddd]">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>

      {/* ── BEAT 4 · SERVICES (list, not cards) ── */}
      <div className="px-[var(--site-px)] pt-24 md:pt-36 pb-32 md:pb-48">
        <RevealOnScroll>
          <div className="flex items-center gap-3 mb-12 md:mb-16">
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[#bbb]">
              Services
            </span>
            <span className="w-6 h-px bg-black/[0.15]" />
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#ccc]">
              02
            </span>
          </div>
        </RevealOnScroll>

        <div className="max-w-[900px]">
          <div className="border-t border-black/[0.06]" />
          {services.map((s, i) => (
            <ServiceRow key={s.title} title={s.title} desc={s.desc} index={i} />
          ))}
        </div>
      </div>

      {/* ── BEAT 5 · TOOLS (weighted cloud) ── */}
      <div className="px-[var(--site-px)] pt-24 md:pt-36 pb-36 md:pb-52">
        <RevealOnScroll>
          <div className="flex items-center gap-3 mb-12 md:mb-16">
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[#bbb]">
              Tools
            </span>
            <span className="w-6 h-px bg-black/[0.15]" />
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#ccc]">
              03
            </span>
          </div>
        </RevealOnScroll>

        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-3 md:gap-x-7 md:gap-y-4 max-w-[900px]">
          {tools.map((t, i) => (
            <RevealOnScroll key={t.name} delay={i * 0.03}>
              <span
                className={`font-[family-name:var(--font-space)] cursor-default transition-all duration-300 hover:text-[#E05252] hover:opacity-100 ${
                  t.tier === 1
                    ? "text-[1.8rem] md:text-[2.6rem] text-[#1A1A1A] opacity-90"
                    : t.tier === 2
                    ? "text-[1.1rem] md:text-[1.5rem] text-[#1A1A1A] opacity-50"
                    : "text-[0.8rem] md:text-[1rem] text-[#1A1A1A] opacity-30"
                }`}
              >
                {t.name}
              </span>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {/* ── BEAT 6 · PERSONALITY CLOSER ── */}
      <div className="px-[var(--site-px)] pb-40 md:pb-56">
        <RevealOnScroll>
          <Rule />
        </RevealOnScroll>
        <div className="py-24 md:py-36 max-w-[700px]">
          <RevealOnScroll>
            <p className="font-[family-name:var(--font-display)] italic text-[1.6rem] md:text-[2.2rem] lg:text-[2.8rem] leading-[1.25] text-[#1A1A1A]">
              I don&apos;t do &ldquo;<span className="text-[#E05252]">good enough</span>.&rdquo;
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15}>
            <p className="font-[family-name:var(--font-inter)] text-[14px] leading-[1.9] text-[#999] mt-8 max-w-[500px]">
              More hungry startup founder than polished agency.
              Loves hip-hop, garlic, and building things.
              Hates being ordinary.
            </p>
          </RevealOnScroll>
        </div>
        <RevealOnScroll delay={0.2}>
          <Rule />
        </RevealOnScroll>
      </div>
    </section>
  );
}
