import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ProjectsSection from "@/components/ProjectsSection";
import About from "@/components/About";
import Capabilities from "@/components/Capabilities";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <Nav spaceGrotesk="font-[family-name:var(--font-space-grotesk)]" jetBrainsMono="font-[family-name:var(--font-jetbrains-mono)]" />
      <Hero spaceGrotesk="font-[family-name:var(--font-space-grotesk)]" />
      <ProjectsSection />
      <About />
      <Capabilities />
      <Contact />
    </main>
  );
}
