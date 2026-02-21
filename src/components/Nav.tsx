"use client";

import MagneticButton from "./MagneticButton";

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-[var(--site-px)] py-5 pointer-events-none bg-[#F5F2EE]/90 backdrop-blur-md">
      <MagneticButton
        href="/"
        className="font-[family-name:var(--font-space)] text-sm font-medium uppercase tracking-[0.25em] text-[#1A1A1A] pointer-events-auto"
      >
        Ethan Wu
      </MagneticButton>

      <div className="flex flex-row items-center gap-6 pointer-events-auto">
        {["Work", "About", "Contact"].map((item) => (
          <MagneticButton
            key={item}
            href={`#${item.toLowerCase()}`}
            className="font-[family-name:var(--font-space)] text-[13px] font-medium uppercase tracking-[0.15em] text-[#1A1A1A] hover:text-[#E05252] transition-colors"
          >
            {item}
          </MagneticButton>
        ))}
      </div>
    </nav>
  );
}
