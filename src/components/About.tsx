"use client";

import RevealOnScroll from "./RevealOnScroll";

export default function About() {
  return (
    <section id="about" className="relative px-6 md:px-12 lg:px-16 pt-32 md:pt-44 lg:pt-56 pb-20 md:pb-28">
      {/* Section label */}
      <RevealOnScroll>
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-[#bbb] mb-16 md:mb-24">
          About
        </p>
      </RevealOnScroll>

      {/* Intro — full width, large */}
      <RevealOnScroll>
        <h2 className="font-[family-name:var(--font-display)] italic text-[2rem] sm:text-[2.5rem] md:text-[3.2rem] lg:text-[3.8rem] leading-[1.15] text-[#1A1A1A] max-w-[900px] mb-20 md:mb-28">
          I&apos;m Ethan Wu — I run Zen Lab Creative, a design studio out of Sydney.
        </h2>
      </RevealOnScroll>

      {/* Two-column body */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20 md:mb-28">
        {/* Left — copy */}
        <RevealOnScroll>
          <div className="md:col-span-6 lg:col-span-5">
            <div className="font-[family-name:var(--font-inter)] text-[15px] leading-[1.85] text-[#666] space-y-6 max-w-md">
              <p>
                I keep things intentionally small. No account managers, no
                handoffs, no revolving door. When you work with me, you work
                with me — start to finish.
              </p>
              <p>
                I work with brands that care about craft. Asset managers,
                skincare brands, consulting firms — I design their identities,
                build their websites, and create the materials that make people
                take them seriously.
              </p>
              <p>
                I also study Commerce &amp; Design at UNSW and I&apos;m building
                Briefed — a platform for freelance designers who want to stop
                winging it with clients.
              </p>
            </div>
          </div>
        </RevealOnScroll>

        {/* Right — services & tools */}
        <RevealOnScroll delay={0.15}>
          <div className="md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9 space-y-10">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.25em] text-[#bbb] mb-5">
                Services
              </p>
              <ul className="font-[family-name:var(--font-inter)] text-[14px] leading-[2.2] text-[#444]">
                <li>Brand Identity</li>
                <li>Web Design &amp; Development</li>
                <li>Pitch Decks</li>
                <li>UI/UX Design</li>
                <li>Creative Direction</li>
                <li>3D &amp; Motion Design</li>
              </ul>
            </div>

            <div className="border-t border-black/[0.06] pt-8">
              <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.25em] text-[#bbb] mb-5">
                Tools
              </p>
              <div className="font-[family-name:var(--font-inter)] text-[13px] leading-[2.2] text-[#999]">
                <p>Figma · Adobe Suite · Blender</p>
                <p>Next.js · React · TypeScript</p>
                <p>Tailwind · Framer Motion</p>
                <p>After Effects · Cinema 4D</p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      {/* Pull quote */}
      <RevealOnScroll>
        <div className="border-t border-black/[0.06] pt-12">
          <p className="font-[family-name:var(--font-display)] italic text-[1.4rem] md:text-[1.8rem] text-[#1A1A1A]">
            I don&apos;t do &ldquo;good enough.&rdquo;
          </p>
        </div>
      </RevealOnScroll>
    </section>
  );
}
