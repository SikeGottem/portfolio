"use client";

import { useRef, useCallback } from "react";
import { useScrollVelocity } from "@/hooks/useScrollVelocity";
import { useIsMobile } from "@/hooks/useIsMobile";
import SmoothScroll from "@/components/SmoothScroll";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WorkSection from "@/components/WorkSection";
import LabSection from "@/components/LabSection";
import About from "@/components/About";
import Contact from "@/components/Contact";
import FloatingElements from "@/components/FloatingElements";
import DotGrid from "@/components/DotGrid";
import HorizontalRule from "@/components/HorizontalRule";
import ProjectCarousel from "@/components/ProjectCarousel";

export default function Home() {
  const ripplesRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const scrollVelocityRef = useScrollVelocity();
  const isMobile = useIsMobile();

  // Lazy AudioContext for subtle click sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playClick = useCallback(() => {
    if (typeof AudioContext === "undefined") return;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    ripplesRef.current.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: performance.now(),
    });
    playClick();
  }, [playClick, isMobile]);

  return (
    <SmoothScroll>
      <Marquee />
      <Nav />
      <main>
        <div className="relative" onClick={isMobile ? undefined : handleClick}>
          {!isMobile && <DotGrid ripplesRef={ripplesRef} scrollVelocityRef={scrollVelocityRef} />}
          <Hero ripplesRef={ripplesRef} scrollVelocityRef={scrollVelocityRef} />
          {!isMobile && <FloatingElements />}
        </div>
        
        <WorkSection />
        
        {/* ProjectCarousel removed */}
        
        <LabSection />
        
        <HorizontalRule />
        
        <About />
        
        <Contact />
      </main>
    </SmoothScroll>
  );
}
