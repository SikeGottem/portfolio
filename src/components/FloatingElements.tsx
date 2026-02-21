'use client';

import { motion } from 'framer-motion';

export default function FloatingElements() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
      {/* Floating circle 1 */}
      <motion.div
        className="absolute w-1 h-1 rounded-full bg-black/[0.03]"
        initial={{ x: -20, y: '60%' }}
        animate={{
          x: ['20vw', '80vw', '20vw'],
          y: ['60%', '40%', '60%'],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating circle 2 */}
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-black/[0.025]"
        initial={{ x: '90vw', y: '30%' }}
        animate={{
          x: ['90vw', '10vw', '90vw'],
          y: ['30%', '70%', '30%'],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />
      
      {/* Floating line */}
      <motion.div
        className="absolute w-6 h-px bg-black/[0.02]"
        style={{ transformOrigin: 'center' }}
        initial={{ x: '50vw', y: '20%', rotate: 15 }}
        animate={{
          x: ['50vw', '70vw', '30vw', '50vw'],
          y: ['20%', '80%', '50%', '20%'],
          rotate: [15, 45, -30, 15],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 8,
        }}
      />
      
      {/* Small floating dot */}
      <motion.div
        className="absolute w-0.5 h-0.5 rounded-full bg-black/[0.04]"
        initial={{ x: '20vw', y: '80%' }}
        animate={{
          x: ['20vw', '60vw', '20vw'],
          y: ['80%', '20%', '80%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 12,
        }}
      />
    </div>
  );
}