'use client'

import { motion } from 'framer-motion'

const capabilities = [
  {
    title: 'Design',
    items: ['Brand Identity', 'Web Design', 'Pitch Decks', 'UI/UX']
  },
  {
    title: 'Development',
    items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion']
  },
  {
    title: 'Strategy',
    items: ['Client Management', 'Project Scoping', 'Creative Direction']
  }
]

export default function Capabilities() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <p className="font-mono text-[#555] text-sm uppercase tracking-wider">
            What I Do
          </p>
        </motion.div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                ease: [0.22, 1, 0.36, 1],
                delay: index * 0.1
              }}
              whileHover={{ y: -4 }}
              className={`
                py-8 md:py-12 
                ${index < capabilities.length - 1 ? 'md:border-r border-[#1E1E1E] md:pr-8' : ''}
                ${index > 0 ? 'md:pl-8' : ''}
                transition-transform duration-300 ease-out
              `}
            >
              <div className="space-y-6">
                <h3 className="font-bold text-xl text-[#E8E8E8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {capability.title}
                </h3>
                
                <ul className="space-y-3">
                  {capability.items.map((item) => (
                    <li key={item} className="text-[#E8E8E8] text-base leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}