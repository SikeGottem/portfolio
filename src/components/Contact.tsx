'use client'

import { motion } from 'framer-motion'

export default function Contact() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <h2 
              className="text-5xl md:text-7xl font-bold text-[#E8E8E8] leading-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Have a project?
            </h2>
            <p className="text-[#555] text-xl md:text-2xl mt-4">
              Let&apos;s make something great.
            </p>
          </motion.div>

          {/* Email Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="mb-12"
          >
            <motion.a
              href="mailto:ethanswu@gmail.com"
              className="group inline-block text-2xl md:text-3xl text-[#E05252] font-medium relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              ethanswu@gmail.com
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#E05252] group-hover:w-full transition-all duration-300 ease-out" />
            </motion.a>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex gap-8 font-mono text-[#E8E8E8]">
              <motion.a
                href="https://github.com/ethancodes2020"
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:text-[#E05252] transition-colors duration-200"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                GitHub
                <span className="inline-block ml-1 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </motion.a>
              
              <motion.a
                href="https://linkedin.com/in/ethanwu2020"
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:text-[#E05252] transition-colors duration-200"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                LinkedIn
                <span className="inline-block ml-1 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </motion.a>
            </div>
          </motion.div>

          {/* Colophon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="border-t border-[#1E1E1E] pt-8"
          >
            <div className="text-[#555] text-sm leading-relaxed space-y-1">
              <p>Built with Next.js & Framer Motion. Set in Space Grotesk.</p>
              <p>Designed in Figma, coded by hand.</p>
              <p>© 2026 Ethan Wu</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}