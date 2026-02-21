'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface HorizontalRuleProps {
  className?: string;
}

export default function HorizontalRule({ className = '' }: HorizontalRuleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <div className={`px-6 md:px-12 lg:px-16 ${className}`}>
      <div 
        ref={ref}
        className="relative flex items-center justify-center my-16 md:my-24"
      >
        {/* Center dot */}
        <div className="w-1 h-1 rounded-full bg-black/10 z-10" />
        
        {/* Expanding line */}
        <motion.div
          className="absolute inset-y-1/2 h-px bg-black/10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isInView ? 1 : 0 }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2,
          }}
          style={{ transformOrigin: 'center' }}
        />
      </div>
    </div>
  );
}