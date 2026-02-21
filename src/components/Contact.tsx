"use client";

import RevealOnScroll from "./RevealOnScroll";
import MagneticButton from "./MagneticButton";

export default function Contact() {
  return (
    <section id="contact" className="px-6 md:px-12 lg:px-16 pt-32 md:pt-44 lg:pt-56 pb-20 md:pb-28">
      {/* Divider */}
      <div className="border-t border-black/[0.06] mb-20 md:mb-28" />

      <RevealOnScroll>
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[#bbb] mb-16 md:mb-24">
          Contact
        </p>
      </RevealOnScroll>

      <RevealOnScroll>
        <h2 className="font-[family-name:var(--font-display)] italic text-[2.8rem] md:text-[4.5rem] lg:text-[5.5rem] leading-[1.05] text-[#1A1A1A] max-w-[800px] mb-12 md:mb-16">
          Let&apos;s work together.
        </h2>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div className="flex flex-col gap-8 mb-32 md:mb-40">
          <MagneticButton
            href="mailto:ethanswu@gmail.com"
            className="inline-block w-fit font-[family-name:var(--font-space)] text-lg md:text-2xl text-[#E05252] relative group"
          >
            ethanswu@gmail.com
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#E05252] transition-all duration-300 group-hover:w-full" />
          </MagneticButton>

          <div className="flex gap-6">
            <MagneticButton
              href="https://github.com/SikeGottem"
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.15em] text-[#bbb] hover:text-[#1A1A1A] transition-colors"
            >
              GitHub ↗
            </MagneticButton>
            <MagneticButton
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.15em] text-[#bbb] hover:text-[#1A1A1A] transition-colors"
            >
              LinkedIn ↗
            </MagneticButton>
          </div>
        </div>
      </RevealOnScroll>

      {/* Footer */}
      <div className="border-t border-black/[0.06] pt-6 pb-4 flex flex-col md:flex-row justify-between gap-3">
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#ccc]">
          © 2026 Zen Lab Creative
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#ccc]">
          Built with Next.js · Set in Instrument Serif
        </span>
      </div>
    </section>
  );
}
