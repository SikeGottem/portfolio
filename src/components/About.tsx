'use client'

import { motion } from 'framer-motion'

export default function About() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="py-20 md:py-32"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Photo Placeholder */}
          <div className="aspect-[3/4] bg-[#1E1E1E] rounded-lg" />
          
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <p className="text-[#E8E8E8] text-lg leading-relaxed">
                Ethan Wu is a designer and developer based in Sydney.
              </p>
              
              <p className="text-[#E8E8E8] text-lg leading-relaxed">
                Currently studying Commerce & Design at UNSW and building
                Briefed — a platform for freelance designers to manage
                their clients.
              </p>
              
              <p className="text-[#E8E8E8] text-lg leading-relaxed">
                He&apos;s worked with asset managers, skincare brands, salons,
                and consulting firms — designing pitch decks, brand
                identities, and websites that convert.
              </p>
              
              <p className="text-[#E8E8E8] text-lg leading-relaxed font-medium">
                Good design is clear thinking made visible.
              </p>
            </div>
            
            {/* Tools */}
            <div className="pt-4">
              <p className="font-mono text-[#555] text-sm">
                Figma · Adobe Suite · Next.js · React · TypeScript · Tailwind
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}