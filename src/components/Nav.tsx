"use client";

import { useEffect, useState } from "react";

export default function Nav({ spaceGrotesk, jetBrainsMono }: { spaceGrotesk: string; jetBrainsMono: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300 ${
        scrolled ? "py-3 px-6 bg-[#0a0a0a]/80 backdrop-blur-md" : "py-6 px-8"
      }`}
    >
      <a href="/" className={`${spaceGrotesk} text-sm tracking-tight text-foreground hover:text-accent transition-colors`}>
        ethan wu
      </a>

      <div className="flex items-center gap-6">
        {["work", "about", "contact"].map((item) => (
          <a
            key={item}
            href={`#${item}`}
            className={`${jetBrainsMono} text-xs uppercase tracking-widest text-muted hover:text-foreground transition-colors`}
          >
            {item}
          </a>
        ))}
        <a
          href="https://briefed.app"
          target="_blank"
          rel="noopener noreferrer"
          className={`${jetBrainsMono} text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors`}
        >
          ↗ briefed
        </a>
      </div>
    </nav>
  );
}
