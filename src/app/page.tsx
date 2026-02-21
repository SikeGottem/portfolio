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
  return (
    <SmoothScroll>
      <Marquee />
      <Nav />
      <main>
        <div className="relative">
          <DotGrid />
          <Hero />
          <FloatingElements />
        </div>
        
        <WorkSection />
        
        <ProjectCarousel />
        
        <LabSection />
        
        {/* Divider between Lab and About */}
        <HorizontalRule />
        
        <About />
        
        <Contact />
      </main>
    </SmoothScroll>
  );
}
