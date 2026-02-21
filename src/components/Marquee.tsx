"use client";

const text =
  "ETHAN WU — DESIGN — BRAND — WEB — CODE — SYDNEY — ";

export default function Marquee() {
  const repeated = text.repeat(8);
  return (
    <div className="overflow-hidden py-2 mt-14">
      <div className="animate-marquee whitespace-nowrap">
        <span className="font-[family-name:var(--font-space)] text-[12px] uppercase tracking-[0.3em] text-[#999] opacity-60">
          {repeated}
        </span>
      </div>
    </div>
  );
}
