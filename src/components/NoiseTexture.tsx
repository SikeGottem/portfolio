'use client';

export default function NoiseTexture() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          opacity: 0.025,
        }}
      >
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="1"
            seed="2"
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
          <feOffset dx="0" dy="0" />
          <feBlend mode="multiply" in2="SourceGraphic" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
        
        {/* Add subtle animation */}
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 1 1; 0 0"
          dur="60s"
          repeatCount="indefinite"
        />
      </svg>
    </div>
  );
}