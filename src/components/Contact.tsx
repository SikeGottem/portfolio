"use client";

import RevealOnScroll from "./RevealOnScroll";
import MagneticButton from "./MagneticButton";

export default function Contact() {
  return (
    <section id="contact" className="bg-[#1A1A1A] text-[#F5F0EB]">
      {/* Main contact area */}
      <div className="px-[var(--site-px)] pt-32 md:pt-44 lg:pt-56 pb-24 md:pb-36">
        <RevealOnScroll>
          <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[#666] mb-16 md:mb-24">
            Contact
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="font-[family-name:var(--font-display)] italic text-[2.8rem] md:text-[4.5rem] lg:text-[5.5rem] xl:text-[6.5rem] leading-[1.05] text-[#F5F0EB] max-w-[900px] mb-12 md:mb-16">
            Let&apos;s work together.
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <MagneticButton
            href="mailto:ethanswu@gmail.com"
            className="inline-block w-fit font-[family-name:var(--font-inter)] text-lg md:text-xl text-[#E05252] relative group"
          >
            ethanswu@gmail.com
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#E05252] transition-all duration-300 group-hover:w-full" />
          </MagneticButton>
        </RevealOnScroll>

        <RevealOnScroll delay={0.15}>
          <div className="flex gap-6 mt-10">
            <MagneticButton
              href="https://github.com/SikeGottem"
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.15em] text-[#555] hover:text-[#F5F0EB] transition-colors"
            >
              GitHub ↗
            </MagneticButton>
            <MagneticButton
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.15em] text-[#555] hover:text-[#F5F0EB] transition-colors"
            >
              LinkedIn ↗
            </MagneticButton>
          </div>
        </RevealOnScroll>
      </div>

      {/* Footer */}
      <div className="px-[var(--site-px)] border-t border-white/[0.06] mt-32 md:mt-44 py-6 flex flex-col md:flex-row justify-between gap-3">
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#444]">
          © 2026 Zen Lab Creative
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#444]">
          Built with Next.js · Set in Instrument Serif
        </span>
      </div>
    </section>
  );
}
